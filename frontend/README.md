# KuliBayar Frontend

Escrow platform untuk konstruksi Indonesia. Dana dikunci di smart contract, cair otomatis setelah kerja terverifikasi via foto + GPS.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Icons**: Iconify
- **Fonts**: Inter (body), Playfair Display (headings), JetBrains Mono (code)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, mission, features |
| `/dashboard` | Project dashboard (toggle Kontraktor/Kuli) |
| `/dashboard/projects/create` | Create new project (Kontraktor) |
| `/dashboard/projects/[id]` | Project detail + escrow status |
| `/dashboard/projects/[id]/fund` | Fund escrow (Kontraktor) |
| `/dashboard/my-work` | Active projects list (Kuli) |
| `/dashboard/proofs` | Submit work proof with photo + GPS (Kuli) |
| `/dashboard/payments` | Payment history + wallet balance (Kuli) |
| `/dashboard/reputation` | Search on-chain reputation |

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_ESCROW_ADDRESS=0x...
NEXT_PUBLIC_REPUTATION_ADDRESS=0x...
NEXT_PUBLIC_WORKPROOF_ADDRESS=0x...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Design System

- **Background**: `#050505` (dark)
- **Accent**: `#FF4500` (orange)
- **Card**: `#111111`
- **Fonts**: Playfair Display (serif headings), Inter (body)
- **Effects**: Noise overlay, reveal animations, parallax cards
