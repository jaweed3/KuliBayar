// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Reputation.sol";
import "../src/types/Reputation.sol";
import "../src/errors/ReputationErrors.sol";

contract ReputationTest is Test {
    using ReputationTypes for ReputationTypes.Profile;

    Reputation public reputation;

    address public admin = address(this);
    address public worker1 = address(0x1);
    address public worker2 = address(0x2);
    address public kontraktor1 = address(0x3);
    address public randomUser = address(0x4);

    function setUp() public {
        reputation = new Reputation();
    }

    // ============================================================
    //                    TEST: CREATE PROFILE
    // ============================================================

    function test_CreateWorkerProfile() public {
        vm.prank(worker1);
        uint256 profileId = reputation.createProfile(ReputationTypes.Role.Worker);

        ReputationTypes.Profile memory profile = reputation.getProfile(profileId);

        assertEq(profile.user, worker1);
        assertEq(uint256(profile.role), uint256(ReputationTypes.Role.Worker));
        assertEq(profile.rating, 0);
        assertEq(profile.totalJobs, 0);
        assertTrue(profile.exists);
    }

    function test_CreateKontraktorProfile() public {
        vm.prank(kontraktor1);
        uint256 profileId = reputation.createProfile(ReputationTypes.Role.Kontraktor);

        ReputationTypes.Profile memory profile = reputation.getProfile(profileId);

        assertEq(profile.user, kontraktor1);
        assertEq(uint256(profile.role), uint256(ReputationTypes.Role.Kontraktor));
        assertTrue(profile.exists);
    }

    function test_RevertCreateDuplicateProfile() public {
        vm.prank(worker1);
        reputation.createProfile(ReputationTypes.Role.Worker);

        vm.prank(worker1);
        vm.expectRevert(ProfileAlreadyExists.selector);
        reputation.createProfile(ReputationTypes.Role.Worker);
    }

    // ============================================================
    //                    TEST: RECORD JOB COMPLETE
    // ============================================================

    function test_RecordJobComplete() public {
        vm.prank(worker1);
        uint256 profileId = reputation.createProfile(ReputationTypes.Role.Worker);

        reputation.recordJobComplete(profileId, 0.1 ether, true);

        ReputationTypes.Profile memory profile = reputation.getProfile(profileId);
        assertEq(profile.totalJobs, 1);
        assertEq(profile.totalEarnings, 0.1 ether);
        assertEq(profile.onTimePayments, 1);
    }

    function test_RecordMultipleJobs() public {
        vm.prank(worker1);
        uint256 profileId = reputation.createProfile(ReputationTypes.Role.Worker);

        reputation.recordJobComplete(profileId, 0.1 ether, true);
        reputation.recordJobComplete(profileId, 0.2 ether, true);
        reputation.recordJobComplete(profileId, 0.15 ether, false);

        ReputationTypes.Profile memory profile = reputation.getProfile(profileId);
        assertEq(profile.totalJobs, 3);
        assertEq(profile.totalEarnings, 0.45 ether);
        assertEq(profile.onTimePayments, 2);
    }

    function test_RevertRecordJobProfileNotFound() public {
        vm.expectRevert(ProfileNotFound.selector);
        reputation.recordJobComplete(999, 0.1 ether, true);
    }

    function test_RevertRecordJobNotAdmin() public {
        vm.prank(worker1);
        uint256 profileId = reputation.createProfile(ReputationTypes.Role.Worker);

        vm.prank(randomUser);
        vm.expectRevert(NotAuthorized.selector);
        reputation.recordJobComplete(profileId, 0.1 ether, true);
    }

    // ============================================================
    //                    TEST: UPDATE RATING
    // ============================================================

    function test_UpdateRatingFirstJob() public {
        vm.prank(worker1);
        uint256 profileId = reputation.createProfile(ReputationTypes.Role.Worker);

        reputation.updateRating(profileId, 500); // 5.0 stars

        ReputationTypes.Profile memory profile = reputation.getProfile(profileId);
        assertEq(profile.rating, 500);
    }

    function test_UpdateRatingMovingAverage() public {
        vm.prank(worker1);
        uint256 profileId = reputation.createProfile(ReputationTypes.Role.Worker);

        // First job: 5 stars (update rating BEFORE recording job)
        reputation.updateRating(profileId, 500);
        reputation.recordJobComplete(profileId, 0.1 ether, true);

        // Second job: 3 stars
        reputation.updateRating(profileId, 300);
        reputation.recordJobComplete(profileId, 0.1 ether, true);

        ReputationTypes.Profile memory profile = reputation.getProfile(profileId);
        // Moving average: (500 * 1 + 300) / 2 = 400
        assertEq(profile.rating, 400);
    }

    function test_RevertUpdateRatingTooLow() public {
        vm.prank(worker1);
        uint256 profileId = reputation.createProfile(ReputationTypes.Role.Worker);

        vm.expectRevert(InvalidRating.selector);
        reputation.updateRating(profileId, 50); // Below 100 (1.0 star)
    }

    function test_RevertUpdateRatingTooHigh() public {
        vm.prank(worker1);
        uint256 profileId = reputation.createProfile(ReputationTypes.Role.Worker);

        vm.expectRevert(InvalidRating.selector);
        reputation.updateRating(profileId, 600); // Above 500 (5.0 stars)
    }

    // ============================================================
    //                    TEST: RECORD DISPUTE
    // ============================================================

    function test_RecordDispute() public {
        vm.prank(worker1);
        uint256 profileId = reputation.createProfile(ReputationTypes.Role.Worker);

        reputation.recordDispute(profileId);
        reputation.recordDispute(profileId);

        ReputationTypes.Profile memory profile = reputation.getProfile(profileId);
        assertEq(profile.disputes, 2);
    }

    // ============================================================
    //                    TEST: VIEW FUNCTIONS
    // ============================================================

    function test_GetProfileByAddress() public {
        vm.prank(worker1);
        uint256 profileId = reputation.createProfile(ReputationTypes.Role.Worker);

        assertEq(reputation.getProfileByAddress(worker1), profileId);
        assertEq(reputation.getProfileByAddress(randomUser), 0);
    }

    function test_IsReliable() public {
        vm.prank(worker1);
        uint256 profileId = reputation.createProfile(ReputationTypes.Role.Worker);

        // Not reliable yet (no rating)
        assertFalse(reputation.isReliable(profileId));

        // Complete jobs and get good rating (update rating BEFORE recording job)
        for (uint256 i = 0; i < 5; i++) {
            reputation.updateRating(profileId, 450); // 4.5 stars
            reputation.recordJobComplete(profileId, 0.1 ether, true);
        }

        // Now reliable
        assertTrue(reputation.isReliable(profileId));
    }

    function test_IsReliableWithDisputes() public {
        vm.prank(worker1);
        uint256 profileId = reputation.createProfile(ReputationTypes.Role.Worker);

        // Good rating but too many disputes
        for (uint256 i = 0; i < 5; i++) {
            reputation.recordJobComplete(profileId, 0.1 ether, true);
            reputation.updateRating(profileId, 500);
        }
        reputation.recordDispute(profileId);
        reputation.recordDispute(profileId);
        reputation.recordDispute(profileId);

        // Not reliable due to disputes
        assertFalse(reputation.isReliable(profileId));
    }

    function test_GetOnTimeRate() public {
        vm.prank(worker1);
        uint256 profileId = reputation.createProfile(ReputationTypes.Role.Worker);

        // No jobs yet
        assertEq(reputation.getOnTimeRate(profileId), 0);

        // 2 on-time, 1 late
        reputation.recordJobComplete(profileId, 0.1 ether, true);
        reputation.recordJobComplete(profileId, 0.1 ether, true);
        reputation.recordJobComplete(profileId, 0.1 ether, false);

        assertEq(reputation.getOnTimeRate(profileId), 66); // 66%
    }

    function test_GetProfileCount() public {
        assertEq(reputation.getProfileCount(), 0);

        vm.prank(worker1);
        reputation.createProfile(ReputationTypes.Role.Worker);
        assertEq(reputation.getProfileCount(), 1);

        vm.prank(kontraktor1);
        reputation.createProfile(ReputationTypes.Role.Kontraktor);
        assertEq(reputation.getProfileCount(), 2);
    }
}
