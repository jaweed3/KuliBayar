// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./types/WorkProof.sol";
import "./errors/WorkProofErrors.sol";
import "./events/WorkProofEvents.sol";

/**
 * @title WorkProof
 * @notice On-chain work proof storage with photo hash and GPS verification
 * @dev Stores immutable evidence of work completion for dispute resolution
 */
contract WorkProof is IWorkProofEvents {
    using WorkProofTypes for WorkProofTypes.Proof;

    // ============================================================
    //                        STATE
    // ============================================================

    uint256 public nextProofId = 1;

    mapping(uint256 => WorkProofTypes.Proof) public proofs;
    mapping(uint256 => uint256[]) public projectProofs; // projectId => proofIds
    mapping(address => bool) public authorizedVerifiers; // AI oracle addresses

    address public admin;

    // ============================================================
    //                       MODIFIERS
    // ============================================================

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAuthorized();
        _;
    }

    modifier onlyVerifier() {
        if (!authorizedVerifiers[msg.sender]) revert NotAuthorized();
        _;
    }

    modifier proofExists(uint256 proofId) {
        if (proofId == 0 || proofId >= nextProofId) revert InvalidProofId();
        _;
    }

    // ============================================================
    //                      CONSTRUCTOR
    // ============================================================

    constructor() {
        admin = msg.sender;
    }

    // ============================================================
    //                 ADMIN FUNCTIONS
    // ============================================================

    /// @notice Authorize an AI oracle address to verify proofs
    /// @param verifier Address to authorize
    /// @param authorized Whether to authorize or deauthorize
    function setVerifier(address verifier, bool authorized) external onlyAdmin {
        authorizedVerifiers[verifier] = authorized;
    }

    // ============================================================
    //                 PROOF FUNCTIONS
    // ============================================================

    /// @notice Submit a work proof with photo and GPS data
    /// @param projectId ID of the project
    /// @param photoHash IPFS/Greenfield hash of the photo
    /// @param latitude GPS latitude (scaled by 1e6)
    /// @param longitude GPS longitude (scaled by 1e6)
    /// @return proofId ID of the submitted proof
    function submitProof(
        uint256 projectId,
        string calldata photoHash,
        int256 latitude,
        int256 longitude
    ) external returns (uint256) {
        uint256 proofId = nextProofId++;

        proofs[proofId] = WorkProofTypes.Proof({
            id: proofId,
            projectId: projectId,
            worker: msg.sender,
            photoHash: photoHash,
            latitude: latitude,
            longitude: longitude,
            timestamp: block.timestamp,
            verified: false,
            verifiedBy: address(0)
        });

        projectProofs[projectId].push(proofId);

        emit ProofSubmitted(proofId, projectId, msg.sender, photoHash, latitude, longitude, block.timestamp);
        return proofId;
    }

    /// @notice Verify a proof (AI oracle only)
    /// @param proofId ID of the proof
    /// @param result Whether the proof is valid
    function verifyProof(
        uint256 proofId,
        bool result
    ) external onlyVerifier proofExists(proofId) {
        WorkProofTypes.Proof storage proof = proofs[proofId];

        if (proof.verified) revert ProofAlreadyVerified();

        proof.verified = result;
        proof.verifiedBy = msg.sender;

        emit ProofVerified(proofId, msg.sender, result);
    }

    // ============================================================
    //                  VIEW FUNCTIONS
    // ============================================================

    /// @notice Get proof details
    /// @param proofId ID of the proof
    /// @return Proof data
    function getProof(uint256 proofId) external view proofExists(proofId) returns (WorkProofTypes.Proof memory) {
        return proofs[proofId];
    }

    /// @notice Get all proofs for a project
    /// @param projectId ID of the project
    /// @return proofIds Array of proof IDs
    function getProjectProofIds(uint256 projectId) external view returns (uint256[] memory) {
        return projectProofs[projectId];
    }

    /// @notice Get total number of proofs
    /// @return count Total proofs submitted
    function getProofCount() external view returns (uint256) {
        return nextProofId - 1;
    }
}
