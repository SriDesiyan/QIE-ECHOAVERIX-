// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EchoMeshRouter
 * @author QIE EchoAverix Team
 * @notice On-chain router for EchoMesh™ multi-expert collaboration sessions.
 *         Tracks which experts contributed to a mesh response, records attribution
 *         weights, and handles revenue distribution for collaborative queries.
 * @dev Part of QIE EchoAverix Layer 6 — EchoMesh™ Multi-Expert Collaboration.
 */
contract EchoMeshRouter is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ──────────────────────────────────────────────
    //  Types
    // ──────────────────────────────────────────────

    struct MeshSession {
        uint256     sessionId;        // Unique session identifier
        address     requester;        // User who initiated the mesh query
        bytes32     queryHash;        // Keccak256 of the original query
        bytes32[]   expertAgentIds;   // List of agent IDs that contributed
        uint256[]   attributionBps;   // Attribution weight per expert (basis points)
        uint256     totalCost;        // Total QUSDC cost for the session
        uint256     createdAt;        // Session creation timestamp
        bool        isFinalized;      // Whether results and attribution are final
        bytes32     resultHash;       // Keccak256 of the synthesized response
    }

    struct ExpertContribution {
        bytes32  agentId;          // Contributing agent
        uint256  attributionBps;   // Contribution weight (basis points)
        bytes32  responseHash;     // Hash of this expert's individual response
        uint256  latencyMs;        // Response latency in milliseconds
    }

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────

    IERC20 public immutable qusdcToken;

    uint256 public nextSessionId;

    /// @dev sessionId => MeshSession
    mapping(uint256 => MeshSession) public sessions;

    /// @dev sessionId => index => ExpertContribution
    mapping(uint256 => mapping(uint256 => ExpertContribution)) public contributions;

    /// @dev sessionId => number of contributions
    mapping(uint256 => uint256) public contributionCount;

    /// @dev agentId => list of session IDs the agent participated in
    mapping(bytes32 => uint256[]) public agentSessions;

    /// @dev requester => list of session IDs they created
    mapping(address => uint256[]) public requesterSessions;

    /// @dev Total mesh sessions completed
    uint256 public totalSessions;

    /// @dev Authorized orchestrators (oracle addresses)
    mapping(address => bool) public authorizedOrchestrators;

    address public admin;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────

    event MeshSessionCreated(
        uint256 indexed sessionId,
        address indexed requester,
        bytes32 queryHash,
        uint256 expertCount,
        uint256 timestamp
    );

    event ContributionRecorded(
        uint256 indexed sessionId,
        bytes32 indexed agentId,
        uint256 attributionBps,
        bytes32 responseHash,
        uint256 latencyMs
    );

    event MeshFinalized(
        uint256 indexed sessionId,
        bytes32 resultHash,
        uint256 totalCost,
        uint256 timestamp
    );

    // ──────────────────────────────────────────────
    //  Modifiers
    // ──────────────────────────────────────────────

    modifier onlyOrchestrator() {
        require(authorizedOrchestrators[msg.sender], "MeshRouter: not orchestrator");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "MeshRouter: not admin");
        _;
    }

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────

    constructor(address _qusdcToken) {
        require(_qusdcToken != address(0), "MeshRouter: invalid QUSDC");
        qusdcToken = IERC20(_qusdcToken);
        admin = msg.sender;
        authorizedOrchestrators[msg.sender] = true;
    }

    // ──────────────────────────────────────────────
    //  Session Management
    // ──────────────────────────────────────────────

    /**
     * @notice Create a new EchoMesh™ collaboration session.
     * @param requester      Address of the user requesting the mesh query
     * @param queryHash      Keccak256 hash of the query text
     * @param expertAgentIds List of agent IDs selected for collaboration
     */
    function createMeshSession(
        address   requester,
        bytes32   queryHash,
        bytes32[] calldata expertAgentIds
    ) external onlyOrchestrator returns (uint256 sessionId) {
        require(expertAgentIds.length >= 2, "MeshRouter: need at least 2 experts");
        require(expertAgentIds.length <= 10, "MeshRouter: max 10 experts");

        sessionId = nextSessionId++;

        MeshSession storage session = sessions[sessionId];
        session.sessionId     = sessionId;
        session.requester     = requester;
        session.queryHash     = queryHash;
        session.createdAt     = block.timestamp;
        session.isFinalized   = false;

        for (uint256 i = 0; i < expertAgentIds.length; i++) {
            session.expertAgentIds.push(expertAgentIds[i]);
            agentSessions[expertAgentIds[i]].push(sessionId);
        }

        requesterSessions[requester].push(sessionId);

        emit MeshSessionCreated(
            sessionId, requester, queryHash, expertAgentIds.length, block.timestamp
        );
    }

    /**
     * @notice Record an expert's contribution to a mesh session.
     * @param sessionId      The mesh session
     * @param agentId        The contributing agent
     * @param attributionBps Attribution weight in basis points
     * @param responseHash   Hash of the expert's individual response
     * @param latencyMs      Response time in milliseconds
     */
    function recordContribution(
        uint256 sessionId,
        bytes32 agentId,
        uint256 attributionBps,
        bytes32 responseHash,
        uint256 latencyMs
    ) external onlyOrchestrator {
        require(!sessions[sessionId].isFinalized, "MeshRouter: already finalized");

        uint256 idx = contributionCount[sessionId];
        contributions[sessionId][idx] = ExpertContribution({
            agentId:        agentId,
            attributionBps: attributionBps,
            responseHash:   responseHash,
            latencyMs:      latencyMs
        });

        sessions[sessionId].attributionBps.push(attributionBps);
        contributionCount[sessionId]++;

        emit ContributionRecorded(sessionId, agentId, attributionBps, responseHash, latencyMs);
    }

    /**
     * @notice Finalize a mesh session with the synthesized result.
     * @param sessionId  The session to finalize
     * @param resultHash Hash of the final synthesized response
     * @param totalCost  Total QUSDC cost for the session
     */
    function finalizeMesh(
        uint256 sessionId,
        bytes32 resultHash,
        uint256 totalCost
    ) external onlyOrchestrator {
        MeshSession storage session = sessions[sessionId];
        require(!session.isFinalized, "MeshRouter: already finalized");
        require(contributionCount[sessionId] > 0, "MeshRouter: no contributions");

        session.resultHash  = resultHash;
        session.totalCost   = totalCost;
        session.isFinalized = true;
        totalSessions++;

        emit MeshFinalized(sessionId, resultHash, totalCost, block.timestamp);
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    function getSession(uint256 sessionId) external view returns (MeshSession memory) {
        return sessions[sessionId];
    }

    function getContribution(uint256 sessionId, uint256 index)
        external view
        returns (ExpertContribution memory)
    {
        require(index < contributionCount[sessionId], "MeshRouter: invalid index");
        return contributions[sessionId][index];
    }

    function getAgentSessionCount(bytes32 agentId) external view returns (uint256) {
        return agentSessions[agentId].length;
    }

    function getRequesterSessions(address requester) external view returns (uint256[] memory) {
        return requesterSessions[requester];
    }

    function getSessionExperts(uint256 sessionId) external view returns (bytes32[] memory) {
        return sessions[sessionId].expertAgentIds;
    }

    // ──────────────────────────────────────────────
    //  Orchestrator Management
    // ──────────────────────────────────────────────

    function authorizeOrchestrator(address orchestrator) external onlyAdmin {
        require(orchestrator != address(0), "MeshRouter: invalid address");
        authorizedOrchestrators[orchestrator] = true;
    }

    function revokeOrchestrator(address orchestrator) external onlyAdmin {
        authorizedOrchestrators[orchestrator] = false;
    }

    function setAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "MeshRouter: invalid admin");
        admin = newAdmin;
    }
}
