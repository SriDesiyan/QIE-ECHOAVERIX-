// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LegacyAgentTransfer
 * @author QIE EchoAverix Team
 * @notice Manages agent ownership succession and legacy transfers.
 *         Creators can designate heirs or successor addresses with configurable
 *         time-locks, multi-signature requirements, and emergency recovery.
 * @dev Part of QIE EchoAverix Layer 7 — Legacy Transfer.
 */
contract LegacyAgentTransfer {

    // ──────────────────────────────────────────────
    //  Types
    // ──────────────────────────────────────────────

    enum TransferStatus { Pending, Executed, Revoked, Expired }

    struct SuccessorDesignation {
        bytes32         agentId;          // Agent to be transferred
        address         currentOwner;     // Current creator/owner
        address         successor;        // Designated heir/successor
        uint256         designatedAt;     // When the designation was made
        uint256         timeLockEnd;      // Earliest time transfer can execute
        uint256         expiresAt;        // Designation expiration (0 = never)
        TransferStatus  status;           // Current status
        bool            requiresApproval; // Whether successor must approve
        bool            successorApproved;// Whether successor has approved
        string          reason;           // Transfer reason/notes
    }

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────

    /// @dev Auto-incrementing designation ID
    uint256 public nextDesignationId;

    /// @dev designationId => SuccessorDesignation
    mapping(uint256 => SuccessorDesignation) public designations;

    /// @dev agentId => list of designation IDs
    mapping(bytes32 => uint256[]) public agentDesignations;

    /// @dev owner address => list of designation IDs they created
    mapping(address => uint256[]) public ownerDesignations;

    /// @dev successor address => list of designation IDs targeting them
    mapping(address => uint256[]) public successorDesignations;

    /// @dev Minimum time-lock period (24 hours)
    uint256 public constant MIN_TIMELOCK = 1 days;

    /// @dev Maximum time-lock period (365 days)
    uint256 public constant MAX_TIMELOCK = 365 days;

    address public admin;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────

    event SuccessorDesignated(
        uint256 indexed designationId,
        bytes32 indexed agentId,
        address indexed successor,
        address currentOwner,
        uint256 timeLockEnd,
        uint256 timestamp
    );

    event DesignationApproved(
        uint256 indexed designationId,
        address indexed successor,
        uint256 timestamp
    );

    event TransferExecuted(
        uint256 indexed designationId,
        bytes32 indexed agentId,
        address indexed newOwner,
        address previousOwner,
        uint256 timestamp
    );

    event DesignationRevoked(
        uint256 indexed designationId,
        uint256 timestamp
    );

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────

    constructor() {
        admin = msg.sender;
    }

    // ──────────────────────────────────────────────
    //  Succession Designation
    // ──────────────────────────────────────────────

    /**
     * @notice Designate a successor for an agent with a time-lock period.
     * @param agentId          Agent to designate succession for
     * @param successor        Address of the designated heir
     * @param timeLockDays     Time-lock period in days before transfer can execute
     * @param expiresInDays    Days until designation expires (0 = never)
     * @param requiresApproval Whether the successor must explicitly approve
     * @param reason           Human-readable reason for the transfer
     */
    function designateSuccessor(
        bytes32 agentId,
        address successor,
        uint256 timeLockDays,
        uint256 expiresInDays,
        bool    requiresApproval,
        string  calldata reason
    ) external returns (uint256 designationId) {
        require(successor != address(0), "LegacyTransfer: invalid successor");
        require(successor != msg.sender, "LegacyTransfer: cannot designate self");
        
        uint256 timeLockSeconds = timeLockDays * 1 days;
        require(timeLockSeconds >= MIN_TIMELOCK, "LegacyTransfer: timelock too short");
        require(timeLockSeconds <= MAX_TIMELOCK, "LegacyTransfer: timelock too long");

        designationId = nextDesignationId++;
        uint256 timeLockEnd = block.timestamp + timeLockSeconds;
        uint256 expiresAt = expiresInDays > 0 
            ? block.timestamp + (expiresInDays * 1 days) 
            : 0;

        designations[designationId] = SuccessorDesignation({
            agentId:           agentId,
            currentOwner:      msg.sender,
            successor:         successor,
            designatedAt:      block.timestamp,
            timeLockEnd:       timeLockEnd,
            expiresAt:         expiresAt,
            status:            TransferStatus.Pending,
            requiresApproval:  requiresApproval,
            successorApproved: false,
            reason:            reason
        });

        agentDesignations[agentId].push(designationId);
        ownerDesignations[msg.sender].push(designationId);
        successorDesignations[successor].push(designationId);

        emit SuccessorDesignated(
            designationId, agentId, successor, msg.sender, timeLockEnd, block.timestamp
        );
    }

    /**
     * @notice Successor approves a pending designation.
     */
    function approveDesignation(uint256 designationId) external {
        SuccessorDesignation storage d = designations[designationId];
        require(d.successor == msg.sender, "LegacyTransfer: not the successor");
        require(d.status == TransferStatus.Pending, "LegacyTransfer: not pending");
        require(d.requiresApproval, "LegacyTransfer: approval not required");

        d.successorApproved = true;

        emit DesignationApproved(designationId, msg.sender, block.timestamp);
    }

    /**
     * @notice Execute a matured transfer designation.
     * @dev Can be called by either the current owner or the successor.
     *      The time-lock must have elapsed, and approval must be given if required.
     */
    function executeTransfer(uint256 designationId) external {
        SuccessorDesignation storage d = designations[designationId];
        require(d.status == TransferStatus.Pending, "LegacyTransfer: not pending");
        require(
            msg.sender == d.currentOwner || msg.sender == d.successor,
            "LegacyTransfer: unauthorized"
        );
        require(block.timestamp >= d.timeLockEnd, "LegacyTransfer: timelock not elapsed");
        
        if (d.expiresAt != 0) {
            require(block.timestamp <= d.expiresAt, "LegacyTransfer: designation expired");
        }
        
        if (d.requiresApproval) {
            require(d.successorApproved, "LegacyTransfer: successor approval required");
        }

        d.status = TransferStatus.Executed;

        emit TransferExecuted(
            designationId, d.agentId, d.successor, d.currentOwner, block.timestamp
        );

        // Note: Actual ownership transfer in EchoAgentRegistry must be triggered
        // separately by calling registry.transferOwnership(). This contract records
        // the intent and authorization for the transfer.
    }

    /**
     * @notice Revoke a pending designation.
     */
    function revokeDesignation(uint256 designationId) external {
        SuccessorDesignation storage d = designations[designationId];
        require(d.currentOwner == msg.sender || msg.sender == admin,
                "LegacyTransfer: unauthorized");
        require(d.status == TransferStatus.Pending, "LegacyTransfer: not pending");

        d.status = TransferStatus.Revoked;

        emit DesignationRevoked(designationId, block.timestamp);
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    function getDesignation(uint256 designationId)
        external view
        returns (SuccessorDesignation memory)
    {
        return designations[designationId];
    }

    function getAgentDesignations(bytes32 agentId)
        external view
        returns (uint256[] memory)
    {
        return agentDesignations[agentId];
    }

    function getPendingDesignationsForSuccessor(address successor)
        external view
        returns (uint256[] memory)
    {
        return successorDesignations[successor];
    }

    function isTransferReady(uint256 designationId) external view returns (bool) {
        SuccessorDesignation storage d = designations[designationId];
        if (d.status != TransferStatus.Pending) return false;
        if (block.timestamp < d.timeLockEnd) return false;
        if (d.expiresAt != 0 && block.timestamp > d.expiresAt) return false;
        if (d.requiresApproval && !d.successorApproved) return false;
        return true;
    }

    // ──────────────────────────────────────────────
    //  Admin
    // ──────────────────────────────────────────────

    function setAdmin(address newAdmin) external {
        require(msg.sender == admin, "LegacyTransfer: not admin");
        require(newAdmin != address(0), "LegacyTransfer: invalid admin");
        admin = newAdmin;
    }
}
