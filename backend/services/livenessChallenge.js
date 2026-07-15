/**
 * Liveness Challenge Service
 * Generates random challenges and verifies photo contains challenge text
 */

import crypto from 'crypto';
import fs from 'fs';
import Tesseract from 'tesseract.js';

// In-memory challenge storage (in production, use Redis or database)
const challenges = new Map();

// Challenge expiry time (5 minutes)
const CHALLENGE_EXPIRY_MS = 5 * 60 * 1000;

// Challenge templates
const CHALLENGE_TEMPLATES = [
  'Tulis di kertas: {code}',
  'Pegang kertas bertuliskan: {code}',
  'Foto dengan tulisan: {code}',
  'Ambil foto sambil memegang: {code}',
  'Tunjukkan kertas dengan kode: {code}'
];

/**
 * Generate a random challenge code
 * @returns {string} - Random 8-character alphanumeric code
 */
function generateChallengeCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

/**
 * Create a new liveness challenge
 * @param {string} projectId - Project ID
 * @param {string} workerAddress - Worker's wallet address
 * @returns {Object} - { challengeId, challenge, code, expiresAt }
 */
export function createChallenge(projectId, workerAddress) {
  const code = generateChallengeCode();
  const template = CHALLENGE_TEMPLATES[Math.floor(Math.random() * CHALLENGE_TEMPLATES.length)];
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

  // Clean up expired challenges
  cleanupExpiredChallenges();

  return {
    challengeId,
    challenge: challengeText,
    code,
    expiresAt: new Date(expiresAt).toISOString()
  };
}

/**
 * Verify that a photo contains the challenge text using OCR
 * @param {string} photoPath - Path to the uploaded photo
 * @param {string} challengeId - Challenge ID
 * @returns {Object} - { valid, score, reasons, ocrText }
 */
export async function verifyChallenge(photoPath, challengeId) {
  const reasons = [];
  let score = 0;
  let ocrText = '';

  // 1. Check if challenge exists and is valid
  const challenge = challenges.get(challengeId);
  if (!challenge) {
    return {
      valid: false,
      score: 0,
      reasons: ['Challenge not found'],
      ocrText: ''
    };
  }

  if (challenge.used) {
    return {
      valid: false,
      score: 0,
      reasons: ['Challenge already used'],
      ocrText: ''
    };
  }

  if (Date.now() > challenge.expiresAt) {
    challenges.delete(challengeId);
    return {
      valid: false,
      score: 0,
      reasons: ['Challenge expired'],
      ocrText: ''
    };
  }

  // 2. Validate image size before OCR (prevent DoS)
  const stats = fs.statSync(photoPath);
  const maxSize = 10 * 1024 * 1024; // 10MB max
  if (stats.size > maxSize) {
    challenges.delete(challengeId);
    return {
      valid: false,
      score: 0,
      reasons: [`Image too large (${(stats.size / 1024 / 1024).toFixed(2)}MB). Max is 10MB.`],
      ocrText: ''
    };
  }

  // 3. Perform OCR on the photo with timeout
  try {
    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const { data: { text } } = await Tesseract.recognize(
      photoPath,
      'ind+eng',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            // Optional: log progress
          }
        },
        abortSignal: controller.signal
      }
    );

    clearTimeout(timeoutId);
    ocrText = text;

    // 3. Check if challenge code appears in OCR text
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

    // 4. Check if challenge text appears (more strict)
    const challengeWords = challenge.challengeText.split(' ').filter(w => w.length > 3);
    const wordsFound = challengeWords.filter(w => text.toLowerCase().includes(w.toLowerCase()));

    if (wordsFound.length > 0) {
      score += 20;
      reasons.push(`Challenge words found: ${wordsFound.join(', ')}`);
    }

    // 5. Bonus for clear text (multiple challenge words found)
    if (wordsFound.length >= 3) {
      score += 15;
      reasons.push('Clear challenge text detected');
    }

    // 6. Check OCR confidence (if available)
    // Note: Tesseract.js doesn't directly expose confidence in this API

  } catch (error) {
    console.error('OCR failed:', error.message);
    
    if (error.name === 'AbortError') {
      reasons.push('OCR timeout (exceeded 30 seconds)');
    } else {
      reasons.push('OCR processing failed');
    }
    
    score -= 20;
  }

  // 7. Mark challenge as used if valid enough
  if (score >= 30) {
    challenge.used = true;
  }

  const valid = score >= 30;

  return {
    valid,
    score: Math.max(0, Math.min(100, score)),
    reasons,
    ocrText
  };
}

/**
 * Get challenge info (without exposing the code)
 * @param {string} challengeId - Challenge ID
 * @returns {Object|null} - Challenge info or null
 */
export function getChallengeInfo(challengeId) {
  const challenge = challenges.get(challengeId);
  if (!challenge) return null;

  return {
    challengeId,
    projectId: challenge.projectId,
    expiresAt: new Date(challenge.expiresAt).toISOString(),
    used: challenge.used
  };
}

/**
 * Cleanup expired challenges
 */
function cleanupExpiredChallenges() {
  const now = Date.now();
  for (const [id, challenge] of challenges.entries()) {
    if (now > challenge.expiresAt) {
      challenges.delete(id);
    }
  }
}

/**
 * Get all active challenges for a worker (for debugging)
 * @param {string} workerAddress - Worker's wallet address
 * @returns {Array} - Active challenges
 */
export function getWorkerChallenges(workerAddress) {
  const workerChallenges = [];
  for (const [id, challenge] of challenges.entries()) {
    if (challenge.workerAddress === workerAddress && !challenge.used) {
      workerChallenges.push({
        challengeId: id,
        challenge: challenge.challengeText,
        expiresAt: new Date(challenge.expiresAt).toISOString()
      });
    }
  }
  return workerChallenges;
}
