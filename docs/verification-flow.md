# Verification Flow

Flow verifikasi end-to-end dari submission hingga payment release.

---

## Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   WORKER     │     │   FRONTEND   │     │   BACKEND    │     │  BLOCKCHAIN  │
│   (Kuli)     │────▶│  (Next.js)   │────▶│  (Express)   │────▶│  (Solidity)  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

## Step-by-Step Flow

### Step 1: Worker Opens Proof Submission Page

**Endpoint:** `GET /dashboard/proofs`

**UI Components:**
- Project ID input
- GPS Location button
- Liveness Challenge button
- Photo Upload area
- Submit button (disabled until all required)

---

### Step 2: Get GPS Location

**Browser API:**
```javascript
navigator.geolocation.getCurrentPosition(
  (pos) => {
    setGps({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy
    });
  },
  (err) => {
    alert('Gagal dapat lokasi: ' + err.message);
  },
  { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
);
```

**Key Settings:**
- `enableHighAccuracy: true` - Use GPS receiver
- `timeout: 10000` - 10 second timeout
- `maximumAge: 0` - Always fresh location

**Accuracy Display:**
- ≤50m: "(baik)" - Green
- >50m: "(kurang akurat)" - Yellow

---

### Step 3: Get Liveness Challenge

**API Call:**
```javascript
POST /api/challenges/create
Body: {
  projectId: "1",
  workerAddress: "0x0000000000000000000000000000000000000001"
}
```

**Response:**
```json
{
  "success": true,
  "challengeId": "a1b2c3d4e5f6...",
  "challenge": "Pegang kertas bertuliskan: KULI-A1B2C3D4",
  "code": "A1B2C3D4",
  "expiresAt": "2026-07-11T10:30:00.000Z"
}
```

**What Worker Sees:**
```
┌─────────────────────────────────────────┐
│  ✅ Challenge Aktif                     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Pegang kertas bertuliskan:      │   │
│  │ KULI-A1B2C3D4                   │   │
│  │                                 │   │
│  │ Berlaku sampai: 10:30:00       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ⚠️ Tulis kode di atas di kertas,     │
│     pegang saat mengambil foto          │
└─────────────────────────────────────────┘
```

---

### Step 4: Take Photo with Challenge Code

**Worker Actions:**
1. Tulis kode "KULI-A1B2C3D4" di kertas
2. Pegang kertas tersebut
3. Ambil foto dengan kode terlihat jelas

**Photo Requirements:**
- Format: JPG atau PNG
- Maksimal: 5MB
- Kode harus terbaca jelas

---

### Step 5: Submit Proof

**API Call:**
```javascript
POST /api/proofs
Content-Type: multipart/form-data

Fields:
- projectId: "1"
- photo: <file>
- latitude: "-6.2615"
- longitude: "106.8106"
- accuracy: "12.5"
- challengeId: "a1b2c3d4e5f6..."
```

---

### Step 6: Backend Verification

#### 6a. EXIF Validation

**File:** `backend/services/photoVerification.js`

```javascript
// Parse EXIF dari foto
const photoBuffer = fs.readFileSync(photoPath);
const exifData = exifParser.create(photoBuffer).parse();

// Extract GPS dari EXIF
const exifGPS = {
  lat: exifData.gps.Latitude,
  lng: exifData.gps.Longitude
};

// Extract timestamp dari EXIF
const exifTimestamp = new Date(exifData.tags.DateTimeOriginal);

// Cross-validate GPS
const distance = calculateDistance(
  submittedLat, submittedLng,
  exifGPS.lat, exifGPS.lng
);
if (distance > 100) { // > 100m
  score -= 25;
  reasons.push(`EXIF GPS mismatch: ${distance.toFixed(0)}m deviation`);
}
```

#### 6b. GPS Accuracy Check

```javascript
if (accuracy > 50) { // > 50 meters
  score -= 15;
  reasons.push(`GPS accuracy too low: ${accuracy.toFixed(1)}m`);
}
```

#### 6c. Liveness Challenge Verification

