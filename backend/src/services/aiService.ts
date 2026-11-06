/**
 * AI Service for Franchise Readiness Benchmarking and Advisory Assistant
 * Features structured evaluation and approved knowledge base fallback
 */

export interface IReadinessInput {
  brandName: string;
  industry: string;
  operatingYears: number;
  existingOutlets: number;
  annualRevenueInLakhs: number;
  ebitdaMarginPercent: number;
  hasRegisteredTrademark: boolean;
  hasDocumentedSOPs: boolean;
  hasFDDOrDisclosureReady: boolean;
  hasDedicatedTrainingProgram: boolean;
  centralizedSupplyChain: boolean;
  targetExpansionFormat: string;
}

export interface IReadinessPillarResult {
  score: number;
  status: 'Strong' | 'Moderate' | 'Action Needed';
  notes: string;
  recommendations: string[];
}

export interface IReadinessAnalysisResult {
  overallScore: number;
  readinessTier: 'Franchise-Ready (Grade A)' | 'Near-Ready (Grade B)' | 'Emerging (Grade C)' | 'High-Risk (Requires Restructuring)';
  executiveSummary: string;
  pillars: {
    brandStrength: IReadinessPillarResult;
    unitEconomics: IReadinessPillarResult;
    sopDocumentation: IReadinessPillarResult;
    legalAndIpReadiness: IReadinessPillarResult;
    supplyChainReadiness: IReadinessPillarResult;
    trainingSystemReadiness: IReadinessPillarResult;
    unitRepeatability: IReadinessPillarResult;
    expansionCapacity: IReadinessPillarResult;
  };
  strengths: string[];
  weaknesses: string[];
  actionPlan30Days: string[];
  actionPlan60Days: string[];
  actionPlan90Days: string[];
  estimatedTimeframeToLaunchWeeks: number;
  disclaimer: string;
}

