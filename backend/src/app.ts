import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { env } from './config/env';
import { getDatabaseStatus } from './config/db';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { Logger } from './utils/logger';

export const app = express();

// Ensure uploads folder exists and serve statically
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Request correlation ID middleware
app.use((req, res, next) => {
  const incomingId = req.headers['x-request-id'] as string;
  const requestId = incomingId || randomUUID();
  (req as any).id = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
});

// Security Headers (CSP, HSTS in production)
app.use(
  helmet({
    contentSecurityPolicy: env.isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
            connectSrc: ["'self'", ...env.getAllowedOrigins()],
            fontSrc: ["'self'", 'https:'],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
          },
        }
      : false,
    crossOriginEmbedderPolicy: false,
    hsts: env.isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  })
);

// CORS configuration for cookies and auth headers
const allowedOrigins = env.getAllowedOrigins();
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      
      if (!env.isProduction) {
        // In dev/test, allow localhost and any configured client origin
        if (origin.includes('localhost') || origin.includes('127.0.0.1') || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, true);
      }

      // In production, strictly match configured origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        Logger.warn(`Blocked CORS request from unauthorized origin: ${origin}`);
        return callback(new Error('Blocked by CORS policy: Origin not allowed'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-Id'],
  })
);

// Body parsers & cookies (preserving rawBody for cryptographic webhook verification)
app.use(
  express.json({
    limit: '10mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString('utf8');
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(env.COOKIE_SECRET));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global API rate limiter (1000 requests per 15 minutes)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);
app.use('/api/v1', globalLimiter);

// Dedicated strict rate limiter for authentication routes (prevent brute force)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 login/register attempts per 15 minutes per IP
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(['/api/v1/auth/login', '/api/auth/login'], authRateLimiter);
app.use(['/api/v1/auth/register', '/api/auth/register'], authRateLimiter);

// Strict rate limiter for password recovery endpoints (prevent email enumeration and spam)
export const passwordResetRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 password reset requests per 15 minutes per IP
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(['/api/v1/auth/forgot-password', '/api/auth/forgot-password'], passwordResetRateLimiter);
app.use(['/api/v1/auth/reset-password', '/api/auth/reset-password'], passwordResetRateLimiter);

// Comprehensive Health check endpoint
export const healthHandler = (req: express.Request, res: express.Response) => {
  const dbStatus = getDatabaseStatus();
  const isHealthy = dbStatus.state === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: env.NODE_ENV,
    version: '1.0.0',
    service: 'FranchiseBridge Enterprise API Gateway',
    database: dbStatus,
    memory: {
      rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapTotalMb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
    endpoints: {
      v1: '/api/v1',
      legacy: '/api',
    },
  });
};

app.get('/health', healthHandler);
app.get('/api/v1/health', healthHandler);

// Mount API routes (versioned v1 and legacy compatibility alias)
app.use('/api/v1', routes);
app.use('/api', routes);

// Centralized error handler
app.use(errorHandler);
