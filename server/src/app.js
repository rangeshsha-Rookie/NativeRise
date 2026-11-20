// server/src/app.js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { nanoid } from 'nanoid';
import mongoose from 'mongoose';
import config from './config/env.js';
import { notFound, errorHandler } from './middleware/error.js';
import apiRouter from './routes/index.js';

const app = express();

// 1. Security headers
app.use(helmet());

// 2. CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (config.clientOrigins.includes('*') || config.clientOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(null, false);
    },
    credentials: false,
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept-Language', 'Idempotency-Key']
  })
);

// 3. Request ID & Logging
app.use(
  pinoHttp({
    genReqId: () => nanoid(10),
    autoLogging: config.NODE_ENV !== 'test',
    level: config.NODE_ENV === 'test' ? 'silent' : 'info'
  })
);

// 4. Raw body for Razorpay Webhook, JSON for everything else
app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/payments/webhook') {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json({ limit: '1mb' })(req, res, next);
  }
});

// 5. Language middleware
app.use((req, res, next) => {
  const acceptLang = req.headers['accept-language'] || '';
  req.lang = acceptLang.toLowerCase().startsWith('mr') ? 'mr' : 'en';
  next();
});

// Health check handler
const healthCheck = (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'down';
  res.status(200).json({
    ok: true,
    uptime: Math.round(process.uptime()),
    db: dbState,
    time: new Date().toISOString()
  });
};

app.get('/health', healthCheck);
app.get('/api/v1/health', healthCheck);

// 6. Routes under /api/v1
app.use('/api/v1', apiRouter);

// 7. 404 Not Found
app.use(notFound);

// 8. Central Error Handler
app.use(errorHandler);

export default app;