export function evaluateFranchiseReadiness(input: IReadinessInput): IReadinessAnalysisResult {
  // Brand Strength & IP
  const brandScore = Math.min(100, (input.hasRegisteredTrademark ? 50 : 15) + Math.min(50, input.operatingYears * 12));
  
  // Unit Economics
  let unitEconomicsScore = 40;
  if (input.ebitdaMarginPercent >= 20) unitEconomicsScore += 45;
  else if (input.ebitdaMarginPercent >= 12) unitEconomicsScore += 30;
  else unitEconomicsScore += 10;
  if (input.annualRevenueInLakhs >= 100) unitEconomicsScore += 15;

  // SOP Documentation
  const sopScore = input.hasDocumentedSOPs ? 88 : 25;

  // Legal & IP Readiness
  let legalScore = 30;
  if (input.hasRegisteredTrademark) legalScore += 35;
  if (input.hasFDDOrDisclosureReady) legalScore += 35;

  // Supply Chain
  const supplyChainScore = input.centralizedSupplyChain ? 85 : 40;

  // Training
  const trainingScore = input.hasDedicatedTrainingProgram ? 90 : 35;

  // Unit Repeatability
  let repeatabilityScore = 40;
  if (input.existingOutlets >= 3) repeatabilityScore += 45;
  else if (input.existingOutlets >= 2) repeatabilityScore += 30;
  else repeatabilityScore += 10;

  // Expansion Capacity
  let capacityScore = 45;
  if (input.annualRevenueInLakhs >= 200 && input.ebitdaMarginPercent >= 15) capacityScore += 45;
  else if (input.annualRevenueInLakhs >= 80) capacityScore += 30;

  const rawAverage = Math.round(
    (brandScore +
      unitEconomicsScore +
      sopScore +
      legalScore +
      supplyChainScore +
      trainingScore +
      repeatabilityScore +
      capacityScore) /
      8
  );

  let readinessTier: IReadinessAnalysisResult['readinessTier'] = 'Emerging (Grade C)';
  if (rawAverage >= 80) readinessTier = 'Franchise-Ready (Grade A)';
  else if (rawAverage >= 65) readinessTier = 'Near-Ready (Grade B)';
  else if (rawAverage < 50) readinessTier = 'High-Risk (Requires Restructuring)';

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (input.hasRegisteredTrademark) strengths.push('Formal Class 43/35 Registered Trademark secured');
  else weaknesses.push('Unregistered or pending trademark creates territory vulnerability');

  if (input.ebitdaMarginPercent >= 15) strengths.push(`Healthy operating EBITDA margin of ${input.ebitdaMarginPercent}% provides healthy franchisee ROI`);
  else weaknesses.push(`Sub-15% EBITDA margin (${input.ebitdaMarginPercent}%) increases break-even exposure for franchisees`);

  if (input.hasDocumentedSOPs) strengths.push('Core kitchen/store operations standard operating procedures documented');
  else weaknesses.push('Lack of codified SOPs risks inconsistent quality across multi-unit rollouts');

  if (input.centralizedSupplyChain) strengths.push('Centralized vendor agreements guarantee standardized input margins');
  else weaknesses.push('Decentralized sourcing could lead to regional cost swings');

  if (input.hasFDDOrDisclosureReady) strengths.push('Comprehensive Franchise Disclosure Document (FDD) prepared');
  else weaknesses.push('FDD/Legal disclosure pack incomplete; essential before onboarding external investors');

  return {
    overallScore: rawAverage,
    readinessTier,
    executiveSummary: `${input.brandName} presents an overall franchise readiness rating of ${rawAverage}/100 (${readinessTier}). The business exhibits solid operational foundation in ${input.industry}, but optimizing formal disclosures and SOP validation will dramatically accelerate multi-city scale.`,
    pillars: {
      brandStrength: {
        score: brandScore,
        status: brandScore >= 75 ? 'Strong' : brandScore >= 50 ? 'Moderate' : 'Action Needed',
        notes: `${input.operatingYears} years in market with established local presence.`,
        recommendations: [
          'Audit trademark class registrations across all planned ancillary merchandise/services',
          'Build standardized social media brand assets kit for incoming regional franchisees',
        ],
      },
      unitEconomics: {
        score: unitEconomicsScore,
        status: unitEconomicsScore >= 75 ? 'Strong' : unitEconomicsScore >= 50 ? 'Moderate' : 'Action Needed',
        notes: `Estimated EBITDA margin of ${input.ebitdaMarginPercent}% on ${input.annualRevenueInLakhs}L annual run rate.`,
        recommendations: [
          'Develop Item 19 FPR (Financial Performance Representation) with low, base, and high unit scenarios',
          'Set a sustainable royalty threshold (typically 4-7% gross) without squeezing operator cash flows',
        ],
      },
      sopDocumentation: {
        score: sopScore,
        status: sopScore >= 75 ? 'Strong' : 'Action Needed',
        notes: input.hasDocumentedSOPs ? 'Documented SOP manuals available.' : 'SOPs currently informal or uncodified.',
        recommendations: [
          'Upload digital operating manuals to Franchise Document Vault',
          'Institute quarterly checklist audits for store managers',
        ],
      },
      legalAndIpReadiness: {
        score: legalScore,
        status: legalScore >= 75 ? 'Strong' : legalScore >= 50 ? 'Moderate' : 'Action Needed',
        notes: 'Compliance with Indian Contract Act and Franchise Disclosure norms.',
        recommendations: [
          'Draft standard Unit Franchise Agreement with non-compete and territory carve-outs',
          'Establish structured escrow mechanism for upfront franchise fees',
        ],
      },
      supplyChainReadiness: {
        score: supplyChainScore,
        status: supplyChainScore >= 75 ? 'Strong' : 'Action Needed',
        notes: input.centralizedSupplyChain ? 'Central procurement active.' : 'Local ad-hoc procurement.',
        recommendations: [
          'Formalize Master Service Agreements with primary suppliers with SLA penalties',
          'Implement batch tracking and shelf-life compliance tracking',
        ],
      },
      trainingSystemReadiness: {
        score: trainingScore,
        status: trainingScore >= 75 ? 'Strong' : 'Action Needed',
        notes: input.hasDedicatedTrainingProgram ? 'Structured training curriculum in place.' : 'Informal on-the-job training.',
        recommendations: [
          'Structure 14-day mandatory corporate training for new franchisee managers',
          'Deploy digital video modules for frontline staff onboarding',
        ],
      },
      unitRepeatability: {
        score: repeatabilityScore,
        status: repeatabilityScore >= 75 ? 'Strong' : 'Action Needed',
        notes: `${input.existingOutlets} operational outlets demonstrating model viability.`,
        recommendations: [
          'Standardize 3 prototype floorplans (Kiosk, Inline Standard, Flagship)',
          'Create turnkey equipment vendor catalog with pre-negotiated volume pricing',
        ],
      },
      expansionCapacity: {
        score: capacityScore,
        status: capacityScore >= 75 ? 'Strong' : 'Action Needed',
        notes: 'HQ bandwidth to support onboarding, site scouting, and ongoing quality audits.',
        recommendations: [
          'Designate dedicated Franchise Business Coach (FBC) per 10 regional units',
          'Deploy cloud POS and automated daily sales reporting',
        ],
      },
    },
    strengths,
    weaknesses,
    actionPlan30Days: [
      'Finalize Class 43/35 IP trademark documentation and domain portfolio protection',
      'Codify core SOPs into digital PDF manuals with step-by-step photographic guides',
      'Assemble audited financial statements for past 2 fiscal years for FDD Item 19',
    ],
    actionPlan60Days: [
      'Engage franchise legal counsel to draft 2026 Master & Unit Franchise Agreements',
      'Sign vendor SLA contracts for core proprietary ingredients / equipment',
      'Launch interactive Franchise Bridge digital deal room and investor teaser',
    ],
    actionPlan90Days: [
      'Conduct broker demo day with pre-qualified multi-unit investors',
      'Execute pilot territory agreement in priority Tier 1 or Tier 2 target market',
      'Begin store site selection and turnkey architectural design fitout',
    ],
    estimatedTimeframeToLaunchWeeks: rawAverage >= 80 ? 4 : rawAverage >= 65 ? 8 : 14,
    disclaimer:
      'This AI-powered Franchise Readiness Benchmark provides strategic operational guidance. It does not constitute formal legal counsel or financial underwriting guarantee.',
  };
}

