import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app';
import { env } from '../config/env';
import { FranchiseListing } from '../models/FranchiseListing';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGODB_URI);
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('FranchiseBridge Enterprise Backend API Test Suite', () => {
  let adminToken: string;
  let investorToken: string;
  let brandOwnerToken: string;
  let testListingId: string;

  it('GET /health & GET /api/v1/health should return 200 with service info and versioning', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.version).toBe('1.0.0');

    const resV1 = await request(app).get('/api/v1/health');
    expect(resV1.status).toBe(200);
    expect(resV1.body.endpoints.v1).toBe('/api/v1');
  });

  it('POST /api/v1/auth/login with admin credentials should return valid JWT and user payload', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'broker.admin@franchisebridge.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('admin');
    adminToken = res.body.data.token;
  });

  it('POST /api/v1/auth/register should register investor and return token', async () => {
    const testEmail = `investor_${Date.now()}@example.com`;
    const res = await request(app).post('/api/v1/auth/register').send({
      email: testEmail,
      password: 'Password123!',
      fullName: 'Vikram Mehta',
      phone: '+91 98888 77777',
      role: 'investor',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.token).toBeDefined();
    investorToken = res.body.data.token;
  });

  it('POST /api/v1/auth/register should register brand owner and return token', async () => {
    const testEmail = `brandowner_${Date.now()}@example.com`;
    const res = await request(app).post('/api/v1/auth/register').send({
      email: testEmail,
      password: 'Password123!',
      fullName: 'Priya Sharma',
      phone: '+91 97777 66666',
      role: 'business_owner',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    brandOwnerToken = res.body.data.token;
  });

  it('POST /api/v1/auth/forgot-password should issue reset token', async () => {
    const res = await request(app).post('/api/v1/auth/forgot-password').send({
      email: 'broker.admin@franchisebridge.com',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('RBAC Enforcement: Investor cannot access /api/v1/admin/dashboard (returns 403)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${investorToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/franchises returns published listings', async () => {
    const res = await request(app).get('/api/v1/franchises');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    if (res.body.data.length > 0) {
      testListingId = res.body.data[0]._id;
    }
  });

  it('CRM Pipeline: Admin/Broker can access /api/v1/crm/pipeline and /api/v1/crm/metrics', async () => {
    const pipelineRes = await request(app)
      .get('/api/v1/crm/pipeline')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(pipelineRes.status).toBe(200);
    expect(pipelineRes.body.success).toBe(true);
    expect(pipelineRes.body.data.columns).toBeDefined();
    expect(pipelineRes.body.data.columns.NEW_LEAD).toBeDefined();

    const metricsRes = await request(app)
      .get('/api/v1/crm/metrics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(metricsRes.status).toBe(200);
    expect(metricsRes.body.success).toBe(true);
    expect(metricsRes.body.data.totalLeads).toBeDefined();
  });

  it('Task Management: Create task, fetch tasks, and update status', async () => {
    const createRes = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Conduct FDD legal audit',
        description: 'Verify disclosure item 19 financial performance representations',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    const taskId = createRes.body.data._id;

    // Fetch tasks
    const getRes = await request(app)
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(getRes.status).toBe(200);
    expect(Array.isArray(getRes.body.data)).toBe(true);

    // Update status to completed
    const updateRes = await request(app)
      .patch(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'completed' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.status).toBe('completed');
  });

  it('Notifications: Fetch notifications and mark all as read', async () => {
    const notifRes = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(notifRes.status).toBe(200);
    expect(notifRes.body.success).toBe(true);
    expect(notifRes.body.data.unreadCount).toBeDefined();

    const markRes = await request(app)
      .post('/api/v1/notifications/read-all')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(markRes.status).toBe(200);
    expect(markRes.body.success).toBe(true);
  });

  it('Reviews: Submit a review and retrieve listing reviews', async () => {
    if (!testListingId) {
      const listing = await FranchiseListing.findOne();
      if (listing) testListingId = listing._id.toString();
    }

    if (testListingId) {
      const reviewRes = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${investorToken}`)
        .send({
          franchiseListingId: testListingId,
          rating: 5,
          title: 'Outstanding Franchise Model and Support',
          reviewText: 'Great unit economics, transparent supply chain, and top-tier support from the franchisor team.',
          isVerifiedFranchisee: true,
          storeLocation: 'Mumbai Suburban',
        });

      // Should succeed or return 409 if already submitted by this test user
      expect([201, 409]).toContain(reviewRes.status);

      const getReviewsRes = await request(app).get(`/api/v1/reviews/listing/${testListingId}`);
      expect(getReviewsRes.status).toBe(200);
      expect(getReviewsRes.body.success).toBe(true);
      expect(getReviewsRes.body.data.reviews).toBeDefined();
    }
  });
});
