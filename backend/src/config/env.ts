import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform(Number),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/franchisebridge'),
  JWT_SECRET: z.string().default('franchisebridge_jwt_secret_super_secure_key_change_in_prod'),
  JWT_REFRESH_SECRET: z.string().default('franchisebridge_jwt_refresh_secret_key_change_in_prod'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  COOKIE_SECRET: z.string().default('franchisebridge_cookie_signing_secret'),
  UPLOAD_DIR: z.string().default('./uploads'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
