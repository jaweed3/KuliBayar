// BNB Chain Testnet Configuration
export const BSC_TESTNET = {
  id: 97,
  name: 'BNB Smart Chain Testnet',
  rpcUrls: {
    default: { http: ['https://data-seed-prebsc-1-s1.binance.org:8545'] },
  },
  blockExplorers: {
    default: { name: 'BscScan Testnet', url: 'https://testnet.bscscan.com' },
  },
  nativeCurrency: {
    name: 'BNB',
    symbol: 'tBNB',
    decimals: 18,
  },
};

// Contract addresses (update after deployment)
export const CONTRACTS = {
  projectEscrow: process.env.NEXT_PUBLIC_ESCROW_ADDRESS || '0x0000000000000000000000000000000000000000',
  reputation: process.env.NEXT_PUBLIC_REPUTATION_ADDRESS || '0x0000000000000000000000000000000000000000',
  workProof: process.env.NEXT_PUBLIC_WORKPROOF_ADDRESS || '0x0000000000000000000000000000000000000000',
};

// API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
