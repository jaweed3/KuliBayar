import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';

import projectsRouter from './routes/projects.js';
import proofsRouter from './routes/proofs.js';
import reputationRouter from './routes/reputation.js';
import matchingRouter from './routes/matching.js';
import { initContracts } from './services/blockchain.js';

config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/projects', projectsRouter);
app.use('/api/proofs', proofsRouter);
app.use('/api/reputation', reputationRouter);
app.use('/api/matching', matchingRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 KuliBayar Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);

  // Initialize blockchain contracts
  try {
    initContracts();
  } catch (err) {
    console.error('⚠️  Failed to initialize contracts:', err.message);
    console.error('   Make sure backend/.env has correct contract addresses and Anvil is running');
  }
});
