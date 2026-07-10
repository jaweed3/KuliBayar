import { Router } from 'express';
import multer from 'multer';
import { verifyPhoto } from '../services/photoVerification.js';
import {
  submitWorkProof,
  verifyWorkProof,
  getProof,
  getProjectProofIds,
  getProofCount
} from '../services/blockchain.js';

const router = Router();

// Configure multer for photo upload
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

// Submit work proof with photo
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { projectId, latitude, longitude } = req.body;

    if (!projectId || !req.file) {
      return res.status(400).json({ error: 'Missing projectId or photo' });
    }

    // Verify photo metadata
    const verification = verifyPhoto({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timestamp: new Date().toISOString()
    });

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
        reasons: verification.reasons
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
    const { verified, projectId } = req.body;
    const { id } = req.params;

    if (verified === undefined) {
      return res.status(400).json({ error: 'Missing verified field' });
    }

    // Use provided projectId, or default to proof's projectId
    const pId = projectId || id;
    await verifyWorkProof(pId, id, verified);
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
