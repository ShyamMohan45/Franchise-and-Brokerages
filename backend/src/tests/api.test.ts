import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app';
import { env } from '../config/env';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGODB_URI);
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('FranchiseBridge Backend API Test Suite', () => {
  it('GET /health should return 200 with service info', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toContain('FranchiseBridge');
  });

  it('GET /api/franchises should return published listings', async () => {
    const res = await request(app).get('/api/franchises');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/businesses/my without token should return 401', async () => {
    const res = await request(app).get('/api/businesses/my');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login with valid admin credentials should return token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'broker.admin@franchisebridge.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('admin');

    const adminToken = res.body.data.token;

    // Verify admin access to admin dashboard metrics
    const metricsRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(metricsRes.status).toBe(200);
    expect(metricsRes.body.success).toBe(true);
    expect(metricsRes.body.data.totalUsers).toBeGreaterThan(0);
  });

  it('POST /api/auth/register should create a new user account', async () => {
    const testEmail = `testuser_${Date.now()}@example.com`;
    const res = await request(app).post('/api/auth/register').send({
      email: testEmail,
      password: 'Password123!',
      fullName: 'Test Developer',
      phone: '+91 99999 88888',
      role: 'investor',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.token).toBeDefined();
  });
});
