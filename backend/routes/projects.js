import { Router } from 'express';
import {
  createProject,
  depositFunds,
  startProject,
  getProject as getBlockchainProject,
  getBalance,
  raiseDispute,
  resolveDispute,
  cancelProject
} from '../services/blockchain.js';
import {
  getProjectsByRole,
  getMyWork,
  getProject,
  getOpenProjects,
  updateProject,
} from '../services/store.js';

const router = Router();

// Get projects by role (kontraktor/kuli)
router.get('/role/:role', async (req, res) => {
  try {
    const data = getProjectsByRole(req.params.role);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get kuli's work projects
router.get('/my-work', async (req, res) => {
  try {
    const data = getMyWork(req.walletAddress);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get open projects (Created — no kuli assigned)
router.get('/open', async (req, res) => {
  try {
    const data = getOpenProjects();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kuli applies to an open project
router.post('/:id/apply', async (req, res) => {
  try {
    const project = getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.status !== 'Created') return res.status(400).json({ error: 'Project is not open' });

    updateProject(project.id, { kuli: req.walletAddress, kuliName: req.body.name || req.walletAddress.slice(0, 8) });
    res.json({ success: true, projectId: project.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
