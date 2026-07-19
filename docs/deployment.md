# Deployment Guide

Panduan lengkap deployment KuliBayar ke testnet dan mainnet.

---

## Prerequisites

### Required Tools

```bash
# Node.js
node --version  # v20+

# Package manager
npm --version   # v10+

# Foundry (for smart contracts)
forge --version # v0.2+

# Git
git --version
```

### Required Accounts

1. **Ethereum Wallet** - For deploying contracts
2. **RPC Provider** - Alchemy, Infura, or similar
3. **Etherscan API Key** - For contract verification
4. **Railway Account** - For backend deployment (optional)

---

## Environment Setup

### Smart Contracts

```bash
cd kulibayar

# Install dependencies
forge install

# Copy environment file
cp .env.example .env

# Edit .env
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key
ETHERSCAN_API_KEY=your_etherscan_key
```

### Backend

```bash
cd kulibayar/backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env
PORT=3001
ADMIN_PRIVATE_KEY=your_admin_private_key
CONTRACT_ADDRESS=deployed_contract_address
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key
```

### Frontend

```bash
cd kulibayar/frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CHAIN_ID=11155111
```

---

## Deploy Smart Contracts

### Testnet (Sepolia)

```bash
# Build contracts
forge build

# Run tests
forge test

# Deploy ProjectEscrow
forge create src/ProjectEscrow.sol:ProjectEscrow \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY

# Deploy WorkProof
forge create src/WorkProof.sol:WorkProof \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY

# Deploy Reputation
forge create src/Reputation.sol:Reputation \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

### Verify on Etherscan

```bash
# Verify ProjectEscrow
forge verify-contract <PROJECT_ESCROW_ADDRESS> \
  src/ProjectEscrow.sol:ProjectEscrow \
  --chain-id 11155111 \
  --etherscan-api-key $ETHERSCAN_API_KEY

# Verify WorkProof
forge verify-contract <WORK_PROOF_ADDRESS> \
  src/WorkProof.sol:WorkProof \
  --chain-id 11155111 \
  --etherscan-api-key $ETHERSCAN_API_KEY

# Verify Reputation
forge verify-contract <REPUTATION_ADDRESS> \
  src/Reputation.sol:Reputation \
  --chain-id 11155111 \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

### Update Environment

```bash
# Update backend .env with contract addresses
CONTRACT_ADDRESS=<PROJECT_ESCROW_ADDRESS>
WORK_PROOF_ADDRESS=<WORK_PROOF_ADDRESS>
REPUTATION_ADDRESS=<REPUTATION_ADDRESS>
```

---

## Deploy Backend

### Local Development

```bash
cd kulibayar/backend

# Start Anvil (local blockchain)
anvil

# Deploy contracts to local
forge create src/ProjectEscrow.sol:ProjectEscrow \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Start backend
npm run dev
```

### Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Set environment variables
railway variables set PORT=3001
railway variables set ADMIN_PRIVATE_KEY=your_key
railway variables set CONTRACT_ADDRESS=your_address
railway variables set RPC_URL=your_rpc_url

# Deploy
railway up
```

### Docker Deployment

```bash
# Build image
docker build -t kulibayar-backend .

# Run container
docker run -p 3001:3001 \
  -e ADMIN_PRIVATE_KEY=your_key \
  -e CONTRACT_ADDRESS=your_address \
  -e RPC_URL=your_rpc_url \
  kulibayar-backend
```

---

## Deploy Frontend

### Vercel Deployment

```bash
cd kulibayar/frontend

# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_CHAIN_ID
```

### Netlify Deployment

```bash
# Build
npm run build

# Deploy to Netlify
npx netlify-cli deploy --dir=.next --prod
```

### Docker Deployment

```bash
# Build image
docker build -t kulibayar-frontend .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3001 \
  kulibayar-frontend
```

---

## Environment Variables

### Smart Contracts (.env)

```bash
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key
ETHERSCAN_API_KEY=your_etherscan_key
```

### Backend (.env)

```bash
PORT=3001
ADMIN_PRIVATE_KEY=your_admin_private_key
CONTRACT_ADDRESS=deployed_contract_address
WORK_PROOF_ADDRESS=deployed_work_proof_address
REPUTATION_ADDRESS=deployed_reputation_address
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key
USE_MOCK_DATA=false
```

### Frontend (.env)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_CONTRACT_ADDRESS=deployed_contract_address
```

---

## Verification Checklist

### Smart Contracts

- [ ] All tests passing (`forge test`)
- [ ] Contracts verified on Etherscan
- [ ] Constructor arguments correct
- [ ] Admin address set correctly

### Backend

