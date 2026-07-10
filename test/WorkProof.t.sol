// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/WorkProof.sol";
import "../src/types/WorkProof.sol";
import "../src/errors/WorkProofErrors.sol";

contract WorkProofTest is Test {
    using WorkProofTypes for WorkProofTypes.Proof;

    WorkProof public workProof;

    address public admin = address(this);
    address public worker1 = address(0x1);
    address public worker2 = address(0x2);
    address public verifier = address(0x3);
    address public randomUser = address(0x4);

    function setUp() public {
        workProof = new WorkProof();
        // Authorize verifier
        workProof.setVerifier(verifier, true);
    }

    // ============================================================
    //                    TEST: SUBMIT PROOF
    // ============================================================

    function test_SubmitProof() public {
        vm.prank(worker1);
        uint256 proofId = workProof.submitProof(
            1, // projectId
            "QmHash123",
            6598010,   // latitude * 1e6 (Jakarta)
            10684530   // longitude * 1e6 (Jakarta)
        );

        assertEq(proofId, 1);

        WorkProofTypes.Proof memory proof = workProof.getProof(proofId);
        assertEq(proof.projectId, 1);
        assertEq(proof.worker, worker1);
        assertEq(proof.photoHash, "QmHash123");
        assertEq(proof.latitude, 6598010);
        assertEq(proof.longitude, 10684530);
        assertFalse(proof.verified);
        assertEq(proof.verifiedBy, address(0));
    }

    function test_SubmitMultipleProofs() public {
        vm.prank(worker1);
        uint256 proofId1 = workProof.submitProof(1, "QmHash1", 6598010, 10684530);

        vm.prank(worker2);
        uint256 proofId2 = workProof.submitProof(1, "QmHash2", 6598020, 10684540);

        assertEq(proofId1, 1);
        assertEq(proofId2, 2);

        uint256[] memory proofIds = workProof.getProjectProofIds(1);
        assertEq(proofIds.length, 2);
        assertEq(proofIds[0], 1);
        assertEq(proofIds[1], 2);
    }

    // ============================================================
    //                    TEST: VERIFY PROOF
    // ============================================================

    function test_VerifyProof() public {
        vm.prank(worker1);
        uint256 proofId = workProof.submitProof(1, "QmHash123", 6598010, 10684530);

        vm.prank(verifier);
        workProof.verifyProof(proofId, true);

        WorkProofTypes.Proof memory proof = workProof.getProof(proofId);
        assertTrue(proof.verified);
        assertEq(proof.verifiedBy, verifier);
    }

    function test_RejectProof() public {
        vm.prank(worker1);
        uint256 proofId = workProof.submitProof(1, "QmHash123", 6598010, 10684530);

        vm.prank(verifier);
        workProof.verifyProof(proofId, false);

        WorkProofTypes.Proof memory proof = workProof.getProof(proofId);
        assertFalse(proof.verified);
        assertEq(proof.verifiedBy, verifier);
    }

    function test_RevertVerifyAlreadyVerified() public {
        vm.prank(worker1);
        uint256 proofId = workProof.submitProof(1, "QmHash123", 6598010, 10684530);

        vm.prank(verifier);
        workProof.verifyProof(proofId, true);

        vm.prank(verifier);
        vm.expectRevert(ProofAlreadyVerified.selector);
        workProof.verifyProof(proofId, false);
    }

    function test_RevertVerifyNotVerifier() public {
        vm.prank(worker1);
        uint256 proofId = workProof.submitProof(1, "QmHash123", 6598010, 10684530);

        vm.prank(randomUser);
        vm.expectRevert(NotAuthorized.selector);
        workProof.verifyProof(proofId, true);
    }

    // ============================================================
    //                    TEST: ADMIN FUNCTIONS
    // ============================================================

    function test_SetVerifier() public {
        workProof.setVerifier(randomUser, true);
        assertTrue(workProof.authorizedVerifiers(randomUser));

        workProof.setVerifier(randomUser, false);
        assertFalse(workProof.authorizedVerifiers(randomUser));
    }

    function test_RevertSetVerifierNotAdmin() public {
        vm.prank(randomUser);
        vm.expectRevert(NotAuthorized.selector);
        workProof.setVerifier(worker1, true);
    }

    // ============================================================
    //                    TEST: VIEW FUNCTIONS
    // ============================================================

    function test_GetProofCount() public {
        assertEq(workProof.getProofCount(), 0);

        vm.prank(worker1);
        workProof.submitProof(1, "QmHash123", 6598010, 10684530);
        assertEq(workProof.getProofCount(), 1);

        vm.prank(worker2);
        workProof.submitProof(1, "QmHash456", 6598020, 10684540);
        assertEq(workProof.getProofCount(), 2);
    }

    function test_RevertGetProofInvalidId() public {
        vm.expectRevert(InvalidProofId.selector);
        workProof.getProof(999);
    }
}
