import { app } from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

async function startServer() {
  try {
    await connectDB();
    const server = app.listen(env.PORT, () => {
      console.log(`===============================================`);
      console.log(` FranchiseBridge Backend API Server Running    `);
      console.log(` Environment : ${env.NODE_ENV}`);
      console.log(` Port        : ${env.PORT}`);
      console.log(` Health URL  : http://localhost:${env.PORT}/health`);
      console.log(` API Base    : http://localhost:${env.PORT}/api`);
      console.log(`===============================================`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  }
}

startServer();
