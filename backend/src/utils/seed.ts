import mongoose from 'mongoose';
import { env } from '../config/env';
import { hashPassword } from './password';
import { User } from '../models/User';
import { BusinessProfile } from '../models/BusinessProfile';
import { InvestorProfile } from '../models/InvestorProfile';
import { FranchiseListing } from '../models/FranchiseListing';
import { FranchiseApplication } from '../models/FranchiseApplication';
import { FranchiseReadinessAssessment } from '../models/FranchiseReadinessAssessment';
import { SOPDocument } from '../models/SOPDocument';
import { LegalDocument } from '../models/LegalDocument';
import { DocumentVersion } from '../models/DocumentVersion';
import { Lead } from '../models/Lead';
import { BrokerageDeal } from '../models/BrokerageDeal';
import { Meeting } from '../models/Meeting';
import { Notification } from '../models/Notification';
import { ContactEnquiry } from '../models/ContactEnquiry';
import { BlogPost } from '../models/BlogPost';
import { PlatformSettings } from '../models/PlatformSettings';
import { AuditLog } from '../models/AuditLog';

export async function runSeed() {
  console.log('[Seed] Connecting to MongoDB...');
  await mongoose.connect(env.MONGODB_URI);
  console.log('[Seed] Connected.');

  console.log('[Seed] Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    BusinessProfile.deleteMany({}),
    InvestorProfile.deleteMany({}),
    FranchiseListing.deleteMany({}),
    FranchiseApplication.deleteMany({}),
    FranchiseReadinessAssessment.deleteMany({}),
    SOPDocument.deleteMany({}),
    LegalDocument.deleteMany({}),
    DocumentVersion.deleteMany({}),
    Lead.deleteMany({}),
    BrokerageDeal.deleteMany({}),
    Meeting.deleteMany({}),
    Notification.deleteMany({}),
    ContactEnquiry.deleteMany({}),
    BlogPost.deleteMany({}),
    PlatformSettings.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  const defaultPasswordHash = await hashPassword('Password123!');

  // 1. Create Admins
  const superAdmin = await User.create({
    email: 'superadmin@franchisebridge.com',
    passwordHash: defaultPasswordHash,
    fullName: 'David Sterling',
    phone: '+91 98765 00001',
    role: 'super_admin',
    status: 'active',
    emailVerified: true,
  });

  const brokerAdmin = await User.create({
    email: 'broker.admin@franchisebridge.com',
    passwordHash: defaultPasswordHash,
    fullName: 'Sarah Jenkins',
    phone: '+91 98765 00002',
    role: 'admin',
    status: 'active',
    emailVerified: true,
  });

  // 2. Create Business Owners
  const owner1 = await User.create({
    email: 'owner.roastcraft@example.com',
    passwordHash: defaultPasswordHash,
    fullName: 'Rahul Sharma',
    phone: '+91 98765 11111',
    role: 'business_owner',
    status: 'active',
    emailVerified: true,
  });

  const owner2 = await User.create({
    email: 'owner.fitpulse@example.com',
    passwordHash: defaultPasswordHash,
    fullName: 'Ananya Mehta',
    phone: '+91 98765 22222',
    role: 'business_owner',
    status: 'active',
    emailVerified: true,
  });

  const owner3 = await User.create({
    email: 'owner.curryleaf@example.com',
    passwordHash: defaultPasswordHash,
    fullName: 'Vikramaditya Nair',
    phone: '+91 98765 33333',
    role: 'business_owner',
    status: 'active',
    emailVerified: true,
  });

  const owner4 = await User.create({
    email: 'owner.codebloom@example.com',
    passwordHash: defaultPasswordHash,
    fullName: 'Dr. Tanvi Roy',
    phone: '+91 98765 66666',
    role: 'business_owner',
    status: 'active',
    emailVerified: true,
  });

  const owner5 = await User.create({
    email: 'owner.auraluxe@example.com',
    passwordHash: defaultPasswordHash,
    fullName: 'Rohan Mehra',
    phone: '+91 98765 77777',
    role: 'business_owner',
    status: 'active',
    emailVerified: true,
  });

  // 3. Create Investors
  const investor1 = await User.create({
    email: 'investor.arun@example.com',
    passwordHash: defaultPasswordHash,
    fullName: 'Arun Kulkarni',
    phone: '+91 98765 44444',
    role: 'investor',
    status: 'active',
    emailVerified: true,
  });

  const investor2 = await User.create({
    email: 'investor.priya@example.com',
    passwordHash: defaultPasswordHash,
    fullName: 'Priya Sundaram',
    phone: '+91 98765 55555',
    role: 'investor',
    status: 'active',
    emailVerified: true,
  });

  // 4. Create Business Profiles
  const business1 = await BusinessProfile.create({
    user: owner1._id,
    businessName: 'RoastCraft Specialty Coffee',
    slug: 'roastcraft-specialty-coffee',
    category: 'Food & Beverage',
    founderName: 'Rahul Sharma',
    contactEmail: 'contact@roastcraft.in',
    contactPhone: '+91 98765 11111',
    websiteUrl: 'https://roastcraft.example.com',
    establishedYear: 2019,
    headquarters: { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
    currentLocations: ['Indiranagar', 'Koramangala', 'Whitefield', 'Jayanagar'],
    numberOfOutlets: 4,
    description:
      'Artisan single-origin specialty coffee roastery and café chain known for bespoke brewing methods, farm-to-cup traceability, and high customer retention.',
    businessModel: 'Direct-to-consumer premium café lounge with high-margin retail bean packaging and bakery items.',
    expansionGoals: 'Expand into tier-1 metropolitan hubs including Mumbai, Delhi NCR, and Hyderabad via area development partnerships.',
    desiredExpansionCities: ['Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune'],
    estimatedInvestmentMin: 3500000,
    estimatedInvestmentMax: 5500000,
    existingFranchiseExperience: true,
    annualRevenueRange: '₹3 Cr - ₹5 Cr',
    logoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1600&auto=format&fit=crop&q=80'],
    approvalStatus: 'approved',
    readinessScore: 88,
  });

  const business2 = await BusinessProfile.create({
    user: owner2._id,
    businessName: 'FitPulse 24/7 Smart Gyms',
    slug: 'fitpulse-24-7-smart-gyms',
    category: 'Health & Wellness',
    founderName: 'Ananya Mehta',
    contactEmail: 'partner@fitpulse.in',
    contactPhone: '+91 98765 22222',
    websiteUrl: 'https://fitpulse.example.com',
    establishedYear: 2021,
    headquarters: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    currentLocations: ['Bandra West', 'Andheri East', 'Powai'],
    numberOfOutlets: 3,
    description:
      'App-enabled, automated 24/7 fitness hubs with keyless RFID access, biometric turnstiles, and certified personal trainers on demand.',
    businessModel: 'High recurring monthly and annual subscription memberships with ultra-low staff overhead and IoT equipment tracking.',
    expansionGoals: 'Targeting residential clusters across suburban Mumbai, Pune, and Bengaluru.',
    desiredExpansionCities: ['Bengaluru', 'Pune', 'Ahmedabad'],
    estimatedInvestmentMin: 6000000,
    estimatedInvestmentMax: 9000000,
    existingFranchiseExperience: false,
    annualRevenueRange: '₹2.5 Cr - ₹4 Cr',
    logoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&auto=format&fit=crop&q=80'],
    approvalStatus: 'approved',
    readinessScore: 82,
  });

  const business3 = await BusinessProfile.create({
    user: owner3._id,
    businessName: 'Curry Leaf Express',
    slug: 'curry-leaf-express',
    category: 'Fast Casual Dining',
    founderName: 'Vikramaditya Nair',
    contactEmail: 'franchise@curryleafexpress.in',
    contactPhone: '+91 98765 33333',
    websiteUrl: 'https://curryleaf.example.com',
    establishedYear: 2020,
    headquarters: { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
    currentLocations: ['T. Nagar', 'Adyar', 'Velachery', 'Anna Nagar', 'OMR'],
    numberOfOutlets: 5,
    description:
      'Express coastal South Indian comfort food serving quick meal boxes, authentic dosas, and filter coffee with high delivery volume.',
    businessModel: 'Compact footprint quick-service restaurant (QSR) optimized for both dining and high-density aggregator delivery.',
    expansionGoals: 'National expansion targeting transit hubs, tech parks, and commercial corridors.',
    desiredExpansionCities: ['Bengaluru', 'Hyderabad', 'Kochi', 'Coimbatore'],
    estimatedInvestmentMin: 2500000,
    estimatedInvestmentMax: 4000000,
    existingFranchiseExperience: true,
    annualRevenueRange: '₹4 Cr - ₹7 Cr',
    logoUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=200&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1600&auto=format&fit=crop&q=80'],
    approvalStatus: 'approved',
    readinessScore: 91,
  });

  const business4 = await BusinessProfile.create({
    user: owner4._id,
    businessName: 'CodeBloom AI & Robotics Labs',
    slug: 'codebloom-ai-robotics-labs',
    category: 'Education & EdTech',
    founderName: 'Dr. Tanvi Roy',
    contactEmail: 'franchise@codebloomlabs.com',
    contactPhone: '+91 98765 66666',
    websiteUrl: 'https://codebloomlabs.example.com',
    establishedYear: 2022,
    headquarters: { city: 'Hyderabad', state: 'Telangana', country: 'India' },
    currentLocations: ['HITEC City', 'Gachibowli', 'Jubilee Hills'],
    numberOfOutlets: 3,
    description:
      'Interactive STEAM learning academies empowering K-12 students with AI, Python, robotics kits, and patent-pending gamified curriculum.',
    businessModel: 'B2C after-school academies paired with weekend cohort subscriptions and B2B school curriculum licensing.',
    expansionGoals: 'Expansion into premier residential corridors and educational hubs across South & Western India.',
    desiredExpansionCities: ['Bengaluru', 'Pune', 'Chennai', 'Mumbai'],
    estimatedInvestmentMin: 2000000,
    estimatedInvestmentMax: 3500000,
    existingFranchiseExperience: true,
    annualRevenueRange: '₹1.8 Cr - ₹3 Cr',
    logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&auto=format&fit=crop&q=80'],
    approvalStatus: 'approved',
    readinessScore: 89,
  });

  const business5 = await BusinessProfile.create({
    user: owner5._id,
    businessName: 'Aura Luxe MedSpa & Wellness',
    slug: 'aura-luxe-medspa-wellness',
    category: 'Health & Beauty',
    founderName: 'Rohan Mehra',
    contactEmail: 'expansion@auraluxemedspa.com',
    contactPhone: '+91 98765 77777',
    websiteUrl: 'https://auraluxemedspa.example.com',
    establishedYear: 2021,
    headquarters: { city: 'New Delhi', state: 'Delhi NCR', country: 'India' },
    currentLocations: ['Vasant Vihar', 'Greater Kailash', 'Cyber Hub Gurgaon'],
    numberOfOutlets: 3,
    description:
      'Ultra-luxury medical aesthetics and non-invasive anti-aging clinics featuring FDA-approved laser technologies and licensed practitioners.',
    businessModel: 'High average order value aesthetic treatments and luxury medical skincare product subscriptions.',
    expansionGoals: 'Targeting upscale commercial and retail high-streets in metros.',
    desiredExpansionCities: ['Mumbai', 'Bengaluru', 'Chandigarh', 'Kolkata'],
    estimatedInvestmentMin: 7500000,
    estimatedInvestmentMax: 12000000,
    existingFranchiseExperience: true,
    annualRevenueRange: '₹6 Cr - ₹10 Cr',
    logoUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=1600&auto=format&fit=crop&q=80'],
    approvalStatus: 'approved',
    readinessScore: 94,
  });

  // 5. Create Investor Profiles
  const invProfile1 = await InvestorProfile.create({
    user: investor1._id,
    fullName: 'Arun Kulkarni',
    phone: '+91 98765 44444',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    investorType: 'individual',
    investmentBudgetMin: 3000000,
    investmentBudgetMax: 8000000,
    preferredLocations: ['Bengaluru', 'Hyderabad', 'Pune'],
    preferredIndustries: ['Food & Beverage', 'Fast Casual Dining'],
    businessExperienceYears: 12,
    pastFranchiseExperience: true,
    interestType: 'multi_unit',
    proposedOutlets: 3,
    investmentTimeline: '1_to_3_months',
    liquidCapital: 6000000,
    netWorthRange: '₹15 Cr+',
    currentOccupation: 'Managing Director, Retail Ventures',
    isVerified: true,
  });

  const invProfile2 = await InvestorProfile.create({
    user: investor2._id,
    fullName: 'Priya Sundaram',
    phone: '+91 98765 55555',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    investorType: 'syndicate',
    investmentBudgetMin: 5000000,
    investmentBudgetMax: 12000000,
    preferredLocations: ['Mumbai', 'Pune', 'Bengaluru'],
    preferredIndustries: ['Health & Wellness', 'Education & EdTech'],
    businessExperienceYears: 8,
    pastFranchiseExperience: false,
    interestType: 'multi_unit',
    proposedOutlets: 2,
    investmentTimeline: 'immediate',
    liquidCapital: 10000000,
    netWorthRange: '₹20 Cr+',
    currentOccupation: 'Partner, Wellness Growth Capital',
    isVerified: true,
  });

  // Link profiles to users
  owner1.businessProfile = business1._id as any;
  await owner1.save();
  owner2.businessProfile = business2._id as any;
  await owner2.save();
  owner3.businessProfile = business3._id as any;
  await owner3.save();
  owner4.businessProfile = business4._id as any;
  await owner4.save();
  owner5.businessProfile = business5._id as any;
  await owner5.save();

  investor1.investorProfile = invProfile1._id as any;
  await investor1.save();
  investor2.investorProfile = invProfile2._id as any;
  await investor2.save();

  // 6. Create Franchise Listings
  const listing1 = await FranchiseListing.create({
    business: business1._id,
    ownerUser: owner1._id,
    brandName: 'RoastCraft Specialty Coffee',
    slug: 'roastcraft-specialty-coffee',
    tagline: 'Artisan Micro-Roastery & Premium Café Experience',
    industry: 'Food & Beverage',
    subCategory: 'Specialty Coffee & Bakery',
    summary:
      'High-margin specialty coffee franchise with standardized beans, precision espresso workflows, and comprehensive barista training.',
    brandStory:
      'Founded in 2019 in Bengaluru, RoastCraft disrupted traditional cafes by bringing direct-trade estate beans and micro-roasting directly to discerning urban professionals.',
    logoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1600&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80',
    ],
    franchiseModelType: 'both',
    totalInvestmentMin: 3500000,
    totalInvestmentMax: 5500000,
    initialFranchiseFee: 800000,
    royaltyPercentage: 6,
    marketingFeePercentage: 2,
    estimatedRoiMonths: 18,
    commercialSpaceMinSqFt: 800,
    commercialSpaceMaxSqFt: 1600,
    staffRequiredMin: 4,
    staffRequiredMax: 8,
    trainingDurationWeeks: 3,
    supportProvided: [
      'Site Selection & Architectural Layout Plans',
      'Proprietary Espresso Machines & Grinder Supply',
      'Exclusive Estate Coffee Supply Chain',
      'Head Barista & Service Staff Recruitment & Certification',
      'Cloud POS, Inventory ERP, & CRM Integration',
    ],
    idealFranchiseeProfile:
      'Hospitality passionate entrepreneur or multi-unit investor with prior commercial real-estate access and customer service excellence.',
    expansionLocations: ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune'],
    status: 'published',
    isFeatured: true,
    viewsCount: 1420,
    enquiriesCount: 38,
    publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    approvedBy: brokerAdmin._id,
  });

  const listing2 = await FranchiseListing.create({
    business: business2._id,
    ownerUser: owner2._id,
    brandName: 'FitPulse 24/7 Smart Gyms',
    slug: 'fitpulse-24-7-smart-gyms',
    tagline: 'Tech-Driven 24/7 Smart Neighborhood Fitness Hubs',
    industry: 'Health & Wellness',
    subCategory: 'Fitness & Gymnasiums',
    summary:
      'Turnkey automated fitness center model powered by mobile app access, commercial biomechanical equipment, and lean operating costs.',
    brandStory:
      'FitPulse pioneered contactless 24-hour gym memberships in Mumbai, capturing working professionals with flexibility, immaculate cleanliness, and tech-enabled fitness tracking.',
    logoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
    ],
    franchiseModelType: 'multi_unit',
    totalInvestmentMin: 6000000,
    totalInvestmentMax: 9000000,
    initialFranchiseFee: 1200000,
    royaltyPercentage: 7,
    marketingFeePercentage: 2,
    estimatedRoiMonths: 22,
    commercialSpaceMinSqFt: 2500,
    commercialSpaceMaxSqFt: 5000,
    staffRequiredMin: 3,
    staffRequiredMax: 6,
    trainingDurationWeeks: 2,
    supportProvided: [
      'IoT Turnstile & Biometric Access Hardware Package',
      'Preferred Lease Rates with Tier-1 Commercial Developers',
      'Pre-Launch Membership Pre-Sale Marketing Campaigns',
      'Equipment Maintenance & Annual Overhaul Support',
    ],
    idealFranchiseeProfile:
      'Multi-unit franchise investors looking for low-headcount, cash-flow generative recurring subscription businesses.',
    expansionLocations: ['Mumbai', 'Bengaluru', 'Pune', 'Ahmedabad'],
    status: 'published',
    isFeatured: true,
    viewsCount: 1180,
    enquiriesCount: 29,
    publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    approvedBy: brokerAdmin._id,
  });

  const listing3 = await FranchiseListing.create({
    business: business3._id,
    ownerUser: owner3._id,
    brandName: 'Curry Leaf Express',
    slug: 'curry-leaf-express',
    tagline: 'Fast, Authentic South Indian Coastal Delicacies',
    industry: 'Fast Casual Dining',
    subCategory: 'Quick Service Restaurant (QSR)',
    summary:
      'Compact footprint QSR model generating high ticket turns, rapid counter service, and heavy delivery channel volume.',
    brandStory:
      'Born out of Chennai, Curry Leaf Express perfected standardized batter preservation, automated dosa plate robotics, and rapid recipe assembly lines.',
    logoUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=200&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1600&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80',
    ],
    franchiseModelType: 'both',
    totalInvestmentMin: 2500000,
    totalInvestmentMax: 4000000,
    initialFranchiseFee: 600000,
    royaltyPercentage: 5,
    marketingFeePercentage: 2,
    estimatedRoiMonths: 14,
    commercialSpaceMinSqFt: 450,
    commercialSpaceMaxSqFt: 1000,
    staffRequiredMin: 3,
    staffRequiredMax: 5,
    trainingDurationWeeks: 2,
    supportProvided: [
      'Central Commissary Base Gravies & Standard Spices',
      'Automated Cooking Equipment & Kitchen Engineering',
      'Swiggy & Zomato Preferred National Placement',
      'Staff Training & SOP Compliance Auditing',
    ],
    idealFranchiseeProfile:
      'First-time franchise buyers or seasoned QSR operators wanting high ROI and speedy payback.',
    expansionLocations: ['Chennai', 'Bengaluru', 'Hyderabad', 'Kochi', 'Coimbatore'],
    status: 'published',
    isFeatured: true,
    viewsCount: 1650,
    enquiriesCount: 45,
    publishedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    approvedBy: brokerAdmin._id,
  });

  const listing4 = await FranchiseListing.create({
    business: business4._id,
    ownerUser: owner4._id,
    brandName: 'CodeBloom AI & Robotics Labs',
    slug: 'codebloom-ai-robotics-labs',
    tagline: 'Experiential Next-Gen Coding & AI Academy for Kids',
    industry: 'Education & EdTech',
    subCategory: 'AI, Robotics & Coding Labs',
    summary:
      'Award-winning hands-on STEM & Robotics franchise with gamified Python curriculum, proprietary robotics hardware kits, and zero royalty first 6 months.',
    brandStory:
      'Started by IIT & Carnegie Mellon alumni, CodeBloom transforms local learning into an experiential playground where students build real-world AI projects.',
    logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    ],
    franchiseModelType: 'both',
    totalInvestmentMin: 2000000,
    totalInvestmentMax: 3500000,
    initialFranchiseFee: 500000,
    royaltyPercentage: 8,
    marketingFeePercentage: 2,
    estimatedRoiMonths: 12,
    commercialSpaceMinSqFt: 600,
    commercialSpaceMaxSqFt: 1200,
    staffRequiredMin: 2,
    staffRequiredMax: 4,
    trainingDurationWeeks: 3,
    supportProvided: [
      'Full LMS & Gamified Coding Platform Licenses',
      'STEM Instructor Training & Monthly Recertification',
      'School Tie-Up Outreach Playbook & Competitions',
      'Hardware Lab Setup & Annual Upgrades',
    ],
    idealFranchiseeProfile:
      'Educators, engineers, or parent-entrepreneurs passionate about modern digital literacy with high neighborhood reputation.',
    expansionLocations: ['Bengaluru', 'Pune', 'Hyderabad', 'Chennai', 'Mumbai'],
    status: 'published',
    isFeatured: true,
    viewsCount: 890,
    enquiriesCount: 22,
    publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    approvedBy: brokerAdmin._id,
  });

  const listing5 = await FranchiseListing.create({
    business: business5._id,
    ownerUser: owner5._id,
    brandName: 'Aura Luxe MedSpa & Wellness',
    slug: 'aura-luxe-medspa-wellness',
    tagline: 'High-Margin Medical Aesthetics & Non-Invasive Wellness',
    industry: 'Health & Beauty',
    subCategory: 'Aesthetic Dermatology & Wellness',
    summary:
      'Premier luxury aesthetic clinic franchise combining FDA-cleared laser workstations, board-certified clinical protocols, and private clientele memberships.',
    brandStory:
      'Aura Luxe redefined modern aesthetics by pairing medical clinical excellence with luxury hospitality ambiance, boasting 74% client re-booking rates.',
    logoUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=1600&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80',
    ],
    franchiseModelType: 'multi_unit',
    totalInvestmentMin: 7500000,
    totalInvestmentMax: 12000000,
    initialFranchiseFee: 1500000,
    royaltyPercentage: 6,
    marketingFeePercentage: 3,
    estimatedRoiMonths: 20,
    commercialSpaceMinSqFt: 1500,
    commercialSpaceMaxSqFt: 3000,
    staffRequiredMin: 5,
    staffRequiredMax: 9,
    trainingDurationWeeks: 4,
    supportProvided: [
      'Direct OEM Medical Equipment Leasing Rates',
      'Clinical Dermatologist Onboarding & Medical SOPs',
      'VIP Loyalty App with Automated Client Re-Booking',
      'Exclusive German Cosmeceutical Skincare Distributorship',
    ],
    idealFranchiseeProfile:
      'Dermatologists, healthcare executives, or luxury franchise syndicates with prime commercial retail locations.',
    expansionLocations: ['New Delhi', 'Mumbai', 'Bengaluru', 'Chandigarh', 'Kolkata'],
    status: 'published',
    isFeatured: true,
    viewsCount: 1350,
    enquiriesCount: 31,
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    approvedBy: brokerAdmin._id,
  });

  // 7. Create Readiness Assessments
  await FranchiseReadinessAssessment.create({
    business: business1._id,
    evaluatedBy: brokerAdmin._id,
    status: 'certified_ready',
    overallScore: 88,
    pillars: {
      brandStrength: { score: 92, notes: 'Exceptional brand identity and customer NPS score.', recommendations: [] },
      unitEconomics: { score: 90, notes: 'Strong EBITDA margins above 22% across existing outlets.', recommendations: [] },
      sopDocumentation: { score: 85, notes: 'Complete barista and opening/closing manuals.', recommendations: [] },
      legalAndIpReadiness: { score: 88, notes: 'Trademark registered; FDD Item 1-23 drafted.', recommendations: [] },
      supplyChainReadiness: { score: 86, notes: 'Direct estate roaster contracts secured.', recommendations: [] },
      trainingSystemReadiness: { score: 84, notes: '3-week structured academy in place.', recommendations: [] },
      unitRepeatability: { score: 89, notes: 'Successful operation across 4 distinct neighborhoods.', recommendations: [] },
      expansionCapacity: { score: 90, notes: 'Dedicated franchise support team initialized.', recommendations: [] },
    },
    summaryRecommendation:
      'RoastCraft is certified franchise-ready with robust unit economics and systematized operational packaging.',
    priorityActionItems: [
      'Finalize territory exclusivity parameters for multi-unit operators',
      'Integrate cloud kitchen delivery modules for off-peak hours',
    ],
  });

  // 8. Create SOP Documents
  await SOPDocument.create([
    {
      business: business1._id,
      title: 'Barista Espresso Extraction & Milk Steaming Standards',
      category: 'daily_operations',
      summary: 'Precision guidelines on grind calibration, tamping pressure, extraction yield, and microfoam texture.',
      version: 1,
      status: 'approved',
      author: owner1._id,
      reviewedBy: brokerAdmin._id,
      jurisdiction: 'GLOBAL',
      checklists: [
        { item: 'Calibrate grinder with optical timer every morning', isMandatory: true, completed: true },
        { item: 'Maintain water boiler temperature at 93.5°C', isMandatory: true, completed: true },
        { item: 'Purge steam wand immediately after every jug', isMandatory: true, completed: true },
      ],
    },
    {
      business: business1._id,
      title: 'Store Opening & Cash Drawer Balancing Protocol',
      category: 'opening_closing_procedures',
      summary: 'Step-by-step procedure for morning unlocking, register float verification, and HVAC startup.',
      version: 1,
      status: 'approved',
      author: owner1._id,
      reviewedBy: brokerAdmin._id,
      jurisdiction: 'GLOBAL',
      checklists: [
        { item: 'Disarm security alarm and inspect perimeter', isMandatory: true, completed: true },
        { item: 'Verify cash drawer opening float of ₹5,000', isMandatory: true, completed: true },
        { item: 'Preheat ovens and check refrigeration temps', isMandatory: true, completed: true },
      ],
    },
    {
      business: business2._id,
      title: 'IoT Access Gate & Emergency Override Protocols',
      category: 'health_and_safety',
      summary: 'Emergency evacuation procedures and automated RFID gate malfunction failsafe protocols.',
      version: 1,
      status: 'approved',
      author: owner2._id,
      reviewedBy: brokerAdmin._id,
      jurisdiction: 'GLOBAL',
      checklists: [
        { item: 'Weekly panic bar release physical audit', isMandatory: true, completed: true },
        { item: 'Automatic fire alarm gate release testing', isMandatory: true, completed: true },
      ],
    },
  ]);

  // 9. Create Legal Documents
  await LegalDocument.create([
    {
      business: business1._id,
      documentType: 'fdd_master',
      title: 'Franchise Disclosure Document (Master FDD & FIM Disclosure)',
      fddItemNumber: 1,
      jurisdiction: 'GLOBAL',
      status: 'approved',
      version: 1,
      storageKey: 'legal/roastcraft_fdd_master_v1.pdf',
      originalFileName: 'roastcraft_master_fdd_2026.pdf',
      fileSizeBytes: 2450000,
      mimeType: 'application/pdf',
      uploadedBy: owner1._id,
      legalReviewer: brokerAdmin._id,
      legalReviewNotes: 'Legal counsel verified Items 1-23 and territory protection covenants.',
      complianceChecklist: [
        { clause: 'Initial Fee Structure Disclosed (Item 5)', isCompliant: true },
        { clause: 'Estimated Initial Investment Disclosed (Item 7)', isCompliant: true },
        { clause: 'Territory Exclusivity Rights Defined (Item 12)', isCompliant: true },
      ],
    },
    {
      business: business1._id,
      documentType: 'ip_trademark_license',
      title: 'Registered Trademark & Brand Licensing Agreement',
      jurisdiction: 'IN',
      status: 'approved',
      version: 1,
      storageKey: 'legal/roastcraft_tm_license.pdf',
      originalFileName: 'roastcraft_trademark_certificate.pdf',
      fileSizeBytes: 890000,
      mimeType: 'application/pdf',
      uploadedBy: owner1._id,
      legalReviewer: brokerAdmin._id,
      complianceChecklist: [
        { clause: 'Class 43 Trademark Registration Verified', isCompliant: true },
      ],
    },
  ]);

  // 10. Create Franchise Applications
  const app1 = await FranchiseApplication.create({
    franchise: listing1._id,
    investorUser: investor1._id,
    investorProfile: invProfile1._id,
    businessOwnerUser: owner1._id,
    proposedLocationCity: 'Bengaluru',
    proposedLocationState: 'Karnataka',
    unitsInterested: 2,
    investmentBudget: 7500000,
    availableLiquidCapital: 6000000,
    timeline: '1_to_3_months',
    businessBackgroundSummary:
      'Seasoned multi-unit retail operator with 12 years executive experience managing luxury consumer retail chains.',
    status: 'in_discussion',
    privacyConsentGiven: true,
    ndaSigned: true,
    statusHistory: [
      { status: 'submitted', changedBy: investor1._id, note: 'Application filed', timestamp: new Date(Date.now() - 14 * 86400000) },
      { status: 'vetted_by_broker', changedBy: brokerAdmin._id, note: 'Capital and background verified', timestamp: new Date(Date.now() - 10 * 86400000) },
      { status: 'introduced_to_owner', changedBy: brokerAdmin._id, note: 'NDA signed; mutual introduction completed', timestamp: new Date(Date.now() - 7 * 86400000) },
      { status: 'in_discussion', changedBy: owner1._id, note: 'First location shortlisting discussion underway', timestamp: new Date(Date.now() - 3 * 86400000) },
    ],
  });

  const app2 = await FranchiseApplication.create({
    franchise: listing2._id,
    investorUser: investor2._id,
    investorProfile: invProfile2._id,
    businessOwnerUser: owner2._id,
    proposedLocationCity: 'Mumbai',
    proposedLocationState: 'Maharashtra',
    unitsInterested: 2,
    investmentBudget: 15000000,
    availableLiquidCapital: 10000000,
    timeline: 'immediate',
    businessBackgroundSummary:
      'Healthcare and wellness growth syndicate with existing commercial footprint in Navi Mumbai and Thane.',
    status: 'documentation_review',
    privacyConsentGiven: true,
    ndaSigned: true,
    statusHistory: [
      { status: 'submitted', changedBy: investor2._id, note: 'Application submitted', timestamp: new Date(Date.now() - 12 * 86400000) },
      { status: 'vetted_by_broker', changedBy: brokerAdmin._id, note: 'High net worth verified', timestamp: new Date(Date.now() - 8 * 86400000) },
      { status: 'introduced_to_owner', changedBy: brokerAdmin._id, note: 'Owner approved introduction', timestamp: new Date(Date.now() - 5 * 86400000) },
      { status: 'documentation_review', changedBy: brokerAdmin._id, note: 'Reviewing FDD multi-unit addendum', timestamp: new Date(Date.now() - 2 * 86400000) },
    ],
  });

  // 11. Create Brokerage Deals Pipeline
  await BrokerageDeal.create([
    {
      dealTitle: 'RoastCraft 2-Unit Area Expansion - Whitefield & Outer Ring Rd',
      franchiseListing: listing1._id,
      businessOwner: owner1._id,
      investor: investor1._id,
      applicationRef: app1._id,
      stage: 'negotiation',
      dealValue: 7500000,
      franchiseFee: 1600000,
      commissionType: 'percentage',
      commissionRate: 0.05,
      expectedCommission: 375000,
      assignedBroker: brokerAdmin._id,
      notes: 'Territory radius negotiated at 3.5 km. Term sheet ready for execution.',
      stageHistory: [
        { stage: 'lead_received', changedBy: brokerAdmin._id, note: 'Deal generated from vetted application', timestamp: new Date(Date.now() - 10 * 86400000) },
        { stage: 'qualification', changedBy: brokerAdmin._id, note: 'Investor net worth and operator team verified', timestamp: new Date(Date.now() - 8 * 86400000) },
        { stage: 'initial_discussion', changedBy: brokerAdmin._id, note: 'Founder-investor pitch conducted', timestamp: new Date(Date.now() - 6 * 86400000) },
        { stage: 'negotiation', changedBy: brokerAdmin._id, note: 'Negotiating multi-unit royalty step-down', timestamp: new Date(Date.now() - 2 * 86400000) },
      ],
    },
    {
      dealTitle: 'FitPulse 24/7 Mumbai Suburban Dual Hub Launch',
      franchiseListing: listing2._id,
      businessOwner: owner2._id,
      investor: investor2._id,
      applicationRef: app2._id,
      stage: 'documentation_review',
      dealValue: 15000000,
      franchiseFee: 2400000,
      commissionType: 'percentage',
      commissionRate: 0.05,
      expectedCommission: 750000,
      assignedBroker: brokerAdmin._id,
      notes: 'Real estate leases currently undergoing structural load validation.',
      stageHistory: [
        { stage: 'lead_received', changedBy: brokerAdmin._id, note: 'Syndicate lead inbound', timestamp: new Date(Date.now() - 8 * 86400000) },
        { stage: 'qualification', changedBy: brokerAdmin._id, note: 'Capital backing confirmed', timestamp: new Date(Date.now() - 6 * 86400000) },
        { stage: 'documentation_review', changedBy: brokerAdmin._id, note: 'Counsel reviewing equipment financing disclosures', timestamp: new Date(Date.now() - 2 * 86400000) },
      ],
    },
  ]);

  // 12. Create CRM Leads
  await Lead.create([
    {
      fullName: 'Sunil Chhabra',
      email: 'sunil.chhabra@capitalventures.in',
      phone: '+91 99887 66554',
      company: 'Chhabra Capital Holdings',
      leadType: 'multi_unit_operator',
      status: 'qualified',
      source: 'marketplace_enquiry',
      targetIndustry: 'Food & Beverage',
      budgetMin: 10000000,
      budgetMax: 25000000,
      priority: 'high',
      assignedBroker: brokerAdmin._id,
      internalNotes: 'Looking to acquire 5-10 units of an emerging QSR brand across North India.',
      activities: [
        { type: 'note', summary: 'Lead entered from web contact form', performedBy: brokerAdmin._id, timestamp: new Date() },
        { type: 'call', summary: 'Discussed capital availability and preference for tier-1 mall locations', performedBy: brokerAdmin._id, timestamp: new Date() },
      ],
    },
    {
      fullName: 'Dr. Meera Iyer',
      email: 'dr.meera@apexmedicare.com',
      phone: '+91 99112 33445',
      company: 'Apex Medicare Clinics',
      leadType: 'brand_owner',
      status: 'meeting_scheduled',
      source: 'referral',
      targetIndustry: 'Health & Wellness',
      priority: 'urgent',
      assignedBroker: brokerAdmin._id,
      internalNotes: 'Operating 6 profitable physiotherapy clinics; wants to build FDD and franchise 50 units across South India.',
      activities: [
        { type: 'note', summary: 'Referral from existing legal counsel', performedBy: brokerAdmin._id, timestamp: new Date() },
      ],
    },
  ]);

  // 13. Create Meetings
  await Meeting.create([
    {
      title: 'RoastCraft Multi-Unit Term Sheet & Territory Alignment',
      meetingType: 'negotiation',
      organizer: brokerAdmin._id,
      participants: [brokerAdmin._id, owner1._id, investor1._id],
      relatedFranchise: listing1._id,
      relatedApplication: app1._id,
      scheduledStartTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      scheduledEndTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      status: 'scheduled',
      meetingUrl: 'https://meet.google.com/fb-roastcraft-deal',
      agenda: 'Review final territory radius covenants, store launch timeline, and initial marketing fund allocation.',
    },
  ]);

  // 14. Create Blog Posts
  await BlogPost.create([
    {
      title: 'The 8 Pillars of Franchise Readiness: How to Scale a Proven Local Brand',
      slug: '8-pillars-of-franchise-readiness',
      excerpt:
        'A blueprint for independent restaurant, retail, and service brand owners preparing to expand through multi-unit franchising.',
      content: `Franchising is one of the most powerful wealth-creation mechanisms in business, yet over 70% of emerging brands falter in their initial franchise rollout due to premature expansion.

### The Readiness Pillars:
1. **Unit Economics & Margin Resilience**: A franchise outlet must be more profitable than an owner-managed store to absorb royalty fees and management overhead.
2. **SOP Codification**: Everything from morning prep to emergency closures must be documented so non-founders can execute flawlessly.
3. **Legal Disclosure Integrity**: Whether complying with US FTC 23-Item FDD standards or Indian Contract & IP jurisprudence, transparent documentation protects franchisors and investors alike.
4. **Supply Chain Traceability**: Proprietary seasonings, specialty beans, or IoT components must be deliverable consistently at competitive prices.`,
      category: 'Franchise Strategy',
      authorName: 'Sarah Jenkins',
      authorRole: 'Head of Brokerage & Advisory',
      readTimeMinutes: 6,
      tags: ['Franchise Readiness', 'SOPs', 'Expansion', 'FDD'],
      isPublished: true,
      createdBy: brokerAdmin._id,
    },
    {
      title: 'Navigating Legal Documentation: FDDs vs. Franchise Information Memorandums (FIM)',
      slug: 'navigating-legal-fdd-and-fim-documentation',
      excerpt:
        'Understanding international and domestic legal frameworks when expanding brand intellectual property into new territories.',
      content: `Unlike the United States where the Federal Trade Commission mandates a 23-item Franchise Disclosure Document (FDD), markets like India, the UK, and UAE govern franchising through a blend of contract law, intellectual property statutes, and competition regulations.

### Key Documentation Requirements:
- **Franchise Agreement**: Clear definition of license scope, non-compete clauses, and termination terms.
- **Brand Protection**: Registered trademarks under appropriate commercial classes.
- **Financial Disclosures**: Verifiable unit economics without deceptive earning representations.`,
      category: 'Legal & Compliance',
      authorName: 'David Sterling',
      authorRole: 'Managing Director & Legal Counsel',
      readTimeMinutes: 8,
      tags: ['Legal', 'FDD', 'Compliance', 'IP Protection'],
      isPublished: true,
      createdBy: superAdmin._id,
    },
  ]);

  // 15. Create Platform Settings
  await PlatformSettings.create({
    platformName: 'FranchiseBridge',
    supportEmail: 'advisory@franchisebridge.com',
    defaultCommissionRate: 0.05,
    defaultJurisdiction: 'GLOBAL',
    enabledJurisdictions: ['IN', 'US', 'UK', 'GLOBAL'],
    requireNdaBeforeIntro: true,
    minReadinessScoreForListing: 65,
    maintenanceMode: false,
    updatedBy: superAdmin._id,
  });

  console.log('[Seed] Seeding completed successfully!');
  console.log('Demo Credentials created:');
  console.log(' - Super Admin : superadmin@franchisebridge.com / Password123!');
  console.log(' - Admin Broker: broker.admin@franchisebridge.com / Password123!');
  console.log(' - Business 1  : owner.roastcraft@example.com / Password123!');
  console.log(' - Business 2  : owner.fitpulse@example.com / Password123!');
  console.log(' - Investor 1  : investor.arun@example.com / Password123!');
  console.log(' - Investor 2  : investor.priya@example.com / Password123!');

  await mongoose.disconnect();
}

if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed] Error running seed:', err);
      process.exit(1);
    });
}
