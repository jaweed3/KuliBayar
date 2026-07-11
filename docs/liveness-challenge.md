# Liveness Challenge System

Sistem challenge-response untuk membuktikan kehadiran fisik kuli di lokasi proyek.

---

## Concept

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    SERVER    │────▶│    USER      │────▶│    PHOTO     │
│              │     │              │     │              │
│ Generate     │     │ Tulis kode   │     │ Foto dengan  │
│ random code  │     │ di kertas    │     │ kode terlihat│
└──────────────┘     └──────────────┘     └──────────────┘
       │                                        │
       │                                        │
       ▼                                        ▼
┌──────────────┐                         ┌──────────────┐
│   VERIFY     │◀────────────────────────│   OCR        │
│   CODE       │                         │   PROCESS    │
└──────────────┘                         └──────────────┘
```

---

## Flow

### 1. Create Challenge

**API:**
```javascript
POST /api/challenges/create
Body: {
  "projectId": "1",
  "workerAddress": "0x1234..."
}
```

**Response:**
```json
{
  "success": true,
  "challengeId": "a1b2c3d4e5f67890...",
  "challenge": "Tulis di kertas: KULI-A1B2C3D4",
  "code": "A1B2C3D4",
  "expiresAt": "2026-07-11T10:30:00.000Z"
}
```

**What User Sees:**
```
┌─────────────────────────────────────────┐
│  ✅ Challenge Aktif                     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Tulis di kertas:                │   │
│  │ KULI-A1B2C3D4                   │   │
│  │                                 │   │
│  │ Berlaku sampai: 10:30:00       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ⚠️ Tulis kode di atas di kertas,     │
│     pegang saat mengambil foto          │
└─────────────────────────────────────────┘
```

### 2. User Takes Photo

**Instructions:**
1. Tulis kode "KULI-A1B2C3D4" di kertas
2. Pegang kertas tersebut
3. Ambil foto dengan kode terlihat jelas
4. Pastikan tulisan terbaca

### 3. Verify Challenge

**API:**
```javascript
POST /api/challenges/verify
Body: {
  "challengeId": "a1b2c3d4e5f67890...",
  "photoPath": "/uploads/1234567890-photo.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "score": 70,
  "reasons": [
    "Challenge code found in photo",
    "Challenge words found: Tulis, kertas",
    "Clear challenge text detected"
  ]
}
```

---

## Implementation Details

### Challenge Generation

**File:** `backend/services/livenessChallenge.js`

```javascript
import crypto from 'crypto';

// Challenge templates
const CHALLENGE_TEMPLATES = [
  'Tulis di kertas: {code}',
  'Pegang kertas bertuliskan: {code}',
  'Foto dengan tulisan: {code}',
  'Ambil foto sambil memegang: {code}',
  'Tunjukkan kertas dengan kode: {code}'
];

// In-memory storage (production: use Redis)
const challenges = new Map();

// Challenge expiry: 5 minutes
const CHALLENGE_EXPIRY_MS = 5 * 60 * 1000;

