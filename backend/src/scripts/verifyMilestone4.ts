import mongoose from 'mongoose';
import { env } from '../config/env';
import { User, InvestorProfile, FranchiseListing, FranchiseApplication, BusinessProfile } from '../models';

const BASE_URL = 'http://localhost:5000/api/v1';

async function verifyMilestone4() {
  console.log('========================================================================');
  console.log('   MILESTONE 4: INVESTOR ONBOARDING & FRANCHISE MARKETPLACE VERIFICATION');
  console.log('========================================================================\n');

  await mongoose.connect(env.MONGODB_URI);

  let passedTests = 0;
  const totalTests = 12;

  // Ensure test users exist
  const investorEmail = 'investor@franchisebridge.com';
  const brokerEmail = 'broker@franchisebridge.com';
  const brandOwnerEmail = 'brandowner@franchisebridge.com';
  const password = 'Password123!';

  // Helper to ensure user exists
  async function ensureUser(email: string, role: string, fullName: string) {
    let u = await User.findOne({ email });
    if (!u) {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, phone: '+91 98765 43210', role }),
      });
      const data = await res.json();
      return data.data?.token;
    } else {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      return data.data?.token;
    }
  }

  console.log('Preparing test actors (Investor, Broker, Brand Owner)...');
  const investorToken = await ensureUser(investorEmail, 'investor', 'Rajesh K. Investor');
  const brokerToken = await ensureUser(brokerEmail, 'broker', 'Alok Verma (Senior Broker)');
  const brandToken = await ensureUser(brandOwnerEmail, 'brand_owner', 'Sunil Mittal (Brand Owner)');
  console.log('✓ Actors authenticated successfully.\n');

  const brandOwnerUserObj = await User.findOne({ email: brandOwnerEmail });
  let business = await BusinessProfile.findOne({ user: brandOwnerUserObj!._id });
  if (!business) {
    business = await BusinessProfile.create({
      user: brandOwnerUserObj!._id,
      businessName: 'Nirvana Hospitality Pvt Ltd',
      legalBusinessName: 'Nirvana Hospitality Pvt Ltd',
      brandName: 'Café Nirvana QSR',
      slug: 'nirvana-hospitality-test',
      category: 'Food & Beverage',
      founderName: 'Sunil Mittal',
      contactEmail: brandOwnerEmail,
      contactPhone: '+91 98765 43210',
      establishedYear: 2020,
      headquarters: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      operatingLocations: ['Mumbai', 'Pune', 'Bengaluru'],
      status: 'published',
    });
  }

  // Ensure an active published franchise listing and an unpublished listing
  let publishedFranchise = await FranchiseListing.findOne({
    slug: 'cafe-nirvana-qsr-test',
  });

  if (!publishedFranchise) {
    publishedFranchise = await FranchiseListing.create({
      business: business._id,
      ownerUser: brandOwnerUserObj!._id,
      brandName: 'Café Nirvana QSR',
      legalBusinessName: 'Nirvana Foods Pvt Ltd',
      slug: 'cafe-nirvana-qsr-test',
      opportunityTitle: 'Premium Express Coffee & Bakery Franchise Opportunity',
      tagline: 'Artisanal coffee and bakery kiosk',
      summary: 'Proven unit economics with rapid 18-month payback and turnkey operational supply chain.',
      brandStory: 'Started in 2020, Café Nirvana is a rapid scaling specialty coffee and bakery brand across metropolitan tech hubs.',
      industry: 'Food & Beverage',
      category: 'Food & Beverage',
      businessModel: 'FOFO',
      franchiseModelType: 'multi_unit',
      totalInvestmentMin: 3000000,
      totalInvestmentMax: 6000000,
      initialFranchiseFee: 500000,
      royaltyPercentage: 6,
      marketingFeePercentage: 2,
      estimatedRoiMonths: 18,
      commercialSpaceMinSqFt: 400,
      commercialSpaceMaxSqFt: 800,
      spaceRequiredMin: 400,
      spaceRequiredMax: 800,
      idealFranchiseeProfile: 'Passionate hospitality entrepreneur with capital and local territory focus.',
      status: 'published',
      publishedAt: new Date(),
      expansionLocations: ['Mumbai', 'Pune', 'Bengaluru'],
      targetLocations: ['Mumbai', 'Pune'],
      availableTerritories: ['Maharashtra', 'Karnataka'],
    });
  } else {
    publishedFranchise.status = 'published';
    publishedFranchise.publishedAt = new Date();
    await publishedFranchise.save();
  }

  // Ensure an unpublished draft listing exists to verify filter isolation
  const draftSlug = 'secret-draft-brand-unpub';
  await FranchiseListing.deleteOne({ slug: draftSlug });
  const draftFranchise = await FranchiseListing.create({
    business: business._id,
    ownerUser: brandOwnerUserObj!._id,
    brandName: 'Top Secret Unapproved Brand',
    legalBusinessName: 'Stealth Entity LLC',
    slug: draftSlug,
    opportunityTitle: 'Unapproved Internal Prototype Franchise',
    tagline: 'Top secret proprietary prototype',
    summary: 'Internal prototype draft only.',
    brandStory: 'Confidential stealth internal project.',
    industry: 'Technology',
    category: 'Technology',
    businessModel: 'FOFO',
    franchiseModelType: 'single_unit',
    totalInvestmentMin: 10000000,
    totalInvestmentMax: 20000000,
    initialFranchiseFee: 1500000,
    royaltyPercentage: 8,
    marketingFeePercentage: 2,
    estimatedRoiMonths: 24,
    commercialSpaceMinSqFt: 500,
    commercialSpaceMaxSqFt: 1000,
    idealFranchiseeProfile: 'Internal test only',
    status: 'draft',
    expansionLocations: ['Delhi NCR'],
  });

  // Clean previous test application / enquiry for clean test runs
  const investorUserObj = await User.findOne({ email: investorEmail });
  if (investorUserObj) {
    await FranchiseApplication.deleteMany({ investorUser: investorUserObj._id });
  }

  // ------------------------------------------------------------------------
  // TEST 1: Create investor profile & verify profile completion percentage
  // ------------------------------------------------------------------------
  console.log('1. [TEST] Create investor profile & verify completion percentage calculation:');
  const prof1Res = await fetch(`${BASE_URL}/investors/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${investorToken}`,
    },
    body: JSON.stringify({
      fullName: 'Rajesh K. Investor',
      phone: '+91 98765 43210',
      email: investorEmail,
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      investmentBudgetMin: 2500000,
      investmentBudgetMax: 7500000,
      liquidCapital: 5000000,
      preferredIndustries: ['Food & Beverage', 'Retail'],
      preferredLocations: ['Mumbai', 'Pune'],
      preferredStates: ['Maharashtra'],
      preferredCities: ['Mumbai', 'Pune'],
      preferredBusinessModel: 'FOFO',
      operationPreference: 'manager_operated',
      investmentExperience: 'Owner of two commercial grocery franchises in Thane.',
      investmentTimeline: '1_to_3_months',
      additionalRequirements: 'High-visibility corner location with dedicated franchisor support.',
    }),
  });
  const prof1Data = await prof1Res.json();
  const completion = prof1Data.data?.profileCompletion;
  console.log(`   Response status: ${prof1Res.status}`);
  console.log(`   Profile completion score: ${completion}%`);
  if (prof1Res.status === 200 && completion >= 80 && prof1Data.data?.investmentBudgetMinPaise === 250000000) {
    console.log('   ✓ Test 1 Passed: Investor profile created with integer paise and completion calculated.\n');
    passedTests++;
  } else {
    console.error('   ✗ Test 1 Failed:', prof1Data);
  }

  // ------------------------------------------------------------------------
  // TEST 2: Update investor profile & verify validation rules (min budget <= max budget)
  // ------------------------------------------------------------------------
  console.log('2. [TEST] Investor profile validation (budgetMin <= budgetMax):');
  const invalidProfRes = await fetch(`${BASE_URL}/investors/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${investorToken}`,
    },
    body: JSON.stringify({
      investmentBudgetMin: 9000000,
      investmentBudgetMax: 4000000, // Invalid: min > max
    }),
  });
  const invalidData = await invalidProfRes.json();
  console.log(`   Invalid update status: ${invalidProfRes.status} (Expected 400)`);
  if (invalidProfRes.status === 400) {
    console.log('   ✓ Test 2 Passed: Validation rejected min budget greater than max budget.\n');
    passedTests++;
  } else {
    console.error('   ✗ Test 2 Failed: Validation permitted min > max budget:', invalidData);
  }

  // ------------------------------------------------------------------------
  // TEST 3: Retrieve investor profile & verify all fields match
  // ------------------------------------------------------------------------
  console.log('3. [TEST] Retrieve investor profile and verify fields match:');
  const getProfRes = await fetch(`${BASE_URL}/investors/profile`, {
    headers: { Authorization: `Bearer ${investorToken}` },
  });
  const getProfData = await getProfRes.json();
  const p = getProfData.data;
  const fieldsMatch =
    p.city === 'Mumbai' &&
    p.state === 'Maharashtra' &&
    p.investmentBudgetMin === 2500000 &&
    p.investmentBudgetMax === 7500000 &&
    p.preferredBusinessModel === 'FOFO' &&
    p.operationPreference === 'manager_operated';
  if (getProfRes.status === 200 && fieldsMatch) {
    console.log(`   ✓ Test 3 Passed: Profile retrieved accurately for ${p.fullName} (${p.city}, ${p.state}).\n`);
    passedTests++;
  } else {
    console.error('   ✗ Test 3 Failed to match fields:', getProfData);
  }

  // ------------------------------------------------------------------------
  // TEST 4: Search marketplace with text, industry, budget, location, and model filters
  // ------------------------------------------------------------------------
  console.log('4. [TEST] Marketplace search with multiple filters:');
  const searchQuery = new URLSearchParams({
    search: 'Nirvana',
    industry: 'Food & Beverage',
    budgetMin: '2000000',
    budgetMax: '8000000',
    location: 'Mumbai',
    modelType: 'FOFO',
  });
  const searchRes = await fetch(`${BASE_URL}/franchises?${searchQuery.toString()}`);
  const searchData = await searchRes.json();
  const searchHits = searchData.data || [];
  const foundListing = searchHits.some((f: any) => f._id === publishedFranchise!._id.toString() || f.slug === publishedFranchise!.slug);
  console.log(`   Search matched ${searchHits.length} opportunities. Found published listing: ${foundListing}`);
  if (searchRes.status === 200 && foundListing) {
    console.log('   ✓ Test 4 Passed: Multi-criteria marketplace filter succeeded.\n');
    passedTests++;
  } else {
    console.error('   ✗ Test 4 Failed:', searchData);
  }

  // ------------------------------------------------------------------------
  // TEST 5: Verify unpublished opportunities do NOT appear in marketplace search
  // ------------------------------------------------------------------------
  console.log('5. [TEST] Verify unpublished draft opportunities do NOT appear:');
  const allMarketplaceRes = await fetch(`${BASE_URL}/franchises?search=Secret`);
  const allMarketplaceData = await allMarketplaceRes.json();
  const unpubVisible = (allMarketplaceData.data || []).some(
    (f: any) => f.slug === draftSlug || f.brandName === 'Top Secret Unapproved Brand'
  );
  if (!unpubVisible) {
    console.log('   ✓ Test 5 Passed: Unpublished/draft opportunities strictly excluded from marketplace.\n');
    passedTests++;
  } else {
    console.error('   ✗ Test 5 Failed: Draft opportunity leaked in search results!');
  }

  // ------------------------------------------------------------------------
  // TEST 6: Retrieve franchise detail page by slug
  // ------------------------------------------------------------------------
  console.log('6. [TEST] Retrieve franchise detail page by slug:');
  const detailRes = await fetch(`${BASE_URL}/franchises/${publishedFranchise.slug}`);
  const detailData = await detailRes.json();
  const fDetail = detailData.data?.listing || detailData.data;
  const detailValid =
    fDetail &&
    fDetail.brandName === publishedFranchise.brandName &&
    fDetail.totalInvestmentMin === publishedFranchise.totalInvestmentMin &&
    fDetail.royaltyPercentage === publishedFranchise.royaltyPercentage;
  if (detailRes.status === 200 && detailValid) {
    console.log(`   ✓ Test 6 Passed: Listing detail retrieved for slug "${publishedFranchise.slug}".\n`);
    passedTests++;
  } else {
    console.error('   ✗ Test 6 Failed:', detailData);
  }

  // ------------------------------------------------------------------------
  // TEST 7: Save a franchise to investor favorites
  // ------------------------------------------------------------------------
  console.log('7. [TEST] Save franchise to investor favorites:');
  const saveRes = await fetch(`${BASE_URL}/franchises/${publishedFranchise._id}/save`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${investorToken}` },
  });
  const saveData = await saveRes.json();
  const getSavedRes = await fetch(`${BASE_URL}/franchises/saved`, {
    headers: { Authorization: `Bearer ${investorToken}` },
  });
  const getSavedData = await getSavedRes.json();
  const isSavedInList = (getSavedData.data || []).some(
    (item: any) => (item.franchise?._id || item.franchise) === publishedFranchise!._id.toString()
  );
  if (saveRes.status === 200 && isSavedInList) {
    console.log('   ✓ Test 7 Passed: Franchise saved and appears in investor saved list.\n');
    passedTests++;
  } else {
    console.error('   ✗ Test 7 Failed:', saveData, getSavedData);
  }

  // ------------------------------------------------------------------------
  // TEST 8: Remove franchise from favorites
  // ------------------------------------------------------------------------
  console.log('8. [TEST] Remove franchise from favorites (toggle):');
  const unsaveRes = await fetch(`${BASE_URL}/franchises/${publishedFranchise._id}/save`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${investorToken}` },
  });
  const getSavedRes2 = await fetch(`${BASE_URL}/franchises/saved`, {
    headers: { Authorization: `Bearer ${investorToken}` },
  });
  const getSavedData2 = await getSavedRes2.json();
  const stillInList = (getSavedData2.data || []).some(
    (item: any) => (item.franchise?._id || item.franchise) === publishedFranchise!._id.toString()
  );
  if (unsaveRes.status === 200 && !stillInList) {
    console.log('   ✓ Test 8 Passed: Franchise removed from saved list successfully.\n');
    passedTests++;
  } else {
    console.error('   ✗ Test 8 Failed: Item still in saved list:', getSavedData2);
  }

  // ------------------------------------------------------------------------
  // TEST 9: Submit an investor enquiry
  // ------------------------------------------------------------------------
  console.log('9. [TEST] Submit investor enquiry:');
  const initialEnquiryCount = publishedFranchise.inquiriesCount || 0;
  const enquiryRes = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${investorToken}`,
    },
    body: JSON.stringify({
      franchiseId: publishedFranchise._id,
      unitsInterested: 2,
      proposedLocationCity: 'Pune',
      proposedLocationState: 'Maharashtra',
      investmentBudget: 5000000,
      availableLiquidCapital: 4000000,
      timeline: '1_to_3_months',
      businessBackgroundSummary: 'Experienced multi-unit retail and F&B operator with successful track record.',
      businessPlanSummary: 'Opening flagship multi-unit store on FC Road, Pune with turnkey setup.',
      privacyConsentGiven: true,
    }),
  });
  const enquiryData = await enquiryRes.json();
  const appObj = enquiryData.data;
  const refNum = appObj?.referenceNumber;
  const refPattern = /^ENQ-\d{8}-[A-Z0-9]{4}$/;
  const isRefValid = refPattern.test(refNum || '');

  // Verify duplicate submission prevention
  const dupEnquiryRes = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${investorToken}`,
    },
    body: JSON.stringify({
      franchiseId: publishedFranchise._id,
      unitsInterested: 1,
      proposedLocationCity: 'Pune',
      investmentBudget: 5000000,
      availableLiquidCapital: 4000000,
      timeline: '1_to_3_months',
      businessBackgroundSummary: 'Experienced operator',
      privacyConsentGiven: true,
    }),
  });
  const isDupBlocked = dupEnquiryRes.status === 409 || dupEnquiryRes.status === 400;

  // Verify counter increment
  const updatedFranchise = await FranchiseListing.findById(publishedFranchise._id);
  const counterIncremented =
    (updatedFranchise?.inquiriesCount || updatedFranchise?.enquiriesCount || 0) > initialEnquiryCount;

  console.log(`   Generated reference number: ${refNum} (Valid format: ${isRefValid})`);
  console.log(`   Initial status: ${appObj?.status}`);
  console.log(`   Duplicate submission blocked: ${isDupBlocked} (HTTP ${dupEnquiryRes.status})`);
  console.log(`   Franchise enquiry counter incremented: ${counterIncremented}`);

  if (enquiryRes.status === 201 && isRefValid && appObj?.status === 'NEW' && isDupBlocked && counterIncremented) {
    console.log('   ✓ Test 9 Passed: Investor enquiry created with ref number, status NEW, duplicates blocked, counter updated.\n');
    passedTests++;
  } else {
    console.error('   ✗ Test 9 Failed:', enquiryData);
  }

  const applicationId = appObj?._id;

  // ------------------------------------------------------------------------
  // TEST 10: Retrieve investor enquiries as investor. Verify internal notes NOT present
  // ------------------------------------------------------------------------
  console.log('10. [TEST] Investor enquiry retrieval security (internal notes NOT exposed):');
  // First, directly seed an internal note to the DB to verify sanitization
  await FranchiseApplication.findByIdAndUpdate(applicationId, {
    internalNotes: 'TOP SECRET BROKER NOTE: Investor has ₹1.5Cr undisclosed liquidity; credit rating A+.',
  });

  const investorGetRes = await fetch(`${BASE_URL}/applications/my`, {
    headers: { Authorization: `Bearer ${investorToken}` },
  });
  const investorGetData = await investorGetRes.json();
  const myEnquiry = (investorGetData.data || []).find((e: any) => e._id === applicationId);
  const internalNotesExposed = myEnquiry && myEnquiry.internalNotes !== undefined;

  const singleGetRes = await fetch(`${BASE_URL}/applications/${applicationId}`, {
    headers: { Authorization: `Bearer ${investorToken}` },
  });
  const singleGetData = await singleGetRes.json();
  const singleInternalExposed = singleGetData.data?.internalNotes !== undefined;

  if (!internalNotesExposed && !singleInternalExposed) {
    console.log('   ✓ Test 10 Passed: Internal notes strictly sanitized and hidden from investor view.\n');
    passedTests++;
  } else {
    console.error('   ✗ Test 10 Failed: CRITICAL SECURITY LEAK! Internal notes exposed to investor:', myEnquiry);
  }

  // ------------------------------------------------------------------------
  // TEST 11: As broker/admin, retrieve enquiries. Verify internal notes ARE visible
  // ------------------------------------------------------------------------
  console.log('11. [TEST] Broker retrieval: internal notes ARE visible to authorized desk:');
  const brokerGetRes = await fetch(`${BASE_URL}/applications/broker?search=${refNum}`, {
    headers: { Authorization: `Bearer ${brokerToken}` },
  });
  const brokerGetData = await brokerGetRes.json();
  const brokerEnquiry = (brokerGetData.data || []).find((e: any) => e._id === applicationId);
  const brokerHasNote = brokerEnquiry && typeof brokerEnquiry.internalNotes === 'string' && brokerEnquiry.internalNotes.length > 0;

  if (brokerGetRes.status === 200 && brokerHasNote) {
    console.log(`   ✓ Test 11 Passed: Broker successfully views internal notes ("${brokerEnquiry.internalNotes.slice(0, 30)}...").\n`);
    passedTests++;
  } else {
    console.error('   ✗ Test 11 Failed: Broker could not view internal notes:', brokerGetData);
  }

  // ------------------------------------------------------------------------
  // TEST 12: Update enquiry status through progression & broker assignment
  // ------------------------------------------------------------------------
  console.log('12. [TEST] Update enquiry status lifecycle and broker assignment:');
  const brokerUserObj = await User.findOne({ email: brokerEmail });

  // Step 12a: Assign to broker -> status changes to ASSIGNED
  const assignRes = await fetch(`${BASE_URL}/applications/${applicationId}/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${brokerToken}`,
    },
    body: JSON.stringify({ brokerId: brokerUserObj!._id }),
  });
  const assignData = await assignRes.json();
  const isAssigned = assignData.data?.status === 'ASSIGNED';
  console.log(`   12a. Broker assignment: status is ${assignData.data?.status} (Expected ASSIGNED): ${isAssigned}`);

  // Step 12b: Transition through statuses: CONTACTED -> QUALIFIED -> IN_PROGRESS -> CONVERTED -> CLOSED
  const statusesToTest = ['CONTACTED', 'QUALIFIED', 'IN_PROGRESS', 'CONVERTED', 'CLOSED'];
  let statusCyclePassed = true;
  for (const st of statusesToTest) {
    const patchRes = await fetch(`${BASE_URL}/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brokerToken}`,
      },
      body: JSON.stringify({
        status: st,
        note: `Transitioned stage to ${st}`,
        internalNotes: `Broker audit log for stage ${st}: verification complete.`,
      }),
    });
    const patchData = await patchRes.json();
    if (patchData.data?.status !== st) {
      statusCyclePassed = false;
      console.error(`   Failed transition to ${st}:`, patchData);
      break;
    }
  }
  console.log(`   12b. Full status progression lifecycle (CONTACTED -> CLOSED): ${statusCyclePassed}`);

  // Step 12c: Verify investor sees updated status (CLOSED) but NOT internal notes
  const finalInvestorRes = await fetch(`${BASE_URL}/applications/${applicationId}`, {
    headers: { Authorization: `Bearer ${investorToken}` },
  });
  const finalInvestorData = await finalInvestorRes.json();
  const investorSeesClosed = finalInvestorData.data?.status === 'CLOSED';
  const investorStillNoNotes = finalInvestorData.data?.internalNotes === undefined;
  console.log(`   12c. Investor sees status CLOSED: ${investorSeesClosed} | Notes hidden: ${investorStillNoNotes}`);

  if (isAssigned && statusCyclePassed && investorSeesClosed && investorStillNoNotes) {
    console.log('   ✓ Test 12 Passed: Complete status lifecycle, broker assignment & security isolation verified.\n');
    passedTests++;
  } else {
    console.error('   ✗ Test 12 Failed in lifecycle verification.');
  }

  // ------------------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------------------
  console.log('========================================================================');
  console.log(`   MILESTONE 4 TEST VERIFICATION RESULTS: ${passedTests} / ${totalTests} PASSED`);
  console.log('========================================================================\n');

  await mongoose.disconnect();

  if (passedTests === totalTests) {
    console.log('🎉 ALL 12 MANDATORY MILESTONE 4 VERIFICATION TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error(`❌ Verification failed with ${totalTests - passedTests} failing test(s).`);
    process.exit(1);
  }
}

verifyMilestone4().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
