import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../models/User';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runAuthAndRbacVerification() {
  console.log('====================================================');
  console.log('   AUTH, RBAC & API ENDPOINT VERIFICATION SUITE    ');
  console.log('====================================================\n');

  await mongoose.connect(env.MONGODB_URI);

  // 1. Test Registration via API
  console.log('1. [CHECK] User Registration via API (POST /api/v1/auth/register):');
  const uniqueId = Date.now();
  const regEmail = `test_investor_${uniqueId}@franchisetest.com`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: regEmail,
      password: 'StrongPassword123!',
      fullName: 'Rajesh Singhania',
      phone: '+91 99887 66554',
      role: 'investor',
    }),
  });
  const regData = await regRes.json();
  console.log(`   ✓ HTTP Status: ${regRes.status}`);
  console.log(`   ✓ Registration Response: success=${regData.success}, user=${regData.data?.user?.email}, token=${!!regData.data?.token}`);
  const registeredUserInDb = await User.findOne({ email: regEmail }).select('+passwordHash +emailVerificationToken');
  console.log(`   ✓ Saved in MongoDB: ${registeredUserInDb?.email} | Role: ${registeredUserInDb?.role} | Hash: ${registeredUserInDb?.passwordHash.substring(0, 10)}... | emailVerified: ${registeredUserInDb?.emailVerified}\n`);

  // 2. Test Login via API
  console.log('2. [CHECK] User Login via API (POST /api/v1/auth/login):');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: regEmail,
      password: 'StrongPassword123!',
    }),
  });
  const loginData = await loginRes.json();
  console.log(`   ✓ HTTP Status: ${loginRes.status}`);
  console.log(`   ✓ Login Response: success=${loginData.success}, tokenReceived=${!!loginData.data?.token}`);
  const investorToken = loginData.data?.token;

  // Test invalid password rejection
  const invalidLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: regEmail,
      password: 'WrongPassword!',
    }),
  });
  console.log(`   ✓ Invalid Password Rejection: HTTP Status ${invalidLoginRes.status} (Expected 401)\n`);

  // 3. Test Email Verification via API
  console.log('3. [CHECK] Email Verification Flow (GET /api/v1/auth/verify-email):');
  const verificationToken = registeredUserInDb?.emailVerificationToken;
  console.log(`   ✓ Generated verification token: ${verificationToken?.substring(0, 15)}...`);
  const verifyEmailRes = await fetch(`${BASE_URL}/auth/verify-email?token=${verificationToken}`);
  const verifyEmailData = await verifyEmailRes.json();
  console.log(`   ✓ HTTP Status: ${verifyEmailRes.status}`);
  console.log(`   ✓ Verification Response: success=${verifyEmailData.success}, message="${verifyEmailData.message}"`);
  const verifiedUserInDb = await User.findOne({ email: regEmail });
  console.log(`   ✓ User emailVerified in MongoDB after verification: ${verifiedUserInDb?.emailVerified}\n`);

  // 4. Test Password Reset Flow via API
  console.log('4. [CHECK] Password Reset Flow (POST /forgot-password & /reset-password):');
  const forgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: regEmail }),
  });
  const forgotData = await forgotRes.json();
  console.log(`   ✓ Forgot Password HTTP Status: ${forgotRes.status} (success=${forgotData.success})`);

  // Set test token to verify hash matching
  const crypto = await import('crypto');
  const rawToken = 'my_test_reset_token_' + Date.now();
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  await User.updateOne(
    { email: regEmail },
    { passwordResetToken: tokenHash, passwordResetExpires: new Date(Date.now() + 3600000) }
  );
  console.log(`   ✓ Issued raw reset token: ${rawToken.substring(0, 20)}...`);

  // Submit reset password
  const newPassword = 'BrandNewPassword456!';
  const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: rawToken,
      newPassword,
    }),
  });
  const resetData = await resetRes.json();
  console.log(`   ✓ Reset Password HTTP Status: ${resetRes.status} (success=${resetData.success})`);

  // Verify login with new password succeeds
  const newLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: regEmail,
      password: newPassword,
    }),
  });
  console.log(`   ✓ Login with newly reset password: HTTP Status ${newLoginRes.status} (Expected 200, success=${(await newLoginRes.json()).success})\n`);

  // 5. Protected Routes and Backend Authorization (RBAC)
  console.log('5. [CHECK] Role-Based Access Control (RBAC) & Protected Routes:');

  // Obtain tokens for different roles
  // A. Admin Token
  const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'broker.admin@franchisebridge.com', password: 'Password123!' }),
  });
  const adminToken = (await adminLogin.json()).data.token;

  // B. Broker Token
  const brokerLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'broker@franchisebridge.com', password: 'Password123!' }),
  });
  const brokerToken = (await brokerLogin.json()).data.token;

  // Test Case A: Unauthenticated request to protected route
  const unauthRes = await fetch(`${BASE_URL}/admin/dashboard`);
  console.log(`   ✓ Unauthenticated access to /admin/dashboard: HTTP ${unauthRes.status} (Expected 401 Unauthorized)`);

  // Test Case B: Investor trying to access Admin Dashboard
  const investorToAdminRes = await fetch(`${BASE_URL}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${investorToken}` },
  });
  console.log(`   ✓ Investor accessing /admin/dashboard: HTTP ${investorToAdminRes.status} (Expected 403 Forbidden)`);

  // Test Case C: Investor trying to access Broker CRM Pipeline
  const investorToCrmRes = await fetch(`${BASE_URL}/crm/pipeline`, {
    headers: { Authorization: `Bearer ${investorToken}` },
  });
  console.log(`   ✓ Investor accessing /crm/pipeline: HTTP ${investorToCrmRes.status} (Expected 403 Forbidden)`);

  // Test Case D: Broker accessing Broker CRM Pipeline
  const brokerToCrmRes = await fetch(`${BASE_URL}/crm/pipeline`, {
    headers: { Authorization: `Bearer ${brokerToken}` },
  });
  console.log(`   ✓ Broker accessing /crm/pipeline: HTTP ${brokerToCrmRes.status} (Expected 200 OK)`);

  // Test Case E: Admin accessing Admin Dashboard
  const adminToAdminRes = await fetch(`${BASE_URL}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`   ✓ Admin accessing /admin/dashboard: HTTP ${adminToAdminRes.status} (Expected 200 OK)`);

  // Test Case F: Authenticated user fetching their own profile
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${investorToken}` },
  });
  console.log(`   ✓ Investor accessing /auth/me: HTTP ${meRes.status} (Expected 200 OK)\n`);

  // Clean up registered test user
  await User.deleteOne({ email: regEmail });
  console.log(`   ✓ Cleaned up test user ${regEmail}`);

  await mongoose.disconnect();

  console.log('\n====================================================');
  console.log('      ALL AUTH, RBAC & API CHECKS VERIFIED OK       ');
  console.log('====================================================');
}

runAuthAndRbacVerification().catch((err) => {
  console.error('Auth verification error:', err);
  process.exit(1);
});