function generateChallengeCode() {
  // Generate 8-character alphanumeric code
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

export function createChallenge(projectId, workerAddress) {
  const code = generateChallengeCode(); // e.g., "A1B2C3D4"
  const template = CHALLENGE_TEMPLATES[
    Math.floor(Math.random() * CHALLENGE_TEMPLATES.length)
  ];
  const challengeText = template.replace('{code}', code);

  const challengeId = crypto.randomBytes(16).toString('hex');
  const expiresAt = Date.now() + CHALLENGE_EXPIRY_MS;

  // Store challenge
  challenges.set(challengeId, {
    code,
    challengeText,
    projectId,
    workerAddress,
    expiresAt,
    used: false,
    createdAt: Date.now()
  });

  // Cleanup expired challenges
  cleanupExpiredChallenges();

  return {
    challengeId,
    challenge: challengeText,
    code,
    expiresAt: new Date(expiresAt).toISOString()
  };
}
```

### OCR Verification

```javascript
import Tesseract from 'tesseract.js';

export async function verifyChallenge(photoPath, challengeId) {
  const reasons = [];
  let score = 0;

  // 1. Check challenge exists
  const challenge = challenges.get(challengeId);
  if (!challenge) {
    return { valid: false, score: 0, reasons: ['Challenge not found'] };
  }

  // 2. Check if already used
  if (challenge.used) {
    return { valid: false, score: 0, reasons: ['Challenge already used'] };
  }

  // 3. Check if expired
  if (Date.now() > challenge.expiresAt) {
    challenges.delete(challengeId);
    return { valid: false, score: 0, reasons: ['Challenge expired'] };
  }

  // 4. Perform OCR
  try {
    const { data: { text } } = await Tesseract.recognize(
      photoPath,
      'ind+eng',
      {
        logger: m => {
          // Optional: log progress
        }
      }
    );

    // 5. Check if challenge code appears in OCR text
    const codeUpper = challenge.code.toUpperCase();
    const codeLower = challenge.code.toLowerCase();
    const codeFound = text.includes(codeUpper) || text.includes(codeLower);

    if (codeFound) {
      score += 50;
      reasons.push('Challenge code found in photo');
    } else {
      reasons.push('Challenge code not found in photo');
      score -= 30;
    }

    // 6. Check if challenge words appear (more strict)
    const challengeWords = challenge.challengeText
      .split(' ')
      .filter(w => w.length > 3);
    const wordsFound = challengeWords.filter(w =>
      text.toLowerCase().includes(w.toLowerCase())
    );

    if (wordsFound.length > 0) {
      score += 20;
      reasons.push(`Challenge words found: ${wordsFound.join(', ')}`);
    }

    // 7. Bonus for clear text
    if (wordsFound.length >= 3) {
      score += 15;
      reasons.push('Clear challenge text detected');
    }

  } catch (error) {
    console.error('OCR failed:', error.message);
    reasons.push('OCR processing failed');
    score -= 20;
  }

  // 8. Mark as used if valid enough
  if (score >= 30) {
    challenge.used = true;
  }

  return {
    valid: score >= 30,
    score: Math.max(0, Math.min(100, score)),
    reasons,
    ocrText: text
  };
}
```

---

## Challenge Types

### Simple Code
```
Tulis di kertas: KULI-A1B2C3D4
```
- ✅ Easy to write
- ✅ Easy to OCR
- ❌ Could be guessed

### Date-Based Code
```
Tulis di kertas: KULI-2026-07-11
```
- ✅ Changes daily
- ✅ Predictable pattern
- ❌ Could be reused same day

### Random Phrase
```
Pegang kertas bertuliskan: MERAH DELIMA
```
- ✅ Hard to guess
- ✅ Easy to write
- ❌ Longer to write

### Action-Based
```
Ambil foto sambil memegang: KULI-X9Y8Z7
```
- ✅ Requires action
- ✅ Hard to fake
- ❌ More complex

---

## Score Calculation

| Check | Score | Notes |
|-------|-------|-------|
| Code found in photo | +50 | Primary check |
| Challenge words found | +20 | Secondary check |
| Clear text detected | +15 | Bonus for clarity |
| Code not found | -30 | Primary failure |
| OCR failed | -20 | Processing error |
| **Threshold** | **30** | Minimum to pass |

---

## Security Considerations

### What This Protects Against

1. **Photo Reuse**: Cannot use old photos (time-limited)
2. **Stock Photos**: Must have specific code
3. **Remote Submission**: Must be physically present to write code
4. **Bot Submission**: Requires human interaction

### Limitations

1. **OCR Accuracy**: Not 100% reliable
   - Handwriting may be difficult to read
   - Poor lighting can cause failures
   - Non-standard fonts may not be recognized

2. **Physical Presence**: Does not verify WHO is present
   - Could be someone else at the location
   - Does not verify identity

3. **Time Window**: 5 minutes may be too short/long
   - Too short: User may not have time to write
   - Too long: Could be exploited

### Future Improvements

1. **Face Recognition**: Verify identity
2. **Voice Challenge**: Audio-based verification
3. **Biometric**: Fingerprint or iris scan
4. **Video Proof**: Continuous video instead of photo

---

## Configuration

### Environment Variables

```bash
# Challenge expiry time (ms)
CHALLENGE_EXPIRY_MS=300000  # 5 minutes

# OCR languages
OCR_LANGUAGES=ind+eng

# Score threshold
CHALLENGE_SCORE_THRESHOLD=30
```

### Customization

**More Strict:**
```javascript
const CHALLENGE_EXPIRY_MS = 3 * 60 * 1000; // 3 minutes
const SCORE_THRESHOLD = 50; // Higher threshold
```

**More Lenient:**
```javascript
const CHALLENGE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const SCORE_THRESHOLD = 20; // Lower threshold
```

---

## API Reference

### POST /api/challenges/create

Create a new liveness challenge.

**Request:**
```json
{
  "projectId": "1",
  "workerAddress": "0x1234..."
}
```

**Response:**
```json
{
  "success": true,
  "challengeId": "abc123...",
  "challenge": "Tulis di kertas: KULI-A1B2C3D4",
  "code": "A1B2C3D4",
  "expiresAt": "2026-07-11T10:30:00.000Z"
}
```

### POST /api/challenges/verify

Verify a challenge from a photo.

**Request:**
```json
{
  "challengeId": "abc123...",
  "photoPath": "/uploads/photo.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "score": 70,
  "reasons": [
    "Challenge code found in photo",
    "Challenge words found: Tulis, kertas"
  ]
}
```

### GET /api/challenges/:challengeId

Get challenge info (without exposing code).

**Response:**
```json
{
  "success": true,
  "challengeId": "abc123...",
  "projectId": "1",
  "expiresAt": "2026-07-11T10:30:00.000Z",
  "used": false
}
```

### GET /api/challenges/worker/:workerAddress

Get all active challenges for a worker.

**Response:**
```json
{
  "success": true,
  "challenges": [
    {
      "challengeId": "abc123...",
      "challenge": "Tulis di kertas: KULI-A1B2C3D4",
      "expiresAt": "2026-07-11T10:30:00.000Z"
    }
  ]
}
```
