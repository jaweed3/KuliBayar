import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';

import projectsRouter from './routes/projects.js';
import proofsRouter from './routes/proofs.js';
import reputationRouter from './routes/reputation.js';
import matchingRouter from './routes/matching.js';
import challengesRouter from './routes/challenges.js';
import authRouter from './routes/auth.js';
import { initContracts } from './services/blockchain.js';
import { requireWallet } from './middleware/auth.js';

config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const proofLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 proof submissions per minute
  message: { error: 'Too many proof submissions, please wait before trying again' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Wallet-Address', 'X-Wallet-Signature', 'X-Auth-Nonce', 'X-Auth-Domain'],
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Apply general rate limiter to all API routes
app.use('/api/', generalLimiter);

// Auth (no protection — these ARE the auth endpoints)
app.use('/api/auth', authRouter);

// Protected routes — require wallet address header
app.use('/api/projects', requireWallet, projectsRouter);
app.use('/api/proofs', proofLimiter, requireWallet, proofsRouter);
app.use('/api/reputation', requireWallet, reputationRouter);
app.use('/api/matching', requireWallet, matchingRouter);
app.use('/api/challenges', requireWallet, challengesRouter);

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
