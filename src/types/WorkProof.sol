// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title WorkProof Types
 * @notice Structs for work proof system
 */
library WorkProofTypes {
    struct Proof {
        uint256 id;
        uint256 projectId;
        address worker;
        string photoHash;      // IPFS/Greenfield hash
        int256 latitude;       // GPS lat (scaled by 1e6)
        int256 longitude;      // GPS lng (scaled by 1e6)
        uint256 timestamp;
        bool verified;
        address verifiedBy;    // AI oracle address
    }
}
