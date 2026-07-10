// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProjectEscrow Events
 * @notice Events for ProjectEscrow contract
 */
interface IProjectEscrowEvents {
    event ProjectCreated(
        uint256 indexed projectId,
        address indexed kontraktor,
        address indexed kuli,
        uint256 totalAmount,
        uint256 dailyRate,
        uint256 durationDays
    );

    event FundsDeposited(uint256 indexed projectId, uint256 amount);
    event PaymentReleased(uint256 indexed projectId, address indexed kuli, uint256 amount, uint256 day);
    event WorkProofSubmitted(uint256 indexed projectId, uint256 indexed proofId, string photoHash);
    event WorkProofVerified(uint256 indexed projectId, uint256 indexed proofId, bool verified);
    event DisputeRaised(uint256 indexed projectId, address indexed raisedBy, string reason);
    event DisputeResolved(uint256 indexed projectId, bool favorKuli, uint256 amount);
    event ProjectCompleted(uint256 indexed projectId, uint256 totalPaid);
    event ProjectCancelled(uint256 indexed projectId, uint256 refundAmount);
}
