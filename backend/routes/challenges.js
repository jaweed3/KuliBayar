import { Router } from 'express';
import { createChallenge, verifyChallenge, getChallengeInfo, getWorkerChallenges } from '../services/livenessChallenge.js';

const router = Router();

// Create a new liveness challenge
router.post('/create', async (req, res) => {
  try {
    const { projectId, workerAddress } = req.body;

    if (!projectId || !workerAddress) {
      return res.status(400).json({ error: 'Missing projectId or workerAddress' });
    }

    const challenge = createChallenge(projectId, workerAddress);
    res.json({ success: true, ...challenge });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify challenge from photo
router.post('/verify', async (req, res) => {
  try {
    const { challengeId, photoPath } = req.body;

    if (!challengeId || !photoPath) {
      return res.status(400).json({ error: 'Missing challengeId or photoPath' });
    }

    const result = await verifyChallenge(photoPath, challengeId);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error verifying challenge:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get challenge info
router.get('/:challengeId', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const info = getChallengeInfo(challengeId);

    if (!info) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    res.json({ success: true, ...info });
  } catch (error) {
    console.error('Error getting challenge:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get worker's active challenges
router.get('/worker/:workerAddress', async (req, res) => {
  try {
    const { workerAddress } = req.params;
    const challenges = getWorkerChallenges(workerAddress);
    res.json({ success: true, challenges });
  } catch (error) {
    console.error('Error getting worker challenges:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
