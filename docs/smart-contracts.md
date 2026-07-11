# Smart Contracts

Arsitektur smart contract KuliBayar: escrow, proof storage, dan reputation.

---

## Overview

```
┌─────────────────────────────────────────────────────────┐
│                  SMART CONTRACTS                         │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │  ProjectEscrow  │  │   WorkProof     │              │
│  │  (Main Escrow)  │  │  (Standalone)   │              │
│  └────────┬────────┘  └────────┬────────┘              │
│           │                     │                        │
│           └─────────┬───────────┘                        │
│                     │                                    │
│                     ▼                                    │
│           ┌─────────────────┐                           │
│           │   Reputation    │                           │
│           │  (On-chain)     │                           │
│           └─────────────────┘                           │
└─────────────────────────────────────────────────────────┘
```

---

## Contract: ProjectEscrow

### Purpose

Main escrow contract untuk construction project payments.

### State Variables

```solidity
uint256 public nextProjectId = 1;
uint256 public nextProofId = 1;

mapping(uint256 => ProjectTypes.Project) public projects;
mapping(uint256 => ProjectTypes.WorkProof[]) public projectProofs;
mapping(uint256 => mapping(uint256 => bool)) public proofVerified;
mapping(uint256 => bool) public projectDisputed;

address public admin;
```

### Modifiers

```solidity
modifier onlyAdmin() {
    if (msg.sender != admin) revert NotAuthorized();
    _;
}

modifier onlyKontraktor(uint256 projectId) {
    if (msg.sender != projects[projectId].kontraktor) revert NotAuthorized();
    _;
}

modifier onlyKuli(uint256 projectId) {
    if (msg.sender != projects[projectId].kuli) revert NotAuthorized();
    _;
}

modifier projectExists(uint256 projectId) {
    if (projectId == 0 || projectId >= nextProjectId) revert InvalidProjectId();
    _;
}
```

### State Machine

```
Created → Funded → Active → Completed
                         ↘ Disputed → Completed
                         ↘ Cancelled
```

### Functions

#### Kontraktor Functions

```solidity
// Create a new project
function createProject(
    address _kuli,
    uint256 _dailyRate,
    uint256 _durationDays
) external returns (uint256)

// Deposit funds to activate project
function depositFunds(uint256 projectId) external payable
```

#### Kuli Functions

```solidity
// Submit work proof with photo
function submitWorkProof(
    uint256 projectId,
    string memory photoHash,
    int256 latitude,
    int256 longitude
) external onlyKuli(projectId) returns (uint256)

// Raise dispute
function raiseDispute(
    uint256 projectId,
    string memory reason
) external
```

#### Admin Functions

```solidity
// Verify work proof
function verifyWorkProof(
    uint256 projectId,
    uint256 proofId,
    bool verified
) external onlyAdmin

// Resolve dispute
function resolveDispute(
    uint256 projectId,
    bool favorKuli,
    uint256 amount
) external onlyAdmin

// Cancel project
function cancelProject(uint256 projectId) external onlyAdmin
```

### Events

```solidity
event ProjectCreated(uint256 projectId, address kontraktor, address kuli, uint256 totalAmount, uint256 dailyRate, uint256 durationDays);
event FundsDeposited(uint256 projectId, uint256 amount);
event WorkProofSubmitted(uint256 projectId, uint256 proofId, address submittedBy, string photoHash);
event WorkProofVerified(uint256 projectId, uint256 proofId, bool verified);
event PaymentReleased(uint256 projectId, uint256 amount, address to);
event DisputeRaised(uint256 projectId, address raisedBy, string reason);
event DisputeResolved(uint256 projectId, bool favorKuli, uint256 amount);
event ProjectCompleted(uint256 projectId, uint256 totalReleased);
event ProjectCancelled(uint256 projectId, uint256 refundAmount);
```

---

## Contract: WorkProof

### Purpose

Standalone proof storage contract (not used in main flow).

### Functions

```solidity
// Submit proof
function submitProof(
    uint256 projectId,
    string memory photoHash,
    int256 latitude,
    int256 longitude
) external returns (uint256)

// Verify proof (authorized verifiers only)
function verifyProof(
    uint256 proofId,
    bool verified
) external

// Set verifier
function setVerifier(address verifier, bool authorized) external onlyAdmin
```

---

## Contract: Reputation

### Purpose

On-chain reputation system for workers and kontraktors.

### Structs

```solidity
struct Profile {
    uint256 id;
    address user;
    Role role;
    uint256 rating;      // 100-500 (1.0-5.0 stars)
    uint256 totalJobs;
    uint256 onTimePayments;
    uint256 disputes;
    uint256 totalEarnings;
    uint256 createdAt;
}
```

### Functions

