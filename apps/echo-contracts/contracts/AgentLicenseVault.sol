// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AgentLicenseVault
 * @author QIE EchoAverix Team
 * @notice Manages licensing tiers for AI expert agents on Echo Exchange™.
 *         Supports subscription, pay-per-query, trial, and enterprise licensing 
 *         with QUSDC payments.
 * @dev Part of the QIE EchoAverix Layer 5 — Echo Exchange™ monetization.
 */
contract AgentLicenseVault is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ──────────────────────────────────────────────
    //  Types
    // ──────────────────────────────────────────────

    enum LicenseType { Subscription, PayPerQuery, Trial, Enterprise }

    struct LicenseTier {
        bytes32      agentId;         // Reference to EchoAgentRegistry
        LicenseType  licenseType;     // Type of license
        uint256      qusdcPrice;      // Price in QUSDC (6 decimals)
        uint256      queryLimit;      // Max queries allowed (0 = unlimited)
        uint256      durationDays;    // License duration in days
        bool         isActive;        // Whether this tier is available
        address      creator;         // Agent creator who set up this tier
    }

    struct ActiveLicense {
        uint256      tierId;          // Reference to the license tier
        address      licensee;        // Address that purchased the license
        uint256      purchasedAt;     // Timestamp of purchase
        uint256      expiresAt;       // Timestamp of expiration
        uint256      queriesUsed;     // Number of queries consumed
        uint256      queryLimit;      // Snapshot of query limit at purchase time
        bool         isRevoked;       // Whether the license was revoked
    }

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────

    IERC20 public immutable qusdcToken;

    /// @dev Auto-incrementing tier ID counter
    uint256 public nextTierId;

    /// @dev Auto-incrementing license ID counter
    uint256 public nextLicenseId;

    /// @dev tierId => LicenseTier
    mapping(uint256 => LicenseTier) public licenseTiers;

    /// @dev licenseId => ActiveLicense
    mapping(uint256 => ActiveLicense) public activeLicenses;

    /// @dev agentId => list of tier IDs
    mapping(bytes32 => uint256[]) public agentTiers;

    /// @dev licensee => agentId => list of license IDs
    mapping(address => mapping(bytes32 => uint256[])) public userLicenses;

    /// @dev Platform fee percentage (basis points, e.g., 500 = 5%)
    uint256 public platformFeeBps = 500;

    /// @dev Platform treasury address
    address public treasury;

    /// @dev Admin address
    address public admin;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────

    event LicenseTierCreated(
        uint256 indexed tierId,
        bytes32 indexed agentId,
        LicenseType licenseType,
        uint256 qusdcPrice,
        uint256 queryLimit,
        uint256 durationDays
    );

    event LicensePurchased(
        uint256 indexed licenseId,
        uint256 indexed tierId,
        address indexed licensee,
        bytes32 agentId,
        uint256 qusdcPaid,
        uint256 expiresAt
    );

    event LicenseRevoked(
        uint256 indexed licenseId,
        uint256 timestamp
    );

    event QueryRecorded(
        uint256 indexed licenseId,
        uint256 queriesUsed,
        uint256 queryLimit
    );

    // ──────────────────────────────────────────────
    //  Modifiers
    // ──────────────────────────────────────────────

    modifier onlyAdmin() {
        require(msg.sender == admin, "LicenseVault: not admin");
        _;
    }

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────

    constructor(address _qusdcToken, address _treasury) {
        require(_qusdcToken != address(0), "LicenseVault: invalid QUSDC address");
        require(_treasury != address(0), "LicenseVault: invalid treasury");
        qusdcToken = IERC20(_qusdcToken);
        treasury   = _treasury;
        admin      = msg.sender;
    }

    // ──────────────────────────────────────────────
    //  License Tier Management
    // ──────────────────────────────────────────────

    /**
     * @notice Create a new licensing tier for an agent.
     * @dev Only the agent creator should call this (enforced off-chain via registry check).
     */
    function createLicenseTier(
        bytes32      agentId,
        LicenseType  licenseType,
        uint256      qusdcPrice,
        uint256      queryLimit,
        uint256      durationDays
    ) external returns (uint256 tierId) {
        require(durationDays > 0, "LicenseVault: duration must be positive");

        tierId = nextTierId++;

        licenseTiers[tierId] = LicenseTier({
            agentId:      agentId,
            licenseType:  licenseType,
            qusdcPrice:   qusdcPrice,
            queryLimit:   queryLimit,
            durationDays: durationDays,
            isActive:     true,
            creator:      msg.sender
        });

        agentTiers[agentId].push(tierId);

        emit LicenseTierCreated(tierId, agentId, licenseType, qusdcPrice, queryLimit, durationDays);
    }

    /**
     * @notice Deactivate a license tier (no new purchases).
     */
    function deactivateTier(uint256 tierId) external {
        require(licenseTiers[tierId].creator == msg.sender, "LicenseVault: not tier creator");
        licenseTiers[tierId].isActive = false;
    }

    // ──────────────────────────────────────────────
    //  License Purchase
    // ──────────────────────────────────────────────

    /**
     * @notice Purchase a license for an agent using QUSDC.
     * @param tierId The license tier to purchase
     */
    function purchaseLicense(uint256 tierId)
        external nonReentrant
        returns (uint256 licenseId)
    {
        LicenseTier storage tier = licenseTiers[tierId];
        require(tier.isActive, "LicenseVault: tier not active");
        require(tier.qusdcPrice > 0 || tier.licenseType == LicenseType.Trial, "LicenseVault: invalid tier");

        // Transfer QUSDC from buyer
        if (tier.qusdcPrice > 0) {
            uint256 platformFee  = (tier.qusdcPrice * platformFeeBps) / 10000;
            uint256 creatorShare = tier.qusdcPrice - platformFee;

            qusdcToken.safeTransferFrom(msg.sender, tier.creator, creatorShare);
            qusdcToken.safeTransferFrom(msg.sender, treasury, platformFee);
        }

        // Create active license
        licenseId = nextLicenseId++;
        uint256 expiresAt = block.timestamp + (tier.durationDays * 1 days);

        activeLicenses[licenseId] = ActiveLicense({
            tierId:      tierId,
            licensee:    msg.sender,
            purchasedAt: block.timestamp,
            expiresAt:   expiresAt,
            queriesUsed: 0,
            queryLimit:  tier.queryLimit,
            isRevoked:   false
        });

        userLicenses[msg.sender][tier.agentId].push(licenseId);

        emit LicensePurchased(licenseId, tierId, msg.sender, tier.agentId, tier.qusdcPrice, expiresAt);
    }

    // ──────────────────────────────────────────────
    //  Access Validation
    // ──────────────────────────────────────────────

    /**
     * @notice Check if a user has a valid, unexpired license for an agent.
     */
    function validateAccess(address user, bytes32 agentId)
        external view
        returns (bool hasAccess, uint256 activeLicenseId)
    {
        uint256[] storage licenses = userLicenses[user][agentId];
        for (uint256 i = 0; i < licenses.length; i++) {
            ActiveLicense storage lic = activeLicenses[licenses[i]];
            if (
                !lic.isRevoked &&
                block.timestamp < lic.expiresAt &&
                (lic.queryLimit == 0 || lic.queriesUsed < lic.queryLimit)
            ) {
                return (true, licenses[i]);
            }
        }
        return (false, 0);
    }

    /**
     * @notice Record a query against a license (called by oracle service).
     */
    function recordQuery(uint256 licenseId) external {
        ActiveLicense storage lic = activeLicenses[licenseId];
        require(!lic.isRevoked, "LicenseVault: license revoked");
        require(block.timestamp < lic.expiresAt, "LicenseVault: license expired");
        require(lic.queryLimit == 0 || lic.queriesUsed < lic.queryLimit, "LicenseVault: query limit reached");

        lic.queriesUsed++;

        emit QueryRecorded(licenseId, lic.queriesUsed, lic.queryLimit);
    }

    /**
     * @notice Revoke a license (creator or admin only).
     */
    function revokeLicense(uint256 licenseId) external {
        LicenseTier storage tier = licenseTiers[activeLicenses[licenseId].tierId];
        require(
            msg.sender == tier.creator || msg.sender == admin,
            "LicenseVault: unauthorized"
        );
        activeLicenses[licenseId].isRevoked = true;
        emit LicenseRevoked(licenseId, block.timestamp);
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    function getAgentTiers(bytes32 agentId) external view returns (uint256[] memory) {
        return agentTiers[agentId];
    }

    function getUserLicenses(address user, bytes32 agentId) external view returns (uint256[] memory) {
        return userLicenses[user][agentId];
    }

    // ──────────────────────────────────────────────
    //  Admin
    // ──────────────────────────────────────────────

    function setPlatformFee(uint256 _feeBps) external onlyAdmin {
        require(_feeBps <= 2000, "LicenseVault: fee too high"); // Max 20%
        platformFeeBps = _feeBps;
    }

    function setTreasury(address _treasury) external onlyAdmin {
        require(_treasury != address(0), "LicenseVault: invalid treasury");
        treasury = _treasury;
    }

    function setAdmin(address _admin) external onlyAdmin {
        require(_admin != address(0), "LicenseVault: invalid admin");
        admin = _admin;
    }
}
