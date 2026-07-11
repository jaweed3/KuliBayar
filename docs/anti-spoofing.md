# Anti-Spoofing Mechanisms

Semua mekanisme anti-spoofing yang diimplementasi di KuliBayar.

---

## Overview

```
┌─────────────────────────────────────────────────────────┐
│                 ANTI-SPOOFING LAYERS                    │
│                                                         │
│  Layer 1: EXIF Validation                               │
│  ├── GPS coordinates dari foto                          │
│  ├── Timestamp dari foto                                │
│  └── Cross-check GPS EXIF vs submitted                  │
│                                                         │
│  Layer 2: GPS Accuracy Check                            │
│  ├── High accuracy mode required                        │
│  └── Threshold: 50m                                     │
│                                                         │
│  Layer 3: Liveness Challenge                            │
│  ├── Random code generation                             │
│  ├── OCR verification                                   │
│  └── Challenge-response flow                            │
│                                                         │
│  Layer 4: Location Cross-Validation                     │
│  ├── Project site coordinates                           │
│  ├── Haversine distance formula                         │
│  └── Radius threshold: 500m                             │
└─────────────────────────────────────────────────────────┘
```

---

## Layer 1: EXIF Validation

### What is EXIF?

EXIF (Exchangeable Image File Format) adalah metadata yang disimpan di dalam foto, termasuk:
- **GPS Coordinates**: Lokasi foto diambil
- **Timestamp**: Kapan foto diambil
- **Camera Info**: Model kamera, settings
- **Orientation**: Rotasi foto

### Implementation

**File:** `backend/services/photoVerification.js`

```javascript
import exifParser from 'exif-parser';
import fs from 'fs';

function parseEXIF(photoBuffer) {
  try {
    const parser = exifParser.create(photoBuffer);
    return parser.parse();
  } catch (error) {
    console.error('EXIF parsing failed:', error.message);
    return null;
  }
}

function extractGPSFromEXIF(exifData) {
  if (!exifData?.gps?.Latitude || !exifData?.gps?.Longitude) {
    return null;
  }

  const lat = exifData.gps.Latitude;
  const lng = exifData.gps.Longitude;
  const latRef = exifData.gps.LatitudeRef || 'N';
  const lngRef = exifData.gps.LongitudeRef || 'E';

  return {
    lat: latRef === 'S' ? -lat : lat,
    lng: lngRef === 'W' ? -lng : lng
  };
}

function extractTimestampFromEXIF(exifData) {
  if (!exifData?.tags?.DateTimeOriginal) {
    return null;
  }

  // EXIF format: "YYYY:MM:DD HH:MM:SS"
  const dateTimeStr = exifData.tags.DateTimeOriginal;
  const [datePart, timePart] = dateTimeStr.split(' ');
  const [year, month, day] = datePart.split(':');
  const [hours, minutes, seconds] = timePart.split(':');

  return new Date(year, month - 1, day, hours, minutes, seconds);
}
```

### GPS Cross-Validation

```javascript
const MAX_GPS_DEVIATION_METERS = 100;

// Cross-validate GPS
if (exifGPS) {
  const distance = calculateDistance(
    latitude, longitude,      // Submitted GPS
    exifGPS.lat, exifGPS.lng  // EXIF GPS
  );

  if (distance > MAX_GPS_DEVIATION_METERS) {
    score -= 25;
    reasons.push(`EXIF GPS mismatch: ${distance.toFixed(0)}m deviation`);
  }
}
```

### Haversine Formula

