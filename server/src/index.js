// server/src/index.js
import app from './app.js';
import config from './config/env.js';
import { connectDB } from './config/db.js';
import { startJobs } from './services/jobs.js';

async function bootstrap() {
  // 1. Bind port immediately so Render / cloud platforms detect open port
  const server = app.listen(config.PORT, () => {
    console.log(`[NativeRise API] Server listening on port ${config.PORT} (${config.NODE_ENV})`);
  });

  // 2. Connect to MongoDB with graceful background retries
  let isJobsStarted = false;
  const tryConnect = async (retries = 30, delay = 5000) => {
    try {
      await connectDB();
      if (!isJobsStarted) {
        startJobs();
        isJobsStarted = true;
      }
      console.log('[NativeRise API] Database connected & background jobs running.');
    } catch (err) {
      console.warn(`[Database] MongoDB initial connection attempt failed: ${err.message}`);
      if (retries > 0) {
        console.log(`[Database] Retrying MongoDB connection in ${delay / 1000}s (${retries} attempts left)...`);
        setTimeout(() => tryConnect(retries - 1, delay), delay);
      } else {
        console.error('[Database] Exhausted DB reconnection attempts. Please ensure 0.0.0.0/0 is added in MongoDB Atlas Network Access.');
      }
    }
  };

  tryConnect();

  const shutdown = async (signal) => {
    console.log(`\n[NativeRise API] Received ${signal}, gracefully shutting down...`);
    server.close(() => {
      console.log('[NativeRise API] HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap();
