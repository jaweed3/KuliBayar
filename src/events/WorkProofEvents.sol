// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title WorkProof Events
 * @notice Events for WorkProof contract
 */
interface IWorkProofEvents {
    event ProofSubmitted(
        uint256 indexed proofId,
        uint256 indexed projectId,
        address indexed worker,
        string photoHash,
        int256 latitude,
        int256 longitude,
        uint256 timestamp
    );

    event ProofVerified(uint256 indexed proofId, address indexed verifiedBy, bool result);
}
