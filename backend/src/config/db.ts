import mongoose from 'mongoose';
import { env } from './env';

export interface DatabaseStatus {
  state: 'connected' | 'connecting' | 'disconnecting' | 'disconnected' | 'unknown';
  host: string | null;
  name: string | null;
  readyState: number;
}

let isInitialized = false;

export function setupDatabaseEventListeners(): void {
  if (isInitialized) return;
  isInitialized = true;

  mongoose.connection.on('connected', () => {
    console.log('[Database] MongoDB connection established successfully.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[Database] MongoDB runtime connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB disconnected. Attempting automatic reconnection...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[Database] MongoDB reconnected successfully.');
  });
}

export async function connectDB(): Promise<typeof mongoose> {
  setupDatabaseEventListeners();
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: env.DB_MAX_POOL_SIZE,
      minPoolSize: env.DB_MIN_POOL_SIZE,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      autoIndex: !env.isProduction, // Disable automatic indexing in high-load production
    });
    console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name} (pool: min=${env.DB_MIN_POOL_SIZE}, max=${env.DB_MAX_POOL_SIZE})`);
    return conn;
  } catch (error) {
    console.error('[Database] MongoDB initial connection error:', error);
    if (env.isProduction) {
      process.exit(1);
    }
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  console.log('[Database] MongoDB disconnected cleanly');
}

export function getDatabaseStatus(): DatabaseStatus {
  const stateMap: Record<number, DatabaseStatus['state']> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const readyState = mongoose.connection.readyState;
  return {
    state: stateMap[readyState] || 'unknown',
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
    readyState,
  };
}
