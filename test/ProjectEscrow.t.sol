// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ProjectEscrow.sol";
import "../src/types/Project.sol";
import "../src/errors/ProjectEscrowErrors.sol";

contract ProjectEscrowTest is Test {
    using ProjectTypes for ProjectTypes.Project;
    using ProjectTypes for ProjectTypes.WorkProof;

    ProjectEscrow public escrow;

    address public kontraktor = address(0x1);
    address public kuli = address(0x2);
    address public randomUser = address(0x3);

    uint256 public dailyRate = 0.01 ether;
    uint256 public durationDays = 5;
    uint256 public totalAmount = dailyRate * durationDays;

    function setUp() public {
        escrow = new ProjectEscrow();
        // Fund test addresses with ETH
        vm.deal(kontraktor, 100 ether);
        vm.deal(kuli, 100 ether);
        vm.deal(randomUser, 100 ether);
    }

    // ============================================================
    //                    HELPER FUNCTIONS
    // ============================================================

    function _createAndFundProject() internal returns (uint256) {
        vm.prank(kontraktor);
        uint256 projectId = escrow.createProject(kuli, dailyRate, durationDays);

        vm.prank(kontraktor);
        escrow.depositFunds{value: totalAmount}(projectId);

        return projectId;
    }

    function _startProject(uint256 projectId) internal {
        vm.prank(kontraktor);
        escrow.startProject(projectId);
    }

    function _submitProof(uint256 projectId) internal returns (uint256) {
        vm.prank(kuli);
        return escrow.submitWorkProof(projectId, "QmHash123", 6598010, 10684530);
    }

    // ============================================================
    //                    TEST: CREATE PROJECT
    // ============================================================

    function test_CreateProject() public {
        vm.prank(kontraktor);
        uint256 projectId = escrow.createProject(kuli, dailyRate, durationDays);

        ProjectTypes.Project memory project = escrow.getProject(projectId);

        assertEq(project.kontraktor, kontraktor);
        assertEq(project.kuli, kuli);
        assertEq(project.dailyRate, dailyRate);
        assertEq(project.durationDays, durationDays);
        assertEq(project.totalAmount, totalAmount);
        assertEq(uint256(project.status), uint256(ProjectTypes.Status.Created));
    }

    // ============================================================
    //                    TEST: DEPOSIT FUNDS
    // ============================================================

    function test_DepositFunds() public {
        uint256 projectId = _createAndFundProject();

        ProjectTypes.Project memory project = escrow.getProject(projectId);
        assertEq(uint256(project.status), uint256(ProjectTypes.Status.Funded));
        assertEq(escrow.getBalance(), totalAmount);
    }

    function test_RevertDepositInsufficientFunds() public {
        vm.prank(kontraktor);
        uint256 projectId = escrow.createProject(kuli, dailyRate, durationDays);

        vm.prank(kontraktor);
        vm.expectRevert(InsufficientFunds.selector);
        escrow.depositFunds{value: totalAmount / 2}(projectId);
    }

    function test_RevertDepositNotKontraktor() public {
        vm.prank(kontraktor);
        uint256 projectId = escrow.createProject(kuli, dailyRate, durationDays);

        vm.prank(randomUser);
        vm.expectRevert(NotAuthorized.selector);
        escrow.depositFunds{value: totalAmount}(projectId);
    }

    // ============================================================
    //                    TEST: START PROJECT
    // ============================================================

    function test_StartProject() public {
        uint256 projectId = _createAndFundProject();
        _startProject(projectId);

        ProjectTypes.Project memory project = escrow.getProject(projectId);
        assertEq(uint256(project.status), uint256(ProjectTypes.Status.Active));
        assertGt(project.startTime, 0);
    }

    function test_RevertStartProjectNotFunded() public {
        vm.prank(kontraktor);
        uint256 projectId = escrow.createProject(kuli, dailyRate, durationDays);

        vm.prank(kontraktor);
        vm.expectRevert(ProjectNotActive.selector);
        escrow.startProject(projectId);
    }

    // ============================================================
    //                    TEST: SUBMIT WORK PROOF
    // ============================================================

    function test_SubmitWorkProof() public {
        uint256 projectId = _createAndFundProject();
        _startProject(projectId);

        uint256 proofId = _submitProof(projectId);
        assertEq(proofId, 1);

        ProjectTypes.WorkProof[] memory proofs = escrow.getProjectProofs(projectId);
        assertEq(proofs.length, 1);
        assertEq(proofs[0].photoHash, "QmHash123");
        assertFalse(proofs[0].verified);
    }

    function test_RevertSubmitProofNotKuli() public {
        uint256 projectId = _createAndFundProject();
        _startProject(projectId);

        vm.prank(randomUser);
        vm.expectRevert(NotAuthorized.selector);
        escrow.submitWorkProof(projectId, "QmHash123", 6598010, 10684530);
    }

    // ============================================================
    //                    TEST: VERIFY PROOF + RELEASE PAYMENT
    // ============================================================

    function test_VerifyAndReleasePayment() public {
        uint256 projectId = _createAndFundProject();
        _startProject(projectId);

        uint256 proofId = _submitProof(projectId);

        uint256 kuliBalanceBefore = kuli.balance;
        escrow.verifyWorkProof(projectId, proofId, true);

        ProjectTypes.Project memory project = escrow.getProject(projectId);
        assertEq(project.daysCompleted, 1);
        assertEq(project.totalReleased, dailyRate);
        assertEq(kuli.balance - kuliBalanceBefore, dailyRate);
    }

    function test_VerifyAndRejectProof() public {
        uint256 projectId = _createAndFundProject();
        _startProject(projectId);

        uint256 proofId = _submitProof(projectId);

        escrow.verifyWorkProof(projectId, proofId, false);

        ProjectTypes.Project memory project = escrow.getProject(projectId);
        assertEq(project.daysCompleted, 0);
        assertEq(project.totalReleased, 0);
    }

    // ============================================================
    //                    TEST: COMPLETE PROJECT
    // ============================================================

    function test_CompleteProjectAfterAllDays() public {
        uint256 projectId = _createAndFundProject();
        _startProject(projectId);

        for (uint256 i = 0; i < durationDays; i++) {
            vm.prank(kuli);
            uint256 proofId =
                escrow.submitWorkProof(projectId, string(abi.encodePacked("QmHash", i)), 6598010, 10684530);

            escrow.verifyWorkProof(projectId, proofId, true);
        }

        ProjectTypes.Project memory project = escrow.getProject(projectId);
        assertEq(uint256(project.status), uint256(ProjectTypes.Status.Completed));
        assertEq(project.daysCompleted, durationDays);
        assertEq(project.totalReleased, totalAmount);
        assertEq(escrow.getBalance(), 0);
    }

    // ============================================================
    //                    TEST: DISPUTE
    // ============================================================

    function test_RaiseDispute() public {
        uint256 projectId = _createAndFundProject();
        _startProject(projectId);

        vm.prank(kuli);
        escrow.raiseDispute(projectId, "Kontraktor refuses to verify work");

        ProjectTypes.Project memory project = escrow.getProject(projectId);
        assertEq(uint256(project.status), uint256(ProjectTypes.Status.Disputed));
        assertTrue(escrow.projectDisputed(projectId));
    }

    function test_ResolveDisputeFavorKuli() public {
        uint256 projectId = _createAndFundProject();
        _startProject(projectId);

        vm.prank(kuli);
        escrow.raiseDispute(projectId, "Test dispute");

        uint256 kuliBalanceBefore = kuli.balance;
        escrow.resolveDispute(projectId, true, dailyRate * 2);

        ProjectTypes.Project memory project = escrow.getProject(projectId);
        assertEq(uint256(project.status), uint256(ProjectTypes.Status.Completed));
        assertEq(kuli.balance - kuliBalanceBefore, dailyRate * 2);
    }

    function test_ResolveDisputeFavorKontraktor() public {
        uint256 projectId = _createAndFundProject();
        _startProject(projectId);

        vm.prank(kuli);
        escrow.raiseDispute(projectId, "Test dispute");

        uint256 kontraktorBalanceBefore = kontraktor.balance;
        escrow.resolveDispute(projectId, false, dailyRate * 3);

        ProjectTypes.Project memory project = escrow.getProject(projectId);
        assertEq(uint256(project.status), uint256(ProjectTypes.Status.Completed));
        assertEq(kontraktor.balance - kontraktorBalanceBefore, dailyRate * 3);
    }

    // ============================================================
    //                    TEST: CANCEL PROJECT
    // ============================================================

    function test_CancelProject() public {
        uint256 projectId = _createAndFundProject();

        uint256 kontraktorBalanceBefore = kontraktor.balance;
        escrow.cancelProject(projectId);

        ProjectTypes.Project memory project = escrow.getProject(projectId);
        assertEq(uint256(project.status), uint256(ProjectTypes.Status.Cancelled));
        assertEq(kontraktor.balance - kontraktorBalanceBefore, totalAmount);
        assertEq(escrow.getBalance(), 0);
    }

    // ============================================================
    //                    TEST: VIEW FUNCTIONS
    // ============================================================

    function test_GetBalance() public {
        assertEq(escrow.getBalance(), 0);

        uint256 projectId = _createAndFundProject();
        assertEq(escrow.getBalance(), totalAmount);
    }
}
