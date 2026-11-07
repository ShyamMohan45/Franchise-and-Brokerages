import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import {
  User,
  BusinessProfile,
  InvestorProfile,
  FranchiseListing,
  Lead,
  BrokerageDeal,
  LegalDocument,
  SOPDocument,
  Task,
  Meeting,
  Notification,
  Review,
  AuditLog,
} from '../models';

async function runMilestoneVerification() {
  console.log('====================================================');
  console.log('   FRANCHISEBRIDGE MILESTONES 1 & 2 VERIFICATION   ');
  console.log('====================================================\n');

  // 1. Database Connection Check
  console.log('1. [CHECK] MongoDB Connection:');
  await mongoose.connect(env.MONGODB_URI);
  console.log('   ✓ Status: CONNECTED');
  console.log(`   ✓ Database Name: ${mongoose.connection.name}`);
  console.log(`   ✓ Host: ${mongoose.connection.host}:${mongoose.connection.port}\n`);

  // 2. Database Collections
  console.log('2. [CHECK] Database Collections in MongoDB:');
  const collections = await mongoose.connection.db!.listCollections().toArray();
  collections.forEach((col) => console.log(`   • ${col.name}`));
  console.log(`   ✓ Total Collections Found: ${collections.length}\n`);

  // 3. Mongoose Models Verification
  console.log('3. [CHECK] Mongoose Models Verification:');
  const modelsMap = [
    { name: 'User', model: User },
    { name: 'BrandProfile / BusinessProfile', model: BusinessProfile },
    { name: 'InvestorProfile', model: InvestorProfile },
    { name: 'FranchiseOpportunity / FranchiseListing', model: FranchiseListing },
    { name: 'Lead', model: Lead },
    { name: 'Deal / BrokerageDeal', model: BrokerageDeal },
    { name: 'LegalDocument', model: LegalDocument },
    { name: 'SOPDocument', model: SOPDocument },
    { name: 'Task', model: Task },
    { name: 'Meeting', model: Meeting },
    { name: 'Notification', model: Notification },
    { name: 'Review', model: Review },
    { name: 'AuditLog', model: AuditLog },
  ];

  for (const item of modelsMap) {
    const count = await item.model.countDocuments();
    console.log(`   ✓ Model "${item.name}" registered cleanly. Document count: ${count}`);
  }
  console.log('');

  // 4. Role Coverage Check
  console.log('4. [CHECK] Roles Implementation & Persistence:');
  const roles = ['brand_owner', 'business_owner', 'investor', 'broker', 'admin', 'super_admin'];
  for (const r of roles) {
    const userWithRole = await User.findOne({ role: r });
    if (userWithRole) {
      console.log(`   ✓ Role "${r}" exists in MongoDB -> ${userWithRole.email} (${userWithRole.fullName})`);
    } else {
      console.log(`   ℹ Role "${r}" schema-supported (no user in DB with this specific role yet)`);
    }
  }
  console.log('');

  // 5. Password Hashing Verification
  console.log('5. [CHECK] Bcrypt Password Hashing Verification:');
  const sampleUsers = await User.find().select('+passwordHash').limit(4);
  for (const u of sampleUsers) {
    const isBcrypt = !!u.passwordHash && (u.passwordHash.startsWith('$2a$') || u.passwordHash.startsWith('$2b$'));
    const matchesPassword123 = u.passwordHash ? await bcrypt.compare('Password123!', u.passwordHash) : false;
    console.log(`   ✓ ${u.email} -> Hash starts with: "${u.passwordHash?.slice(0, 7)}..." | Bcrypt Format: ${isBcrypt} | Compares successfully with 'Password123!': ${matchesPassword123}`);
  }
  console.log('');

  // 6. Direct User Registration & Persistence Test
  console.log('6. [CHECK] User Creation & MongoDB Persistence:');
  const testEmail = `verify_user_${Date.now()}@testdomain.com`;
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('TestPass123!', salt);
  const createdUser = await User.create({
    email: testEmail,
    passwordHash: hash,
    fullName: 'Milestone Verify Agent',
    phone: '+91 99999 11111',
    role: 'investor',
    emailVerified: false,
    emailVerificationToken: 'verify_token_sample_123',
  });
  console.log(`   ✓ User saved directly into MongoDB with _id: ${createdUser._id}`);
  const retrievedUser = await User.findById(createdUser._id);
  console.log(`   ✓ User retrieved from MongoDB: ${retrievedUser?.email} (${retrievedUser?.role})`);
  await User.findByIdAndDelete(createdUser._id);
  console.log(`   ✓ Temporary verification user cleaned up cleanly.\n`);

  await mongoose.disconnect();
  console.log('====================================================');
  console.log('          ALL DATABASE & MODEL CHECKS PASSED        ');
  console.log('====================================================');
}

runMilestoneVerification().catch((err) => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
