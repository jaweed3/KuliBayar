import { Router } from 'express';
import multer from 'multer';
import { verifyPhoto, checkLocationMatch } from '../services/photoVerification.js';
import { verifyChallenge } from '../services/livenessChallenge.js';
import {
  submitWorkProof,
  verifyWorkProof,
  getProof,
  getProjectProofIds,
  getProofCount
} from '../services/blockchain.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

const router = Router();

// Configure multer for photo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

// Magic bytes for common image formats
const IMAGE_MAGIC_BYTES = {
  jpg: Buffer.from([0xFF, 0xD8, 0xFF]),
  png: Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
  gif: Buffer.from([0x47, 0x49, 0x46]),
  webp: Buffer.from([0x52, 0x49, 0x46, 0x46]),
  bmp: Buffer.from([0x42, 0x4D])
};

// Block SVG and other potentially dangerous formats
const BLOCKED_FORMATS = ['svg', 'svgz', 'xml'];

function validateImageMagicBytes(buffer) {
  for (const [format, magicBytes] of Object.entries(IMAGE_MAGIC_BYTES)) {
    if (buffer.length >= magicBytes.length) {
      const header = buffer.slice(0, magicBytes.length);
      if (header.equals(magicBytes)) {
        return { valid: true, format };
      }
    }
  }
  return { valid: false, format: null };
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    // First check MIME type
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images allowed'), false);
    }
    
    // Block SVG explicitly (can contain JavaScript)
    const ext = file.originalname.split('.').pop().toLowerCase();
    if (BLOCKED_FORMATS.includes(ext)) {
      return cb(new Error('SVG and XML-based image formats are not allowed'), false);
    }
    
    cb(null, true);
  }
}).single('photo');

// Wrapper to handle multer errors properly and validate magic bytes
function uploadMiddleware(req, res, next) {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    // Validate magic bytes after file is uploaded
    if (req.file) {
      const fs = require('fs');
      const buffer = fs.readFileSync(req.file.path);
      const validation = validateImageMagicBytes(buffer);
      
      if (!validation.valid) {
        // Clean up the file
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Invalid image format. File header does not match expected image types.' });
      }
    }
    
    next();
  });
}

// Submit work proof with photo
router.post('/', uploadMiddleware, async (req, res) => {
  try {
    const { projectId, latitude, longitude, accuracy, challengeId, challengeResponse } = req.body;

    if (!projectId || !req.file) {
      return res.status(400).json({ error: 'Missing projectId or photo' });
    }

    // Verify photo metadata with EXIF validation
    const verification = verifyPhoto({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      accuracy: accuracy ? parseFloat(accuracy) : null,
      timestamp: new Date().toISOString(),
      photoPath: req.file.path
    });

    // Verify liveness challenge if provided
    let challengeResult = null;
    if (challengeId) {
      challengeResult = await verifyChallenge(req.file.path, challengeId);

      if (!challengeResult.valid) {
        return res.status(400).json({
          error: 'Liveness challenge failed',
          score: challengeResult.score,
          reasons: challengeResult.reasons
        });
      }
    }

    // Location cross-validation against project site
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
        verification.reasons.push(`GPS location is outside project site: ${projectLocation.name}`);
        verification.score -= 25;
      } else {
        verification.reasons.push(`GPS location verified at project site: ${projectLocation.name}`);
        verification.score += 5;
      }
    }

    // Combine scores (EXIF: 60%, Challenge: 20%, Location: 20% if provided)
    let finalScore = verification.score;
    if (challengeResult && locationResult) {
      finalScore = Math.round(verification.score * 0.6 + challengeResult.score * 0.2 + (locationResult.valid ? 20 : 0));
    } else if (challengeResult) {
      finalScore = Math.round(verification.score * 0.7 + challengeResult.score * 0.3);
    } else if (locationResult) {
      finalScore = Math.round(verification.score * 0.8 + (locationResult.valid ? 20 : 0));
    }

    const combinedReasons = [
      ...verification.reasons,
      ...(challengeResult ? challengeResult.reasons.map(r => `[Liveness] ${r}`) : []),
      ...(locationResult ? [`[Location] ${locationResult.valid ? 'Within project site' : 'Outside project site'}`] : [])
    ];

    // Update verification result
    verification.score = finalScore;
    verification.reasons = combinedReasons;
    verification.valid = finalScore >= 60;

    if (!verification.valid) {
      return res.status(400).json({
        error: 'Photo verification failed',
        score: verification.score,
        reasons: verification.reasons
      });
    }

    // Create proof hash (simplified - in production use IPFS)
    const photoHash = `Qm${req.file.filename}`;

    // Scale GPS coordinates for blockchain (contract expects ×1e6)
    const latScaled = Math.round(parseFloat(latitude) * 1e6);
    const lngScaled = Math.round(parseFloat(longitude) * 1e6);

    // Submit to blockchain
    const proofId = await submitWorkProof(projectId, photoHash, latScaled, lngScaled);

    res.json({
      success: true,
      proofId,
      photoHash,
      verification: {
        score: verification.score,
        reasons: verification.reasons,
        exif: verification.exif,
        challenge: challengeResult ? {
          verified: challengeResult.valid,
          score: challengeResult.score
        } : null,
        location: locationResult
      }
    });
  } catch (error) {
    console.error('Error submitting proof:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify proof (admin/AI oracle)
router.post('/:id/verify', async (req, res) => {
  try {
    const { verified } = req.body;
    const { id } = req.params;

    if (verified === undefined) {
      return res.status(400).json({ error: 'Missing verified field' });
    }

    // projectId required in body (cannot infer from proof ID alone)
    if (!req.body.projectId) {
      return res.status(400).json({ error: 'Missing projectId in body' });
    }

    await verifyWorkProof(req.body.projectId, id, verified);
    res.json({ success: true });
  } catch (error) {
    console.error('Error verifying proof:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get proof count (must be before /:id to avoid route conflict)
router.get('/count', async (req, res) => {
  try {
    const count = await getProofCount();
    res.json({ count });
  } catch (error) {
    console.error('Error getting proof count:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get project proofs
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const proofIds = await getProjectProofIds(projectId);
    res.json({ proofIds });
  } catch (error) {
    console.error('Error getting project proofs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get proof details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const proof = await getProof(id);
    res.json(proof);
  } catch (error) {
    console.error('Error getting proof:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
