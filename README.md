# 🏗️ KuliBayar

**"Bayaran Kuli, Dijamin On-Chain"**

Escrow platform untuk konstruksi Indonesia. Dana dikunci di smart contract, cair otomatis setelah kerja terverifikasi via foto + GPS.

> 🏆 Indonesia Web3 Hackathon 2026 — Finance & Commerce Track

---

## 🎯 Problem

10 juta kuli bangunan di Indonesia:
- Tidak ada kontrak formal
- Pembayaran sering telat atau tidak dibayar
- Tidak ada track record/reputasi yang bisa diverifikasi

## 💡 Solution

Platform escrow on-chain yang:
1. Mengunci dana kontraktor di smart contract
2. Membayar kuli harian setelah foto kerja terverifikasi
3. Membangun reputasi on-chain yang tidak bisa dihapus

---

## ✅ Status

| Component | Status | Tests |
|-----------|--------|-------|
| Smart Contracts | ✅ Done | 43/43 passing |
| Backend | ✅ Done | 15/15 API tests |
| Frontend | ✅ Done | 11/11 pages, 0 TS errors |
| Deployment | ⏳ Pending | — |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│            Next.js 16 + React 19 + Tailwind CSS v4          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Landing  │  │ Dashboard│  │  Photo   │  │Reputation│   │
│  │   Page    │  │ (11 pages│  │ Check-in │  │  Lookup  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │              │              │              │         │
│       └──────────────┴──────────────┴──────────────┘         │
│                          │ HTTP                              │
├──────────────────────────┼──────────────────────────────────┤
│                        BACKEND                              │
│              Express.js + ethers.js v6 (ES modules)         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Projects │  │  Proofs  │  │Reputation│  │ Matching │   │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────┘   │
│       │              │              │                        │
│  ┌────┴──────────────┴──────────────┴────┐                  │
│  │         Blockchain Service            │                  │
│  │    (ethers.js + Smart Contracts)      │                  │
│  └───────────────────┬───────────────────┘                  │
├──────────────────────┼──────────────────────────────────────┤
│                   BLOCKCHAIN                                │
│              Solidity 0.8.20 + Foundry                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ProjectEscrow │  │  Reputation  │  │  WorkProof   │      │
│  │   (core)     │  │  (profiles)  │  │  (standalone)│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 👥 User Roles

| Role | Description | Actions |
|------|-------------|---------|
| **Kontraktor** | Pemberi kerja / employer | Buat proyek, fund escrow, mulai proyek |
| **Kuli** | Pekerja / worker | Submit foto bukti kerja, terima bayaran |
| **Admin/AI Oracle** | Verifier | Verifikasi foto, resolve dispute |

---

## 🔄 Complete User Flows

### Flow 1: Kontraktor - Buat & Fund Proyek

```
1. Kontraktor connect wallet (MetaMask)
2. Klik "Buat Proyek"
3. Isi form:
   - Alamat wallet kuli (0x...)
   - Tarif per hari (ETH): 0.01
   - Durasi proyek (hari): 5
4. Submit → Smart contract createProject()
5. Klik "Fund Escrow"
6. Konfirmasi transaksi di MetaMask
   - Total: 0.05 ETH (5 hari × 0.01 ETH)
7. Smart contract depositFunds()
8. Status proyek: Created → Funded
9. Klik "Start Project"
10. Status: Funded → Active
```

### Flow 2: Kuli - Kerja & Submit Bukti

```
1. Kuli connect wallet (MetaMask - Account 2)
2. Buka halaman "Foto Check-in"
3. Masukkan Project ID
4. Klik "Dapatkan Lokasi GPS"
5. Pilih/upload foto progress
6. Klik "Kirim Bukti Kerja"
7. Backend verifikasi:
   - GPS coordinate valid (di area Indonesia)
   - Foto dari hari ini
   - File size < 5MB
8. Smart contract submitWorkProof()
9. Proof tersimpan on-chain:
   - Photo hash (IPFS-style)
   - GPS coordinates (scaled ×1e6)
   - Timestamp
```

### Flow 3: Admin - Verifikasi & Bayar

```
1. Admin/AI oracle menerima notifikasi ada proof baru
2. Review foto + GPS
3. Jika valid:
   POST /api/proofs/:id/verify
   Body: { "verified": true, "projectId": 1 }
4. Smart contract verifyWorkProof()
5. Jika verified == true:
   - Payment otomatis release ke kuli
   - 0.01 ETH dikirim ke wallet kuli
   - daysCompleted++
6. Proyek berakhir jika semua hari selesai
   - Status: Active → Completed
   - Sisa dana kembali ke kontraktor (jika ada)
```

### Flow 4: Dispute Resolution

```
1. Kuli atau Kontraktor raise dispute
   POST /api/projects/:id/dispute
   Body: { "reason": "Foto tidak sesuai" }
2. Status: Active → Disputed
3. Admin review dispute
4. Admin resolve:
   POST /api/projects/:id/dispute/resolve
   Body: { "favorKuli": true, "amount": 0.02 }
5. Dana dikirim sesuai keputusan admin
6. Status: Disputed → Completed
```

---

## 📡 API Documentation

Base URL: `http://localhost:3001`

### Projects

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/projects` | Buat proyek baru | `{ kuli, dailyRate, durationDays }` |
| `POST` | `/api/projects/:id/deposit` | Fund escrow | `{ amount }` |
| `POST` | `/api/projects/:id/start` | Mulai proyek | - |
| `GET` | `/api/projects/:id` | Lihat detail proyek | - |
| `GET` | `/api/projects/balance` | Cek saldo escrow | - |
| `POST` | `/api/projects/:id/dispute` | Raise dispute | `{ reason }` |
| `POST` | `/api/projects/:id/dispute/resolve` | Resolve dispute | `{ favorKuli, amount }` |
| `POST` | `/api/projects/:id/cancel` | Batalkan proyek | - |

### Proofs

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/proofs` | Submit foto bukti | `multipart: projectId, photo, latitude, longitude` |
| `POST` | `/api/proofs/:id/verify` | Verifikasi proof | `{ verified, projectId }` |
| `GET` | `/api/proofs/:id` | Lihat detail proof | - |
| `GET` | `/api/proofs/project/:projectId` | Semua proof proyek | - |
| `GET` | `/api/proofs/count` | Jumlah total proof | - |

### Reputation

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/reputation` | Buat profil | `{ role, useKuliWallet? }` |
| `GET` | `/api/reputation/:id` | Lihat profil | - |
| `GET` | `/api/reputation/address/:address` | Cari by wallet | - |
| `GET` | `/api/reputation/:id/reliable` | Cek reliable | - |
| `GET` | `/api/reputation/:id/onTimeRate` | Cek on-time rate | - |

### Matching

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/matching/workers` | Match worker ke proyek | `{ budget, durationDays, skills, location }` |
| `POST` | `/api/matching/projects` | Match proyek ke worker | `{ dailyRate, rating, skills, location }` |

---

## 🔗 Smart Contracts

### ProjectEscrow.sol (Core)

State Machine:
```
Created → Funded → Active → Completed
                       ↓
                    Disputed → Completed
                       ↓
                    Cancelled
```

Key Functions:
- `createProject(kuli, dailyRate, durationDays)` → uint256 projectId
- `depositFunds(projectId)` [payable]
- `startProject(projectId)`
- `submitWorkProof(projectId, photoHash, latitude, longitude)` → uint256 proofId
- `verifyWorkProof(projectId, proofId, verified)` → releases payment if verified
- `raiseDispute(projectId, reason)`
- `resolveDispute(projectId, favorKuli, amount)`
- `cancelProject(projectId)`

### Reputation.sol

Key Functions:
- `createProfile(role)` → profileId
- `recordJobComplete(profileId, earnings, onTime)`
- `updateRating(profileId, newRating)` (100-500, represent 1.0-5.0 stars)
- `isReliable(profileId)` → bool (rating >= 400 && disputes < 3)

### WorkProof.sol

Key Functions:
- `submitProof(projectId, photoHash, latitude, longitude)` → proofId
- `verifyProof(proofId, result)` (AI oracle only)

---

## 🖥️ Frontend Pages (11/11)

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Hero, stats, how-it-works |
| Dashboard | `/dashboard` | Project list, role toggle, filters |
| Create Project | `/dashboard/projects/create` | Form buat proyek |
| Fund Escrow | `/dashboard/projects/[id]/fund` | Konfirmasi & sign transaksi |
| Project Detail | `/dashboard/projects/[id]` | Status, progress, proofs |
| My Work | `/dashboard/my-work` | Kuli's active projects |
| Photo Check-in | `/dashboard/proofs` | Submit foto + GPS |
| Payment History | `/dashboard/payments` | Riwayat transaksi |
| Reputation | `/dashboard/reputation` | Cari & lihat profil on-chain |
| Disputes | `/dashboard/disputes` | Ajukan & lihat sengketa |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Blockchain | Solidity 0.8.20, Foundry |
| Smart Contracts | ProjectEscrow, Reputation, WorkProof |
| Backend | Node.js, Express.js, ethers.js v6 (ES modules) |
| Frontend | Next.js 16, React 19, Tailwind CSS v4, TypeScript |
| Icons | @iconify/react |
| Wallet | MetaMask (window.ethereum) |
| Network | Anvil (local) / BNB Testnet (prod) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Foundry (forge, anvil)
- MetaMask browser extension

### 1. Start Anvil (Local Blockchain)
```bash
anvil
```

### 2. Deploy Contracts
```bash
# Set private key (Anvil account #0)
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Deploy all contracts
bash scripts/deploy.sh
```

### 3. Start Backend
```bash
cd backend
npm install
npm start
# Server running at http://localhost:3001
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend running at http://localhost:3000
```

### 5. Setup MetaMask
1. Add network: Anvil Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
2. Import account (Anvil #0):
   - Private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

---

## 🚀 Deployment (BSC Testnet)

### Step 1: Get Testnet BNB
1. Buka https://www.bnbchain.org/en/testnet-faucet
2. Login Binance account
3. Request tBNB

### Step 2: Deploy Contracts
```bash
cp .env.example .env
# Edit .env → isi PRIVATE_KEY dari MetaMask
bash scripts/deploy.sh
```

### Step 3: Deploy Backend (Railway)
- Root directory: `backend/`
- Environment variables:
  ```
  PORT=3001
  RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
  CHAIN_ID=97
  PROJECT_ESCROW_ADDRESS=<dari deploy script>
  REPUTATION_ADDRESS=<dari deploy script>
  WORK_PROOF_ADDRESS=<dari deploy script>
  ADMIN_PRIVATE_KEY=<private key kamu>
  KULI_PRIVATE_KEY=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
  ```

### Step 4: Deploy Frontend (Vercel)
- Root directory: `frontend/`
- Environment variables:
  ```
  NEXT_PUBLIC_ESCROW_ADDRESS=<dari deploy script>
  NEXT_PUBLIC_REPUTATION_ADDRESS=<dari deploy script>
  NEXT_PUBLIC_WORKPROOF_ADDRESS=<dari deploy script>
  NEXT_PUBLIC_API_URL=https://kulibayar-backend.up.railway.app
  ```

---

## 📁 Project Structure

```
kulibayar/
├── src/                          # Smart contracts (Solidity)
│   ├── ProjectEscrow.sol
│   ├── Reputation.sol
│   ├── WorkProof.sol
│   ├── interfaces/
│   ├── types/
│   ├── errors/
│   └── events/
├── test/                         # Foundry tests (43 passing)
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── projects.js
│   │   ├── proofs.js
│   │   ├── reputation.js
│   │   └── matching.js
│   └── services/
│       ├── blockchain.js         # ethers.js + contract interaction
│       ├── photoVerification.js  # GPS + timestamp validation
│       └── matching.js           # Worker-project matching
├── frontend/
│   ├── src/
│   │   ├── app/                  # Next.js App Router (11 pages)
│   │   ├── components/
│   │   │   ├── Iconify.tsx       # @iconify/react wrapper
│   │   │   ├── NavigationBar.tsx # With wallet + mobile menu
│   │   │   ├── NotificationBanner.tsx
│   │   │   └── dashboard/        # Dashboard sub-components
│   │   ├── lib/
│   │   │   ├── config.ts         # Network config
│   │   │   ├── mock/             # Mock data (6 files)
│   │   │   ├── api/              # API functions
│   │   │   └── hooks/            # Custom React hooks (7 files)
│   │   └── types/
│   │       └── models.ts         # TypeScript interfaces
│   └── .env.local
├── scripts/
│   └── deploy.sh                 # Deploy + auto-update .env
├── reference-ui/                 # 11 HTML mockups
├── foundry.toml
├── .env.example
├── TODO.md
└── README.md
```

---

## 🧪 Testing

### Smart Contract Tests
```bash
forge test
# 43 tests passing
```

### API Tests (via curl)
```bash
# Health check
curl http://localhost:3001/api/health

# Create project
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"kuli":"0x70997970C51812dc3A010C7d01b50e0d17dc79C8","dailyRate":0.01,"durationDays":5}'

# Deposit funds
curl -X POST http://localhost:3001/api/projects/1/deposit \
  -H "Content-Type: application/json" \
  -d '{"amount":0.05}'

# Submit proof
curl -X POST http://localhost:3001/api/proofs \
  -F "projectId=1" \
  -F "photo=@photo.jpg" \
  -F "latitude=-6.2088" \
  -F "longitude=106.8456"

# Verify proof (projectId required in body)
curl -X POST http://localhost:3001/api/proofs/1/verify \
  -H "Content-Type: application/json" \
  -d '{"verified":true,"projectId":1}'
```

### Frontend Build
```bash
cd frontend
npm run build
# 0 TypeScript errors, 11 routes compiled
```

---

## 📝 License

MIT

---

## 🏆 Hackathon

**Indonesia Web3 Hackathon 2026**
- Track: Finance & Commerce
- Problem: Late/missing payments for construction workers
- Solution: Trustless escrow + on-chain reputation
- Prize Pool: USD 5,000
