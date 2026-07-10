// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../types/Project.sol";

/**
 * @title IProjectEscrow
 * @notice Interface for ProjectEscrow contract
 */
interface IProjectEscrow {
    // Functions - Kontraktor
    function createProject(
        address kuli,
        uint256 dailyRate,
        uint256 durationDays
    ) external returns (uint256);

    function depositFunds(uint256 projectId) external payable;
    function startProject(uint256 projectId) external;

    // Functions - Kuli
    function submitWorkProof(
        uint256 projectId,
        string calldata photoHash,
        int256 latitude,
        int256 longitude
    ) external returns (uint256);

    // Functions - Admin (AI Oracle)
    function verifyWorkProof(
        uint256 projectId,
        uint256 proofId,
        bool verified
    ) external;

    // Functions - Dispute
    function raiseDispute(uint256 projectId, string calldata reason) external;
    function resolveDispute(
        uint256 projectId,
        bool favorKuli,
        uint256 amount
    ) external;

    // Functions - Cancel
    function cancelProject(uint256 projectId) external;

    // View Functions
    function getProject(uint256 projectId) external view returns (ProjectTypes.Project memory);
    function getProjectProofs(uint256 projectId) external view returns (ProjectTypes.WorkProof[] memory);
    function getBalance() external view returns (uint256);
}