- [ ] All API endpoints working
- [ ] EXIF validation working
- [ ] Liveness challenge working
- [ ] Location validation working
- [ ] File upload working
- [ ] Error handling proper

### Frontend

- [ ] All pages loading
- [ ] GPS capture working
- [ ] Photo upload working
- [ ] Challenge display working
- [ ] Error messages showing
- [ ] Mobile responsive

---

## Post-Deployment

### 1. Create Test Project

```bash
# Via API
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"kuli": "0x5678...", "dailyRate": "0.01", "durationDays": 30}'
```

### 2. Deposit Funds

```bash
# Via API
curl -X POST http://localhost:3001/api/projects/1/deposit \
  -H "Content-Type: application/json" \
  -d '{"amount": "0.3"}'
```

### 3. Test Proof Submission

```bash
# Via API
curl -X POST http://localhost:3001/api/proofs \
  -F "projectId=1" \
  -F "photo=@test-photo.jpg" \
  -F "latitude=-6.2615" \
  -F "longitude=106.8106" \
  -F "accuracy=12.5" \
  -F "challengeId=abc123..."
```

### 4. Verify Proof

```bash
# Via API
curl -X POST http://localhost:3001/api/proofs/1/verify \
  -H "Content-Type: application/json" \
  -d '{"verified": true, "projectId": "1"}'
```

---

## Monitoring

### Backend Logs

```bash
# Railway
railway logs

# Docker
docker logs <container_id>

# Local
npm run dev
```

### Smart Contract Events

```bash
# Listen to events
cast logs --rpc-url $RPC_URL --address $CONTRACT_ADDRESS

# Or use Etherscan
https://sepolia.etherscan.io/address/<contract_address>#events
```

---

## Troubleshooting

### Common Issues

1. **Contract deployment fails**
   - Check private key has enough ETH
   - Check RPC URL is correct
   - Check network is Sepolia

2. **Backend can't connect to blockchain**
   - Check RPC_URL in .env
   - Check CONTRACT_ADDRESS is correct
   - Check Anvil is running (for local)

3. **EXIF validation fails**
   - Check photo has EXIF data
   - Check exif-parser is installed
   - Check file path is correct

4. **OCR fails**
   - Check tesseract.js is installed
   - Check photo is clear enough
   - Check challenge code is visible

### Debug Mode

```bash
# Backend
DEBUG=kulibayar:* npm run dev

# Smart contracts
forge test -vvvv
```

---

## Rollback

### Smart Contracts

Cannot rollback deployed contracts. Options:
1. Deploy new contract with fixes
2. Update frontend/backend to use new contract
3. Migrate data if needed

### Backend

```bash
# Railway
railway rollback

# Docker
docker stop <container_id>
docker run -d <previous_image>
```

### Frontend

```bash
# Vercel
vercel rollback

# Netlify
netlify deploy --prod --dir=.next
```

---

## Contract Deployment Checklist

### Prerequisites

| Item | Notes |
|---|---|
| **Wallet Deployer** | Address with test POL for gas fees |
| **Private Key** | Set as `PRIVATE_KEY` in root `.env` |
| **Test POL** | Get free from https://faucet.polygon.technology/ or https://www.alchemy.com/faucets/polygon-amoy |
| **forge build** | Compile contracts first |

### Steps

```bash
# 1. Set PRIVATE_KEY in root .env (NOT the Anvil default)
#    RPC_URL & CHAIN_ID default to Polygon Amoy, so delete those lines
#    if you want to use default Amoy (chain 80002)

# 2. Compile contracts
forge build

# 3. Deploy
./scripts/deploy.sh

# Script auto-updates:
#   - backend/.env   → contract addresses + RPC_CHAIN config
#   - frontend/.env.local → NEXT_PUBLIC_* addresses

# 4. Upload to server
#    Copy backend/.env + frontend/.env.local to server
#    restart PM2 processes:
#      pm2 restart all
```

### Environment Files (what needs what)

| File | What to set | Purpose |
|---|---|---|
| Root `.env` | `PRIVATE_KEY` | Used by `deploy.sh` |
| `backend/.env` | Auto-filled by deploy script | RPC, chain, contract addresses |
| `frontend/.env.local` | Auto-filled by deploy script | `NEXT_PUBLIC_*` for frontend |

### Env Inconsistency

Backend `.env` currently set to **Polygon Amoy** (chain 80002). Deploy script also defaults to Amoy. Frontend config hardcoded to Amoy. **Don't mix chains** — all three must match.

### Post-Deploy (Optional)

- Update backend code to call contracts on-chain instead of in-memory store
- All env vars already populated by deploy script
