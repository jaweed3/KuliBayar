// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Reputation Events
 * @notice Events for Reputation contract
 */
interface IReputationEvents {
    event ProfileCreated(uint256 indexed profileId, address indexed user, uint8 role);
    event JobCompleted(uint256 indexed profileId, uint256 jobId, uint256 earnings);
    event RatingUpdated(uint256 indexed profileId, uint256 oldRating, uint256 newRating);
    event DisputeRecorded(uint256 indexed profileId, uint256 disputeId);
}
