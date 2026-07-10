/**
 * Photo Verification Service
 * Simple GPS + timestamp validation for MVP
 */

// Jakarta bounds (for demo)
const JAKARTA_BOUNDS = {
  lat: { min: -6.4, max: -6.1 },
  lng: { min: 106.7, max: 106.9 }
};

// Max age for photo (24 hours)
const MAX_PHOTO_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Verify photo metadata
 * @param {Object} photoData - { latitude, longitude, timestamp }
 * @returns {Object} - { valid, score, reasons }
 */
export function verifyPhoto(photoData) {
  const { latitude, longitude, timestamp } = photoData;
  const reasons = [];
  let score = 100;

  // 1. GPS coordinates check
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
  }

  // 2. Timestamp check
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

  // 3. Basic EXIF validation (simplified)
  // In real implementation, this would parse EXIF data from the image

  return {
    valid: score >= 60,
    score: Math.max(0, score),
    reasons,
    verifiedAt: new Date().toISOString()
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
