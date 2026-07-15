import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import { logger } from './utils/logger.js';
import { startUploadCleanup } from './utils/uploadCleanup.js';

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

// Challenge creation is expensive (OCR processing) - stricter limits
const challengeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 challenge creations per minute
  message: { error: 'Too many challenge requests, please wait before trying again' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints - stricter limits to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per 15 minutes
  message: { error: 'Too many authentication attempts, please wait before trying again' },
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
app.use('/api/auth', authLimiter, authRouter);

// Protected routes — require wallet address header
app.use('/api/projects', requireWallet, projectsRouter);
app.use('/api/proofs', proofLimiter, requireWallet, proofsRouter);
app.use('/api/reputation', requireWallet, reputationRouter);
app.use('/api/matching', requireWallet, matchingRouter);
app.use('/api/challenges', challengeLimiter, requireWallet, challengesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, async () => {
  logger.info(`🚀 KuliBayar Backend running on port ${PORT}`);
  logger.info(`📡 Health check: http://localhost:${PORT}/api/health`);
  
  // Start periodic upload cleanup
  startUploadCleanup();
  logger.info('🗑️  Upload cleanup job started (daily, deletes files > 7 days old)');

  // Initialize blockchain contracts
  try {
    initContracts();
  } catch (err) {
    logger.error('⚠️  Failed to initialize contracts:', err.message);
    logger.error('   Make sure backend/.env has correct contract addresses and Anvil is running');
  }
});
