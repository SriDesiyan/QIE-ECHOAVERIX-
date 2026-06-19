// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ReputationAnchor
 * @author QIE EchoAverix Team
 * @notice Anchors EchoScore™ benchmark results on-chain for immutable reputation
 *         tracking. Each score submission is hashed and stored with version binding,
 *         creating a tamper-proof audit trail of agent quality over time.
 * @dev Part of QIE EchoAverix Layer 4 — EchoScore™ Benchmarking.
 *      Scores are computed off-chain by the EchoAverix Oracle and anchored here.
 */
contract ReputationAnchor {

    // ──────────────────────────────────────────────
    //  Types
    // ──────────────────────────────────────────────

    struct ScoreAnchor {
        bytes32  agentId;           // Agent this score belongs to
        uint256  agentVersion;      // Version of the agent when scored
        uint256  compositeScore;    // EchoScore™ composite (0-1000)
        bytes32  dimensionHash;     // Keccak256 of individual dimension scores JSON
        address  oracle;            // Address of the oracle that submitted the score
        uint256  anchoredAt;        // Block timestamp
        uint256  blockNumber;       // Block number for verifiability
    }

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────

    /// @dev Auto-incrementing anchor ID
    uint256 public nextAnchorId;

    /// @dev anchorId => ScoreAnchor
    mapping(uint256 => ScoreAnchor) public anchors;

    /// @dev agentId => list of anchor IDs (score history)
    mapping(bytes32 => uint256[]) public agentScoreHistory;

    /// @dev agentId => latest composite score
    mapping(bytes32 => uint256) public latestScore;

    /// @dev agentId => latest anchor ID
    mapping(bytes32 => uint256) public latestAnchorId;

    /// @dev Authorized oracle addresses that can submit scores
    mapping(address => bool) public authorizedOracles;

    /// @dev Total number of anchored scores
    uint256 public totalAnchors;

    address public admin;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────

    event ScoreAnchored(
        uint256 indexed anchorId,
        bytes32 indexed agentId,
        uint256 compositeScore,
        uint256 agentVersion,
        bytes32 dimensionHash,
        address indexed oracle,
        uint256 timestamp
    );

    event OracleAuthorized(address indexed oracle, uint256 timestamp);
    event OracleRevoked(address indexed oracle, uint256 timestamp);

    // ──────────────────────────────────────────────
    //  Modifiers
    // ──────────────────────────────────────────────

    modifier onlyOracle() {
        require(authorizedOracles[msg.sender], "ReputationAnchor: not authorized oracle");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "ReputationAnchor: not admin");
        _;
    }

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────

    constructor() {
        admin = msg.sender;
        authorizedOracles[msg.sender] = true; // Admin is first oracle
    }

    // ──────────────────────────────────────────────
    //  Score Anchoring
    // ──────────────────────────────────────────────

    /**
     * @notice Anchor a computed EchoScore™ on-chain.
     * @param agentId         The agent being scored
     * @param agentVersion    The version of the agent at scoring time
     * @param compositeScore  The composite EchoScore (0-1000)
     * @param dimensionHash   Keccak256 hash of the dimension scores JSON
     *                        e.g., keccak256('{"accuracy":970,"reliability":950,...}')
     */
    function anchorScore(
        bytes32  agentId,
        uint256  agentVersion,
        uint256  compositeScore,
        bytes32  dimensionHash
    ) external onlyOracle returns (uint256 anchorId) {
        require(compositeScore <= 1000, "ReputationAnchor: score exceeds maximum");
        require(agentVersion > 0, "ReputationAnchor: invalid version");

        anchorId = nextAnchorId++;

        anchors[anchorId] = ScoreAnchor({
            agentId:        agentId,
            agentVersion:   agentVersion,
            compositeScore: compositeScore,
            dimensionHash:  dimensionHash,
            oracle:         msg.sender,
            anchoredAt:     block.timestamp,
            blockNumber:    block.number
        });

        agentScoreHistory[agentId].push(anchorId);
        latestScore[agentId]    = compositeScore;
        latestAnchorId[agentId] = anchorId;
        totalAnchors++;

        emit ScoreAnchored(
            anchorId, agentId, compositeScore, agentVersion, 
            dimensionHash, msg.sender, block.timestamp
        );
    }

    // ──────────────────────────────────────────────
    //  Score Verification
    // ──────────────────────────────────────────────

    /**
     * @notice Verify a score by comparing dimension data against the anchored hash.
     * @param anchorId         The anchor ID to verify against
     * @param dimensionJson    The raw JSON string of dimension scores
     * @return isValid         Whether the hash matches
     */
    function verifyScore(uint256 anchorId, string calldata dimensionJson)
        external view
        returns (bool isValid)
    {
        ScoreAnchor storage anchor = anchors[anchorId];
        require(anchor.anchoredAt != 0, "ReputationAnchor: anchor does not exist");

        bytes32 computedHash = keccak256(bytes(dimensionJson));
        return computedHash == anchor.dimensionHash;
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    function getScoreHistory(bytes32 agentId)
        external view
        returns (uint256[] memory anchorIds)
    {
        return agentScoreHistory[agentId];
    }

    function getAnchor(uint256 anchorId)
        external view
        returns (ScoreAnchor memory)
    {
        require(anchors[anchorId].anchoredAt != 0, "ReputationAnchor: not found");
        return anchors[anchorId];
    }

    function getLatestScore(bytes32 agentId) external view returns (uint256) {
        return latestScore[agentId];
    }

    function getScoreCount(bytes32 agentId) external view returns (uint256) {
        return agentScoreHistory[agentId].length;
    }

    /**
     * @notice Get the score trend (last N scores) for an agent.
     */
    function getScoreTrend(bytes32 agentId, uint256 count)
        external view
        returns (uint256[] memory scores, uint256[] memory timestamps)
    {
        uint256[] storage history = agentScoreHistory[agentId];
        uint256 len = history.length;
        uint256 resultLen = count > len ? len : count;

        scores     = new uint256[](resultLen);
        timestamps = new uint256[](resultLen);

        for (uint256 i = 0; i < resultLen; i++) {
            uint256 idx = len - resultLen + i;
            ScoreAnchor storage a = anchors[history[idx]];
            scores[i]     = a.compositeScore;
            timestamps[i] = a.anchoredAt;
        }
    }

    // ──────────────────────────────────────────────
    //  Oracle Management
    // ──────────────────────────────────────────────

    function authorizeOracle(address oracle) external onlyAdmin {
        require(oracle != address(0), "ReputationAnchor: invalid oracle");
        authorizedOracles[oracle] = true;
        emit OracleAuthorized(oracle, block.timestamp);
    }

    function revokeOracle(address oracle) external onlyAdmin {
        authorizedOracles[oracle] = false;
        emit OracleRevoked(oracle, block.timestamp);
    }

    function setAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "ReputationAnchor: invalid admin");
        admin = newAdmin;
    }
}
