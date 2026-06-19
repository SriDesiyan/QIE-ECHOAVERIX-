// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EchoAccessController
 * @author QIE EchoAverix Team
 * @notice Role-based access control for AI expert agents on the EchoAverix platform.
 *         Manages granular permissions: creator, subscriber, collaborator, admin, successor.
 * @dev Part of the QIE EchoAverix security layer. Works in conjunction with
 *      EchoAgentRegistry and AgentLicenseVault.
 */
contract EchoAccessController {

    // ──────────────────────────────────────────────
    //  Types
    // ──────────────────────────────────────────────

    enum AccessRole { None, Subscriber, Collaborator, Creator, Successor, Admin }

    struct AccessGrant {
        AccessRole  role;           // Granted role level
        uint256     grantedAt;      // When the access was granted
        uint256     expiresAt;      // When the access expires (0 = permanent)
        bool        isRevoked;      // Whether access was revoked
    }

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────

    /// @dev agentId => user address => AccessGrant
    mapping(bytes32 => mapping(address => AccessGrant)) private _grants;

    /// @dev agentId => list of addresses with grants
    mapping(bytes32 => address[]) private _grantees;

    /// @dev Platform admin
    address public admin;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────

    event AccessGranted(
        bytes32 indexed agentId,
        address indexed grantee,
        AccessRole role,
        uint256 expiresAt,
        uint256 timestamp
    );

    event AccessRevoked(
        bytes32 indexed agentId,
        address indexed grantee,
        uint256 timestamp
    );

    event AccessRoleUpdated(
        bytes32 indexed agentId,
        address indexed grantee,
        AccessRole previousRole,
        AccessRole newRole,
        uint256 timestamp
    );

    // ──────────────────────────────────────────────
    //  Modifiers
    // ──────────────────────────────────────────────

    modifier onlyAdmin() {
        require(msg.sender == admin, "AccessController: not admin");
        _;
    }

    modifier onlyAgentAuthority(bytes32 agentId) {
        AccessGrant storage grant = _grants[agentId][msg.sender];
        require(
            grant.role == AccessRole.Creator || 
            grant.role == AccessRole.Admin ||
            msg.sender == admin,
            "AccessController: insufficient authority"
        );
        _;
    }

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────

    constructor() {
        admin = msg.sender;
    }

    // ──────────────────────────────────────────────
    //  Grant Management
    // ──────────────────────────────────────────────

    /**
     * @notice Grant access to a user for a specific agent.
     * @param agentId   The agent to grant access for
     * @param grantee   The address receiving access
     * @param role      The access role to grant
     * @param expiresAt Expiration timestamp (0 for permanent)
     */
    function grantAccess(
        bytes32    agentId,
        address    grantee,
        AccessRole role,
        uint256    expiresAt
    ) external onlyAgentAuthority(agentId) {
        require(grantee != address(0), "AccessController: invalid grantee");
        require(role != AccessRole.None, "AccessController: cannot grant None role");

        AccessGrant storage existing = _grants[agentId][grantee];
        
        // Track new grantee if not previously granted
        if (existing.grantedAt == 0) {
            _grantees[agentId].push(grantee);
        }

        _grants[agentId][grantee] = AccessGrant({
            role:      role,
            grantedAt: block.timestamp,
            expiresAt: expiresAt,
            isRevoked: false
        });

        emit AccessGranted(agentId, grantee, role, expiresAt, block.timestamp);
    }

    /**
     * @notice Register the creator as the primary authority for an agent.
     * @dev Should be called by the EchoAgentRegistry upon agent registration.
     */
    function registerCreator(bytes32 agentId, address creator) external {
        require(_grants[agentId][creator].grantedAt == 0, "AccessController: creator already set");

        _grants[agentId][creator] = AccessGrant({
            role:      AccessRole.Creator,
            grantedAt: block.timestamp,
            expiresAt: 0,  // Permanent
            isRevoked: false
        });

        _grantees[agentId].push(creator);
        emit AccessGranted(agentId, creator, AccessRole.Creator, 0, block.timestamp);
    }

    /**
     * @notice Revoke a user's access to an agent.
     */
    function revokeAccess(bytes32 agentId, address grantee)
        external onlyAgentAuthority(agentId)
    {
        require(_grants[agentId][grantee].grantedAt != 0, "AccessController: no grant exists");
        require(_grants[agentId][grantee].role != AccessRole.Creator, "AccessController: cannot revoke creator");

        _grants[agentId][grantee].isRevoked = true;

        emit AccessRevoked(agentId, grantee, block.timestamp);
    }

    /**
     * @notice Update a user's access role for an agent.
     */
    function updateRole(bytes32 agentId, address grantee, AccessRole newRole)
        external onlyAgentAuthority(agentId)
    {
        AccessGrant storage grant = _grants[agentId][grantee];
        require(grant.grantedAt != 0, "AccessController: no grant exists");
        require(!grant.isRevoked, "AccessController: access revoked");

        AccessRole previousRole = grant.role;
        grant.role = newRole;

        emit AccessRoleUpdated(agentId, grantee, previousRole, newRole, block.timestamp);
    }

    // ──────────────────────────────────────────────
    //  Access Checks
    // ──────────────────────────────────────────────

    /**
     * @notice Check if a user has active access to an agent.
     */
    function checkAccess(bytes32 agentId, address user)
        external view
        returns (bool hasAccess, AccessRole role)
    {
        AccessGrant storage grant = _grants[agentId][user];
        
        if (grant.grantedAt == 0 || grant.isRevoked) {
            return (false, AccessRole.None);
        }

        if (grant.expiresAt != 0 && block.timestamp > grant.expiresAt) {
            return (false, AccessRole.None);
        }

        return (true, grant.role);
    }

    /**
     * @notice Get the access level for a specific user and agent.
     */
    function getAccessLevel(bytes32 agentId, address user)
        external view
        returns (AccessRole)
    {
        AccessGrant storage grant = _grants[agentId][user];
        
        if (grant.isRevoked || grant.grantedAt == 0) return AccessRole.None;
        if (grant.expiresAt != 0 && block.timestamp > grant.expiresAt) return AccessRole.None;

        return grant.role;
    }

    /**
     * @notice Get all grantees for an agent.
     */
    function getGrantees(bytes32 agentId)
        external view
        returns (address[] memory)
    {
        return _grantees[agentId];
    }

    /**
     * @notice Get the full access grant details for a user.
     */
    function getGrant(bytes32 agentId, address user)
        external view
        returns (AccessGrant memory)
    {
        return _grants[agentId][user];
    }

    // ──────────────────────────────────────────────
    //  Admin
    // ──────────────────────────────────────────────

    function setAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "AccessController: invalid admin");
        admin = newAdmin;
    }
}
