/**
 * Photo Verification Service
 * EXIF + GPS + timestamp validation with liveness checks
 */

import exifParser from 'exif-parser';
import fs from 'fs';

// Jakarta bounds (for demo)
const JAKARTA_BOUNDS = {
  lat: { min: -6.4, max: -6.1 },
  lng: { min: 106.7, max: 106.9 }
};

// Max age for photo (24 hours)
const MAX_PHOTO_AGE_MS = 24 * 60 * 60 * 1000;

// GPS accuracy threshold (meters)
const MAX_GPS_ACCURACY_METERS = 50;

// Maximum allowed distance between EXIF GPS and submitted GPS (meters)
const MAX_GPS_DEVIATION_METERS = 100;

/**
 * Parse EXIF data from photo buffer
 * @param {Buffer} photoBuffer - Raw photo data
 * @returns {Object|null} - EXIF data or null if parsing fails
 */
function parseEXIF(photoBuffer) {
  try {
    const parser = exifParser.create(photoBuffer);
    const result = parser.parse();
    return result;
  } catch (error) {
    console.error('EXIF parsing failed:', error.message);
    return null;
  }
}

/**
 * Validate that photo has required EXIF data
 * @param {Buffer} photoBuffer - Raw photo data
 * @returns {Object} - { valid, exifData, error }
 */
function validateEXIF(photoBuffer) {
  const exifData = parseEXIF(photoBuffer);
  
  if (!exifData) {
    return {
      valid: false,
      exifData: null,
      error: 'No EXIF data found'
    };
  }
  
  // Check for required EXIF fields
  if (!exifData?.gps?.Latitude || !exifData?.gps?.Longitude) {
    return {
      valid: false,
      exifData,
      error: 'Missing GPS coordinates in EXIF'
    };
  }
  
  if (!exifData?.tags?.DateTimeOriginal) {
    return {
      valid: false,
      exifData,
      error: 'Missing timestamp in EXIF'
    };
  }
  
  return {
    valid: true,
    exifData,
    error: null
  };
}

/**
 * Extract GPS coordinates from EXIF data
 * @param {Object} exifData - Parsed EXIF data
 * @returns {Object|null} - { lat, lng } or null
 */
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

/**
 * Extract timestamp from EXIF data
 * @param {Object} exifData - Parsed EXIF data
 * @returns {Date|null} - EXIF timestamp or null
 */
function extractTimestampFromEXIF(exifData) {
  if (!exifData?.tags?.DateTimeOriginal) {
    return null;
  }

  try {
    // EXIF format: "YYYY:MM:DD HH:MM:SS"
    const dateTimeStr = exifData.tags.DateTimeOriginal;
    const [datePart, timePart] = dateTimeStr.split(' ');
    const [year, month, day] = datePart.split(':');
    const [hours, minutes, seconds] = timePart.split(':');

    return new Date(year, month - 1, day, hours, minutes, seconds);
  } catch (error) {
    console.error('EXIF timestamp parsing failed:', error.message);
    return null;
  }
}

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude 1
 * @param {number} lng1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lng2 - Longitude 2
 * @returns {number} - Distance in meters
 */
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

/**
 * Verify photo metadata with EXIF validation
 * @param {Object} photoData - { latitude, longitude, timestamp, photoPath, accuracy }
 * @returns {Object} - { valid, score, reasons, exifData }
 */
