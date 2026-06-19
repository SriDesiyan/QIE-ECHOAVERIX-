// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EchoAgentRegistry
 * @author QIE EchoAverix Team
 * @notice On-chain registry for AI expert agents (EchoTwins) with versioned 
 *         ownership, metadata anchoring, and creator provenance tracking.
 * @dev Part of the QIE EchoAverix Layer 2 — EchoTwin Registry.
 *      Each agent is a unique digital asset tied to a verified QIE Pass holder.
 */
contract EchoAgentRegistry {

    // ──────────────────────────────────────────────
    //  Types
    // ──────────────────────────────────────────────

    struct AgentRecord {
        bytes32  agentId;          // Unique agent identifier (keccak256 hash)
        address  creator;          // QIE Pass–verified creator address
        string   metadataUri;      // IPFS / Arweave URI for off-chain metadata
        uint256  version;          // Current version number (starts at 1)
        uint256  createdAt;        // Block timestamp of initial registration
        uint256  updatedAt;        // Block timestamp of latest update
        bool     isActive;         // Whether the agent is published and queryable
    }

    struct VersionEntry {
        uint256  version;          // Version number
        string   metadataUri;      // Metadata URI for this version
        bytes32  changelogHash;    // Keccak256 hash of the changelog text
        uint256  publishedAt;      // Block timestamp
    }

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────

    /// @dev agentId => AgentRecord
    mapping(bytes32 => AgentRecord) private _agents;

    /// @dev agentId => version => VersionEntry
    mapping(bytes32 => mapping(uint256 => VersionEntry)) private _versions;

    /// @dev creator address => list of agentIds they own
    mapping(address => bytes32[]) private _creatorAgents;

    /// @dev Total number of registered agents
    uint256 public totalAgents;

    /// @dev Platform administrator (for moderation)
    address public admin;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────

    event AgentRegistered(
        bytes32 indexed agentId,
        address indexed creator,
        string metadataUri,
        uint256 timestamp
    );

    event AgentVersionPublished(
        bytes32 indexed agentId,
        uint256 version,
        string metadataUri,
        bytes32 changelogHash,
        uint256 timestamp
    );

    event AgentStatusChanged(
        bytes32 indexed agentId,
        bool isActive,
        uint256 timestamp
    );

    event AgentOwnershipTransferred(
        bytes32 indexed agentId,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 timestamp
    );

    // ──────────────────────────────────────────────
    //  Modifiers
    // ──────────────────────────────────────────────

    modifier onlyCreator(bytes32 agentId) {
        require(_agents[agentId].creator == msg.sender, "EchoRegistry: caller is not the agent creator");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "EchoRegistry: caller is not admin");
        _;
    }

    modifier agentExists(bytes32 agentId) {
        require(_agents[agentId].createdAt != 0, "EchoRegistry: agent does not exist");
        _;
    }

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────

    constructor() {
        admin = msg.sender;
    }

    // ──────────────────────────────────────────────
    //  Registration
    // ──────────────────────────────────────────────

    /**
     * @notice Register a new AI expert agent on the EchoTwin Registry.
     * @param agentId       Unique identifier (caller-generated keccak256 hash)
     * @param metadataUri   Off-chain URI pointing to the agent's full metadata
     */
    function registerAgent(
        bytes32 agentId,
        string calldata metadataUri
    ) external {
        require(_agents[agentId].createdAt == 0, "EchoRegistry: agent already registered");
        require(bytes(metadataUri).length > 0, "EchoRegistry: metadata URI required");

        AgentRecord storage record = _agents[agentId];
        record.agentId     = agentId;
        record.creator     = msg.sender;
        record.metadataUri = metadataUri;
        record.version     = 1;
        record.createdAt   = block.timestamp;
        record.updatedAt   = block.timestamp;
        record.isActive    = true;

        // Store version 1
        _versions[agentId][1] = VersionEntry({
            version:       1,
            metadataUri:   metadataUri,
            changelogHash: keccak256(bytes("Initial registration")),
            publishedAt:   block.timestamp
        });

        _creatorAgents[msg.sender].push(agentId);
        totalAgents++;

        emit AgentRegistered(agentId, msg.sender, metadataUri, block.timestamp);
        emit AgentVersionPublished(agentId, 1, metadataUri, keccak256(bytes("Initial registration")), block.timestamp);
    }

    // ──────────────────────────────────────────────
    //  Version Management
    // ──────────────────────────────────────────────

    /**
     * @notice Publish a new version of an agent with updated metadata.
     * @param agentId       The agent to update
     * @param metadataUri   New metadata URI for this version
     * @param changelogHash Keccak256 hash of the changelog describing changes
     */
    function publishVersion(
        bytes32 agentId,
        string calldata metadataUri,
        bytes32 changelogHash
    ) external onlyCreator(agentId) agentExists(agentId) {
        require(bytes(metadataUri).length > 0, "EchoRegistry: metadata URI required");

        AgentRecord storage record = _agents[agentId];
        record.version++;
        record.metadataUri = metadataUri;
        record.updatedAt   = block.timestamp;

        _versions[agentId][record.version] = VersionEntry({
            version:       record.version,
            metadataUri:   metadataUri,
            changelogHash: changelogHash,
            publishedAt:   block.timestamp
        });

        emit AgentVersionPublished(agentId, record.version, metadataUri, changelogHash, block.timestamp);
    }

    // ──────────────────────────────────────────────
    //  Status Management
    // ──────────────────────────────────────────────

    /**
     * @notice Toggle an agent's active status (publish / unpublish).
     */
    function setAgentStatus(bytes32 agentId, bool isActive)
        external
        onlyCreator(agentId)
        agentExists(agentId)
    {
        _agents[agentId].isActive  = isActive;
        _agents[agentId].updatedAt = block.timestamp;

        emit AgentStatusChanged(agentId, isActive, block.timestamp);
    }

    // ──────────────────────────────────────────────
    //  Ownership Transfer (internal registry-level)
    // ──────────────────────────────────────────────

    /**
     * @notice Transfer agent ownership to a new address.
     * @dev    For full legacy transfer with time-locks, use LegacyAgentTransfer contract.
     */
    function transferOwnership(bytes32 agentId, address newOwner)
        external
        onlyCreator(agentId)
        agentExists(agentId)
    {
        require(newOwner != address(0), "EchoRegistry: invalid new owner");
        require(newOwner != msg.sender, "EchoRegistry: already the owner");

        address previousOwner = _agents[agentId].creator;
        _agents[agentId].creator   = newOwner;
        _agents[agentId].updatedAt = block.timestamp;

        _creatorAgents[newOwner].push(agentId);

        emit AgentOwnershipTransferred(agentId, previousOwner, newOwner, block.timestamp);
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    function getAgent(bytes32 agentId)
        external view agentExists(agentId)
        returns (AgentRecord memory)
    {
        return _agents[agentId];
    }

    function getVersion(bytes32 agentId, uint256 version)
        external view agentExists(agentId)
        returns (VersionEntry memory)
    {
        require(version > 0 && version <= _agents[agentId].version, "EchoRegistry: invalid version");
        return _versions[agentId][version];
    }

    function getAgentsByCreator(address creator)
        external view
        returns (bytes32[] memory)
    {
        return _creatorAgents[creator];
    }

    function getLatestVersion(bytes32 agentId)
        external view agentExists(agentId)
        returns (uint256)
    {
        return _agents[agentId].version;
    }

    // ──────────────────────────────────────────────
    //  Admin
    // ──────────────────────────────────────────────

    /**
     * @notice Admin can deactivate agents that violate platform policies.
     */
    function adminDeactivate(bytes32 agentId)
        external onlyAdmin agentExists(agentId)
    {
        _agents[agentId].isActive  = false;
        _agents[agentId].updatedAt = block.timestamp;

        emit AgentStatusChanged(agentId, false, block.timestamp);
    }

    function setAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "EchoRegistry: invalid admin address");
        admin = newAdmin;
    }
}
