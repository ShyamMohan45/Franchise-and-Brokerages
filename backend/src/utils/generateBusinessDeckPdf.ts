import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export async function generateDeckPdf(): Promise<string> {
  const doc = await PDFDocument.create();

  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

  // Colors
  const bgDark = rgb(8 / 255, 13 / 255, 24 / 255);
  const cardBg = rgb(15 / 255, 23 / 255, 42 / 255);
  const textWhite = rgb(1, 1, 1);
  const textSlate = rgb(148 / 255, 163 / 255, 184 / 255);
  const textGold = rgb(245 / 255, 215 / 255, 127 / 255);
  const goldBorder = rgb(212 / 255, 175 / 255, 55 / 255);
  const blueBorder = rgb(37 / 255, 99 / 255, 235 / 255);
  const textBlue = rgb(96 / 255, 165 / 255, 250 / 255);
  const greenBorder = rgb(16 / 255, 185 / 255, 129 / 255);
  const textGreen = rgb(52 / 255, 211 / 255, 153 / 255);
  const lineSeparator = rgb(255 / 255, 255 / 255, 255 / 255);

  const pageWidth = 792;
  const pageHeight = 612;

  function addBaseSlide(slideNum: number, tag: string, title: string, subtitle: string) {
    const page = doc.addPage([pageWidth, pageHeight]);

    // Dark background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: bgDark,
    });

    // Decorative top-right accent glow
    page.drawCircle({
      x: pageWidth - 60,
      y: pageHeight - 40,
      size: 100,
      color: rgb(37 / 255, 99 / 255, 235 / 255),
      opacity: 0.12,
    });

    // Header Tag Badge
    const tagWidth = fontBold.widthOfTextAtSize(tag.toUpperCase(), 8) + 16;
    page.drawRectangle({
      x: 50,
      y: pageHeight - 55,
      width: tagWidth,
      height: 18,
      color: rgb(212 / 255, 175 / 255, 55 / 255),
      opacity: 0.15,
      borderColor: goldBorder,
      borderWidth: 1,
    });
    page.drawText(tag.toUpperCase(), {
      x: 58,
      y: pageHeight - 48,
      size: 8,
      font: fontBold,
      color: textGold,
    });

    // Slide Number Badge (Top Right)
    const numText = `SLIDE ${slideNum < 10 ? '0' + slideNum : slideNum}`;
    page.drawText(numText, {
      x: pageWidth - 110,
      y: pageHeight - 48,
      size: 9,
      font: fontBold,
      color: textGold,
    });

    // Title & Subtitle
    page.drawText(title, {
      x: 50,
      y: pageHeight - 85,
      size: 22,
      font: fontBold,
      color: textWhite,
    });

    page.drawText(subtitle, {
      x: 50,
      y: pageHeight - 105,
      size: 11,
      font: fontRegular,
      color: textSlate,
    });

    // Top Divider Line
    page.drawLine({
      start: { x: 50, y: pageHeight - 118 },
      end: { x: pageWidth - 50, y: pageHeight - 118 },
      thickness: 1,
      color: lineSeparator,
      opacity: 0.1,
    });

    // Bottom Divider Line & Footer
    page.drawLine({
      start: { x: 50, y: 45 },
      end: { x: pageWidth - 50, y: 45 },
      thickness: 1,
      color: lineSeparator,
      opacity: 0.1,
    });

    page.drawText('FranchiseBridge (TM) | Confidential Executive Business Deck', {
      x: 50,
      y: 28,
      size: 8,
      font: fontRegular,
      color: textSlate,
    });

    page.drawText(`Page ${slideNum} of 12`, {
      x: pageWidth - 115,
      y: 28,
      size: 8,
      font: fontBold,
      color: textSlate,
    });

    return page;
  }

  // ==================== SLIDE 1: COVER ====================
  {
    const page = doc.addPage([pageWidth, pageHeight]);
    page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: bgDark });

    // Decorative background accents
    page.drawCircle({ x: pageWidth - 100, y: pageHeight - 80, size: 180, color: rgb(37 / 255, 99 / 255, 235 / 255), opacity: 0.15 });
    page.drawCircle({ x: 80, y: 80, size: 140, color: rgb(212 / 255, 175 / 255, 55 / 255), opacity: 0.08 });

    // Logo Icon Box
    page.drawRectangle({
      x: 50,
      y: pageHeight - 80,
      width: 44,
      height: 44,
      color: rgb(37 / 255, 99 / 255, 235 / 255),
      borderColor: goldBorder,
      borderWidth: 1.5,
    });
    page.drawText('FB', { x: 60, y: pageHeight - 65, size: 20, font: fontBold, color: textWhite });

    page.drawText('FranchiseBridge (TM)', {
      x: 105,
      y: pageHeight - 65,
      size: 16,
      font: fontBold,
      color: textWhite,
    });

    // Main Cover Title
    page.drawRectangle({
      x: 50,
      y: pageHeight - 160,
      width: 220,
      height: 22,
      color: rgb(212 / 255, 175 / 255, 55 / 255),
      opacity: 0.15,
      borderColor: goldBorder,
      borderWidth: 1,
    });
    page.drawText('EXECUTIVE PITCH DECK • CONFIDENTIAL', {
      x: 58,
      y: pageHeight - 152,
      size: 9,
      font: fontBold,
      color: textGold,
    });

    page.drawText('Turning Proven Local Brands Into', {
      x: 50,
      y: pageHeight - 215,
      size: 32,
      font: fontBold,
      color: textWhite,
    });

    page.drawText('National Franchise Empires.', {
      x: 50,
      y: pageHeight - 260,
      size: 34,
      font: fontBold,
      color: textGold,
    });

    page.drawText(
      'The AI-powered ecosystem connecting high-margin regional businesses, multi-unit investors,',
      { x: 50, y: pageHeight - 310, size: 13, font: fontRegular, color: textSlate }
    );
    page.drawText(
      'and institutional brokers through codified SOPs, certified FDD legal vaults, and digital deal rooms.',
      { x: 50, y: pageHeight - 330, size: 13, font: fontRegular, color: textSlate }
    );

    // Meta Footer Cards
    const cardY = 80;
    const cardW = 210;
    const cardH = 70;

    // Card 1
    page.drawRectangle({ x: 50, y: cardY, width: cardW, height: cardH, color: cardBg, borderColor: blueBorder, borderWidth: 1 });
    page.drawText('PREPARED FOR', { x: 65, y: cardY + 45, size: 8, font: fontBold, color: textBlue });
    page.drawText('Senior Management & Stakeholders', { x: 65, y: cardY + 25, size: 10, font: fontBold, color: textWhite });

    // Card 2
    page.drawRectangle({ x: 280, y: cardY, width: cardW, height: cardH, color: cardBg, borderColor: goldBorder, borderWidth: 1 });
    page.drawText('PROJECT LEAD & PRESENTER', { x: 295, y: cardY + 45, size: 8, font: fontBold, color: textGold });
    page.drawText('Shyam Faujdaar', { x: 295, y: cardY + 25, size: 12, font: fontBold, color: textWhite });

    // Card 3
    page.drawRectangle({ x: 510, y: cardY, width: cardW, height: cardH, color: cardBg, borderColor: greenBorder, borderWidth: 1 });
    page.drawText('PLATFORM STATUS', { x: 525, y: cardY + 45, size: 8, font: fontBold, color: textGreen });
    page.drawText('v2.6 Enterprise • 2026 Cohort', { x: 525, y: cardY + 25, size: 10, font: fontBold, color: textWhite });
  }

  // ==================== SLIDE 2: THE PROBLEM ====================
  {
    const page = addBaseSlide(2, 'Market Friction', 'The Broken Reality of Franchise Expansion', 'Why 85% of successful single-location businesses fail when attempting multi-city scale.');

    const problems = [
      {
        title: '1. Uncodified "Tribal" Knowledge',
        desc: 'Daily kitchen recipes and customer service protocols exist only inside the founder\'s head. When scaling to store #3, quality collapses, ratings plummet, and units shut down within 18 months.',
        color: rgb(239 / 255, 68 / 255, 68 / 255),
      },
      {
        title: '2. Legal Non-Compliance & IP Risk',
        desc: 'Most regional franchisors lack standardized Franchise Disclosure Documents (23-Item FDD) and formal Class 43/35 trademarks. Territory overlap sparks legal disputes and brand value destruction.',
        color: rgb(245 / 255, 158 / 255, 11 / 255),
      },
      {
        title: '3. Blind Capital Allocation by Investors',
        desc: 'Investors commit Rs.30L to Rs.1 Crore based on glossy brochures rather than audited Item 19 Financial Performance Representations (FPR). Rental deposits and fitout overruns wipe out liquidity.',
        color: rgb(99 / 255, 102 / 255, 241 / 255),
      },
      {
        title: '4. Inefficient Offline Brokerage',
        desc: 'Traditional brokers charge 6-8% commissions while circulating unverified WhatsApp buyer leads to 10 competing brands, leaking private financials with zero transparency or data security.',
        color: rgb(236 / 255, 72 / 255, 153 / 255),
      },
    ];

    const w = 330;
    const h = 180;
    problems.forEach((p, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 50 + col * (w + 32);
      const y = pageHeight - 160 - row * (h + 20) - h;

      page.drawRectangle({ x, y, width: w, height: h, color: cardBg, borderColor: p.color, borderWidth: 1 });
      page.drawRectangle({ x, y: y + h - 5, width: w, height: 5, color: p.color });

      page.drawText(p.title, { x: x + 18, y: y + h - 30, size: 12, font: fontBold, color: textWhite });

      // Split text into lines
      const words = p.desc.split(' ');
      let line = '';
      let curY = y + h - 55;
      for (const word of words) {
        if ((line + word).length > 42) {
          page.drawText(line, { x: x + 18, y: curY, size: 9.5, font: fontRegular, color: textSlate });
          line = word + ' ';
          curY -= 16;
        } else {
          line += word + ' ';
        }
      }
      if (line) page.drawText(line, { x: x + 18, y: curY, size: 9.5, font: fontRegular, color: textSlate });
    });
  }

  // ==================== SLIDE 3: THE SOLUTION ====================
  {
    const page = addBaseSlide(3, 'Our Platform', 'FranchiseBridge: The Complete Digital Ecosystem', 'A vertically integrated, tech-first operating system for the entire franchise lifecycle.');

    const pillars = [
      { name: 'SOP Codification Engine', desc: 'Digital operations manuals with step-by-step kitchen prep & opening checklists. Direct PDF export for staff.', color: blueBorder, titleCol: textBlue },
      { name: 'FDD Legal Vault', desc: 'Institutional 23-Item Franchise Disclosure Document packet repository with certified Item 19 FPR disclosures.', color: goldBorder, titleCol: textGold },
      { name: 'AI Readiness Benchmark', desc: '8-pillar diagnostic scoring unit economics, brand strength, repeatability, and expansion bandwidth (0-100 score).', color: greenBorder, titleCol: textGreen },
      { name: 'Smart Weighted Match', desc: '6-factor compatibility engine: Budget (30%), Location (20%), Industry (20%), Experience, Units, Timeline.', color: blueBorder, titleCol: textBlue },
      { name: 'Digital Deal Rooms', desc: '256-bit encrypted negotiation workspaces with mutual NDAs, live chat, shared vaults, and 1-click legal e-signatures.', color: goldBorder, titleCol: textGold },
      { name: 'Capex Cost Estimator', desc: 'Interactive calculator projecting Low, Base, and High capex scenarios, rental deposits, margins, and break-even months.', color: greenBorder, titleCol: textGreen },
    ];

    const w = 215;
    const h = 175;
    pillars.forEach((p, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = 50 + col * (w + 23);
      const y = pageHeight - 150 - row * (h + 20) - h;

      page.drawRectangle({ x, y, width: w, height: h, color: cardBg, borderColor: p.color, borderWidth: 1 });
      page.drawText(p.name, { x: x + 15, y: y + h - 28, size: 11, font: fontBold, color: p.titleCol });

      const words = p.desc.split(' ');
      let line = '';
      let curY = y + h - 50;
      for (const word of words) {
        if ((line + word).length > 30) {
          page.drawText(line, { x: x + 15, y: curY, size: 9, font: fontRegular, color: textSlate });
          line = word + ' ';
          curY -= 15;
        } else {
          line += word + ' ';
        }
      }
      if (line) page.drawText(line, { x: x + 15, y: curY, size: 9, font: fontRegular, color: textSlate });
    });
  }

  // ==================== SLIDE 4: TARGET STAKEHOLDERS ====================
  {
    const page = addBaseSlide(4, 'Stakeholder Ecosystem', 'Target Stakeholders & User Personas', 'Connecting all four core participants in commercial franchise development.');

    const personas = [
      { role: 'Business Owners (Franchisors)', roleType: 'Supply Side', bullets: ['Proven local brands with 2-10 outlets', 'Goal: Scale nationally without equity dilution', 'Needs: SOP codification, FDD legal pack, vetted investors'], color: textBlue, border: blueBorder },
      { role: 'Accredited Investors (Franchisees)', roleType: 'Demand Side', bullets: ['HNIs, corporate executives & multi-unit operators', 'Capital: Rs.30 Lakhs to Rs.2 Crore liquid funds', 'Needs: Audited Item 19 unit economics & due diligence'], color: textGold, border: goldBorder },
      { role: 'Platform Brokers & Deal Leads', roleType: 'Facilitators', bullets: ['Senior franchise consultants & advisory partners', 'Goal: Accelerate deal velocity and closing rates', 'Needs: Digital Deal Rooms, pipeline CRM & escrow tracking'], color: textGreen, border: greenBorder },
      { role: 'Compliance Admins & Legal', roleType: 'Governance', bullets: ['Platform legal counsel & compliance officers', 'Goal: Eliminate fraud and misrepresentation', 'Needs: Strict KYC checks, 256-bit encryption & audit logs'], color: rgb(192 / 255, 132 / 255, 252 / 255), border: rgb(168 / 255, 85 / 255, 247 / 255) },
    ];

    const w = 330;
    const h = 180;
    personas.forEach((p, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 50 + col * (w + 32);
      const y = pageHeight - 160 - row * (h + 20) - h;

      page.drawRectangle({ x, y, width: w, height: h, color: cardBg, borderColor: p.border, borderWidth: 1 });
      page.drawText(p.role, { x: x + 15, y: y + h - 25, size: 11, font: fontBold, color: p.color });
      page.drawText(p.roleType.toUpperCase(), { x: x + 15, y: y + h - 42, size: 7.5, font: fontBold, color: textSlate });

      let curY = y + h - 65;
      p.bullets.forEach((b) => {
        page.drawText('• ' + b, { x: x + 15, y: curY, size: 9, font: fontRegular, color: textWhite });
        curY -= 20;
      });
    });
  }

  // ==================== SLIDE 5: VALUE PROPOSITION ====================
  {
    const page = addBaseSlide(5, 'Competitive Edge', 'Core Value Proposition & Differentiators', 'Why FranchiseBridge transforms an opaque industry into an institutional asset class.');

    // 4 Top Metrics
    const metrics = [
      { val: '300%', lbl: 'Faster Deal Velocity', col: textBlue },
      { val: '100%', lbl: 'Audited FDD Compliance', col: textGold },
      { val: '94%+', lbl: 'Match Compatibility', col: textGreen },
      { val: '1-Click', lbl: 'Legal E-Signature', col: rgb(192 / 255, 132 / 255, 252 / 255) },
    ];
    metrics.forEach((m, idx) => {
      const x = 50 + idx * 175;
      page.drawRectangle({ x, y: pageHeight - 210, width: 160, height: 75, color: cardBg, borderColor: goldBorder, borderWidth: 0.5 });
      page.drawText(m.val, { x: x + 20, y: pageHeight - 170, size: 24, font: fontBold, color: m.col });
      page.drawText(m.lbl, { x: x + 20, y: pageHeight - 195, size: 8.5, font: fontBold, color: textSlate });
    });

    // 2 Feature Cards
    const featY = pageHeight - 440;
    const featW = 335;
    const featH = 200;

    page.drawRectangle({ x: 50, y: featY, width: featW, height: featH, color: cardBg, borderColor: goldBorder, borderWidth: 1 });
    page.drawText('Institutional Due Diligence (13 Categories)', { x: 70, y: featY + featH - 30, size: 12, font: fontBold, color: textGold });
    const ddPoints = [
      'Corporate Entity Verification (MCA Incorporation & DIN)',
      'Registered Trademark Protection (Class 43 & 35)',
      '3-Year Audited Financial Statements & Tax Filings',
      'Certified FDD 23-Item Compliance Packet',
      'Centralized Vendor Agreements & Supply Chain SLAs',
      'Royalty Escrow & Marketing Fund Accountability',
    ];
    let curY = featY + featH - 55;
    ddPoints.forEach((pt) => {
      page.drawText('> ' + pt, { x: 70, y: curY, size: 9, font: fontRegular, color: textWhite });
      curY -= 22;
    });

    page.drawRectangle({ x: 405, y: featY, width: featW, height: featH, color: cardBg, borderColor: blueBorder, borderWidth: 1 });
    page.drawText('Dynamic Capex Modeling & Break-Even', { x: 425, y: featY + featH - 30, size: 12, font: fontBold, color: textBlue });
    const capexPoints = [
      'Interactive Store Area Sliders (300 to 4,000 sq.ft)',
      'Tier 1 vs Tier 2 Market Rental Adjustments',
      'Itemized Interior Fitout & Kitchen Hardware Capex',
      '6-Month Real Estate Security Deposit Reserves',
      'Low, Medium, and High Scenario Comparison Cards',
      'Payback Horizon & Monthly EBITDA Projections',
    ];
    curY = featY + featH - 55;
    capexPoints.forEach((pt) => {
      page.drawText('> ' + pt, { x: 425, y: curY, size: 9, font: fontRegular, color: textWhite });
      curY -= 22;
    });
  }

  // ==================== SLIDE 6: PRODUCT & TECH ARCHITECTURE ====================
  {
    const page = addBaseSlide(6, 'Engineering Architecture', 'Product & Technical Architecture', 'Enterprise-grade full-stack architecture built for high security, scale, and compliance.');

    const layers = [
      { title: 'Frontend App (Next.js 15)', bullets: ['Next.js 15 App Router (Port 3005)', 'React 19 with 100% TypeScript', 'Tailwind CSS luxury dark & gold UI', '30 verified routes compiled with 0 errors', 'Floating Franchise AI Advisor widget'], border: blueBorder, col: textBlue },
      { title: 'Backend API Gateway (Express)', bullets: ['Node.js & Express RESTful services', 'Mongoose modular document models', 'Multer PDF upload & signed storage', 'HttpOnly secure JWT session cookies', '100% Vitest unit test suite passing'], border: goldBorder, col: textGold },
      { title: 'Security & Cloud Infrastructure', bullets: ['MongoDB Atlas cloud database cluster', '256-bit encrypted Digital Deal Rooms', '1-Click cryptographic e-signature logs', 'Indian Contract & IP statutory rules engine', 'Decoupled Vercel & Render hosting'], border: greenBorder, col: textGreen },
    ];

    const w = 215;
    const h = 330;
    layers.forEach((l, idx) => {
      const x = 50 + idx * (w + 23);
      const y = pageHeight - 150 - h;

      page.drawRectangle({ x, y, width: w, height: h, color: cardBg, borderColor: l.border, borderWidth: 1 });
      page.drawText(l.title, { x: x + 15, y: y + h - 30, size: 12, font: fontBold, color: l.col });

      let curY = y + h - 60;
      l.bullets.forEach((b) => {
        page.drawText('• ' + b, { x: x + 15, y: curY, size: 9, font: fontRegular, color: textWhite });
        curY -= 28;
      });
    });
  }

  // ==================== SLIDE 7: 6-STAGE LIFECYCLE ====================
  {
    const page = addBaseSlide(7, 'Operating Workflow', 'The 6-Stage Franchise Deal Lifecycle', 'How franchisors and investors transition from initial onboarding to legal territory closing.');

    const steps = [
      { step: '01', title: 'Brand Onboarding', desc: 'Franchisor lists brand, uploads operational SOPs, and defines target expansion cities.' },
      { step: '02', title: 'AI Readiness Benchmark', desc: '8-pillar evaluation scores unit economics and legal compliance to award Certified Ready status.' },
      { step: '03', title: 'Smart Algorithmic Match', desc: 'Investors discover opportunities matching capital, preferred industry, and target geography.' },
      { step: '04', title: 'Broker Vetting & Intro', desc: 'Platform broker verifies investor liquid net worth before scheduling discovery calls.' },
      { step: '05', title: 'Digital Deal Room', desc: 'Parties sign mutual NDA, review private Item 19 FPR financials, and negotiate territory terms.' },
      { step: '06', title: '1-Click E-Sign & Close', desc: 'All parties execute Master Agreement; fee escrow released; turnkey store fitout begins.' },
    ];

    steps.forEach((s, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const w = 215;
      const h = 150;
      const x = 50 + col * (w + 23);
      const y = pageHeight - 150 - row * (h + 20) - h;

      page.drawRectangle({ x, y, width: w, height: h, color: cardBg, borderColor: goldBorder, borderWidth: 0.8 });
      page.drawText(s.step, { x: x + 15, y: y + h - 28, size: 16, font: fontBold, color: textGold });
      page.drawText(s.title, { x: x + 48, y: y + h - 25, size: 11, font: fontBold, color: textWhite });

      const words = s.desc.split(' ');
      let line = '';
      let curY = y + h - 55;
      for (const word of words) {
        if ((line + word).length > 30) {
          page.drawText(line, { x: x + 15, y: curY, size: 9, font: fontRegular, color: textSlate });
          line = word + ' ';
          curY -= 15;
        } else {
          line += word + ' ';
        }
      }
      if (line) page.drawText(line, { x: x + 15, y: curY, size: 9, font: fontRegular, color: textSlate });
    });
  }

  // ==================== SLIDE 8: MARKET OPPORTUNITY ====================
  {
    const page = addBaseSlide(8, 'Total Addressable Market', 'Market Opportunity & Industry Tailwinds', 'Capturing India\'s explosive retail consumption and franchise expansion boom.');

    const stats = [
      { val: '$51 Billion', lbl: 'Indian Franchise Market (2024)', col: textGold },
      { val: '$140 Billion', lbl: 'Projected Market Size by 2030', col: textBlue },
      { val: '30%+ CAGR', lbl: 'Annual Industry Growth Rate', col: textGreen },
    ];
    stats.forEach((s, idx) => {
      const x = 50 + idx * 235;
      page.drawRectangle({ x, y: pageHeight - 220, width: 220, height: 85, color: cardBg, borderColor: s.col, borderWidth: 1 });
      page.drawText(s.val, { x: x + 20, y: pageHeight - 170, size: 26, font: fontBold, color: s.col });
      page.drawText(s.lbl, { x: x + 20, y: pageHeight - 200, size: 9, font: fontBold, color: textSlate });
    });

    const boxY = pageHeight - 460;
    page.drawRectangle({ x: 50, y: boxY, width: 692, height: 220, color: cardBg, borderColor: blueBorder, borderWidth: 1 });
    page.drawText('Key Industry Growth Drivers:', { x: 70, y: boxY + 185, size: 14, font: fontBold, color: textWhite });

    const drivers = [
      { t: '1. Tier 2 & 3 Metro Expansion:', d: 'Sprawling consumer affluence in Pune, Hyderabad, Ahmedabad, and Jaipur demands national brands.' },
      { t: '2. Surge in Domestic Capital:', d: 'Rising corporate executives and domestic family offices seeking passive cash flow from multi-unit franchises.' },
      { t: '3. Digital Formalization:', d: 'Transition from unorganized offline brokers to compliant, audit-ready platforms with escrow transparency.' },
    ];

    let dY = boxY + 145;
    drivers.forEach((drv) => {
      page.drawText(drv.t, { x: 70, y: dY, size: 11, font: fontBold, color: textGold });
      page.drawText(drv.d, { x: 70, y: dY - 18, size: 9.5, font: fontRegular, color: textSlate });
      dY -= 45;
    });
  }

  // ==================== SLIDE 9: BUSINESS & REVENUE MODEL ====================
  {
    const page = addBaseSlide(9, 'Monetization Architecture', 'Diversified High-Margin Revenue Model', 'Four distinct, recurring revenue streams built into the platform architecture.');

    const streams = [
      { title: '1. Franchise Deal Commission', type: 'Transactional (4% - 7%)', desc: 'Success fee charged on upfront franchise fee upon deal closing inside the Digital Deal Room (Avg: Rs.1.5L - Rs.4.0L per unit).', col: textGold, border: goldBorder },
      { title: '2. SOP & FDD Retainers', type: 'Advisory (Rs.2.5L - Rs.5.0L)', desc: 'Fixed packaging fee charged to emerging businesses to codify SOP manuals, compile 23-Item FDD packets, and audit trademarks.', col: textBlue, border: blueBorder },
      { title: '3. Franchisor SaaS Portal', type: 'Recurring ARR (Rs.15K - Rs.35K/mo)', desc: 'Monthly cloud subscription for franchisors to track multi-unit outlets, manager performance, SOP audits, and expansion milestones.', col: textGreen, border: greenBorder },
      { title: '4. Featured Marketplace Placement', type: 'Advertising (Rs.50K - Rs.1.2L)', desc: 'Priority algorithm ranking and sponsored homepage banner placements for brands aggressively scaling in specific metro clusters.', col: textWhite, border: blueBorder },
    ];

    const w = 330;
    const h = 160;
    streams.forEach((s, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 50 + col * (w + 32);
      const y = pageHeight - 160 - row * (h + 20) - h;

      page.drawRectangle({ x, y, width: w, height: h, color: cardBg, borderColor: s.border, borderWidth: 1 });
      page.drawText(s.title, { x: x + 15, y: y + h - 25, size: 12, font: fontBold, color: s.col });
      page.drawText(s.type, { x: x + 15, y: y + h - 42, size: 9, font: fontBold, color: textSlate });

      const words = s.desc.split(' ');
      let line = '';
      let curY = y + h - 68;
      for (const word of words) {
        if ((line + word).length > 42) {
          page.drawText(line, { x: x + 15, y: curY, size: 9.5, font: fontRegular, color: textWhite });
          line = word + ' ';
          curY -= 18;
        } else {
          line += word + ' ';
        }
      }
      if (line) page.drawText(line, { x: x + 15, y: curY, size: 9.5, font: fontRegular, color: textWhite });
    });
  }

  // ==================== SLIDE 10: FINANCIAL UNIT ECONOMICS ====================
  {
    const page = addBaseSlide(10, 'Financial Model', 'Financial & Unit Economics Case Study', 'Audited unit economics prototype based on RoastCraft Specialty Coffee model.');

    // Left Table Card
    page.drawRectangle({ x: 50, y: 130, width: 330, height: 340, color: cardBg, borderColor: blueBorder, borderWidth: 1 });
    page.drawText('Standard 1,200 sq.ft Turnkey Capex', { x: 70, y: 440, size: 12, font: fontBold, color: textBlue });

    const rows = [
      { item: 'Interior Fitout & Architecture', val: 'Rs. 21,60,000', pct: '38%' },
      { item: 'Equipment & Kitchen POS Hardware', val: 'Rs. 12,00,000', pct: '21%' },
      { item: 'Real Estate Security Deposit (6 Mos)', val: 'Rs. 10,08,000', pct: '18%' },
      { item: 'Upfront Franchise Brand Fee', val: 'Rs.  8,00,000', pct: '14%' },
      { item: 'Opening Raw Material Inventory', val: 'Rs.  3,50,000', pct: '6%' },
      { item: 'Working Capital Reserve Buffer', val: 'Rs.  2,00,000', pct: '3%' },
      { item: 'TOTAL TURNKEY CAPEX', val: 'Rs. 57,18,000', pct: '100%' },
    ];

    let rowY = 405;
    rows.forEach((r, idx) => {
      const isTotal = idx === rows.length - 1;
      const col = isTotal ? textGold : textWhite;
      const fn = isTotal ? fontBold : fontRegular;
      page.drawText(r.item, { x: 70, y: rowY, size: 8.5, font: fn, color: col });
      page.drawText(r.val, { x: 270, y: rowY, size: 8.5, font: fn, color: col });
      page.drawText(r.pct, { x: 345, y: rowY, size: 8.5, font: fn, color: col });
      rowY -= 35;
    });

    // Right Economics Card
    page.drawRectangle({ x: 410, y: 130, width: 332, height: 340, color: cardBg, borderColor: goldBorder, borderWidth: 1 });
    page.drawText('Operating Returns & Franchisee Payback', { x: 430, y: 440, size: 12, font: fontBold, color: textGold });

    const kpis = [
      { lbl: 'MONTHLY GROSS REVENUE', val: 'Rs. 18.50 Lakhs' },
      { lbl: 'OPERATING EBITDA MARGIN', val: '22.4% (Rs. 4.15 Lakhs/mo)' },
      { lbl: 'FRANCHISEE PAYBACK PERIOD', val: '18 to 22 Months' },
      { lbl: 'FRANCHISOR RECURRING ROYALTY', val: '5% of Gross Sales (Rs. 92,500/mo)' },
    ];

    let kpiY = 385;
    kpis.forEach((k) => {
      page.drawRectangle({ x: 430, y: kpiY - 15, width: 290, height: 50, color: rgb(8 / 255, 13 / 255, 24 / 255), borderColor: goldBorder, borderWidth: 0.5 });
      page.drawText(k.lbl, { x: 445, y: kpiY + 18, size: 8, font: fontBold, color: textSlate });
      page.drawText(k.val, { x: 445, y: kpiY - 2, size: 12, font: fontBold, color: textGreen });
      kpiY -= 65;
    });
  }

  // ==================== SLIDE 11: COMPETITIVE ADVANTAGE ====================
  {
    const page = addBaseSlide(11, 'Defensibility', 'Competitive Landscape & Defensible Moat', 'How FranchiseBridge creates high switching barriers and institutional trust.');

    page.drawRectangle({ x: 50, y: 150, width: 692, height: 320, color: cardBg, borderColor: goldBorder, borderWidth: 1 });

    // Table Header
    page.drawText('CAPABILITY', { x: 70, y: 440, size: 9, font: fontBold, color: textSlate });
    page.drawText('TRADITIONAL PORTALS', { x: 240, y: 440, size: 9, font: fontBold, color: textSlate });
    page.drawText('OFFLINE LAW/BROKERS', { x: 430, y: 440, size: 9, font: fontBold, color: textSlate });
    page.drawText('FRANCHISEBRIDGE (TM)', { x: 600, y: 440, size: 9, font: fontBold, color: textGold });

    page.drawLine({ start: { x: 70, y: 425 }, end: { x: 720, y: 425 }, thickness: 1, color: lineSeparator, opacity: 0.1 });

    const compRows = [
      { cap: 'Investor Matching', p1: 'Unfiltered lead selling', p2: 'Manual cold intros', fb: '6-Factor Weighted Fit' },
      { cap: 'SOP & FDD Packaging', p1: 'None', p2: 'Rs.10L+ slow offline fees', fb: 'Built-in Cloud Vault' },
      { cap: 'Confidential Deal Rooms', p1: 'WhatsApp / Email spam', p2: 'Physical hotel meetings', fb: '256-Bit Encrypted Rooms' },
      { cap: 'Financial Due Diligence', p1: 'Unverified brochure claims', p2: 'Ad-hoc P&L review', fb: '13-Pillar Institutional Audit' },
      { cap: 'Closing & Signatures', p1: 'Paper courier contracts', p2: 'Physical stamp paper delay', fb: '1-Click Cryptographic Sign' },
    ];

    let compY = 390;
    compRows.forEach((r) => {
      page.drawText(r.cap, { x: 70, y: compY, size: 9, font: fontBold, color: textWhite });
      page.drawText(r.p1, { x: 240, y: compY, size: 8.5, font: fontRegular, color: textSlate });
      page.drawText(r.p2, { x: 430, y: compY, size: 8.5, font: fontRegular, color: textSlate });
      page.drawText(r.fb, { x: 600, y: compY, size: 9, font: fontBold, color: textGreen });
      compY -= 45;
    });

    page.drawRectangle({ x: 50, y: 70, width: 692, height: 60, color: rgb(37 / 255, 99 / 255, 235 / 255), opacity: 0.15, borderColor: blueBorder, borderWidth: 1 });
    page.drawText('THE FRANCHISEBRIDGE MOAT: High density of verified multi-unit operators combined with codified operational', { x: 70, y: 105, size: 9, font: fontBold, color: textBlue });
    page.drawText('SOP manuals makes FranchiseBridge the indispensable operating backbone for scaling consumer brands.', { x: 70, y: 88, size: 9, font: fontRegular, color: textWhite });
  }

  // ==================== SLIDE 12: EXECUTION ROADMAP ====================
  {
    const page = addBaseSlide(12, 'Strategic Roadmap', 'Execution Milestones & 2026-2027 Horizons', 'Clear roadmap from operational prototype to nationwide enterprise dominance.');

    const phases = [
      { phase: 'Phase 1: Core Platform', period: 'Q1 2026 • COMPLETED', bullets: ['All 20 master modules built', 'AI readiness & chatbot live', 'Deal Room & E-Signatures', 'SOP upload & FDD facility'], border: greenBorder, col: textGreen },
      { phase: 'Phase 2: Cloud Launch', period: 'Q2 2026 • IN PROGRESS', bullets: ['MongoDB Atlas cloud cluster', 'Vercel frontend & Render API', 'Onboard 25 regional brands', '100 vetted investors in pipeline'], border: blueBorder, col: textBlue },
      { phase: 'Phase 3: Scale & Escrow', period: 'Q3-Q4 2026 • UPCOMING', bullets: ['Integrated banking escrow API', 'Native mobile app (iOS/Android)', 'Launch in 12 Tier 1 & 2 cities', 'Target Rs.15 Cr closed pipeline'], border: goldBorder, col: textGold },
      { phase: 'Phase 4: Market Leader', period: '2027 • STRATEGIC VISION', bullets: ['Cross-border GCC/SE Asia scale', 'Private credit debt syndication', '500+ active franchise concepts', 'Rs.100 Cr+ annual deal GMV'], border: rgb(192 / 255, 132 / 255, 252 / 255), col: rgb(192 / 255, 132 / 255, 252 / 255) },
    ];

    const w = 160;
    const h = 330;
    phases.forEach((p, idx) => {
      const x = 50 + idx * (w + 17);
      const y = pageHeight - 150 - h;

      page.drawRectangle({ x, y, width: w, height: h, color: cardBg, borderColor: p.border, borderWidth: 1 });
      page.drawText(p.period, { x: x + 12, y: y + h - 25, size: 7.5, font: fontBold, color: p.col });
      page.drawText(p.phase, { x: x + 12, y: y + h - 45, size: 10, font: fontBold, color: textWhite });

      let curY = y + h - 80;
      p.bullets.forEach((b) => {
        page.drawText('• ' + b, { x: x + 12, y: curY, size: 8.5, font: fontRegular, color: textSlate });
        curY -= 35;
      });
    });
  }

  // Save PDF
  const pdfBytes = await doc.save();
  const outputPath = path.join(process.cwd(), 'FranchiseBridge_12_Page_Executive_Deck.pdf');
  fs.writeFileSync(outputPath, pdfBytes);

  // Also save a copy to uploads so it can be downloaded directly from backend static server
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const uploadsPath = path.join(uploadsDir, 'FranchiseBridge_12_Page_Executive_Deck.pdf');
  fs.writeFileSync(uploadsPath, pdfBytes);

  console.log(`[DeckPdf] 12-page Business Pitch Deck generated successfully!`);
  console.log(`[DeckPdf] Local Path: ${outputPath}`);
  console.log(`[DeckPdf] Uploads Path: ${uploadsPath}`);

  return outputPath;
}

if (require.main === module) {
  generateDeckPdf().catch(console.error);
}
