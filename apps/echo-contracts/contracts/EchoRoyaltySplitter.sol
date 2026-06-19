// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EchoRoyaltySplitter
 * @author QIE EchoAverix Team
 * @notice Distributes revenue from AI expert agent licensing among creators,
 *         collaborators, and the platform treasury.
 * @dev Supports configurable split ratios per agent with automatic distribution
 *      on QUSDC payment receipt. Part of Echo Exchange™ monetization layer.
 */
contract EchoRoyaltySplitter is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ──────────────────────────────────────────────
    //  Types
    // ──────────────────────────────────────────────

    struct Recipient {
        address payable recipientAddr; // Wallet address
        uint256         shareBps;      // Share in basis points (e.g., 7000 = 70%)
        string          label;         // Human-readable label ("Creator", "Collaborator A")
    }

    struct SplitConfig {
        bytes32      agentId;           // Agent this config applies to
        Recipient[]  recipients;        // List of recipients with shares
        uint256      totalDistributed;  // Cumulative QUSDC distributed
        bool         isConfigured;      // Whether splits are set up
    }

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────

    IERC20 public immutable qusdcToken;

    /// @dev agentId => SplitConfig
    mapping(bytes32 => SplitConfig) private _splits;

    /// @dev recipient => cumulative QUSDC earned
    mapping(address => uint256) public cumulativeEarnings;

    /// @dev recipient => claimable QUSDC balance
    mapping(address => uint256) public pendingClaims;

    /// @dev Agent creator mapping (for authorization)
    mapping(bytes32 => address) public agentCreators;

    address public admin;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────

    event SplitConfigured(
        bytes32 indexed agentId,
        uint256 recipientCount,
        uint256 timestamp
    );

    event RevenueDistributed(
        bytes32 indexed agentId,
        uint256 totalAmount,
        uint256 timestamp
    );

    event RoyaltyClaimed(
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────

    constructor(address _qusdcToken) {
        require(_qusdcToken != address(0), "RoyaltySplitter: invalid QUSDC");
        qusdcToken = IERC20(_qusdcToken);
        admin = msg.sender;
    }

    // ──────────────────────────────────────────────
    //  Split Configuration
    // ──────────────────────────────────────────────

    /**
     * @notice Configure revenue split ratios for an agent.
     * @param agentId    The agent to configure splits for
     * @param addrs      Array of recipient addresses
     * @param sharesBps  Array of shares in basis points (must sum to 10000)
     * @param labels     Array of human-readable labels
     */
    function configureSplit(
        bytes32   agentId,
        address[] calldata addrs,
        uint256[] calldata sharesBps,
        string[]  calldata labels
    ) external {
        require(addrs.length == sharesBps.length && addrs.length == labels.length,
                "RoyaltySplitter: array length mismatch");
        require(addrs.length > 0 && addrs.length <= 10,
                "RoyaltySplitter: 1-10 recipients required");

        // First-time setup or creator reconfiguration
        if (_splits[agentId].isConfigured) {
            require(agentCreators[agentId] == msg.sender, "RoyaltySplitter: not creator");
        } else {
            agentCreators[agentId] = msg.sender;
        }

        // Validate total shares sum to 10000 (100%)
        uint256 totalBps = 0;
        for (uint256 i = 0; i < sharesBps.length; i++) {
            require(addrs[i] != address(0), "RoyaltySplitter: invalid recipient");
            require(sharesBps[i] > 0, "RoyaltySplitter: zero share not allowed");
            totalBps += sharesBps[i];
        }
        require(totalBps == 10000, "RoyaltySplitter: shares must sum to 10000 bps");

        // Clear existing recipients
        delete _splits[agentId].recipients;

        SplitConfig storage config = _splits[agentId];
        config.agentId = agentId;
        config.isConfigured = true;

        for (uint256 i = 0; i < addrs.length; i++) {
            config.recipients.push(Recipient({
                recipientAddr: payable(addrs[i]),
                shareBps:      sharesBps[i],
                label:         labels[i]
            }));
        }

        emit SplitConfigured(agentId, addrs.length, block.timestamp);
    }

    // ──────────────────────────────────────────────
    //  Revenue Distribution
    // ──────────────────────────────────────────────

    /**
     * @notice Distribute a QUSDC payment according to the agent's split config.
     * @dev Caller must have approved this contract to spend `amount` of QUSDC.
     *      Revenue is credited to pendingClaims; recipients call claimRoyalties().
     * @param agentId The agent generating the revenue
     * @param amount  The total QUSDC amount to distribute
     */
    function distributeRevenue(bytes32 agentId, uint256 amount)
        external nonReentrant
    {
        SplitConfig storage config = _splits[agentId];
        require(config.isConfigured, "RoyaltySplitter: splits not configured");
        require(amount > 0, "RoyaltySplitter: zero amount");

        // Transfer QUSDC from caller to this contract
        qusdcToken.safeTransferFrom(msg.sender, address(this), amount);

        // Credit each recipient's pending claims
        for (uint256 i = 0; i < config.recipients.length; i++) {
            uint256 share = (amount * config.recipients[i].shareBps) / 10000;
            pendingClaims[config.recipients[i].recipientAddr] += share;
            cumulativeEarnings[config.recipients[i].recipientAddr] += share;
        }

        config.totalDistributed += amount;

        emit RevenueDistributed(agentId, amount, block.timestamp);
    }

    /**
     * @notice Claim all pending royalties.
     */
    function claimRoyalties() external nonReentrant {
        uint256 claimable = pendingClaims[msg.sender];
        require(claimable > 0, "RoyaltySplitter: nothing to claim");

        pendingClaims[msg.sender] = 0;
        qusdcToken.safeTransfer(msg.sender, claimable);

        emit RoyaltyClaimed(msg.sender, claimable, block.timestamp);
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    function getRevenueBreakdown(bytes32 agentId)
        external view
        returns (
            address[] memory addrs,
            uint256[] memory shares,
            string[]  memory labels,
            uint256 totalDistributed
        )
    {
        SplitConfig storage config = _splits[agentId];
        uint256 len = config.recipients.length;

        addrs  = new address[](len);
        shares = new uint256[](len);
        labels = new string[](len);

        for (uint256 i = 0; i < len; i++) {
            addrs[i]  = config.recipients[i].recipientAddr;
            shares[i] = config.recipients[i].shareBps;
            labels[i] = config.recipients[i].label;
        }

        return (addrs, shares, labels, config.totalDistributed);
    }

    function isSplitConfigured(bytes32 agentId) external view returns (bool) {
        return _splits[agentId].isConfigured;
    }

    // ──────────────────────────────────────────────
    //  Admin
    // ──────────────────────────────────────────────

    function setAdmin(address newAdmin) external {
        require(msg.sender == admin, "RoyaltySplitter: not admin");
        require(newAdmin != address(0), "RoyaltySplitter: invalid admin");
        admin = newAdmin;
    }
}
