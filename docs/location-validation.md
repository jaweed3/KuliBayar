# Location Validation

Validasi lokasi kuli berada di area proyek menggunakan GPS dan Haversine formula.

---

## Concept

```
┌─────────────────────────────────────────────────────────┐
│                    LOCATION VALIDATION                   │
│                                                         │
│  ┌─────────────────┐         ┌─────────────────┐      │
│  │  PROJECT SITE   │         │  SUBMITTED GPS  │      │
│  │  (Fixed)        │         │  (From worker)  │      │
│  │  -6.2615,       │         │  -6.2618,       │      │
│  │  106.8106       │         │  106.8110       │      │
│  └────────┬────────┘         └────────┬────────┘      │
│           │                           │                 │
│           └─────────┬─────────────────┘                 │
│                     │                                   │
│                     ▼                                   │
│           ┌─────────────────┐                          │
│           │   HAVERSINE     │                          │
│           │   FORMULA       │                          │
│           │   Calculate     │                          │
│           │   Distance      │                          │
│           └────────┬────────┘                          │
│                    │                                    │
│         ┌──────────┴──────────┐                        │
│         ▼                     ▼                        │
│  ┌─────────────┐       ┌─────────────┐                │
│  │  ≤ 500m     │       │  > 500m     │                │
│  │  ✅ PASS    │       │  ❌ FAIL    │                │
│  └─────────────┘       └─────────────┘                │
└─────────────────────────────────────────────────────────┘
```

---

## Project Locations

### Configuration File

**File:** `backend/data/projectLocations.json`

```json
{
  "1": {
    "name": "Proyek Jakarta Selatan",
    "latitude": -6.2615,
    "longitude": 106.8106,
    "radiusKm": 0.5
  },
  "2": {
    "name": "Proyek Jakarta Pusat",
    "latitude": -6.1751,
    "longitude": 106.8650,
    "radiusKm": 0.5
  },
  "3": {
    "name": "Proyek Jakarta Barat",
    "latitude": -6.1681,
    "longitude": 106.7589,
    "radiusKm": 0.5
  }
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| name | string | Project name |
| latitude | number | Project latitude (-90 to 90) |
| longitude | number | Project longitude (-180 to 180) |
| radiusKm | number | Allowed radius in kilometers |

---

## Haversine Formula

### What is Haversine?

Haversine formula calculates the great-circle distance between two points on a sphere given their longitudes and latitudes. It's important in navigation because it provides the shortest distance over the earth's surface.

### Implementation

**File:** `backend/services/photoVerification.js`

```javascript
/**
 * Check if GPS coordinates match project location
 * @param {number} photoLat - Photo latitude
 * @param {number} photoLng - Photo longitude
 * @param {number} projectLat - Project latitude
 * @param {number} projectLng - Project longitude
 * @param {number} radiusKm - Allowed radius in km
 * @returns {boolean}
 */
