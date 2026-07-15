/**
 * Periodic cleanup for old uploaded files
 * Deletes files older than 7 days to prevent disk exhaustion
 */

import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // Run daily

export function startUploadCleanup() {
  setInterval(() => {
    cleanupOldFiles();
  }, CLEANUP_INTERVAL);
  
  // Run initial cleanup on startup
  cleanupOldFiles();
}

function cleanupOldFiles() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    logger.debug('Uploads directory does not exist, skipping cleanup');
    return;
  }
  
  const now = Date.now();
  let deletedCount = 0;
  let totalSize = 0;
  
  try {
    const files = fs.readdirSync(UPLOADS_DIR);
    
    for (const file of files) {
      const filePath = path.join(UPLOADS_DIR, file);
      
      try {
        const stats = fs.statSync(filePath);
        
        if (stats.isFile() && (now - stats.mtimeMs) > MAX_AGE_MS) {
          fs.unlinkSync(filePath);
          deletedCount++;
          totalSize += stats.size;
          logger.debug(`Deleted old file: ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
        }
      } catch (error) {
        logger.error(`Error processing file ${file}:`, error.message);
      }
    }
    
    if (deletedCount > 0) {
      logger.info(`Cleanup complete: deleted ${deletedCount} files (${(totalSize / 1024 / 1024).toFixed(2)} MB)`);
    }
  } catch (error) {
    logger.error('Upload cleanup failed:', error.message);
  }
}
