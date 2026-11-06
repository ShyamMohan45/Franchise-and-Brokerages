import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Outlet } from '../models/Outlet';
import { ExpansionPlan, IMilestone } from '../models/ExpansionPlan';
import { BusinessProfile } from '../models/BusinessProfile';

const DEFAULT_MILESTONES: IMilestone[] = [
  {
    stageKey: 'market_analysis',
    title: '1. Market & Demographics Analysis',
    description: 'Evaluate city footfall, target consumer demographics, competitor pricing, and saturation levels.',
    status: 'completed',
    targetDays: 14,
    deliverables: ['Regional demographic report', 'Competitor benchmarking sheet'],
  },
  {
    stageKey: 'partner_screening',
    title: '2. Franchisee / Investor Screening',
    description: 'Vetting investor net worth, operational experience, background check, and interview.',
    status: 'completed',
    targetDays: 14,
    deliverables: ['Financial net worth certification', 'KYC and background verification'],
  },
  {
    stageKey: 'real_estate_scouting',
    title: '3. Site Selection & Lease Negotiation',
    description: 'Scout prime high-street or mall retail locations with required frontage and utilities.',
    status: 'in_progress',
    targetDays: 21,
    deliverables: ['Site evaluation scorecard', 'Signed Letter of Intent (LOI)'],
  },
  {
    stageKey: 'legal_and_fdd',
    title: '4. Legal Disclosures & Agreement Execution',
    description: 'Deliver FDD packet, complete 14-day mandatory disclosure window, sign Franchise Agreement.',
    status: 'pending',
    targetDays: 14,
    deliverables: ['FDD acknowledgement receipt', 'Executed Franchise Agreement'],
  },
  {
    stageKey: 'fitout_and_tech',
    title: '5. Architecture, Fitout & POS Integration',
    description: 'Contractor fitout, kitchen/store hardware installation, cloud POS & surveillance setup.',
    status: 'pending',
    targetDays: 30,
    deliverables: ['Approved architectural layout', 'POS and IT integration signoff'],
  },
  {
    stageKey: 'sop_training',
    title: '6. SOP Certification & Staff Training',
    description: '14-day intensive training for store manager and frontline crew on standard operating procedures.',
    status: 'pending',
    targetDays: 14,
    deliverables: ['Staff SOP exam certification', 'Food safety / hygiene certification'],
  },
  {
    stageKey: 'soft_launch',
    title: '7. Soft Launch & Quality Audit',
    description: 'Limited menu dry-run for 3-5 days to fine-tune service speed, prep quality, and billing.',
    status: 'pending',
    targetDays: 7,
    deliverables: ['Operational punch-list resolution', 'Audit score > 90%'],
  },
  {
    stageKey: 'grand_opening',
    title: '8. Grand Opening & Local PR Campaign',
    description: 'Official ribbon cutting, influencer tastings, regional PR distribution, and launch promos.',
    status: 'pending',
    targetDays: 3,
    deliverables: ['Press release coverage', 'Day 1 sales revenue benchmark'],
  },
];

