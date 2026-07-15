import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load ABIs from Foundry artifacts
function loadABI(contractName) {
  const artifactPath = join(__dirname, '../../out', `${contractName}.sol`, `${contractName}.json`);
  const artifact = JSON.parse(readFileSync(artifactPath, 'utf8'));
  return artifact.abi;
}

// Lazy-initialized provider and wallet
let provider;
let adminWallet;
let projectEscrowContract;
let reputationContract;
let workProofContract;

// Kuli wallet for demo (Anvil account #1)
// WARNING: Remove default value before production - this is for testing only!
const KULI_PRIVATE_KEY = process.env.KULI_PRIVATE_KEY;
if (!KULI_PRIVATE_KEY) {
  throw new Error('KULI_PRIVATE_KEY environment variable is required. Do not use default values in production.');
}
let kuliContract;
let kuliReputationContract;

function getProvider() {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545');
  }
  return provider;
}

function getWallet() {
  if (!adminWallet) {
    const pk = process.env.ADMIN_PRIVATE_KEY;
    if (!pk) throw new Error('ADMIN_PRIVATE_KEY not set');
    adminWallet = new ethers.Wallet(pk, getProvider());
  }
  return adminWallet;
}

export function initContracts() {
  // Validate contract addresses before initialization
  const projectEscrowAddress = process.env.PROJECT_ESCROW_ADDRESS;
  const reputationAddress = process.env.REPUTATION_ADDRESS;
  const workProofAddress = process.env.WORK_PROOF_ADDRESS;
  
  if (!projectEscrowAddress || !ethers.isAddress(projectEscrowAddress)) {
    throw new Error('PROJECT_ESCROW_ADDRESS is not a valid Ethereum address');
  }
  if (!reputationAddress || !ethers.isAddress(reputationAddress)) {
    throw new Error('REPUTATION_ADDRESS is not a valid Ethereum address');
  }
  if (!workProofAddress || !ethers.isAddress(workProofAddress)) {
    throw new Error('WORK_PROOF_ADDRESS is not a valid Ethereum address');
  }
  
  const projectEscrowABI = loadABI('ProjectEscrow');
  const reputationABI = loadABI('Reputation');
  const workProofABI = loadABI('WorkProof');
  const wallet = getWallet();

  projectEscrowContract = new ethers.Contract(
    projectEscrowAddress,
    projectEscrowABI,
    wallet
  );

  reputationContract = new ethers.Contract(
    reputationAddress,
    reputationABI,
    wallet
  );

  workProofContract = new ethers.Contract(
    workProofAddress,
    workProofABI,
    wallet
  );

  console.log('📄 Contracts initialized');

  // Also create kuli signer for demo (Anvil account #1)
  const kuliWallet = new ethers.Wallet(KULI_PRIVATE_KEY, getProvider());
  kuliContract = new ethers.Contract(
    process.env.PROJECT_ESCROW_ADDRESS,
    projectEscrowABI,
    kuliWallet
  );

  // Kuli reputation contract for creating kuli profiles
  kuliReputationContract = new ethers.Contract(
    process.env.REPUTATION_ADDRESS,
    reputationABI,
    kuliWallet
  );

  return { projectEscrowContract, reputationContract, workProofContract };
}

// Project Escrow functions
export async function createProject(kuli, dailyRate, durationDays) {
  const tx = await projectEscrowContract.createProject(
    kuli,
    ethers.parseEther(dailyRate.toString()),
    durationDays
  );
  const receipt = await tx.wait();
  const event = receipt.logs.find(log => log.fragment?.name === 'ProjectCreated');
  return event?.args?.[0]?.toString();
}

export async function depositFunds(projectId, amount) {
  const tx = await projectEscrowContract.depositFunds(projectId, {
    value: ethers.parseEther(amount.toString())
  });
  return tx.wait();
}

export async function startProject(projectId) {
  const tx = await projectEscrowContract.startProject(projectId);
  return tx.wait();
}

export async function submitWorkProof(projectId, photoHash, latitude, longitude) {
  // Validate GPS coordinates before sending to contract (prevent invalid data + save gas)
  // Latitude: -90 to 90 degrees
  // Longitude: -180 to 180 degrees
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  if (isNaN(lat) || lat < -90 || lat > 90) {
    throw new Error('Invalid latitude: must be between -90 and 90');
  }
  
  if (isNaN(lng) || lng < -180 || lng > 180) {
    throw new Error('Invalid longitude: must be between -180 and 180');
  }
  
  // Use kuli wallet for proof submission (contract requires msg.sender == kuli)
  const tx = await kuliContract.submitWorkProof(projectId, photoHash, lat, lng);
  const receipt = await tx.wait();
  const event = receipt.logs.find(log => log.fragment?.name === 'WorkProofSubmitted');
  return event?.args?.[1]?.toString();
}

