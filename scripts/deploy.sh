#!/bin/bash
set -e

echo "🚀 KuliBayar Contract Deployment"
echo "================================"

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ .env file not found!"
  echo "   Copy .env.example to .env and add your private key"
  exit 1
fi

# Source .env
source .env

if [ "$PRIVATE_KEY" = "your_private_key_here" ]; then
  echo "❌ Please set your PRIVATE_KEY in .env"
  exit 1
fi

RPC_URL=${RPC_URL:-"https://rpc-amoy.polygon.technology"}
CHAIN_ID=${CHAIN_ID:-80002}

echo ""
echo "📡 Deploying to chain $CHAIN_ID..."
echo "   RPC: $RPC_URL"
echo ""

# Deploy ProjectEscrow
echo "1️⃣  Deploying ProjectEscrow..."
ESCROW=$(forge create src/ProjectEscrow.sol:ProjectEscrow \
  --rpc-url "$RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --json 2>/dev/null | grep -o '"deployedTo":"[^"]*"' | cut -d'"' -f4)
echo "   ✅ ProjectEscrow: $ESCROW"

# Deploy Reputation
echo "2️⃣  Deploying Reputation..."
REPUTATION=$(forge create src/Reputation.sol:Reputation \
  --rpc-url "$RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --json 2>/dev/null | grep -o '"deployedTo":"[^"]*"' | cut -d'"' -f4)
echo "   ✅ Reputation: $REPUTATION"

# Deploy WorkProof
echo "3️⃣  Deploying WorkProof..."
WORKPROOF=$(forge create src/WorkProof.sol:WorkProof \
  --rpc-url "$RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --json 2>/dev/null | grep -o '"deployedTo":"[^"]*"' | cut -d'"' -f4)
echo "   ✅ WorkProof: $WORKPROOF"

echo ""
echo "📝 Updating backend/.env..."
cat > backend/.env << EOF
PORT=3001
NODE_ENV=development
RPC_URL=$RPC_URL
CHAIN_ID=$CHAIN_ID
PROJECT_ESCROW_ADDRESS=$ESCROW
REPUTATION_ADDRESS=$REPUTATION
WORK_PROOF_ADDRESS=$WORKPROOF
ADMIN_PRIVATE_KEY=$PRIVATE_KEY
KULI_PRIVATE_KEY=${KULI_PRIVATE_KEY:-0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d}
EOF
echo "   ✅ backend/.env updated"

echo ""
echo "📝 Creating frontend/.env.local..."
cat > frontend/.env.local << EOF
NEXT_PUBLIC_ESCROW_ADDRESS=$ESCROW
NEXT_PUBLIC_REPUTATION_ADDRESS=$REPUTATION
NEXT_PUBLIC_WORKPROOF_ADDRESS=$WORKPROOF
NEXT_PUBLIC_API_URL=${API_URL:-http://localhost:3001}
EOF
echo "   ✅ frontend/.env.local created"

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Contract Addresses:"
echo "   ProjectEscrow: $ESCROW"
echo "   Reputation:    $REPUTATION"
echo "   WorkProof:     $WORKPROOF"
echo ""
echo "View on explorer:"
echo "   https://amoy.polygonscan.com/address/$ESCROW"
echo "   https://amoy.polygonscan.com/address/$REPUTATION"
echo "   https://amoy.polygonscan.com/address/$WORKPROOF"