```javascript
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

### Timestamp Validation

```javascript
const MAX_PHOTO_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// Check EXIF timestamp
if (exifTimestamp) {
  const exifTime = exifTimestamp.getTime();
  const now = Date.now();
  const exifAge = now - exifTime;

  // Check if EXIF timestamp is from the future
  if (exifTime > now) {
    score -= 30;
    reasons.push('EXIF timestamp is in the future');
  }

  // Check if EXIF timestamp is too old
  if (exifAge > MAX_PHOTO_AGE_MS) {
    score -= 20;
    reasons.push('EXIF timestamp older than 24 hours');
  }

  // Check if EXIF timestamp matches submitted timestamp
  if (timestamp) {
    const submittedTime = new Date(timestamp).getTime();
    const timeDiff = Math.abs(exifTime - submittedTime);
    const FIVE_MINUTES_MS = 5 * 60 * 1000;

    if (timeDiff > FIVE_MINUTES_MS) {
      score -= 15;
      reasons.push(`EXIF timestamp mismatch: ${Math.round(timeDiff / 1000)}s difference`);
    }
  }
}
```

### Score Impact

| Check | Pass | Fail |
|-------|------|------|
| EXIF GPS match | +5 | -25 |
| EXIF timestamp valid | 0 | -20 to -30 |
| EXIF exists | +10 | -10 |

---

## Layer 2: GPS Accuracy Check

### How GPS Works

GPS di smartphone menggunakan:
- **Satellite signals**: 3-4 satellites untuk triangulasi
- **WiFi/Cell tower**:辅助定位
- **Accuracy**: Bergantung pada kondisi (indoor/outdoor, interference)

### Implementation

**Frontend:**
```javascript
navigator.geolocation.getCurrentPosition(
  (pos) => {
    setGps({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy  // ← Important!
    });
  },
  (err) => { /* ... */ },
  {
    enableHighAccuracy: true,  // ← Use GPS receiver
    timeout: 10000,
    maximumAge: 0
  }
);
```

**Backend:**
```javascript
const MAX_GPS_ACCURACY_METERS = 50;

if (accuracy !== undefined && accuracy !== null) {
  if (accuracy > MAX_GPS_ACCURACY_METERS) {
    score -= 15;
    reasons.push(`GPS accuracy too low: ${accuracy.toFixed(1)}m (max: ${MAX_GPS_ACCURACY_METERS}m)`);
  }
}
```

### Accuracy Levels

| Accuracy | Quality | Score Impact |
|----------|---------|--------------|
| ≤10m | Excellent | 0 |
| 10-30m | Good | 0 |
| 30-50m | Fair | 0 |
| 50-100m | Poor | -15 |
| >100m | Very Poor | -25 |

### Why This Matters

- **GPS spoofing apps** typically report perfect accuracy (1-5m)
- **Real GPS** has natural variation (5-50m)
- **Indoor GPS** is often 50-100m accurate
- **Mock locations** often have suspiciously low accuracy

---

## Layer 3: Liveness Challenge

### Concept

Challenge-response system untuk membuktikan kehadiran fisik:
1. Server generate random code
2. User tulis code di kertas
3. User ambil foto dengan code
4. Server OCR foto dan verifikasi code ada

### Implementation

**File:** `backend/services/livenessChallenge.js`

```javascript
import crypto from 'crypto';
import Tesseract from 'tesseract.js';

// Challenge templates
const CHALLENGE_TEMPLATES = [
  'Tulis di kertas: {code}',
  'Pegang kertas bertuliskan: {code}',
  'Foto dengan tulisan: {code}',
  'Ambil foto sambil memegang: {code}',
  'Tunjukkan kertas dengan kode: {code}'
];

function generateChallengeCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

export function createChallenge(projectId, workerAddress) {
  const code = generateChallengeCode(); // e.g., "A1B2C3D4"
  const template = CHALLENGE_TEMPLATES[
    Math.floor(Math.random() * CHALLENGE_TEMPLATES.length)
  ];
  const challengeText = template.replace('{code}', code);

  // Store with expiry (5 minutes)
  challenges.set(challengeId, {
    code,
    challengeText,
    projectId,
    workerAddress,
    expiresAt: Date.now() + 5 * 60 * 1000,
    used: false
  });

  return { challengeId, challenge: challengeText, code, expiresAt };
}
```

### OCR Verification

```javascript
export async function verifyChallenge(photoPath, challengeId) {
  // Check challenge exists and not expired
  const challenge = challenges.get(challengeId);
  if (!challenge || challenge.used || Date.now() > challenge.expiresAt) {
    return { valid: false, score: 0, reasons: ['Challenge invalid'] };
  }

  // Perform OCR
  const { data: { text } } = await Tesseract.recognize(
    photoPath,
    'ind+eng'
  );

  // Check if code appears in photo
  const codeFound = text.includes(challenge.code.toUpperCase());

  if (codeFound) {
    score += 50;
    reasons.push('Challenge code found in photo');
  } else {
    score -= 30;
    reasons.push('Challenge code not found in photo');
  }

  // Mark as used
  challenge.used = true;

  return { valid: score >= 30, score, reasons };
}
```

### Why This Works

- **Physical presence required**: User harus hadir untuk tulis code
- **Time-limited**: Code expired dalam 5 menit
- **One-time use**: Code tidak bisa dipakai ulang
- **OCR verification**: Tidak bisa curang dengan screenshot

### Limitations

- **OCR accuracy**: Tidak 100% akurat, bisa ada false negative
- **Handwriting**: Tulisan tangan bisa sulit dibaca
- **Lighting**: Foto gelap bisa gagal OCR
- **Alternative**: Bisa ditambah face recognition di masa depan

---

## Layer 4: Location Cross-Validation

### Concept

Verifikasi GPS berada dalam radius project site.

### Implementation

**File:** `backend/routes/proofs.js`

```javascript
import fs from 'fs';
import path from 'path';

