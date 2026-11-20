// server/src/config/env.js
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters').default('supersecretjwtkeyatleast32charslongforsecurity12345'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173,https://rangeshsha-rookie.github.io,https://rangeshsha-Rookie.github.io'),
  RAZORPAY_KEY_ID: z.string().min(1, 'RAZORPAY_KEY_ID is required'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required'),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(''),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),
  CLOUDINARY_CLOUD_NAME: z.string().default('nativerise'),
  CLOUDINARY_API_KEY: z.string().default('123456789012345'),
  CLOUDINARY_API_SECRET: z.string().default('dummy_cloudinary_secret_key_123'),
  NOMINATIM_BASE_URL: z.string().default('https://nominatim.openstreetmap.org'),
  NOMINATIM_USER_AGENT: z.string().default('NativeRise-App/1.0 (contact@nativerise.org)'),
  OSRM_BASE_URL: z.string().default('https://router.project-osrm.org'),
  DEMO_TOOLS_ENABLED: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(true),
  STRICT_GEOFENCE: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  SEED_DEMO_PASSWORD: z.string().default('Demo@1234')
});

let parsedConfig;
try {
  parsedConfig = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('CRITICAL: Missing or invalid environment variable(s):');
    error.errors.forEach((err) => {
      console.error(` - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export const config = {
  ...parsedConfig,
  clientOrigins: parsedConfig.CLIENT_ORIGIN.split(',').map((origin) => origin.trim())
};

export default config;