export function verifyPhoto(photoData) {
  const { latitude, longitude, timestamp, photoPath, accuracy } = photoData;
  const reasons = [];
  let score = 100;
  let exifData = null;
  let exifGPS = null;
  let exifTimestamp = null;

  // 0. Validate EXIF data is present and valid (REQUIRED for security)
  if (photoPath) {
    try {
      const photoBuffer = fs.readFileSync(photoPath);
      const exifValidation = validateEXIF(photoBuffer);
      
      if (!exifValidation.valid) {
        return {
          valid: false,
          score: 0,
          reasons: [`EXIF validation failed: ${exifValidation.error}`],
          exif: { hasEXIF: false, gps: null, timestamp: null, device: null }
        };
      }
      
      exifData = exifValidation.exifData;
      exifGPS = extractGPSFromEXIF(exifData);
      exifTimestamp = extractTimestampFromEXIF(exifData);
    } catch (error) {
      console.error('Failed to read photo for EXIF:', error.message);
      return {
        valid: false,
        score: 0,
        reasons: ['Failed to read photo file'],
        exif: { hasEXIF: false, gps: null, timestamp: null, device: null }
      };
    }
  } else {
    return {
      valid: false,
      score: 0,
      reasons: ['Photo path not provided'],
      exif: { hasEXIF: false, gps: null, timestamp: null, device: null }
    };
  }

  // 1. GPS coordinates check (submitted)
  if (!latitude || !longitude) {
    reasons.push('Missing GPS coordinates');
    score -= 50;
  } else {
    // Check if coordinates are within reasonable range (Indonesia)
    const inIndonesia = latitude >= -11 && latitude <= 6 && longitude >= 95 && longitude <= 141;
    if (!inIndonesia) {
      reasons.push('GPS coordinates outside Indonesia');
      score -= 40;
    }

    // Check if coordinates are in Jakarta area (for demo)
    const inJakarta =
      latitude >= JAKARTA_BOUNDS.lat.min &&
      latitude <= JAKARTA_BOUNDS.lat.max &&
      longitude >= JAKARTA_BOUNDS.lng.min &&
      longitude <= JAKARTA_BOUNDS.lng.max;

    if (!inJakarta) {
      reasons.push('GPS coordinates outside project area');
      score -= 20;
    }

    // 2. GPS accuracy check
    if (accuracy !== undefined && accuracy !== null) {
      if (accuracy > MAX_GPS_ACCURACY_METERS) {
        reasons.push(`GPS accuracy too low: ${accuracy.toFixed(1)}m (max: ${MAX_GPS_ACCURACY_METERS}m)`);
        score -= 15;
      }
    }

    // 3. EXIF GPS cross-validation (if EXIF GPS available)
    if (exifGPS) {
      const distance = calculateDistance(latitude, longitude, exifGPS.lat, exifGPS.lng);
      if (distance > MAX_GPS_DEVIATION_METERS) {
        reasons.push(`EXIF GPS mismatch: ${distance.toFixed(0)}m deviation from submitted GPS`);
        score -= 25;
      }
    }
  }

  // 4. Timestamp check (server-provided)
  if (!timestamp) {
    reasons.push('Missing timestamp');
    score -= 30;
  } else {
    const photoTime = new Date(timestamp).getTime();
    const now = Date.now();
    const age = now - photoTime;

    // Check if photo is from the future
    if (photoTime > now) {
      reasons.push('Photo timestamp is in the future');
      score -= 50;
    }

    // Check if photo is too old
    if (age > MAX_PHOTO_AGE_MS) {
      reasons.push('Photo is older than 24 hours');
      score -= 30;
    }

    // Check if photo is from today
    const photoDate = new Date(timestamp).toDateString();
    const today = new Date().toDateString();
    if (photoDate !== today) {
      reasons.push('Photo is not from today');
      score -= 10;
    }
  }

  // 5. EXIF timestamp validation
  if (exifTimestamp) {
    const exifTime = exifTimestamp.getTime();
    const now = Date.now();
    const exifAge = now - exifTime;

    // Check if EXIF timestamp is from the future
    if (exifTime > now) {
      reasons.push('EXIF timestamp is in the future');
      score -= 30;
    }

    // Check if EXIF timestamp is too old
    if (exifAge > MAX_PHOTO_AGE_MS) {
      reasons.push('EXIF timestamp older than 24 hours');
      score -= 20;
    }

    // Check if EXIF timestamp matches submitted timestamp (within 5 minutes)
    if (timestamp) {
      const submittedTime = new Date(timestamp).getTime();
      const timeDiff = Math.abs(exifTime - submittedTime);
      const FIVE_MINUTES_MS = 5 * 60 * 1000;

      if (timeDiff > FIVE_MINUTES_MS) {
        reasons.push(`EXIF timestamp mismatch: ${Math.round(timeDiff / 1000)}s difference`);
        score -= 15;
      }
    }
  }

  // Note: EXIF validation is now mandatory (done in step 0)
  // Removed: Basic liveness check for missing EXIF

  return {
    valid: score >= 60,
    score: Math.max(0, score),
    reasons,
    verifiedAt: new Date().toISOString(),
    exif: {
      hasEXIF: !!exifData,
      gps: exifGPS,
      timestamp: exifTimestamp?.toISOString() || null,
      device: exifData?.tags?.Model || null
    }
  };
}

/**
 * Check if GPS coordinates match project location
 * @param {number} photoLat - Photo latitude
 * @param {number} photoLng - Photo longitude
 * @param {number} projectLat - Project latitude
 * @param {number} projectLng - Project longitude
 * @param {number} radiusKm - Allowed radius in km
 * @returns {boolean}
 */
export function checkLocationMatch(photoLat, photoLng, projectLat, projectLng, radiusKm = 1) {
  // Haversine formula for distance calculation
  const R = 6371; // Earth's radius in km
  const dLat = (projectLat - photoLat) * Math.PI / 180;
  const dLng = (projectLng - photoLng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(photoLat * Math.PI / 180) * Math.cos(projectLat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= radiusKm;
}
