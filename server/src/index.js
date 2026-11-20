// server/src/index.js
import app from './app.js';
import config from './config/env.js';
import { connectDB } from './config/db.js';
import { startJobs } from './services/jobs.js';

async function bootstrap() {
  try {
    await connectDB();
    startJobs();

    const server = app.listen(config.PORT, () => {
      console.log(`[NativeRise API] Server listening on port ${config.PORT} (${config.NODE_ENV})`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[NativeRise API] Received ${signal}, gracefully shutting down...`);
      server.close(() => {
        console.log('[NativeRise API] HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error(`[NativeRise API] Fatal bootstrap error: ${err.message}`);
    process.exit(1);
  }
}

bootstrap();