// --- Outlets ---
export const getMyOutlets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = await BusinessProfile.findOne({ user: req.user?.id });
    if (!business) {
      res.status(404).json({ success: false, message: 'Business profile not found' });
      return;
    }

    let outlets = await Outlet.find({ business: business._id }).sort({ createdAt: -1 });

    // Seed default outlets if none exist
    if (outlets.length === 0) {
      const bName = (business as any).businessName || 'Brand';
      const sampleOutlets: any[] = [
        {
          business: business._id,
          outletName: `${bName} - Flagship Indiranagar`,
          unitCode: 'IND-001',
          storeType: 'flagship',
          city: 'Bangalore',
          state: 'Karnataka',
          address: '100ft Road, HAL 2nd Stage, Indiranagar',
          pincode: '560038',
          managerName: 'Vikram Mehta',
          managerPhone: '+91 98450 12345',
          managerEmail: 'vikram.m@franchisepartner.in',
          sizeSqFt: 1850,
          monthlyRevenue: 1850000,
          staffCount: 12,
          status: 'operating',
          openingDate: new Date('2024-03-15'),
          fitoutProgressPercent: 100,
        },
        {
          business: business._id,
          outletName: `${bName} - Cyber City Hub`,
          unitCode: 'GUR-002',
          storeType: 'standard',
          city: 'Gurugram',
          state: 'Haryana',
          address: 'Building 10B, DLF Cyber City',
          pincode: '122002',
          managerName: 'Priya Sharma',
          managerPhone: '+91 99100 88214',
          managerEmail: 'priya.s@franchisepartner.in',
          sizeSqFt: 1200,
          monthlyRevenue: 1420000,
          staffCount: 8,
          status: 'operating',
          openingDate: new Date('2024-08-20'),
          fitoutProgressPercent: 100,
        },
        {
          business: business._id,
          outletName: `${bName} - Bandra West`,
          unitCode: 'MUM-003',
          storeType: 'standard',
          city: 'Mumbai',
          state: 'Maharashtra',
          address: 'Linking Road, Bandra West',
          pincode: '400050',
          managerName: 'Arjun Deshmukh',
          managerPhone: '+91 98200 44123',
          managerEmail: 'arjun.d@franchisepartner.in',
          sizeSqFt: 1400,
          monthlyRevenue: 0,
          staffCount: 6,
          status: 'under_fitout',
          openingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          fitoutProgressPercent: 65,
        },
      ];
      outlets = (await Outlet.insertMany(sampleOutlets)) as any;
    }

    res.json({ success: true, count: outlets.length, data: outlets });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOutlet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = await BusinessProfile.findOne({ user: req.user?.id });
    if (!business) {
      res.status(404).json({ success: false, message: 'Business profile not found' });
      return;
    }

    const outlet = await Outlet.create({
      ...req.body,
      business: business._id,
    });

    res.status(201).json({ success: true, data: outlet });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateOutlet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const outlet = await Outlet.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!outlet) {
      res.status(404).json({ success: false, message: 'Outlet not found' });
      return;
    }
    res.json({ success: true, data: outlet });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteOutlet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Outlet.findByIdAndDelete(id);
    res.json({ success: true, message: 'Outlet removed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Expansion Plans & Roadmaps ---
export const getMyExpansionPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = await BusinessProfile.findOne({ user: req.user?.id });
    if (!business) {
      res.status(404).json({ success: false, message: 'Business profile not found' });
      return;
    }

    let plan = await ExpansionPlan.findOne({ business: business._id });
    if (!plan) {
      // Create initial expansion plan
      plan = await ExpansionPlan.create({
        business: business._id,
        planName: `${(business as any).businessName || 'Brand'} National Scale 2026-2027`,
        targetYear: 2026,
        targetTotalOutlets: 25,
        targetCities: [
          { cityName: 'Bangalore', state: 'Karnataka', tier: 'Tier 1', plannedOutlets: 5, priority: 'High', status: 'Launched' },
          { cityName: 'Mumbai', state: 'Maharashtra', tier: 'Tier 1', plannedOutlets: 6, priority: 'High', status: 'Fitout' },
          { cityName: 'Delhi NCR', state: 'Delhi', tier: 'Tier 1', plannedOutlets: 5, priority: 'High', status: 'In Deal Room' },
          { cityName: 'Hyderabad', state: 'Telangana', tier: 'Tier 1', plannedOutlets: 4, priority: 'Medium', status: 'Scouting' },
          { cityName: 'Pune', state: 'Maharashtra', tier: 'Tier 2', plannedOutlets: 3, priority: 'Medium', status: 'Scouting' },
          { cityName: 'Ahmedabad', state: 'Gujarat', tier: 'Tier 2', plannedOutlets: 2, priority: 'Low', status: 'Scouting' },
        ],
        milestones: DEFAULT_MILESTONES,
        overallProgressPercent: 38,
        notes: 'Targeting high-density IT corridors and Grade A retail lifestyle destinations.',
      });
    }

    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateExpansionPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = await BusinessProfile.findOne({ user: req.user?.id });
    if (!business) {
      res.status(404).json({ success: false, message: 'Business profile not found' });
      return;
    }

    const plan = await ExpansionPlan.findOneAndUpdate(
      { business: business._id },
      { $set: req.body },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateMilestone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { stageKey, status } = req.body;
    const business = await BusinessProfile.findOne({ user: req.user?.id });
    if (!business) {
      res.status(404).json({ success: false, message: 'Business profile not found' });
      return;
    }

    const plan = await ExpansionPlan.findOne({ business: business._id });
    if (!plan) {
      res.status(404).json({ success: false, message: 'Expansion plan not found' });
      return;
    }

    const milestone = plan.milestones.find((m) => m.stageKey === stageKey);
    if (milestone) {
      milestone.status = status;
      if (status === 'completed') {
        milestone.completedAt = new Date();
      }
    }

    const completedCount = plan.milestones.filter((m) => m.status === 'completed').length;
    plan.overallProgressPercent = Math.round((completedCount / plan.milestones.length) * 100);

    await plan.save();
    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