export function checkLocationMatch(
  photoLat,
  photoLng,
  projectLat,
  projectLng,
  radiusKm = 1
) {
  // Haversine formula for distance calculation
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

### Formula Breakdown

```
a = sin²(Δφ/2) + cos(φ1) ⋅ cos(φ2) ⋅ sin²(Δλ/2)
c = 2 ⋅ atan2(√a, √(1−a))
d = R ⋅ c

Where:
- φ1, φ2 = latitude of point 1 and 2 (in radians)
- λ1, λ2 = longitude of point 1 and 2 (in radians)
- Δφ = φ2 - φ1
- Δλ = λ2 - λ1
- R = Earth's radius (6,371 km)
- d = distance between the two points
```

### Example Calculation

```javascript
// Project: Jakarta Selatan (-6.2615, 106.8106)
// Worker:  (-6.2618, 106.8110)

const R = 6371;
const dLat = (-6.2618 - (-6.2615)) * Math.PI / 180; // -0.0003 * π/180
const dLng = (106.8110 - 106.8106) * Math.PI / 180; // 0.0004 * π/180

const a = Math.sin(dLat/2)² + cos(-6.2615°) * cos(-6.2618°) * sin(dLng/2)²
const c = 2 * atan2(√a, √(1-a))
const distance = R * c; // ≈ 0.05 km = 50 meters

// 50m < 500m → PASS ✅
```

---

## Integration with Proof Submission

### Backend Implementation

**File:** `backend/routes/proofs.js`

```javascript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkLocationMatch } from '../services/photoVerification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load project locations
let projectLocations = {};
try {
  const locationsPath = path.join(__dirname, '../data/projectLocations.json');
  projectLocations = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));
} catch (error) {
  console.warn('Warning: Could not load project locations:', error.message);
}

// In proof submission handler
router.post('/', upload.single('photo'), async (req, res) => {
  const { projectId, latitude, longitude } = req.body;

  // ... other validations ...

  // Location cross-validation
  let locationResult = null;
  const projectLocation = projectLocations[projectId.toString()];

  if (projectLocation && latitude && longitude) {
    const isWithinRadius = checkLocationMatch(
      parseFloat(latitude),
      parseFloat(longitude),
      projectLocation.latitude,
      projectLocation.longitude,
      projectLocation.radiusKm || 0.5
    );

    locationResult = {
      valid: isWithinRadius,
      projectSite: projectLocation.name,
      maxRadiusKm: projectLocation.radiusKm || 0.5
    };

    if (!isWithinRadius) {
      verification.reasons.push(
        `GPS location is outside project site: ${projectLocation.name}`
      );
      verification.score -= 25;
    } else {
      verification.reasons.push(
        `GPS location verified at project site: ${projectLocation.name}`
      );
      verification.score += 5;
    }
  }

  // ... rest of submission ...
});
```

---

## Radius Configuration

### Recommended Radius by Project Type

| Project Type | Radius | Reason |
|--------------|--------|--------|
| Construction site | 500m | Large area, workers spread out |
| Office building | 200m | Smaller, more precise location |
| Road project | 1km | Linear, workers at different points |
| Bridge project | 500m | Focused area |
| Renovation | 200m | Indoor, precise location |

### How to Set Radius

**Option 1: Global Default**
```javascript
const DEFAULT_RADIUS_KM = 0.5; // 500 meters
```

**Option 2: Per-Project**
```json
{
  "1": {
    "name": "Large Construction Site",
    "latitude": -6.2615,
    "longitude": 106.8106,
    "radiusKm": 1.0
  }
}
```

**Option 3: Dynamic (Future)**
```javascript
// Could be calculated based on project area
const radiusKm = calculateProjectRadius(projectBoundaries);
```

---

## Score Impact

| Location Check | Score | Notes |
|----------------|-------|-------|
| Within radius | +5 | Verified at project site |
| Outside radius | -25 | Not at project site |
| No project location | 0 | Skip check |

---

## Error Messages

### Location Outside Project Site

```json
{
  "error": "Photo verification failed",
  "score": 45,
  "reasons": [
    "GPS location is outside project site: Proyek Jakarta Selatan"
  ]
}
```

### Location Verified

```json
{
  "success": true,
  "verification": {
    "score": 85,
    "reasons": [
      "GPS location verified at project site: Proyek Jakarta Selatan"
    ],
    "location": {
      "valid": true,
      "projectSite": "Proyek Jakarta Selatan",
      "maxRadiusKm": 0.5
    }
  }
}
```

---

## Testing

### Test Cases

**Test 1: Within Radius**
```javascript
const project = { lat: -6.2615, lng: 106.8106 };
const worker = { lat: -6.2618, lng: 106.8110 };
const distance = calculateDistance(worker.lat, worker.lng, project.lat, project.lng);
// distance ≈ 50m → PASS
```

**Test 2: Outside Radius**
```javascript
const project = { lat: -6.2615, lng: 106.8106 };
const worker = { lat: -6.1751, lng: 106.8650 }; // Jakarta Pusat
const distance = calculateDistance(worker.lat, worker.lng, project.lat, project.lng);
// distance ≈ 10km → FAIL
```

**Test 3: Edge Case**
```javascript
const project = { lat: -6.2615, lng: 106.8106 };
const worker = { lat: -6.2660, lng: 106.8106 }; // 500m south
const distance = calculateDistance(worker.lat, worker.lng, project.lat, project.lng);
// distance ≈ 500m → PASS (exactly at boundary)
```

---

## Future Improvements

### 1. Project Boundaries (Polygon)

Instead of radius, define project boundaries as polygon:

```json
{
  "1": {
    "name": "Construction Site",
    "boundaries": [
      [-6.2615, 106.8106],
      [-6.2620, 106.8110],
      [-6.2618, 106.8115],
      [-6.2612, 106.8108]
    ]
  }
}
```

### 2. Time-Based Location

Different locations for different times:

```json
{
  "1": {
    "name": "Construction Site",
    "locations": [
      {
        "time": "08:00-12:00",
        "lat": -6.2615,
        "lng": 106.8106,
        "radiusKm": 0.5
      },
      {
        "time": "13:00-17:00",
        "lat": -6.2620,
        "lng": 106.8110,
        "radiusKm": 0.3
      }
    ]
  }
}
```

### 3. Indoor Positioning

For indoor projects, use WiFi/Bluetooth positioning:

```javascript
// Future: Use indoor positioning API
const indoorLocation = await getIndoorPosition();
if (indoorLocation.accuracy < 10) {
  // Use indoor location
}
```

---

## API Response

### Success Response

```json
{
  "success": true,
  "location": {
    "valid": true,
    "projectSite": "Proyek Jakarta Selatan",
    "maxRadiusKm": 0.5,
    "distance": 0.05
  }
}
```

### Failure Response

```json
{
  "error": "Photo verification failed",
  "score": 45,
  "reasons": [
    "GPS location is outside project site: Proyek Jakarta Selatan"
  ],
  "location": {
    "valid": false,
    "projectSite": "Proyek Jakarta Selatan",
    "maxRadiusKm": 0.5,
    "distance": 10.2
  }
}
```