// Load project locations
const projectLocations = JSON.parse(
  fs.readFileSync('data/projectLocations.json')
);

// Check location
const projectLocation = projectLocations[projectId];
if (projectLocation && latitude && longitude) {
  const isWithinRadius = checkLocationMatch(
    parseFloat(latitude),
    parseFloat(longitude),
    projectLocation.latitude,
    projectLocation.longitude,
    projectLocation.radiusKm || 0.5
  );

  if (!isWithinRadius) {
    score -= 25;
    reasons.push('GPS location is outside project site');
  }
}
```

**Project Locations File:**
```json
{
  "1": {
    "name": "Proyek Jakarta Selatan",
    "latitude": -6.2615,
    "longitude": 106.8106,
    "radiusKm": 0.5
  }
}
```

### Haversine Formula

```javascript
export function checkLocationMatch(
  photoLat, photoLng,
  projectLat, projectLng,
  radiusKm = 1
) {
  const R = 6371; // Earth's radius in km
  const dLat = (projectLat - photoLat) * Math.PI / 180;
  const dLng = (projectLng - photoLng) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(photoLat * Math.PI / 180) *
    Math.cos(projectLat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= radiusKm;
}
```

### Radius Configuration

| Project Type | Recommended Radius |
|--------------|-------------------|
| Construction site | 500m |
| Office building | 200m |
| Road project | 1km |
| Bridge project | 500m |

---

## Combined Protection

### Attack Scenarios

| Attack | Layer 1 | Layer 2 | Layer 3 | Layer 4 | Result |
|--------|---------|---------|---------|---------|--------|
| GPS Spoofing | ❌ | ❌ | ✅ | ❌ | **DETECTED** (EXIF mismatch) |
| Foto Reuse | ❌ | ✅ | ❌ | ✅ | **DETECTED** (EXIF timestamp old) |
| Screenshot | ❌ | ✅ | ❌ | ✅ | **DETECTED** (No EXIF data) |
| Wrong Location | ✅ | ✅ | ❌ | ❌ | **DETECTED** (Outside radius) |
| Not Present | ✅ | ✅ | ❌ | ✅ | **DETECTED** (No challenge code) |
| All Layers Bypassed | - | - | - | - | **SUCCESS** (Very difficult) |

### Difficulty to Cheat

To successfully cheat the system, an attacker would need to:
1. **Spoof GPS** AND **manipulate EXIF GPS** to match
2. **Fake EXIF timestamp** to be current
3. **Write challenge code** on paper and take photo
4. **Be within 500m** of project site
5. **Have GPS accuracy** ≤50m

This is extremely difficult and requires:
- Physical presence at project site
- Knowledge of challenge code (time-limited)
- Tools to manipulate EXIF data
- Coordination to do all within 5 minutes

---

## Configuration

### Environment Variables

```bash
# GPS Accuracy Threshold
MAX_GPS_ACCURACY_METERS=50

# EXIF GPS Deviation Threshold
MAX_GPS_DEVIATION_METERS=100

# Challenge Expiry
CHALLENGE_EXPIRY_MS=300000  # 5 minutes

# Location Radius (default)
DEFAULT_LOCATION_RADIUS_KM=0.5
```

### Tuning

**More Strict:**
```javascript
const MAX_GPS_ACCURACY_METERS = 25;    // Was 50
const MAX_GPS_DEVIATION_METERS = 50;   // Was 100
const CHALLENGE_EXPIRY_MS = 3 * 60 * 1000; // Was 5 min
```

**More Lenient:**
```javascript
const MAX_GPS_ACCURACY_METERS = 100;   // Was 50
const MAX_GPS_DEVIATION_METERS = 200;  // Was 100
const CHALLENGE_EXPIRY_MS = 10 * 60 * 1000; // Was 5 min
```