export async function verifyWorkProof(projectId, proofId, verified) {
  const tx = await projectEscrowContract.verifyWorkProof(projectId, proofId, verified);
  return tx.wait();
}

export async function raiseDispute(projectId, reason) {
  const tx = await projectEscrowContract.raiseDispute(projectId, reason);
  return tx.wait();
}

export async function resolveDispute(projectId, favorKuli, amount) {
  const tx = await projectEscrowContract.resolveDispute(
    projectId,
    favorKuli,
    ethers.parseEther(amount.toString())
  );
  return tx.wait();
}

export async function cancelProject(projectId) {
  const tx = await projectEscrowContract.cancelProject(projectId);
  return tx.wait();
}

export async function getProject(projectId) {
  const project = await projectEscrowContract.getProject(projectId);
  return {
    id: project.id.toString(),
    kontraktor: project.kontraktor,
    kuli: project.kuli,
    totalAmount: ethers.formatEther(project.totalAmount),
    dailyRate: ethers.formatEther(project.dailyRate),
    durationDays: project.durationDays.toString(),
    daysCompleted: project.daysCompleted.toString(),
    totalReleased: ethers.formatEther(project.totalReleased),
    startTime: project.startTime.toString(),
    status: project.status.toString()
  };
}

export async function getBalance() {
  const balance = await projectEscrowContract.getBalance();
  return ethers.formatEther(balance);
}

// Reputation functions
export async function createProfile(role) {
  const tx = await reputationContract.createProfile(role);
  const receipt = await tx.wait();
  const event = receipt.logs.find(log => log.fragment?.name === 'ProfileCreated');
  return event?.args?.[0]?.toString();
}

export async function createKuliProfile(role) {
  const tx = await kuliReputationContract.createProfile(role);
  const receipt = await tx.wait();
  const event = receipt.logs.find(log => log.fragment?.name === 'ProfileCreated');
  return event?.args?.[0]?.toString();
}

export async function getProfile(profileId) {
  const profile = await reputationContract.getProfile(profileId);
  return {
    id: profile.id.toString(),
    user: profile.user,
    role: profile.role.toString(),
    rating: profile.rating.toString(),
    totalJobs: profile.totalJobs.toString(),
    onTimePayments: profile.onTimePayments.toString(),
    disputes: profile.disputes.toString(),
    totalEarnings: ethers.formatEther(profile.totalEarnings),
    createdAt: profile.createdAt.toString(),
    exists: profile.exists
  };
}

export async function getProfileByAddress(address) {
  const profileId = await reputationContract.getProfileByAddress(address);
  return profileId.toString();
}

export async function isReliable(profileId) {
  return reputationContract.isReliable(profileId);
}

export async function getOnTimeRate(profileId) {
  const rate = await reputationContract.getOnTimeRate(profileId);
  return rate.toString();
}

// WorkProof functions (standalone)
export async function submitWorkProofStandalone(projectId, photoHash, latitude, longitude) {
  const tx = await workProofContract.submitProof(projectId, photoHash, latitude, longitude);
  const receipt = await tx.wait();
  const event = receipt.logs.find(log => log.fragment?.name === 'ProofSubmitted');
  return event?.args?.[0]?.toString();
}

export async function verifyProofStandalone(proofId, result) {
  const tx = await workProofContract.verifyProof(proofId, result);
  return tx.wait();
}

export async function getProof(proofId) {
  // Proofs are stored in ProjectEscrow's projectProofs mapping
  // We need to find which project this proof belongs to
  // For now, use getProjectProofs from a known project
  // This is a simplified lookup - in production, you'd index by proofId
  const proof = await projectEscrowContract.getProjectProofs(1); // TODO: proper indexing
  const p = proof[proofId - 1];
  if (!p) return null;
  return {
    id: p.id.toString(),
    projectId: p.projectId.toString(),
    worker: p.submittedBy,
    photoHash: p.photoHash,
    latitude: p.latitude.toString(),
    longitude: p.longitude.toString(),
    timestamp: p.timestamp.toString(),
    verified: p.verified,
    verifiedBy: '0x0000000000000000000000000000000000000000'
  };
}

export async function getProjectProofIds(projectId) {
  const proofs = await projectEscrowContract.getProjectProofs(projectId);
  return proofs.map((p, i) => (i + 1).toString());
}

export async function getProofCount() {
  // Simplified - count proofs across projects
  return '0'; // TODO: proper counting
}