**File:** `backend/services/livenessChallenge.js`

```javascript
// OCR foto
const { data: { text } } = await Tesseract.recognize(
  photoPath,
  'ind+eng'
);

// Cek kode ada di foto
const codeFound = text.includes(challenge.code.toUpperCase());
if (codeFound) {
  score += 50;
  reasons.push('Challenge code found in photo');
} else {
  score -= 30;
  reasons.push('Challenge code not found in photo');
}
```

#### 6d. Location Cross-Validation

**File:** `backend/routes/proofs.js`

```javascript
// Load project locations
const projectLocations = JSON.parse(
  fs.readFileSync('data/projectLocations.json')
);

// Check if GPS within project radius
const isWithinRadius = checkLocationMatch(
  photoLat, photoLng,
  projectLocation.latitude,
  projectLocation.longitude,
  projectLocation.radiusKm // default 0.5 km
);

if (!isWithinRadius) {
  score -= 25;
  reasons.push('GPS location is outside project site');
}
```

---

### Step 7: Score Calculation

```javascript
// Combine scores
const finalScore = Math.round(
  exifScore * 0.6 +           // EXIF: 60%
  challengeScore * 0.2 +      // Challenge: 20%
  (locationValid ? 20 : 0)   // Location: 20%
);

// Decision
if (finalScore >= 60) {
  // Submit to blockchain
  submitWorkProof(projectId, photoHash, latScaled, lngScaled);
} else {
  // Reject with reasons
  return res.status(400).json({
    error: 'Photo verification failed',
    score: finalScore,
    reasons: reasons
  });
}
```

---

### Step 8: Blockchain Submission

**Smart Contract Call:**
```solidity
function submitWorkProof(
  uint256 projectId,
  string memory photoHash,
  int256 latitude,
  int256 longitude
) external onlyKuli(projectId) returns (uint256) {
    // Validate project exists and is Active
    // Create WorkProof struct
    // Emit WorkProofSubmitted event
    return proofId;
}
```

---

### Step 9: Admin/AI Oracle Verification (Future)

**Current (Manual):**
```javascript
POST /api/proofs/:id/verify
Body: {
  verified: true,
  projectId: "1"
}
```

**Future (Automated):**
- Multi-signature verification
- Decentralized oracle (Chainlink)
- Timelock on admin actions

---

### Step 10: Payment Release

**Smart Contract:**
```solidity
function verifyWorkProof(
  uint256 projectId,
  uint256 proofId,
  bool verified
) external onlyAdmin {
    if (verified) {
        _releasePayment(projectId);
    }
}

function _releasePayment(uint256 projectId) internal {
    Project storage project = projects[projectId];
    uint256 amount = project.dailyRate;

    // Transfer ETH to kuli
    (bool success, ) = project.kuli.call{value: amount}("");
    require(success, "Transfer failed");

    // Update state
    project.daysCompleted++;
    project.totalReleased += amount;
}
```

---

## Error Handling

### Verification Failed

```json
{
  "error": "Photo verification failed",
  "score": 45,
  "reasons": [
    "EXIF GPS mismatch: 250m deviation from submitted GPS",
    "Challenge code not found in photo",
    "GPS location is outside project site"
  ]
}
```

### Challenge Expired

```json
{
  "error": "Liveness challenge failed",
  "score": 0,
  "reasons": ["Challenge expired"]
}
```

### Challenge Already Used

```json
{
  "error": "Liveness challenge failed",
  "score": 0,
  "reasons": ["Challenge already used"]
}
```

---

## Timeline

| Step | Duration | Notes |
|------|----------|-------|
| 1. Open page | ~1s | Load React component |
| 2. Get GPS | 2-5s | Depends on device/signal |
| 3. Get challenge | ~1s | API call |
| 4. Take photo | 30-60s | Worker writes code, takes photo |
| 5. Submit | ~1s | Upload photo + metadata |
| 6. Verify | 3-8s | EXIF + OCR processing |
| 7. Blockchain | 2-5s | Transaction confirmation |
| **Total** | **40-80s** | End-to-end |
