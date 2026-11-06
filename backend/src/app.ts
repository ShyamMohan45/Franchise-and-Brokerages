import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration for cookies and auth headers
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost and frontend URL
      if (!origin || origin.includes('localhost') || origin === env.CLIENT_URL) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev/staging
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body parsers & cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(env.COOKIE_SECRET));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global API rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '1.0.0',
    service: 'FranchiseBridge API Gateway',
  });
});

// Mount API routes
app.use('/api', routes);

// Centralized error handler
app.use(errorHandler);
