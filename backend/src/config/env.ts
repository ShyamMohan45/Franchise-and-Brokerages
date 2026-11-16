import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(5000),
    MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/franchisebridge'),
    DB_MAX_POOL_SIZE: z.string().default('50').transform(Number),
    DB_MIN_POOL_SIZE: z.string().default('5').transform(Number),
    JWT_SECRET: z.string().default('franchisebridge_jwt_secret_super_secure_key_change_in_prod'),
    JWT_REFRESH_SECRET: z.string().default('franchisebridge_jwt_refresh_secret_key_change_in_prod'),
    JWT_EXPIRES_IN: z.string().default('1d'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    CLIENT_URL: z.string().default('http://localhost:3004'),
    ALLOWED_ORIGINS: z.string().optional(),
    COOKIE_SECRET: z.string().default('franchisebridge_cookie_signing_secret'),
    UPLOAD_DIR: z.string().default('./uploads'),
    
    // Cloud Object Storage config
    STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
    AWS_S3_BUCKET: z.string().optional(),
    AWS_REGION: z.string().default('ap-south-1'),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_ENDPOINT: z.string().optional(),
    ALLOW_PRESIGNED_URLS: z
      .union([z.boolean(), z.string().transform((v) => v.toLowerCase() === 'true')])
      .default(false),

    // Production SMTP config
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().default('587').transform(Number),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_SECURE: z.string().default('false').transform((val) => val === 'true'),
    FROM_EMAIL: z.string().default('notifications@franchisebridge.com'),

    // Monitoring & Logging
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  })
  .superRefine((data, ctx) => {
    if (data.STORAGE_DRIVER === 's3' && !data.AWS_S3_BUCKET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'AWS_S3_BUCKET is required when STORAGE_DRIVER is set to "s3"',
        path: ['AWS_S3_BUCKET'],
      });
    }

    if (data.NODE_ENV === 'production') {
      const defaultSecret = 'franchisebridge_jwt_secret_super_secure_key_change_in_prod';
      const defaultRefresh = 'franchisebridge_jwt_refresh_secret_key_change_in_prod';
      const defaultCookie = 'franchisebridge_cookie_signing_secret';

      if (data.JWT_SECRET === defaultSecret || data.JWT_SECRET.length < 32) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Production requires a custom JWT_SECRET of at least 32 characters',
          path: ['JWT_SECRET'],
        });
      }
      if (data.JWT_REFRESH_SECRET === defaultRefresh || data.JWT_REFRESH_SECRET.length < 32) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Production requires a custom JWT_REFRESH_SECRET of at least 32 characters',
          path: ['JWT_REFRESH_SECRET'],
        });
      }
      if (data.COOKIE_SECRET === defaultCookie || data.COOKIE_SECRET.length < 16) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Production requires a custom secure COOKIE_SECRET of at least 16 characters',
          path: ['COOKIE_SECRET'],
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === 'production',
  isDevelopment: parsed.data.NODE_ENV === 'development',
  isTest: parsed.data.NODE_ENV === 'test',
  getAllowedOrigins(): string[] {
    const list: string[] = [parsed.data.CLIENT_URL, 'http://localhost:3000', 'http://localhost:3002', 'http://localhost:3004', 'http://localhost:3005'];
    if (parsed.data.ALLOWED_ORIGINS) {
      const additional = parsed.data.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean);
      list.push(...additional);
    }
    return Array.from(new Set(list));
  },
};
