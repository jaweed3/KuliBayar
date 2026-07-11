# API Reference

Lengkap semua endpoints KuliBayar Backend.

---

## Base URL

```
Development: http://localhost:3001
Production: https://api.kulibayar.com
```

---

## Authentication

Saat ini tidak ada authentication di backend. Security bergantung pada:
- Smart contract `msg.sender` validation
- Admin wallet signature

---

## Endpoints

### Health Check

```
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-11T10:30:00.000Z"
}
```

---

### Proofs

#### Submit Work Proof

```
POST /api/proofs
Content-Type: multipart/form-data
```

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| projectId | string | ✅ | Project ID |
| photo | file | ✅ | Photo file (max 5MB, image/*) |
| latitude | string | ✅ | GPS latitude |
| longitude | string | ✅ | GPS longitude |
| accuracy | string | ❌ | GPS accuracy in meters |
| challengeId | string | ❌ | Liveness challenge ID |

**Response (Success):**
```json
{
  "success": true,
  "proofId": 1,
  "photoHash": "Qm1234567890.jpg",
  "verification": {
    "score": 85,
    "reasons": [
      "GPS location verified at project site: Proyek Jakarta Selatan",
      "Challenge code found in photo"
    ],
    "exif": {
      "hasEXIF": true,
      "gps": { "lat": -6.2615, "lng": 106.8106 },
      "timestamp": "2026-07-11T10:30:00.000Z",
      "device": "iPhone 14 Pro"
    },
    "challenge": {
      "verified": true,
      "score": 70
    },
    "location": {
      "valid": true,
      "projectSite": "Proyek Jakarta Selatan",
      "maxRadiusKm": 0.5
    }
  }
}
```

**Response (Failed):**
```json
{
  "error": "Photo verification failed",
  "score": 45,
  "reasons": [
    "EXIF GPS mismatch: 250m deviation from submitted GPS",
    "Challenge code not found in photo"
  ]
}
```

#### Verify Proof (Admin)

```
POST /api/proofs/:id/verify
Content-Type: application/json
```

**Body:**
```json
{
  "verified": true,
  "projectId": "1"
}
```

**Response:**
```json
{
  "success": true
}
```

#### Get Proof Count

```
GET /api/proofs/count
```

**Response:**
```json
{
  "count": 15
}
```

#### Get Project Proofs

```
GET /api/proofs/project/:projectId
```

**Response:**
```json
{
  "proofIds": [1, 2, 3, 4, 5]
}
```

#### Get Proof Details

```
GET /api/proofs/:id
```

**Response:**
```json
{
  "id": 1,
  "projectId": 1,
  "submittedBy": "0x1234...",
  "photoHash": "Qm1234567890.jpg",
  "latitude": -6261500,
  "longitude": 106810600,
  "timestamp": 1689072600,
  "verified": true
}
```

---

### Challenges

#### Create Challenge

```
POST /api/challenges/create
Content-Type: application/json
```

**Body:**
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
  "challengeId": "a1b2c3d4e5f67890...",
  "challenge": "Tulis di kertas: KULI-A1B2C3D4",
  "code": "A1B2C3D4",
  "expiresAt": "2026-07-11T10:35:00.000Z"
}
```

#### Verify Challenge

```
POST /api/challenges/verify
Content-Type: application/json
```

**Body:**
```json
{
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
    "Challenge words found: Tulis, kertas"
  ]
}
```

#### Get Challenge Info

```
GET /api/challenges/:challengeId
```

**Response:**
```json
{
  "success": true,
  "challengeId": "a1b2c3d4e5f67890...",
  "projectId": "1",
  "expiresAt": "2026-07-11T10:35:00.000Z",
  "used": false
}
```

#### Get Worker Challenges

```
GET /api/challenges/worker/:workerAddress
```

**Response:**
```json
{
  "success": true,
  "challenges": [
    {
      "challengeId": "a1b2c3d4e5f67890...",
      "challenge": "Tulis di kertas: KULI-A1B2C3D4",
      "expiresAt": "2026-07-11T10:35:00.000Z"
    }
  ]
}
```

---

### Projects

#### Get All Projects

```
GET /api/projects
```

**Response:**
```json
{
  "projects": [
    {
      "id": 1,
      "name": "Proyek Jakarta Selatan",
      "kontraktor": "0x1234...",
      "kuli": "0x5678...",
      "dailyRate": "0.01",
      "durationDays": 30,
      "status": "Active"
    }
  ]
}
```

#### Get Project by ID

```
GET /api/projects/:id
```

**Response:**
```json
{
  "id": 1,
  "name": "Proyek Jakarta Selatan",
  "kontraktor": "0x1234...",
  "kuli": "0x5678...",
  "dailyRate": "0.01",
  "durationDays": 30,
  "daysCompleted": 5,
  "totalReleased": "0.05",
  "status": "Active"
}
```

#### Create Project

```
POST /api/projects
Content-Type: application/json
```

**Body:**
```json
{
  "kuli": "0x5678...",
  "dailyRate": "0.01",
  "durationDays": 30
}
```

**Response:**
```json
{
  "success": true,
  "projectId": 1
}
```

#### Deposit Funds

```
POST /api/projects/:id/deposit
Content-Type: application/json
```

**Body:**
```json
{
  "amount": "0.3"
}
```

**Response:**
```json
{
  "success": true,
  "txHash": "0xabc..."
}
```

---

### Reputation

#### Get Profile

```
GET /api/reputation/:address
```

**Response:**
```json
{
  "id": 1,
  "address": "0x1234...",
  "role": "Worker",
  "rating": 450,
  "totalJobs": 15,
  "onTimePayments": 14,
  "disputes": 1,
  "totalEarnings": "1.5"
}
```

#### Create Profile

```
POST /api/reputation
Content-Type: application/json
```

**Body:**
```json
{
  "role": "Worker"
}
```

**Response:**
```json
{
  "success": true,
  "profileId": 1
}
```

---

### Matching

#### Get Available Projects

```
GET /api/matching/projects
```

**Response:**
```json
{
  "projects": [
    {
      "id": 1,
      "name": "Proyek Jakarta Selatan",
      "dailyRate": "0.01",
      "durationDays": 30,
      "kontraktor": "0x1234..."
    }
  ]
}
```

#### Get Available Workers

```
GET /api/matching/workers
```

**Response:**
```json
{
  "workers": [
    {
      "address": "0x5678...",
      "rating": 450,
      "totalJobs": 15,
      "reliability": true
    }
  ]
}
```

---

## Error Codes

| HTTP Status | Error | Description |
|-------------|-------|-------------|
| 400 | Missing projectId or photo | Required fields missing |
| 400 | Photo verification failed | Verification score < 60 |
| 400 | Liveness challenge failed | Challenge invalid/expired |
| 400 | Missing verified field | Admin verify missing field |
| 404 | Challenge not found | Challenge ID not found |
| 500 | Internal server error | Server error |

---

## Rate Limiting

Saat ini TIDAK ada rate limiting. Di production, sebaiknya tambahkan:

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## File Upload

### Multer Configuration

```javascript
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'), false);
    }
  }
});
```

### Supported Formats

- JPG/JPEG
- PNG
- GIF
- WebP

### Size Limit

- Maximum: 5MB
- Recommended: <2MB for faster upload

---

## CORS

```javascript
app.use(cors());
```

Di production, specify allowed origins:

```javascript
app.use(cors({
  origin: ['https://kulibayar.com', 'https://app.kulibayar.com']
}));
```
