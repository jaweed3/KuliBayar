export const CHAIN = {
  id: 80002,
  name: 'Polygon Amoy Testnet',
  rpcUrls: {
    default: { http: ['https://rpc-amoy.polygon.technology'] },
  },
  blockExplorers: {
    default: { name: 'PolygonScan Amoy', url: 'https://amoy.polygonscan.com' },
  },
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
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