```solidity
// Create profile
function createProfile(Role role) external returns (uint256)

// Record job completion (admin only)
function recordJobComplete(
    uint256 profileId,
    uint256 earnings,
    bool onTime
) external onlyAdmin

// Update rating (admin only)
function updateRating(
    uint256 profileId,
    uint256 newRating
) external onlyAdmin

// Record dispute (admin only)
function recordDispute(uint256 profileId) external onlyAdmin

// Check if reliable
function isReliable(uint256 profileId) external view returns (bool)
```

---

## Types

### Project

```solidity
struct Project {
    uint256 id;
    address kontraktor;
    address kuli;
    uint256 totalAmount;      // Total escrow amount in wei
    uint256 dailyRate;        // Daily rate in wei
    uint256 durationDays;     // Project duration in days
    uint256 daysCompleted;    // Days verified as complete
    uint256 totalReleased;    // Total amount released to kuli
    uint256 startTime;        // Timestamp when work started
    Status status;
}

enum Status {
    Created,      // Project created, waiting for deposit
    Funded,       // Funds deposited, work can begin
    Active,       // Work in progress
    Disputed,     // Dispute raised, funds locked
    Completed,    // All work done, all funds released
    Cancelled     // Project cancelled, funds refunded
}
```

### WorkProof

```solidity
struct WorkProof {
    uint256 id;
    uint256 projectId;
    address submittedBy;
    string photoHash;         // IPFS/Greenfield hash
    int256 latitude;          // GPS lat (scaled by 1e6)
    int256 longitude;         // GPS lng (scaled by 1e6)
    uint256 timestamp;
    bool verified;
}
```

---

## Trust Model Issues

### Current Problem

```
┌─────────────────────────────────────────────────────────┐
│              SINGLE ADMIN CONTROL                       │
│                                                         │
│  Admin can:                                             │
│  ├── Verify work proofs (approve/reject)                │
│  ├── Resolve disputes (favor kuli/kontraktor)           │
│  ├── Cancel projects (refund to kontraktor)             │
│  └── All with no timelock or multi-sig                  │
│                                                         │
│  Risk: Single point of failure/corruption               │
└─────────────────────────────────────────────────────────┘
```

### Future Improvements

#### 1. Multi-Signature Admin

```solidity
// Using Gnosis Safe or similar
address[] public signers;
uint256 public threshold = 2; // 2-of-3

modifier onlyMultiSig() {
    require(
        getApprovalCount(msg.sig, msg.data) >= threshold,
        "Not enough approvals"
    );
    _;
}
```

#### 2. Role Separation

```solidity
bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER");
bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR");
bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE");

function verifyWorkProof(...) public onlyRole(VERIFIER_ROLE) { ... }
function resolveDispute(...) public onlyRole(ARBITRATOR_ROLE) { ... }
function pause() public onlyRole(GOVERNANCE_ROLE) { ... }
```

#### 3. Timelock

```solidity
// OpenZeppelin TimelockController
TimelockController public timelock;

function verifyWorkProof(...) public onlyRole(VERIFIER_ROLE) {
    bytes memory data = abi.encodeWithSelector(
        this._verifyWorkProof.selector,
        projectId, proofId, verified
    );
    timelock.schedule(target, value, data, salt, delay);
}
```

---

## Deployment

### Testnet (Sepolia)

```bash
# Deploy contracts
forge create src/ProjectEscrow.sol:ProjectEscrow \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY

# Verify on Etherscan
forge verify-contract <address> src/ProjectEscrow.sol:ProjectEscrow \
  --chain-id 11155111 \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

### Mainnet

```bash
# Deploy with multi-sig
forge create src/ProjectEscrow.sol:ProjectEscrow \
  --rpc-url $MAINNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --constructor-args <MULTISIG_ADDRESS>
```

---

## Testing

### Test Coverage

```
test/ProjectEscrow.t.sol     - 43 tests
test/WorkProof.t.sol         - 15 tests
test/Reputation.t.sol        - 12 tests
```

### Run Tests

```bash
# Run all tests
forge test

# Run with verbosity
forge test -vvv

# Run specific test
forge test --match-test testCreateProject

# Run with gas report
forge test --gas-report
```

---

## Security Considerations

### Known Issues

1. **Admin Key in Backend**
   - `ADMIN_PRIVATE_KEY` stored in env var
   - Backend server IS the admin
   - If server compromised, attacker has full control

2. **No Timelock**
   - Admin actions take effect immediately
   - No time for users to react

3. **No Appeal Mechanism**
   - Users can only trust admin's decision
   - No escalation path beyond admin

### Mitigations

1. **Multi-Signature**: Use Gnosis Safe
2. **Timelock**: Add OpenZeppelin TimelockController
3. **Role Separation**: Separate verifier vs arbitrator
4. **Emergency Pause**: Add circuit breaker pattern
