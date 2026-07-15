// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./types/Project.sol";
import "./errors/ProjectEscrowErrors.sol";
import "./events/ProjectEscrowEvents.sol";

/**
 * @title ProjectEscrow
 * @notice Escrow contract for construction project payments
 * @dev Locks kontraktor's funds and releases to kuli based on verified work
 */
contract ProjectEscrow is IProjectEscrowEvents {
    using ProjectTypes for ProjectTypes.Project;
    using ProjectTypes for ProjectTypes.WorkProof;

    // ============================================================
    //                        STATE
    // ============================================================

    uint256 public nextProjectId = 1;
    uint256 public nextProofId = 1;

    mapping(uint256 => ProjectTypes.Project) public projects;
    mapping(uint256 => ProjectTypes.WorkProof[]) public projectProofs;
    mapping(uint256 => mapping(uint256 => bool)) public proofVerified;
    mapping(uint256 => bool) public projectDisputed;

    address public admin;

    // ============================================================
    //                       MODIFIERS
    // ============================================================

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAuthorized();
        _;
    }

    modifier onlyKontraktor(uint256 projectId) {
        if (msg.sender != projects[projectId].kontraktor) revert NotAuthorized();
        _;
    }

    modifier onlyKuli(uint256 projectId) {
        if (msg.sender != projects[projectId].kuli) revert NotAuthorized();
        _;
    }

    modifier projectExists(uint256 projectId) {
        if (projectId == 0 || projectId >= nextProjectId) revert InvalidProjectId();
        _;
    }

    // ============================================================
    //                      CONSTRUCTOR
    // ============================================================

    constructor() {
        admin = msg.sender;
    }

    // ============================================================
    //                 KONTRAKTOR FUNCTIONS
    // ============================================================

    /// @notice Create a new project and set payment terms
    /// @param _kuli Address of the worker
    /// @param _dailyRate Daily payment rate in wei
    /// @param _durationDays Project duration in days
    /// @return projectId ID of the created project
    function createProject(
        address _kuli,
        uint256 _dailyRate,
        uint256 _durationDays
    ) external returns (uint256) {
        uint256 projectId = nextProjectId++;
        uint256 totalAmount = _dailyRate * _durationDays;

        projects[projectId] = ProjectTypes.Project({
            id: projectId,
            kontraktor: msg.sender,
            kuli: _kuli,
            totalAmount: totalAmount,
            dailyRate: _dailyRate,
            durationDays: _durationDays,
            daysCompleted: 0,
            totalReleased: 0,
            startTime: 0,
            status: ProjectTypes.Status.Created
        });

        emit ProjectCreated(projectId, msg.sender, _kuli, totalAmount, _dailyRate, _durationDays);
        return projectId;
    }

    /// @notice Deposit funds into escrow to activate the project
    /// @param projectId ID of the project
    function depositFunds(uint256 projectId) external payable projectExists(projectId) onlyKontraktor(projectId) {
        ProjectTypes.Project storage project = projects[projectId];

        if (project.status != ProjectTypes.Status.Created) revert ProjectNotActive();
        if (msg.value < project.totalAmount) revert InsufficientFunds();

        project.status = ProjectTypes.Status.Funded;
        emit FundsDeposited(projectId, msg.value);
    }

    /// @notice Start the project (kuli begins work)
    /// @param projectId ID of the project
    function startProject(uint256 projectId) external projectExists(projectId) onlyKontraktor(projectId) {
        ProjectTypes.Project storage project = projects[projectId];

        if (project.status != ProjectTypes.Status.Funded) revert ProjectNotActive();

        project.status = ProjectTypes.Status.Active;
        project.startTime = block.timestamp;
    }

    // ============================================================
    //                   KULI FUNCTIONS
    // ============================================================

    /// @notice Submit work proof with photo and GPS data
    /// @param projectId ID of the project
    /// @param _photoHash IPFS/Greenfield hash of the photo
    /// @param _latitude GPS latitude (scaled by 1e6)
    /// @param _longitude GPS longitude (scaled by 1e6)
    /// @return proofId ID of the submitted proof
    /// @notice Validates GPS coordinates to prevent invalid data storage
    function submitWorkProof(
        uint256 projectId,
        string calldata _photoHash,
        int256 _latitude,
        int256 _longitude
    ) external projectExists(projectId) onlyKuli(projectId) returns (uint256) {
        ProjectTypes.Project storage project = projects[projectId];

        if (project.status != ProjectTypes.Status.Active) revert ProjectNotActive();
        if (projectDisputed[projectId]) revert ProjectNotActive();

        // Validate GPS coordinates (scaled by 1e6)
        // Latitude: -90 to 90 degrees = -90000000 to 90000000
        // Longitude: -180 to 180 degrees = -180000000 to 180000000
        if (_latitude < -90000000 || _latitude > 90000000) revert InvalidCoordinates();
        if (_longitude < -180000000 || _longitude > 180000000) revert InvalidCoordinates();

        uint256 proofId = nextProofId++;

        projectProofs[projectId].push(ProjectTypes.WorkProof({
            id: proofId,
            projectId: projectId,
            submittedBy: msg.sender,
            photoHash: _photoHash,
            latitude: _latitude,
            longitude: _longitude,
            timestamp: block.timestamp,
            verified: false
        }));

        emit WorkProofSubmitted(projectId, proofId, _photoHash);
        return proofId;
    }

    // ============================================================
    //              ADMIN FUNCTIONS (AI Oracle)
    // ============================================================

    /// @notice Verify work proof and release payment if valid
    /// @dev Called by AI oracle after photo verification
    /// @param projectId ID of the project
    /// @param _proofId ID of the work proof
    /// @param _verified Whether the proof is valid
    function verifyWorkProof(
        uint256 projectId,
        uint256 _proofId,
        bool _verified
    ) external onlyAdmin projectExists(projectId) {
        ProjectTypes.Project storage project = projects[projectId];
        ProjectTypes.WorkProof storage proof = projectProofs[projectId][_proofId - 1];

        if (proof.verified) return;

        proof.verified = _verified;
        proofVerified[projectId][_proofId] = _verified;

        emit WorkProofVerified(projectId, _proofId, _verified);

        if (_verified && project.status == ProjectTypes.Status.Active) {
            _releasePayment(projectId);
        }
    }

    /// @dev Internal function to release daily payment
    /// @notice Uses Checks-Effects-Interactions pattern to prevent reentrancy
    function _releasePayment(uint256 projectId) internal {
        ProjectTypes.Project storage project = projects[projectId];

        if (project.daysCompleted >= project.durationDays) return;
        if (project.totalReleased >= project.totalAmount) return;

        uint256 amountToRelease = project.dailyRate;
        uint256 remaining = project.totalAmount - project.totalReleased;

        if (amountToRelease > remaining) {
            amountToRelease = remaining;
        }

        // EFFECTS: Update state BEFORE external call (reentrancy protection)
        project.daysCompleted++;
        project.totalReleased += amountToRelease;

        bool completed = project.daysCompleted >= project.durationDays || project.totalReleased >= project.totalAmount;
        if (completed) {
            project.status = ProjectTypes.Status.Completed;
        }

        // INTERACTIONS: External call AFTER state updates
        emit PaymentReleased(projectId, project.kuli, amountToRelease, project.daysCompleted);
        (bool success, ) = project.kuli.call{value: amountToRelease}("");
        require(success, "Transfer failed");

        if (completed) {
            emit ProjectCompleted(projectId, project.totalReleased);
        }
    }

    // ============================================================
    //                  DISPUTE FUNCTIONS
    // ============================================================

    /// @notice Raise a dispute (can be called by kontraktor or kuli)
    /// @param projectId ID of the project
    /// @param _reason Reason for dispute
    function raiseDispute(uint256 projectId, string calldata _reason) external projectExists(projectId) {
        ProjectTypes.Project storage project = projects[projectId];

        if (msg.sender != project.kontraktor && msg.sender != project.kuli) revert NotAuthorized();
        if (project.status == ProjectTypes.Status.Completed || project.status == ProjectTypes.Status.Cancelled) {
            revert AlreadyCompleted();
        }

        project.status = ProjectTypes.Status.Disputed;
        projectDisputed[projectId] = true;

        emit DisputeRaised(projectId, msg.sender, _reason);
    }

    /// @notice Resolve a dispute (admin only)
    /// @param projectId ID of the project
    /// @param _favorKuli Whether the dispute is resolved in favor of kuli
    /// @param _amount Amount to release (to kuli) or refund (to kontraktor)
    /// @notice Uses Checks-Effects-Interactions pattern to prevent reentrancy
    function resolveDispute(
        uint256 projectId,
        bool _favorKuli,
        uint256 _amount
    ) external onlyAdmin projectExists(projectId) {
        ProjectTypes.Project storage project = projects[projectId];

        if (project.status != ProjectTypes.Status.Disputed) revert ProjectNotActive();

        uint256 remaining = project.totalAmount - project.totalReleased;
        if (_amount > remaining) _amount = remaining;

        // EFFECTS: Update state BEFORE external calls (reentrancy protection)
        project.status = ProjectTypes.Status.Completed;

        if (_favorKuli) {
            project.totalReleased += _amount;

            emit DisputeResolved(projectId, true, _amount);
            emit PaymentReleased(projectId, project.kuli, _amount, project.daysCompleted);

            // INTERACTIONS: External call AFTER state updates
            (bool success, ) = project.kuli.call{value: _amount}("");
            require(success, "Transfer failed");
        } else {
            emit DisputeResolved(projectId, false, _amount);

            // INTERACTIONS: External call AFTER state updates
            (bool success, ) = project.kontraktor.call{value: _amount}("");
            require(success, "Refund failed");
        }

        emit ProjectCompleted(projectId, project.totalReleased);
    }

    // ============================================================
    //                  CANCEL FUNCTIONS
    // ============================================================

    /// @notice Cancel project and refund remaining funds (admin only)
    /// @param projectId ID of the project
    /// @notice Uses Checks-Effects-Interactions pattern to prevent reentrancy
    function cancelProject(uint256 projectId) external onlyAdmin projectExists(projectId) {
        ProjectTypes.Project storage project = projects[projectId];

        if (project.status == ProjectTypes.Status.Completed || project.status == ProjectTypes.Status.Cancelled) {
            revert AlreadyCompleted();
        }

        uint256 refundAmount = project.totalAmount - project.totalReleased;

        // EFFECTS: Update state BEFORE external call (reentrancy protection)
        project.status = ProjectTypes.Status.Cancelled;
        emit ProjectCancelled(projectId, refundAmount);

        // INTERACTIONS: External call AFTER state updates
        if (refundAmount > 0) {
            (bool success, ) = project.kontraktor.call{value: refundAmount}("");
            require(success, "Refund failed");
        }
    }

    // ============================================================
    //                  VIEW FUNCTIONS
    // ============================================================

    /// @notice Get project details
    /// @param projectId ID of the project
    /// @return Project data
    function getProject(uint256 projectId) external view projectExists(projectId) returns (ProjectTypes.Project memory) {
        return projects[projectId];
    }

    /// @notice Get all proofs for a project
    /// @param projectId ID of the project
    /// @return proofs Array of work proofs
    function getProjectProofs(uint256 projectId) external view projectExists(projectId) returns (ProjectTypes.WorkProof[] memory) {
        return projectProofs[projectId];
    }

    /// @notice Get contract balance
    /// @return balance Total ETH held in escrow
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
