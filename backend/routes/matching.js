import { Router } from 'express';
import { matchWorkers, matchProjects } from '../services/matching.js';

const router = Router();

// Mock data for demo (in production, this comes from database/on-chain)
const MOCK_WORKERS = [
  {
    id: 1,
    address: '0x1234567489012345678901234567890123456789',
    name: 'Pak Budi',
    skills: ['batu_bata', 'plester'],
    dailyRate: 0.008,
    rating: 450,
    disputes: 1,
    location: 'Jakarta'
  },
  {
    id: 2,
    address: '0x2345678901234567890123456789012345678901',
    name: 'Pak Joko',
    skills: ['cat', 'keramik'],
    dailyRate: 0.012,
    rating: 480,
    disputes: 0,
    location: 'Jakarta'
  },
  {
    id: 3,
    address: '0x3456789012345678901234567890123456789012',
    name: 'Pak Ahmad',
    skills: ['listrik', 'plumbing'],
    dailyRate: 0.015,
    rating: 420,
    disputes: 2,
    location: 'Bekasi'
  }
];

const MOCK_PROJECTS = [
  {
    id: 1,
    name: 'Renovasi Rumah',
    dailyRate: 0.01,
    durationDays: 10,
    skills: ['batu_bata', 'plester', 'cat'],
    location: 'Jakarta',
    budget: 0.1
  },
  {
    id: 2,
    name: 'Bangun Toko',
    dailyRate: 0.012,
    durationDays: 20,
    skills: ['batu_bata', 'keramik', 'listrik'],
    location: 'Jakarta',
    budget: 0.24
  }
];

// Match workers to a project
router.post('/workers', async (req, res) => {
  try {
    const project = req.body;

    if (!project.budget || !project.durationDays) {
      return res.status(400).json({ error: 'Missing project details' });
    }

    const matches = matchWorkers(project, MOCK_WORKERS);
    res.json({ matches });
  } catch (error) {
    console.error('Error matching workers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Match projects to a worker
router.post('/projects', async (req, res) => {
  try {
    const worker = req.body;

    if (!worker.dailyRate || !worker.rating) {
      return res.status(400).json({ error: 'Missing worker details' });
    }

    const matches = matchProjects(worker, MOCK_PROJECTS);
    res.json({ matches });
  } catch (error) {
    console.error('Error matching projects:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
