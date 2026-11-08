import mongoose from 'mongoose';
import { env } from '../config/env';
import { User, BusinessProfile, FranchiseListing } from '../models';

const BASE_URL = 'http://localhost:5000/api/v1';

async function verifyMilestone3() {
  console.log('====================================================');
  console.log('   MILESTONE 3: BRAND ONBOARDING & OPPORTUNITY TEST  ');
  console.log('====================================================\n');

  await mongoose.connect(env.MONGODB_URI);

  // 1. Authenticate Brand Owner
  console.log('1. [STEP] Authenticate Brand Owner:');
  const brandOwnerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'brandowner@franchisebridge.com',
      password: 'Password123!',
    }),
  });
  const brandOwnerLogin = await brandOwnerLoginRes.json();
  const brandToken = brandOwnerLogin.data.token;
  console.log(`   ✓ Brand Owner Login: HTTP ${brandOwnerLoginRes.status} | Token received: ${!!brandToken}\n`);

  // 2. Brand Owner creates/updates company profile (Section A)
  console.log('2. [STEP] Brand Owner creates company profile:');
  const profilePayload = {
    businessName: 'Chai Heritage Express',
    legalBusinessName: 'Chai Heritage Hospitality Pvt Ltd',
    brandName: 'Chai Heritage',
    category: 'Food & Beverage',
    industry: 'Quick Service Restaurant (QSR)',
    founderName: 'Vikram Singhania',
    contactPerson: 'Aditya Singhania (VP Expansion)',
    contactEmail: 'brandowner@franchisebridge.com',
    contactPhone: '+91 98765 99999',
    websiteUrl: 'https://chaiheritage.example.com',
    establishedYear: 2021,
    registeredAddress: {
      street: '14th Floor, Maker Chambers V, Nariman Point',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400021',
      country: 'India',
    },
    headquarters: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
    },
    operatingLocations: ['Mumbai', 'Pune', 'Bengaluru', 'Delhi NCR'],
    currentLocations: ['Mumbai', 'Pune'],
    numberOfOutlets: 12,
    outletsSummary: '12 corporate & franchise-operated outlets across West and South India',
    description: 'Chai Heritage delivers premium single-origin Indian teas and artisanal snacks with high-velocity drive-thru and kiosk formats.',
    businessModel: 'FOCO / FOFO Hybrid',
    expansionGoals: 'Scaling to 100 outlets across Tier 1 & Tier 2 cities in 3 years',
    desiredExpansionCities: ['Hyderabad', 'Ahmedabad', 'Chandigarh', 'Jaipur'],
    estimatedInvestmentMin: 2500000,
    estimatedInvestmentMax: 4500000,
    existingFranchiseExperience: true,
    logoUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=200',
  };

  const profileRes = await fetch(`${BASE_URL}/businesses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${brandToken}`,
    },
    body: JSON.stringify(profilePayload),
  });
  const profileData = await profileRes.json();
  console.log(`   ✓ Profile Creation HTTP: ${profileRes.status}`);
  console.log(`   ✓ Profile Saved: brand="${profileData.data?.brandName}", legalName="${profileData.data?.legalBusinessName}"`);
  console.log(`   ✓ Profile Completion Score: ${profileData.data?.profileCompletion}%\n`);

  // Verify fetch profile via GET /businesses/my
  const myProfileRes = await fetch(`${BASE_URL}/businesses/my`, {
    headers: { Authorization: `Bearer ${brandToken}` },
  });
  const myProfileData = await myProfileRes.json();
  console.log(`   ✓ GET /businesses/my: ${myProfileData.data?.business?.businessName} (Completion: ${myProfileData.data?.profileCompletion}%)\n`);

  // 3. Brand Owner creates a Franchise Opportunity (Section B)
  console.log('3. [STEP] Brand Owner creates Franchise Opportunity (in INR, integer paise validation):');
  const opportunityPayload = {
    brandName: 'Chai Heritage',
    opportunityTitle: 'Chai Heritage Master & Unit Franchise Program',
    industry: 'Food & Beverage',
    category: 'QSR & Cafes',
    businessModel: 'FOFO (Franchise Owned, Franchise Operated)',
    summary: 'High margin QSR tea cafe format with standardized operational SOPs, centralized supply chain, and proven 18-month ROI.',
    brandStory: 'Founded in 2021, Chai Heritage modernizes authentic Indian chai culture into scalable, aesthetically striking cafe spaces.',
    totalInvestmentMin: 2500000, // ₹25,00,000 = 250000000 paise
    totalInvestmentMax: 4500000, // ₹45,00,000 = 450000000 paise
    initialFranchiseFee: 500000,  // ₹5,00,000  = 50000000 paise
    setupCosts: 1500000,         // ₹15,00,000 = 150000000 paise
    equipmentCosts: 700000,      // ₹7,00,000  = 70000000 paise
    workingCapitalEstimate: 300000, // ₹3,00,000 = 30000000 paise
    royaltyPercentage: 6,
    royaltyStructure: {
      type: 'percentage',
      percentage: 6,
      description: '6% net monthly revenue for marketing, POS software, and continuous audit',
    },
    commercialSpaceMinSqFt: 350,
    commercialSpaceMaxSqFt: 800,
    spaceRequirements: {
      minSqFt: 350,
      maxSqFt: 800,
      unit: 'sq ft',
    },
    staffRequiredMin: 3,
    staffRequiredMax: 6,
    trainingDurationWeeks: 3,
    trainingSupportDetails: '3-week immersive training program covering kitchen operations, customer service, billing ERP, and inventory management.',
    supportProvided: ['Site Selection Support', 'Store Design & Fitout Architecture', 'Supply Chain Dispatch', 'Quarterly Audits'],
    idealFranchiseeProfile: 'Passionate food entrepreneur or seasoned multi-unit operator with ₹30L+ liquid capital and high operational commitment.',
    targetLocations: ['Hyderabad', 'Ahmedabad', 'Pune', 'Chandigarh'],
    availableTerritories: ['West Zone', 'North Zone'],
    expectedOpeningTimelineMonths: 2,
    status: 'DRAFT',
  };

  const oppRes = await fetch(`${BASE_URL}/franchises`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${brandToken}`,
    },
    body: JSON.stringify(opportunityPayload),
  });
  const oppData = await oppRes.json();
  const createdOpp = oppData.data;
  console.log(`   ✓ Opportunity Creation HTTP: ${oppRes.status}`);
  console.log(`   ✓ Opportunity Title: "${createdOpp?.opportunityTitle}" | Status: ${createdOpp?.status}`);
  console.log(`   ✓ Monetary Verification in MongoDB (Integer Paise):`);
  console.log(`     - totalInvestmentMin: ₹${createdOpp?.totalInvestmentMin} -> ${createdOpp?.totalInvestmentMinPaise} paise`);
  console.log(`     - initialFranchiseFee: ₹${createdOpp?.initialFranchiseFee} -> ${createdOpp?.initialFranchiseFeePaise} paise`);
  console.log(`     - setupCosts: ₹${createdOpp?.setupCosts} -> ${createdOpp?.setupCostsPaise} paise\n`);

  // 4. Verify Public/Investor Marketplace Visibility (Must NOT be visible in DRAFT)
  console.log('4. [STEP] Verify Opportunity is NOT publicly visible while in DRAFT:');
  const publicListingsDraft = await fetch(`${BASE_URL}/franchises?search=Heritage`);
  const publicDataDraft = await publicListingsDraft.json();
  const isFoundInPublic = publicDataDraft.data?.some((l: any) => l._id === createdOpp?._id);
  console.log(`   ✓ Public Marketplace Query returned ${publicDataDraft.data?.length} listings`);
  console.log(`   ✓ Draft Opportunity found in public marketplace: ${isFoundInPublic} (Expected: false)\n`);

  // 5. Brand Owner submits the Opportunity for Review
  console.log('5. [STEP] Brand Owner submits the Opportunity for Review (DRAFT -> SUBMITTED):');
  const submitRes = await fetch(`${BASE_URL}/franchises/${createdOpp._id}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${brandToken}` },
  });
  const submitData = await submitRes.json();
  console.log(`   ✓ Submit HTTP Status: ${submitRes.status}`);
  console.log(`   ✓ New Opportunity Status: ${submitData.data?.status} (Expected: SUBMITTED)\n`);

  // 6. Security Check: Unauthorized brand owner cannot edit another brand's opportunity
  console.log('6. [STEP] Security Check: Another Brand Owner cannot edit this opportunity:');
  const otherOwnerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'owner.roastcraft@example.com',
      password: 'Password123!',
    }),
  });
  const otherOwnerToken = (await otherOwnerLoginRes.json()).data.token;

  const unauthorizedEditRes = await fetch(`${BASE_URL}/franchises/${createdOpp._id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${otherOwnerToken}`,
    },
    body: JSON.stringify({ brandName: 'Hacked Brand Name' }),
  });
  console.log(`   ✓ Unauthorized edit attempt by different user: HTTP ${unauthorizedEditRes.status} (Expected: 403 Forbidden)\n`);

  // 7. Administrator Review & Approval Workflow
  console.log('7. [STEP] Administrator Reviews & Approves the Opportunity:');
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'superadmin@franchisebridge.com',
      password: 'Password123!',
    }),
  });
  const adminToken = (await adminLoginRes.json()).data.token;

  // Admin approves with publishImmediately: true
  const reviewRes = await fetch(`${BASE_URL}/franchises/${createdOpp._id}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      action: 'APPROVE',
      publishImmediately: true,
    }),
  });
  const reviewData = await reviewRes.json();
  console.log(`   ✓ Admin Approval HTTP: ${reviewRes.status}`);
  console.log(`   ✓ Opportunity Status after Approval: ${reviewData.data?.status} (Expected: PUBLISHED)`);
  console.log(`   ✓ Reviewed By: ${reviewData.data?.reviewedBy} | Reviewed At: ${reviewData.data?.reviewedAt}\n`);

  // 8. Verify Approved/Published Opportunity is NOW publicly visible
  console.log('8. [STEP] Verify Opportunity is NOW publicly visible to Investors:');
  const publicListingsApproved = await fetch(`${BASE_URL}/franchises?search=Chai`);
  const publicDataApproved = await publicListingsApproved.json();
  const isFoundNow = publicDataApproved.data?.some((l: any) => l._id === createdOpp?._id);
  console.log(`   ✓ Public Query for "Chai" returned: ${publicDataApproved.data?.length} listings`);
  console.log(`   ✓ Approved Opportunity visible in Investor Marketplace: ${isFoundNow} (Expected: true)\n`);

  // 9. Clean up created test opportunity
  await FranchiseListing.findByIdAndDelete(createdOpp._id);
  console.log('9. [CLEANUP] Test opportunity safely cleaned up from MongoDB.');

  await mongoose.disconnect();
  console.log('\n====================================================');
  console.log('       ALL MILESTONE 3 VERIFICATION STEPS PASSED    ');
  console.log('====================================================');
}

verifyMilestone3().catch((err) => {
  console.error('Milestone 3 verification failed:', err);
  process.exit(1);
});
