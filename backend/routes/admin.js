import { Router } from 'express';
import { requireAdmin } from '../middleware/admin.js';
import {
  getPendingProofs, getActiveDisputes, getStats,
  getProject, updateProject, updateProof, getProof,
  resolveDispute,
} from '../services/store.js';

const router = Router();

router.use(requireAdmin);

router.get('/stats', (req, res) => {
  res.json(getStats());
});

router.get('/proofs', (req, res) => {
  res.json(getPendingProofs());
});

router.post('/proofs/:id/verify', (req, res) => {
  const { verified } = req.body;
  const proof = updateProof(req.params.id, { status: verified ? 'verified' : 'rejected' });
  if (!proof) return res.status(404).json({ error: 'Proof not found' });
  if (verified) {
    const project = getProject(proof.projectId);
    if (project) {
      const newDays = (project.daysCompleted || 0) + 1;
      const released = (Number(project.dailyRate) * newDays).toFixed(3);
      updateProject(proof.projectId, { daysCompleted: newDays, totalReleased: released });
    }
  }
  res.json({ success: true, proof });
});

router.get('/disputes', (req, res) => {
  res.json(getActiveDisputes());
});

router.post('/disputes/:id/resolve', (req, res) => {
  const { favorKuli, amount } = req.body;
  const d = resolveDispute(req.params.id, favorKuli, amount);
  if (!d) return res.status(404).json({ error: 'Dispute not found' });
  res.json({ success: true, dispute: d });
});

router.post('/projects/:id/cancel', (req, res) => {
  const project = updateProject(req.params.id, { status: 'Cancelled' });
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json({ success: true, project });
});

export default router;
