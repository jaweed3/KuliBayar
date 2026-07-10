// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Reputation Types
 * @notice Structs and enums for reputation system
 */
library ReputationTypes {
    enum Role {
        Worker,      // Kuli bangunan
        Kontraktor   // Construction contractor
    }

    struct Profile {
        uint256 id;
        address user;
        Role role;
        uint256 rating;          // 1-5 stars (scaled by 100, e.g., 450 = 4.5 stars)
        uint256 totalJobs;       // Total jobs completed
        uint256 onTimePayments;  // Payments received/made on time
        uint256 disputes;        // Number of disputes involved in
        uint256 totalEarnings;   // Total ETH earned (worker) or spent (kontraktor)
        uint256 createdAt;       // Registration timestamp
        bool exists;             // Profile exists
    }
}
