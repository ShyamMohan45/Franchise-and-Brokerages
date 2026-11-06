import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { DueDiligenceChecklist, IDueDiligenceCategoryItem } from '../models/DueDiligenceChecklist';
import { FranchiseListing } from '../models/FranchiseListing';

const DEFAULT_13_CATEGORIES: IDueDiligenceCategoryItem[] = [
  {
    itemId: 'dd-1',
    category: 'Corporate Identity',
    title: '1. Corporate Incorporation & MOA/AOA',
    description: 'Verify Certificate of Incorporation, active DIN of directors, and MCA corporate filing compliance.',
    status: 'verified',
    notes: 'Incorporation verified via MCA registry. Clean directorship records.',
  },
  {
    itemId: 'dd-2',
    category: 'Intellectual Property',
    title: '2. Trademark Registration & Class 43/35 Protection',
    description: 'Check trademark status in India (Controller General of Patents, Designs and Trademarks) and territorial rights.',
    status: 'verified',
    notes: 'Registered under Class 43 (Restaurant Services) & Class 30 (Packaged Goods). Valid until 2033.',
  },
  {
    itemId: 'dd-3',
    category: 'Financial Health',
    title: '3. Audited Financials & Tax Filings (Past 3 Years)',
    description: 'Independent CA audited balance sheets, P&L statements, GST filing regularity, and debt obligations.',
    status: 'verified',
    notes: 'Audited P&L reveals positive operational EBITDA for 3 consecutive fiscal years.',
  },
  {
    itemId: 'dd-4',
    category: 'Legal & Disputes',
    title: '4. Litigation, Arbitration & Regulatory Disclosures',
    description: 'Verify pending legal notices, consumer disputes, or criminal proceedings involving promoters.',
    status: 'verified',
    notes: 'Clean legal declaration provided. Zero pending high-court or arbitration claims.',
  },
  {
    itemId: 'dd-5',
    category: 'Unit Economics',
    title: '5. Unit Economics & Item 19 FPR Disclosure',
    description: 'Scrutinize average gross revenue per unit, cost of goods sold (COGS), labor costs, and net margin ranges.',
    status: 'in_review',
    notes: 'Item 19 data received. Reconciling average sales per square foot across company-owned vs franchised units.',
  },
  {
    itemId: 'dd-6',
    category: 'FDD Compliance',
    title: '6. Franchise Disclosure Document (23 Items)',
    description: 'Complete cross-check of US FTC / Indian Franchise benchmark disclosure packet items.',
    status: 'verified',
    notes: '2026 Master FDD packet verified and stored in Document Vault.',
  },
  {
    itemId: 'dd-7',
    category: 'Supply Chain',
    title: '7. Centralized Vendor & Sourcing Agreements',
    description: 'Review contracts with primary suppliers, ingredient price stability covenants, and shelf-life SOPs.',
    status: 'in_review',
    notes: 'Evaluating central commissary distribution SLAs and lead times in South & West India.',
  },
  {
    itemId: 'dd-8',
    category: 'Operations & SOPs',
    title: '8. Standard Operating Procedures (SOP Manuals)',
    description: 'Verify existence of kitchen prep manuals, inventory shrinkage controls, and hygiene checklists.',
    status: 'verified',
    notes: 'Comprehensive 85-page SOP manual uploaded with video training modules.',
  },
  {
    itemId: 'dd-9',
    category: 'Contractual Terms',
    title: '9. Master & Unit Franchise Agreement Structure',
    description: 'Examine territory exclusivity, non-compete clauses, renewal conditions, and default cure periods.',
    status: 'in_review',
    notes: 'Investor counsel requested refinement of 5km non-compete radius upon expiration.',
  },
  {
    itemId: 'dd-10',
    category: 'Real Estate',
    title: '10. Site Selection & Lease Guidelines',
    description: 'Minimum carpet area, power load, water/drainage requirements, and lock-in period norms.',
    status: 'pending',
    notes: 'Awaiting site criteria guidelines for mall food-court versus standalone high-street units.',
  },
  {
    itemId: 'dd-11',
    category: 'Risk & Insurance',
    title: '11. Public Liability & Asset Insurance Standards',
    description: 'Requirement for commercial general liability, fire/perils coverage, and indemnification protection.',
    status: 'pending',
    notes: 'Standardized policy limits to be appended to Schedule C of the agreement.',
  },
  {
    itemId: 'dd-12',
    category: 'Escrow & Fees',
    title: '12. Royalty Escrow & Marketing Fund Accountability',
    description: 'Audit mechanisms for national marketing fund utilization and transparency reports to franchisees.',
    status: 'pending',
    notes: 'Annual audit report of the 2% Brand Marketing Fund to be distributed to franchisees.',
  },
  {
    itemId: 'dd-13',
    category: 'Exit & Transfer',
    title: '13. Resale, Transfer Rights & Buyback Clauses',
    description: 'Conditions under which franchisee can sell the unit, right of first refusal (ROFR) terms, and termination protocols.',
    status: 'pending',
    notes: 'Standard 30-day franchisor ROFR at fair market value.',
  },
];

export const getDueDiligenceChecklist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { franchiseId } = req.params;
    const userId = req.user?.id;

    let checklist = await DueDiligenceChecklist.findOne({
      franchiseListing: franchiseId,
      investor: userId,
    }).populate('franchiseListing', 'brandName industry investmentRange slug logoUrl');

    if (!checklist) {
      checklist = await DueDiligenceChecklist.create({
        franchiseListing: franchiseId,
        investor: userId,
        items: DEFAULT_13_CATEGORIES,
        completionPercentage: 46,
        riskSummary: 'Initial legal review in progress. 6 of 13 categories verified with clean records.',
      });
      await checklist.populate('franchiseListing', 'brandName industry investmentRange slug logoUrl');
    }

    res.json({ success: true, data: checklist });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDueDiligenceItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { checklistId, itemId } = req.params;
    const { status, notes } = req.body;

    const checklist = await DueDiligenceChecklist.findById(checklistId);
    if (!checklist) {
      res.status(404).json({ success: false, message: 'Checklist not found' });
      return;
    }

    const item = checklist.items.find((i) => i.itemId === itemId);
    if (!item) {
      res.status(404).json({ success: false, message: 'Checklist item not found' });
      return;
    }

    if (status) item.status = status;
    if (notes !== undefined) item.notes = notes;
    if (status === 'verified') {
      item.verifiedAt = new Date();
      item.verifiedBy = req.user?.id as any;
    }

    const verifiedCount = checklist.items.filter((i) => i.status === 'verified').length;
    checklist.completionPercentage = Math.round((verifiedCount / checklist.items.length) * 100);

    if (checklist.completionPercentage === 100) {
      checklist.overallStatus = 'completed';
    } else if (checklist.items.some((i) => i.status === 'flagged')) {
      checklist.overallStatus = 'flagged_issues';
    } else {
      checklist.overallStatus = 'in_progress';
    }

    await checklist.save();
    res.json({ success: true, data: checklist });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