export function handleChatAssistant(userMessage: string, userRole: string = 'general'): string {
  const query = userMessage.toLowerCase();

  if (query.includes('fdd') || query.includes('disclosure')) {
    return 'The Franchise Disclosure Document (FDD) is the cornerstone legal document containing 23 standardized disclosure items—such as litigation history, upfront franchise fees, initial investment capex, royalty obligations, territory protections, and Item 19 Financial Performance Representations (FPR). On FranchiseBridge, franchisors can upload their certified FDD packet in the Legal Vault, and verified investors can download and review it with legal counsel.';
  }

  if (query.includes('sop') || query.includes('manual')) {
    return 'Standard Operating Procedures (SOPs) codify daily operations, kitchen prep, customer service protocols, hygiene standards, opening/closing checklists, and emergency procedures. Documenting clear SOPs ensures franchise units can replicate brand quality consistently. In your dashboard, you can upload PDF SOP manuals directly into the Franchise Document Vault.';
  }

  if (query.includes('cost') || query.includes('calculator') || query.includes('investment') || query.includes('capex')) {
    return 'Franchise capex typically includes: 1) Upfront Franchise Fee, 2) Real Estate Security Deposit, 3) Architecture & Interior Fitout, 4) Kitchen/IT Equipment & POS, 5) Initial Opening Inventory, and 6) 3-6 months Working Capital Buffer. You can utilize the Franchise Expansion Cost Estimator tool on FranchiseBridge to generate Low, Medium, and High scenarios along with projected break-even months!';
  }

  if (query.includes('deal room') || query.includes('negotiat')) {
    return 'The Digital Deal Room is a secure, role-based workspace connecting the Franchisor, Investor, and Assigned Broker. Inside the deal room, parties sign non-disclosure agreements (NDAs), exchange private financials and territory plans, collaborate on legal drafts, and complete e-signatures securely.';
  }

  if (query.includes('match') || query.includes('investor') || query.includes('algorithm')) {
    return 'The Smart Investor Matching Engine computes multi-factor fit using weighted criteria: Budget Compatibility (30%), Target Location/Territory (20%), Industry Alignment (20%), Operator Experience (10%), Target Units (10%), and Timeline Urgency (10%). Matches above 75% receive automated high-priority broker introductions.';
  }

  if (query.includes('india') || query.includes('regulation') || query.includes('law')) {
    return 'In India, franchising is governed under a blend of commercial statutes: The Indian Contract Act (1872), The Trademarks Act (1999), The Competition Act (2002), The Consumer Protection Act (2019), and FEMA regulations for cross-border royalties. Registering your trademark and creating clear territorial covenants is vital for brand safety.';
  }

  return `Welcome to the FranchiseBridge AI Assistant! I can help you evaluate franchise readiness, understand FDD disclosures and SOP documentation, navigate our interactive cost estimator, explore our multi-city expansion roadmaps, or collaborate inside our secure digital deal rooms. What specific topic would you like to explore?`;
}
