// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Project Types
 * @notice Structs and enums for KuliBayar project system
 */
library ProjectTypes {
    enum Status {
        Created, // Project created, waiting for deposit
        Funded, // Funds deposited, work can begin
        Active, // Work in progress
        Disputed, // Dispute raised, funds locked
        Completed, // All work done, all funds released
        Cancelled // Project cancelled, funds refunded
    }

    struct Project {
        uint256 id;
        address kontraktor;
        address kuli;
        uint256 totalAmount; // Total escrow amount in wei
        uint256 dailyRate; // Daily rate in wei
        uint256 durationDays; // Project duration in days
        uint256 daysCompleted; // Days verified as complete
        uint256 totalReleased; // Total amount released to kuli
        uint256 startTime; // Timestamp when work started
        Status status;
    }

    struct WorkProof {
        uint256 id;
        uint256 projectId;
        address submittedBy;
        string photoHash; // IPFS/Greenfield hash
        int256 latitude; // GPS lat (scaled by 1e6)
        int256 longitude; // GPS lng (scaled by 1e6)
        uint256 timestamp;
        bool verified;
    }
}
