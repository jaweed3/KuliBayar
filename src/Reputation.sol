// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./types/Reputation.sol";
import "./errors/ReputationErrors.sol";
import "./events/ReputationEvents.sol";

/**
 * @title Reputation
 * @notice On-chain reputation system for workers and kontraktors
 * @dev Soulbound-style profiles (non-transferable) that track job history and ratings
 */
contract Reputation is IReputationEvents {
    using ReputationTypes for ReputationTypes.Profile;

    // ============================================================
    //                        STATE
    // ============================================================

    uint256 public nextProfileId = 1;

    mapping(uint256 => ReputationTypes.Profile) public profiles;
    mapping(address => uint256) public addressToProfileId;
    mapping(uint256 => uint256[]) public profileJobIds;

    address public admin;
    address public escrowContract; // Trusted ProjectEscrow contract address

    // ============================================================
    //                       MODIFIERS
    // ============================================================

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAuthorized();
        _;
    }

    modifier onlyTrusted() {
        if (msg.sender != admin && msg.sender != escrowContract) revert NotAuthorized();
        _;
    }

    modifier profileExists(uint256 profileId) {
        if (profileId == 0 || profileId >= nextProfileId) revert ProfileNotFound();
        _;
    }

    modifier onlyProfileOwner(uint256 profileId) {
        if (msg.sender != profiles[profileId].user) revert NotProfileOwner();
        _;
    }

    // ============================================================
    //                      CONSTRUCTOR
    // ============================================================

    constructor() {
        admin = msg.sender;
    }

    /// @notice Set the trusted ProjectEscrow contract address
    /// @param _escrowContract Address of ProjectEscrow contract
    /// @dev Only admin can set this
    function setEscrowContract(address _escrowContract) external onlyAdmin {
        escrowContract = _escrowContract;
    }

    // ============================================================
    //                 PROFILE FUNCTIONS
    // ============================================================

    /// @notice Create a new reputation profile
    /// @param role Role of the user (Worker or Kontraktor)
    /// @return profileId ID of the created profile
    function createProfile(ReputationTypes.Role role) external returns (uint256) {
        if (addressToProfileId[msg.sender] != 0) revert ProfileAlreadyExists();

        uint256 profileId = nextProfileId++;

        profiles[profileId] = ReputationTypes.Profile({
            id: profileId,
            user: msg.sender,
            role: role,
            rating: 0,
            totalJobs: 0,
            onTimePayments: 0,
            disputes: 0,
            totalEarnings: 0,
            createdAt: block.timestamp,
            exists: true
        });

        addressToProfileId[msg.sender] = profileId;

        emit ProfileCreated(profileId, msg.sender, uint8(role));
        return profileId;
    }

    // ============================================================
    //                 JOB FUNCTIONS (Admin/Contract Only)
    // ============================================================

    /// @notice Record a completed job and update stats
    /// @dev Called by ProjectEscrow contract or admin after job completion
    /// @param profileId ID of the profile to update
    /// @param earnings Amount earned/spent in wei
    /// @param onTime Whether payment was on time
    function recordJobComplete(
        uint256 profileId,
        uint256 earnings,
        bool onTime
    ) external onlyTrusted profileExists(profileId) {
        ReputationTypes.Profile storage profile = profiles[profileId];

        profile.totalJobs++;
        profile.totalEarnings += earnings;

        if (onTime) {
            profile.onTimePayments++;
        }
    }

    /// @notice Update rating for a profile
    /// @dev Called by ProjectEscrow contract or admin after job completion
    /// @param profileId ID of the profile to update
    /// @param newRating New rating (100-500, representing 1.0-5.0 stars)
    function updateRating(
        uint256 profileId,
        uint256 newRating
    ) external onlyTrusted profileExists(profileId) {
        if (newRating < 100 || newRating > 500) revert InvalidRating();

        ReputationTypes.Profile storage profile = profiles[profileId];
        uint256 oldRating = profile.rating;
        uint256 oldTotalJobs = profile.totalJobs;

        // Simple moving average
        if (oldTotalJobs == 0) {
            profile.rating = newRating;
        } else {
            profile.rating = ((oldRating * oldTotalJobs) + newRating) / (oldTotalJobs + 1);
        }

        emit RatingUpdated(profileId, oldRating, profile.rating);
    }

    /// @notice Record a dispute for a profile
    /// @dev Called by ProjectEscrow contract or admin
    /// @param profileId ID of the profile to update
    function recordDispute(uint256 profileId) external onlyTrusted profileExists(profileId) {
        profiles[profileId].disputes++;
        emit DisputeRecorded(profileId, profiles[profileId].disputes);
    }

    // ============================================================
    //                  VIEW FUNCTIONS
    // ============================================================

    /// @notice Get profile by ID
    /// @param profileId ID of the profile
    /// @return Profile data
    function getProfile(uint256 profileId) external view profileExists(profileId) returns (ReputationTypes.Profile memory) {
        return profiles[profileId];
    }

    /// @notice Get profile ID for an address
    /// @param user Address to look up
    /// @return profileId Profile ID (0 if not found)
    function getProfileByAddress(address user) external view returns (uint256) {
        return addressToProfileId[user];
    }

    /// @notice Check if a worker is reliable (high rating, few disputes)
    /// @param profileId ID of the profile
    /// @return reliable True if rating > 4.0 (400) and disputes < 3
    function isReliable(uint256 profileId) external view profileExists(profileId) returns (bool) {
        ReputationTypes.Profile storage profile = profiles[profileId];
        return profile.rating >= 400 && profile.disputes < 3;
    }

    /// @notice Get on-time payment percentage
    /// @param profileId ID of the profile
    /// @return percentage On-time payment rate (0-100)
    function getOnTimeRate(uint256 profileId) external view profileExists(profileId) returns (uint256) {
        ReputationTypes.Profile storage profile = profiles[profileId];
        if (profile.totalJobs == 0) return 0;
        return (profile.onTimePayments * 100) / profile.totalJobs;
    }

    /// @notice Get total number of profiles
    /// @return count Total profiles created
    function getProfileCount() external view returns (uint256) {
        return nextProfileId - 1;
    }
}
