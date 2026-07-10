import { Router } from 'express';
import {
  createProject,
  depositFunds,
  startProject,
  getProject,
  getBalance,
  raiseDispute,
  resolveDispute,
  cancelProject
} from '../services/blockchain.js';

const router = Router();

// Create a new project
router.post('/', async (req, res) => {
  try {
    const { kuli, dailyRate, durationDays } = req.body;

    if (!kuli || !dailyRate || !durationDays) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const projectId = await createProject(kuli, dailyRate, durationDays);
    res.json({ success: true, projectId });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: error.message });
  }
});

// Deposit funds to escrow
router.post('/:id/deposit', async (req, res) => {
  try {
    const { amount } = req.body;
    const { id } = req.params;

    if (!amount) {
      return res.status(400).json({ error: 'Missing amount' });
    }

    await depositFunds(id, amount);
    res.json({ success: true });
  } catch (error) {
    console.error('Error depositing funds:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start project
router.post('/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    await startProject(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error starting project:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get contract balance (must be before /:id to avoid route conflict)
router.get('/balance', async (req, res) => {
  try {
    const balance = await getBalance();
    res.json({ balance });
  } catch (error) {
    console.error('Error getting balance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get project details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await getProject(id);
    res.json(project);
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ error: error.message });
  }
});

// Raise dispute
router.post('/:id/dispute', async (req, res) => {
  try {
    const { reason } = req.body;
    const { id } = req.params;

    if (!reason) {
      return res.status(400).json({ error: 'Missing reason' });
    }

    await raiseDispute(id, reason);
    res.json({ success: true });
  } catch (error) {
    console.error('Error raising dispute:', error);
    res.status(500).json({ error: error.message });
  }
});

// Resolve dispute
router.post('/:id/dispute/resolve', async (req, res) => {
  try {
    const { favorKuli, amount } = req.body;
    const { id } = req.params;

    if (favorKuli === undefined || !amount) {
      return res.status(400).json({ error: 'Missing favorKuli or amount' });
    }

    await resolveDispute(id, favorKuli, amount);
    res.json({ success: true });
  } catch (error) {
    console.error('Error resolving dispute:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel project
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    await cancelProject(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error cancelling project:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
