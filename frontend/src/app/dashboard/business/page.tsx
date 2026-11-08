"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  TrendingUp,
  FileText,
  Users,
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
  Scale,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Upload,
  ExternalLink,
  Download,
  Store,
  Compass,
  MapPin,
  Check,
  Briefcase,
  Send,
  Edit3,
  XCircle,
  Info,
  Layers,
  IndianRupee,
  Eye,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";

export default function BusinessDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "overview" | "opportunities" | "readiness" | "outlets" | "roadmap" | "sops" | "legal" | "applications" | "meetings"
  >("overview");
  const [businessData, setBusinessData] = useState<any | null>(null);
  const [profileCompletion, setProfileCompletion] = useState<number>(0);
  const [assessment, setAssessment] = useState<any | null>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [sops, setSops] = useState<any[]>([]);
  const [legalDocs, setLegalDocs] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [expansionPlan, setExpansionPlan] = useState<any | null>(null);
  const [isAddOutletOpen, setIsAddOutletOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [newOutlet, setNewOutlet] = useState({
    outletName: "",
    unitCode: "",
    storeType: "standard",
    city: "",
    state: "",
    address: "",
    sizeSqFt: 1200,
    managerName: "",
    managerPhone: "",
    monthlyRevenue: 0,
    status: "operating",
    fitoutProgressPercent: 100,
  });

  // SOP Modal state & PDF file upload
  const [isSopModalOpen, setIsSopModalOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [isUploadingSop, setIsUploadingSop] = useState(false);
  const [sopForm, setSopForm] = useState({
    title: "",
    category: "daily_operations",
    summary: "",
    checklist1: "",
    checklist2: "",
    checklist3: "",
  });

  // Profile Form state (Milestone 3 Enhanced)
  const [profileForm, setProfileForm] = useState({
    businessName: "",
    legalBusinessName: "",
    brandName: "",
    logoUrl: "",
    category: "Food & Beverage",
    industry: "Quick Service Restaurant",
    founderName: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    websiteUrl: "",
    establishedYear: 2021,
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    operatingLocations: "Mumbai, Pune",
    numberOfOutlets: 2,
    outletsSummary: "",
    description: "",
    businessModel: "FOCO / FOFO",
    expansionGoals: "",
    estimatedInvestmentMin: 2500000,
    estimatedInvestmentMax: 5000000,
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Franchise Opportunity Modal state (Milestone 3)
  const [isCreateOppModalOpen, setIsCreateOppModalOpen] = useState(false);
  const [isEditingOpp, setIsEditingOpp] = useState(false);
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [oppSubmitting, setOppSubmitting] = useState(false);

  const defaultOppForm = {
    opportunityTitle: "",
    brandName: "",
    category: "Food & Beverage",
    industry: "Quick Service Restaurant",
    businessModel: "FOFO",
    totalInvestmentMin: 2500000,
    totalInvestmentMax: 4500000,
    initialFranchiseFee: 500000,
    setupCosts: 1200000,
    equipmentCosts: 600000,
    workingCapitalEstimate: 200000,
    royaltyPercentage: 6,
    royaltyDescription: "6% monthly gross revenue royalty",
    commercialSpaceMinSqFt: 350,
    commercialSpaceMaxSqFt: 800,
    staffRequiredMin: 3,
    staffRequiredMax: 6,
    trainingDurationWeeks: 2,
    trainingSupportDetails: "2-week comprehensive staff, kitchen, ERP and store manager training",
    targetLocations: "Mumbai, Pune, Bengaluru",
    availableTerritories: "West Zone, South Zone",
    expectedOpeningTimelineMonths: 2,
    idealFranchiseeProfile: "Motivated entrepreneur with retail or F&B experience and ₹30L+ liquid investment capacity",
    summary: "Proven high-volume franchise model with standardized operational SOPs and rapid ROI",
    brandStory: "A celebrated brand delivering consistent quality, high repeat customers, and unit economics",
    status: "DRAFT" as "DRAFT" | "SUBMITTED",
  };

  const [oppForm, setOppForm] = useState(defaultOppForm);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 6000);
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    async function loadDashboardData() {
      try {
        setLoading(true);
        const [bizRes, oppRes, appRes, sopRes, legalRes, meetRes, outletRes, planRes] = await Promise.all([
          api.get<{ business: any; assessment: any; profileCompletion?: number }>("/businesses/my"),
          api.get<any[]>("/franchises/my"),
          api.get<any[]>("/applications/business"),
          api.get<any[]>("/documents/sop"),
          api.get<any[]>("/documents/legal"),
          api.get<any[]>("/meetings/my"),
          api.get<any[]>("/expansion/outlets"),
          api.get<any>("/expansion/plan"),
        ]);

        if (bizRes.success && bizRes.data) {
          const b = bizRes.data.business;
          setBusinessData(b);
          setAssessment(bizRes.data.assessment);
          setProfileCompletion(bizRes.data.profileCompletion || 0);

          if (b) {
            setProfileForm({
              businessName: b.businessName || "",
              legalBusinessName: b.legalBusinessName || b.businessName || "",
              brandName: b.brandName || b.businessName || "",
              logoUrl: b.logoUrl || "",
              category: b.category || "Food & Beverage",
              industry: b.industry || "Quick Service Restaurant",
              founderName: b.founderName || "",
              contactPerson: b.contactPerson || b.founderName || "",
              contactEmail: b.contactEmail || user?.email || "",
              contactPhone: b.contactPhone || "",
              websiteUrl: b.websiteUrl || "",
              establishedYear: b.establishedYear || 2021,
              street: b.registeredAddress?.street || "",
              city: b.headquarters?.city || b.registeredAddress?.city || "",
              state: b.headquarters?.state || b.registeredAddress?.state || "",
              postalCode: b.registeredAddress?.postalCode || "",
              country: b.headquarters?.country || "India",
              operatingLocations: Array.isArray(b.operatingLocations) && b.operatingLocations.length > 0
                ? b.operatingLocations.join(", ")
                : (b.currentLocations || []).join(", "),
              numberOfOutlets: b.numberOfOutlets || 1,
              outletsSummary: b.outletsSummary || "",
              description: b.description || "",
              businessModel: b.businessModel || "FOCO / FOFO",
              expansionGoals: b.expansionGoals || "",
              estimatedInvestmentMin: b.estimatedInvestmentMin || 2500000,
              estimatedInvestmentMax: b.estimatedInvestmentMax || 5000000,
            });
          }
        }
        if (oppRes.success && oppRes.data) setOpportunities(oppRes.data);
        if (appRes.success && appRes.data) setApplications(appRes.data);
        if (sopRes.success && sopRes.data) setSops(sopRes.data);
        if (legalRes.success && legalRes.data) setLegalDocs(legalRes.data);
        if (meetRes.success && meetRes.data) setMeetings(meetRes.data);
        if (outletRes.success && outletRes.data) setOutlets(outletRes.data);
        if (planRes.success && planRes.data) setExpansionPlan(planRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user) loadDashboardData();
  }, [user, isLoading, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSubmitting(true);
    try {
      const locationsArr = profileForm.operatingLocations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        businessName: profileForm.businessName,
        legalBusinessName: profileForm.legalBusinessName || profileForm.businessName,
        brandName: profileForm.brandName || profileForm.businessName,
        logoUrl: profileForm.logoUrl,
        category: profileForm.category,
        industry: profileForm.industry,
        founderName: profileForm.founderName,
        contactPerson: profileForm.contactPerson,
        contactEmail: profileForm.contactEmail,
        contactPhone: profileForm.contactPhone,
        websiteUrl: profileForm.websiteUrl,
        establishedYear: Number(profileForm.establishedYear),
        headquarters: {
          city: profileForm.city,
          state: profileForm.state,
          country: profileForm.country || "India",
        },
        registeredAddress: {
          street: profileForm.street,
          city: profileForm.city,
          state: profileForm.state,
          postalCode: profileForm.postalCode,
          country: profileForm.country || "India",
        },
        operatingLocations: locationsArr,
        currentLocations: locationsArr,
        numberOfOutlets: Number(profileForm.numberOfOutlets),
        outletsSummary: profileForm.outletsSummary,
        description: profileForm.description,
        businessModel: profileForm.businessModel,
        expansionGoals: profileForm.expansionGoals,
        desiredExpansionCities: locationsArr,
        estimatedInvestmentMin: Number(profileForm.estimatedInvestmentMin),
        estimatedInvestmentMax: Number(profileForm.estimatedInvestmentMax),
      };

      const res = await api.post<any>("/businesses", payload);
      if (res.success && res.data) {
        setBusinessData(res.data);
        if (res.data.profileCompletion !== undefined) {
          setProfileCompletion(res.data.profileCompletion);
        }
        setIsEditingProfile(false);
        showFeedback("success", "Company profile saved and verified successfully!");
      }
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to update company profile");
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleSubmitProfileForReview = async () => {
    try {
      setProfileSubmitting(true);
      const res = await api.post<any>("/businesses/submit-review");
      if (res.success && res.data) {
        setBusinessData(res.data);
        showFeedback("success", "Brand company profile submitted for administrator approval!");
      }
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to submit profile for review");
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleOpenCreateOppModal = () => {
    setIsEditingOpp(false);
    setSelectedOppId(null);
    setOppForm({
      ...defaultOppForm,
      brandName: businessData?.brandName || businessData?.businessName || "",
      category: businessData?.category || "Food & Beverage",
      industry: businessData?.industry || "Quick Service Restaurant",
    });
    setIsCreateOppModalOpen(true);
  };

  const handleOpenEditOppModal = (opp: any) => {
    setIsEditingOpp(true);
    setSelectedOppId(opp._id);
    setOppForm({
      opportunityTitle: opp.opportunityTitle || opp.tagline || "",
      brandName: opp.brandName || businessData?.brandName || "",
      category: opp.category || opp.industry || "Food & Beverage",
      industry: opp.industry || "Quick Service Restaurant",
      businessModel: opp.businessModel || opp.franchiseModelType || "FOFO",
      totalInvestmentMin: opp.totalInvestmentMin || 2500000,
      totalInvestmentMax: opp.totalInvestmentMax || 4500000,
      initialFranchiseFee: opp.initialFranchiseFee || 500000,
      setupCosts: opp.setupCosts || 1200000,
      equipmentCosts: opp.equipmentCosts || 600000,
      workingCapitalEstimate: opp.workingCapitalEstimate || 200000,
      royaltyPercentage: opp.royaltyPercentage || 6,
      royaltyDescription: opp.royaltyStructure?.description || "6% monthly gross revenue royalty",
      commercialSpaceMinSqFt: opp.commercialSpaceMinSqFt || 350,
      commercialSpaceMaxSqFt: opp.commercialSpaceMaxSqFt || 800,
      staffRequiredMin: opp.staffRequiredMin || 3,
      staffRequiredMax: opp.staffRequiredMax || 6,
      trainingDurationWeeks: opp.trainingDurationWeeks || 2,
      trainingSupportDetails: opp.trainingSupportDetails || "",
      targetLocations: Array.isArray(opp.targetLocations) ? opp.targetLocations.join(", ") : (opp.expansionLocations || []).join(", "),
      availableTerritories: Array.isArray(opp.availableTerritories) ? opp.availableTerritories.join(", ") : "",
      expectedOpeningTimelineMonths: opp.expectedOpeningTimelineMonths || 2,
      idealFranchiseeProfile: opp.idealFranchiseeProfile || "",
      summary: opp.summary || "",
      brandStory: opp.brandStory || "",
      status: opp.status || "DRAFT",
    });
    setIsCreateOppModalOpen(true);
  };

  const handleSaveOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (oppForm.totalInvestmentMin > oppForm.totalInvestmentMax) {
      showFeedback("error", "Minimum investment cannot exceed maximum investment");
      return;
    }

    setOppSubmitting(true);
    try {
      const targetLocsArr = oppForm.targetLocations.split(",").map((s) => s.trim()).filter(Boolean);
      const terrArr = oppForm.availableTerritories.split(",").map((s) => s.trim()).filter(Boolean);

      const payload = {
        brandName: oppForm.brandName || businessData?.brandName || businessData?.businessName || "My Brand",
        opportunityTitle: oppForm.opportunityTitle,
        tagline: oppForm.opportunityTitle,
        category: oppForm.category,
        industry: oppForm.industry,
        businessModel: oppForm.businessModel,
        summary: oppForm.summary,
        brandStory: oppForm.brandStory,
        totalInvestmentMin: Number(oppForm.totalInvestmentMin),
        totalInvestmentMax: Number(oppForm.totalInvestmentMax),
        initialFranchiseFee: Number(oppForm.initialFranchiseFee),
        setupCosts: Number(oppForm.setupCosts),
        equipmentCosts: Number(oppForm.equipmentCosts),
        workingCapitalEstimate: Number(oppForm.workingCapitalEstimate),
        royaltyPercentage: Number(oppForm.royaltyPercentage),
        royaltyStructure: {
          type: "percentage",
          percentage: Number(oppForm.royaltyPercentage),
          description: oppForm.royaltyDescription,
        },
        commercialSpaceMinSqFt: Number(oppForm.commercialSpaceMinSqFt),
        commercialSpaceMaxSqFt: Number(oppForm.commercialSpaceMaxSqFt),
        spaceRequirements: {
          minSqFt: Number(oppForm.commercialSpaceMinSqFt),
          maxSqFt: Number(oppForm.commercialSpaceMaxSqFt),
          unit: "sq ft",
        },
        staffRequiredMin: Number(oppForm.staffRequiredMin),
        staffRequiredMax: Number(oppForm.staffRequiredMax),
        trainingDurationWeeks: Number(oppForm.trainingDurationWeeks),
        trainingSupportDetails: oppForm.trainingSupportDetails,
        supportProvided: ["Site Selection", "Store Design", "Training Academy", "Supply Chain"],
        idealFranchiseeProfile: oppForm.idealFranchiseeProfile,
        targetLocations: targetLocsArr,
        expansionLocations: targetLocsArr,
        availableTerritories: terrArr,
        expectedOpeningTimelineMonths: Number(oppForm.expectedOpeningTimelineMonths),
        status: oppForm.status,
      };

      if (isEditingOpp && selectedOppId) {
        const res = await api.patch<any>(`/franchises/${selectedOppId}`, payload);
        if (res.success && res.data) {
          setOpportunities((prev) => prev.map((o) => (o._id === selectedOppId ? res.data : o)));
          setIsCreateOppModalOpen(false);
          showFeedback("success", "Franchise opportunity updated successfully!");
        }
      } else {
        const res = await api.post<any>("/franchises", payload);
        if (res.success && res.data) {
          setOpportunities((prev) => [res.data, ...prev]);
          setIsCreateOppModalOpen(false);
          showFeedback("success", "Franchise opportunity created in DRAFT status!");
        }
      }
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to save franchise opportunity");
    } finally {
      setOppSubmitting(false);
    }
  };

  const handleSubmitOpportunityForReview = async (oppId: string) => {
    try {
      const res = await api.post<any>(`/franchises/${oppId}/submit`);
      if (res.success && res.data) {
        setOpportunities((prev) => prev.map((o) => (o._id === oppId ? res.data : o)));
        showFeedback("success", "Opportunity submitted to brokerage admins for compliance review!");
      }
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to submit opportunity");
    }
  };

  const handleCreateSop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessData) {
      alert("Please complete business profile first");
      return;
    }

    setIsUploadingSop(true);
    try {
      let fileUrl = "";
      let fileName = "";
      let fileSizeBytes = 0;
      let mimeType = "application/pdf";

      // 1. Upload PDF file if selected
      if (selectedPdf) {
        const formData = new FormData();
        formData.append("file", selectedPdf);
        const uploadRes = await api.upload<any>("/documents/upload", formData);
        if (uploadRes.success && uploadRes.data) {
          fileUrl = uploadRes.data.fileUrl;
          fileName = uploadRes.data.fileName;
          fileSizeBytes = uploadRes.data.fileSizeBytes;
          mimeType = uploadRes.data.mimeType;
        }
      }

      const checklists = [
        { item: sopForm.checklist1, isMandatory: true, completed: true },
        { item: sopForm.checklist2, isMandatory: true, completed: true },
        { item: sopForm.checklist3, isMandatory: false, completed: false },
      ].filter((c) => c.item.trim() !== "");

      const res = await api.post("/documents/sop", {
        businessId: businessData._id,
        title: sopForm.title,
        category: sopForm.category,
        summary: sopForm.summary,
        checklists,
        fileUrl: fileUrl || undefined,
        fileName: fileName || undefined,
        fileSizeBytes: fileSizeBytes || undefined,
        mimeType: mimeType || undefined,
      });

      if (res.success && res.data) {
        setSops([res.data, ...sops]);
        setIsSopModalOpen(false);
        setSelectedPdf(null);
        setSopForm({
          title: "",
          category: "daily_operations",
          summary: "",
          checklist1: "",
          checklist2: "",
          checklist3: "",
        });
        alert("SOP document and PDF uploaded successfully!");
      }
    } catch (err: any) {
      alert(err.message || "Failed to save SOP");
    } finally {
      setIsUploadingSop(false);
    }
  };

  const handleRunDiagnostic = async () => {
    if (!businessData) return;
    try {
      const res = await api.post("/businesses/readiness", {
        answers: {
          brandStrengthScore: 88,
          brandNotes: "Strong local following and consistent repeat traffic",
          unitEconomicsScore: 84,
          unitEconomicsNotes: "EBITDA margins exceeding 20%",
          sopDocumentationScore: sops.length > 0 ? 82 : 45,
          sopNotes: "Core operational checklists codified",
          legalScore: legalDocs.length > 0 ? 85 : 40,
          legalNotes: "Trademark & disclosure preparation in progress",
          supplyChainScore: 80,
          supplyChainNotes: "Direct vendor supply contracts active",
          trainingScore: 78,
          trainingNotes: "2-week initial onboarding curriculum",
          repeatabilityScore: 86,
          repeatabilityNotes: "Proven across multiple locations",
          expansionCapacityScore: 82,
          expansionNotes: "Advisory team aligned for expansion",
        },
      });

      if (res.success && res.data) {
        setAssessment(res.data);
        setActiveTab("readiness");
      }
    } catch (err: any) {
      alert(err.message || "Failed to run readiness benchmark");
    }
  };

  const handleCreateOutlet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post<any>("/expansion/outlets", newOutlet);
      if (res.success && res.data) {
        setOutlets([res.data, ...outlets]);
        setIsAddOutletOpen(false);
        setNewOutlet({
          outletName: "",
          unitCode: "",
          storeType: "standard",
          city: "",
          state: "",
          address: "",
          sizeSqFt: 1200,
          managerName: "",
          managerPhone: "",
          monthlyRevenue: 0,
          status: "operating",
          fitoutProgressPercent: 100,
        });
      }
    } catch (err: any) {
      alert(err.message || "Failed to create outlet");
    }
  };

  const handleToggleMilestone = async (stageKey: string, currentStatus: string) => {
    const nextStatus = currentStatus === "completed" ? "in_progress" : "completed";
    try {
      const res = await api.put<any>("/expansion/milestone", { stageKey, status: nextStatus });
      if (res.success && res.data) {
        setExpansionPlan(res.data);
      }
    } catch (err: any) {
      console.error("Failed to update milestone", err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Initializing Business Portal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-blue-950 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/50 text-blue-300 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            Franchisor Expansion Headquarters
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {businessData?.brandName || businessData?.businessName || "Welcome to Your Business Portal"}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Package operational SOPs, maintain FDD legal disclosures, benchmark franchise readiness, and launch vetted franchise expansion opportunities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleOpenCreateOppModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create Franchise Opportunity
          </button>
          <button
            onClick={handleRunDiagnostic}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Recalculate Readiness Index
          </button>
          <button
            onClick={() => setIsSopModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add SOP Document
          </button>
        </div>
      </div>

      {/* Global Feedback Alert */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold border ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {feedbackMessage.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-xs font-semibold">
        {[
          { id: "overview", label: "Executive Overview", icon: TrendingUp },
          { id: "opportunities", label: `Franchise Opportunities (${opportunities.length})`, icon: Briefcase },
          { id: "readiness", label: "Franchise Readiness Index", icon: Sparkles },
          { id: "outlets", label: `Outlets (${outlets.length})`, icon: Store },
          { id: "roadmap", label: "Expansion Roadmap", icon: Compass },
          { id: "sops", label: `SOP Manuals (${sops.length})`, icon: FileText },
          { id: "legal", label: `Legal FDD (${legalDocs.length})`, icon: Scale },
          { id: "applications", label: `Investor Enquiries (${applications.length})`, icon: Users },
          { id: "meetings", label: `Advisory Meetings (${meetings.length})`, icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Profile Completion & Verification Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-bold text-navy-900">Brand Onboarding & Verification</h3>
                  <StatusBadge status={businessData?.approvalStatus || "DRAFT"} />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Complete your verified corporate credentials to pass brokerage compliance checks.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {["draft", "DRAFT", "rejected", "REJECTED"].includes(businessData?.approvalStatus || "DRAFT") && (
                  <button
                    onClick={handleSubmitProfileForReview}
                    disabled={profileSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {profileSubmitting ? "Submitting..." : "Submit Profile for Review"}
                  </button>
                )}
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isEditingProfile ? "Close Editor" : "Edit Profile"}
                </button>
              </div>
            </div>

            {/* Profile Completion Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Profile Readiness Completion</span>
                <span className="font-bold text-blue-600">{profileCompletion}% Complete</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    profileCompletion >= 80
                      ? "bg-emerald-500"
                      : profileCompletion >= 50
                      ? "bg-blue-500"
                      : "bg-amber-500"
                  }`}
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>

            {/* Rejection / Note banner if applicable */}
            {businessData?.rejectionReason && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Brokerage Compliance Rejection Feedback:
                </span>
                <p>{businessData.rejectionReason}</p>
              </div>
            )}

            {/* Checklist elements */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 text-[11px]">
              <div className={`p-3 rounded-xl border flex items-center gap-2 ${businessData?.legalBusinessName ? "bg-emerald-50/60 border-emerald-200 text-emerald-800" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                <Check className={`w-3.5 h-3.5 ${businessData?.legalBusinessName ? "text-emerald-600" : "text-slate-300"}`} />
                <span>Legal Entity</span>
              </div>
              <div className={`p-3 rounded-xl border flex items-center gap-2 ${businessData?.brandName ? "bg-emerald-50/60 border-emerald-200 text-emerald-800" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                <Check className={`w-3.5 h-3.5 ${businessData?.brandName ? "text-emerald-600" : "text-slate-300"}`} />
                <span>Brand Identity</span>
              </div>
              <div className={`p-3 rounded-xl border flex items-center gap-2 ${businessData?.registeredAddress?.city ? "bg-emerald-50/60 border-emerald-200 text-emerald-800" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                <Check className={`w-3.5 h-3.5 ${businessData?.registeredAddress?.city ? "text-emerald-600" : "text-slate-300"}`} />
                <span>Headquarters</span>
              </div>
              <div className={`p-3 rounded-xl border flex items-center gap-2 ${businessData?.contactPerson ? "bg-emerald-50/60 border-emerald-200 text-emerald-800" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                <Check className={`w-3.5 h-3.5 ${businessData?.contactPerson ? "text-emerald-600" : "text-slate-300"}`} />
                <span>Key Contact</span>
              </div>
              <div className={`p-3 rounded-xl border flex items-center gap-2 ${businessData?.numberOfOutlets ? "bg-emerald-50/60 border-emerald-200 text-emerald-800" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                <Check className={`w-3.5 h-3.5 ${businessData?.numberOfOutlets ? "text-emerald-600" : "text-slate-300"}`} />
                <span>Active Units</span>
              </div>
              <div className={`p-3 rounded-xl border flex items-center gap-2 ${businessData?.description ? "bg-emerald-50/60 border-emerald-200 text-emerald-800" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                <Check className={`w-3.5 h-3.5 ${businessData?.description ? "text-emerald-600" : "text-slate-300"}`} />
                <span>Value Prop</span>
              </div>
            </div>
          </div>

          {/* Key Metric Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase">Readiness Score</span>
              <div className="text-3xl font-extrabold text-navy-900 flex items-center gap-2">
                {assessment?.overallScore || businessData?.readinessScore || 85}
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  / 100
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Benchmark across 8 expansion dimensions</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase">Franchise Opportunities</span>
              <div className="text-3xl font-extrabold text-navy-900">{opportunities.length}</div>
              <p className="text-[11px] text-slate-500">
                {opportunities.filter((o) => o.status === "PUBLISHED" || o.status === "published").length} active in investor marketplace
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase">Investor Applications</span>
              <div className="text-3xl font-extrabold text-navy-900">{applications.length}</div>
              <p className="text-[11px] text-slate-500">Submitted by vetted multi-unit operators</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase">Operating Units</span>
              <div className="text-3xl font-extrabold text-navy-900">{businessData?.numberOfOutlets || 1}</div>
              <p className="text-[11px] text-slate-500">Proven company & franchise outlets</p>
            </div>
          </div>

          {/* Business Profile Review & Edit */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-navy-900">Brand Profile & Corporate Credentials</h3>
                <p className="text-xs text-slate-500">Legal entity, registered headquarters, and operational footprint</p>
              </div>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 px-3.5 py-1.5 rounded-lg flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditingProfile ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
                {/* 1. Brand & Legal Entity */}
                <div className="space-y-3">
                  <h4 className="font-bold text-navy-900 text-sm border-b pb-1">1. Legal Entity & Brand Identity</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Legal Business Name *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.legalBusinessName}
                        onChange={(e) => setProfileForm({ ...profileForm, legalBusinessName: e.target.value })}
                        placeholder="e.g. Blue Tokai Coffee Roasters Pvt Ltd"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Brand Name *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.brandName}
                        onChange={(e) => setProfileForm({ ...profileForm, brandName: e.target.value, businessName: e.target.value })}
                        placeholder="e.g. Blue Tokai Coffee Roasters"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Brand Logo URL</label>
                      <input
                        type="url"
                        value={profileForm.logoUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, logoUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Industry & Contacts */}
                <div className="space-y-3">
                  <h4 className="font-bold text-navy-900 text-sm border-b pb-1">2. Industry & Key Contact Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Franchise Category *</label>
                      <select
                        value={profileForm.category}
                        onChange={(e) => setProfileForm({ ...profileForm, category: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg bg-white"
                      >
                        <option value="Food & Beverage">Food & Beverage</option>
                        <option value="Retail">Retail</option>
                        <option value="Health & Wellness">Health & Wellness</option>
                        <option value="Education">Education</option>
                        <option value="Automotive">Automotive</option>
                        <option value="Beauty & Salon">Beauty & Salon</option>
                        <option value="Technology">Technology</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Specific Industry *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.industry}
                        onChange={(e) => setProfileForm({ ...profileForm, industry: e.target.value })}
                        placeholder="e.g. Specialty Coffee & Artisanal Bakery"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Established Year *</label>
                      <input
                        type="number"
                        required
                        min={1950}
                        max={2030}
                        value={profileForm.establishedYear}
                        onChange={(e) => setProfileForm({ ...profileForm, establishedYear: parseInt(e.target.value) || 2021 })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Managing Director / Founder *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.founderName}
                        onChange={(e) => setProfileForm({ ...profileForm, founderName: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Contact Person Name *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.contactPerson}
                        onChange={(e) => setProfileForm({ ...profileForm, contactPerson: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Contact Email *</label>
                      <input
                        type="email"
                        required
                        value={profileForm.contactEmail}
                        onChange={(e) => setProfileForm({ ...profileForm, contactEmail: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Contact Phone *</label>
                      <input
                        type="tel"
                        required
                        value={profileForm.contactPhone}
                        onChange={(e) => setProfileForm({ ...profileForm, contactPhone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Company Website URL</label>
                    <input
                      type="url"
                      value={profileForm.websiteUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, websiteUrl: e.target.value })}
                      placeholder="https://www.example.com"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                {/* 3. Registered Address & Operating Footprint */}
                <div className="space-y-3">
                  <h4 className="font-bold text-navy-900 text-sm border-b pb-1">3. Registered Address & Operating Footprint</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-medium mb-1">Street Address</label>
                      <input
                        type="text"
                        value={profileForm.street}
                        onChange={(e) => setProfileForm({ ...profileForm, street: e.target.value })}
                        placeholder="Corporate Office Building, Bandra Kurla Complex"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Headquarters City *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">State & PIN</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={profileForm.state}
                          onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                          placeholder="State"
                          className="w-1/2 px-3 py-2 border rounded-lg"
                        />
                        <input
                          type="text"
                          value={profileForm.postalCode}
                          onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                          placeholder="PIN Code"
                          className="w-1/2 px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-medium mb-1">Operating Locations (Comma-separated) *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.operatingLocations}
                        onChange={(e) => setProfileForm({ ...profileForm, operatingLocations: e.target.value })}
                        placeholder="Mumbai, Pune, Bengaluru, Delhi NCR"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Current Outlets Count *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={profileForm.numberOfOutlets}
                        onChange={(e) => setProfileForm({ ...profileForm, numberOfOutlets: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Outlets Operational Summary</label>
                    <input
                      type="text"
                      value={profileForm.outletsSummary}
                      onChange={(e) => setProfileForm({ ...profileForm, outletsSummary: e.target.value })}
                      placeholder="e.g. 14 flagship company-owned stores, 8 profitable franchise partner outlets"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                {/* 4. Business Description & Economics */}
                <div className="space-y-3">
                  <h4 className="font-bold text-navy-900 text-sm border-b pb-1">4. Mandate, Description & Economics</h4>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Company Description *</label>
                    <textarea
                      rows={3}
                      required
                      value={profileForm.description}
                      onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                      placeholder="Detailed overview of brand heritage, customer demographics, and competitive moat..."
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Primary Franchise Model</label>
                      <input
                        type="text"
                        value={profileForm.businessModel}
                        onChange={(e) => setProfileForm({ ...profileForm, businessModel: e.target.value })}
                        placeholder="FOFO, FOCO, Master Franchise"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Min Estimated Capex (₹)</label>
                      <input
                        type="number"
                        value={profileForm.estimatedInvestmentMin}
                        onChange={(e) => setProfileForm({ ...profileForm, estimatedInvestmentMin: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Max Estimated Capex (₹)</label>
                      <input
                        type="number"
                        value={profileForm.estimatedInvestmentMax}
                        onChange={(e) => setProfileForm({ ...profileForm, estimatedInvestmentMax: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Expansion Goals & Target Geographies *</label>
                    <textarea
                      rows={2}
                      required
                      value={profileForm.expansionGoals}
                      onChange={(e) => setProfileForm({ ...profileForm, expansionGoals: e.target.value })}
                      placeholder="e.g. Target 25 tier-1 metro clusters across Western and Southern India by Q4..."
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={profileSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {profileSubmitting ? "Saving Profile..." : "Save Company Profile"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Profile Header Display */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  {businessData?.logoUrl ? (
                    <img
                      src={businessData.logoUrl}
                      alt={businessData.brandName || "Logo"}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl">
                      {(businessData?.brandName || businessData?.businessName || "B")[0]}
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xl font-bold text-navy-900">
                        {businessData?.brandName || businessData?.businessName || "Brand Profile Pending"}
                      </h4>
                      <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full font-semibold">
                        {businessData?.category || "Food & Beverage"}
                      </span>
                      <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-medium">
                        Est. {businessData?.establishedYear || 2021}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Legal Entity: <span className="font-semibold text-slate-700">{businessData?.legalBusinessName || businessData?.businessName || "Not configured"}</span>
                      {businessData?.industry && ` • Industry: ${businessData.industry}`}
                    </p>
                  </div>
                </div>

                {/* Grid of Verified Credentials */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-slate-400 font-medium">Founder & Leadership</span>
                    <span className="font-bold text-navy-900 block">{businessData?.founderName || "N/A"}</span>
                    <span className="text-slate-500 text-[11px] block">Contact: {businessData?.contactPerson || businessData?.founderName}</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-slate-400 font-medium">Corporate Headquarters</span>
                    <span className="font-bold text-navy-900 block">
                      {businessData?.headquarters?.city || businessData?.registeredAddress?.city || "Mumbai"},{" "}
                      {businessData?.headquarters?.country || "India"}
                    </span>
                    <span className="text-slate-500 text-[11px] block">{businessData?.registeredAddress?.street || "Registered Office"}</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-slate-400 font-medium">Operating Footprint</span>
                    <span className="font-bold text-navy-900 block">{businessData?.numberOfOutlets || 1} Outlets Operational</span>
                    <span className="text-slate-500 text-[11px] block truncate">
                      {Array.isArray(businessData?.operatingLocations) && businessData.operatingLocations.length > 0
                        ? businessData.operatingLocations.join(", ")
                        : (businessData?.currentLocations || []).join(", ") || "Metro regions"}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-slate-400 font-medium">Contact Channels</span>
                    <span className="font-bold text-navy-900 block truncate">{businessData?.contactEmail || user?.email}</span>
                    <span className="text-slate-500 text-[11px] block">{businessData?.contactPhone || "+91 Contact on file"}</span>
                  </div>
                </div>

                {/* Description & Expansion Mandate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1.5">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Brand Description</span>
                    <p className="text-slate-700 leading-relaxed">{businessData?.description || "No company description provided yet."}</p>
                    {businessData?.websiteUrl && (
                      <a
                        href={businessData.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold pt-1"
                      >
                        Visit Official Website <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1.5">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Expansion Strategy & Outlets</span>
                    <p className="text-slate-700 leading-relaxed">{businessData?.expansionGoals || "Expansion targets not specified."}</p>
                    {businessData?.outletsSummary && (
                      <p className="text-slate-500 text-[11px] italic pt-1">Outlets breakdown: {businessData.outletsSummary}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: FRANCHISE OPPORTUNITIES (MILESTONE 3) */}
      {activeTab === "opportunities" && (
        <div className="space-y-8">
          {/* Opportunity Metrics Header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-medium text-slate-400 uppercase">Total Opportunities</span>
              <div className="text-3xl font-extrabold text-navy-900">{opportunities.length}</div>
              <p className="text-[11px] text-slate-500">Configured franchise models</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-medium text-emerald-600 uppercase font-semibold">Published in Marketplace</span>
              <div className="text-3xl font-extrabold text-emerald-600">
                {opportunities.filter((o) => o.status === "PUBLISHED" || o.status === "published").length}
              </div>
              <p className="text-[11px] text-slate-500">Live for vetted investors</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-medium text-amber-600 uppercase font-semibold">Under Compliance Review</span>
              <div className="text-3xl font-extrabold text-amber-600">
                {opportunities.filter((o) => ["SUBMITTED", "submitted", "UNDER_REVIEW", "under_review"].includes(o.status)).length}
              </div>
              <p className="text-[11px] text-slate-500">Pending brokerage approval</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-medium text-slate-400 uppercase">Draft Opportunities</span>
              <div className="text-3xl font-extrabold text-slate-700">
                {opportunities.filter((o) => ["DRAFT", "draft"].includes(o.status)).length}
              </div>
              <p className="text-[11px] text-slate-500">Unsubmitted models</p>
            </div>
          </div>

          {/* Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-navy-900">Franchise Opportunities & Business Models</h3>
              <p className="text-xs text-slate-500">
                Define and publish franchise opportunities with complete capex breakdown, territory rights, and operational support.
              </p>
            </div>
            <button
              onClick={handleOpenCreateOppModal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Create Franchise Opportunity
            </button>
          </div>

          {/* Opportunities Card Grid */}
          {opportunities.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Briefcase className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-navy-900">No Franchise Opportunities Created Yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Package your franchise format (FOFO, FOCO, Master) with required capital, royalty structure, and physical unit specifications to attract multi-unit investors.
                </p>
              </div>
              <button
                onClick={handleOpenCreateOppModal}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create First Opportunity
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {opportunities.map((opp) => {
                const isDraftOrRejected = ["DRAFT", "draft", "REJECTED", "rejected"].includes(opp.status);
                const isPublished = ["PUBLISHED", "published"].includes(opp.status);
                const isUnderReview = ["SUBMITTED", "submitted", "UNDER_REVIEW", "under_review"].includes(opp.status);

                return (
                  <div
                    key={opp._id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
                            {opp.brandName} • {opp.category}
                          </span>
                          <h4 className="text-lg font-extrabold text-navy-900 mt-0.5">
                            {opp.opportunityTitle || opp.tagline || "Franchise Opportunity"}
                          </h4>
                        </div>
                        <StatusBadge status={opp.status} />
                      </div>

                      {/* Business Model Pill */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-md">
                          Model: {opp.businessModel || opp.franchiseModelType || "FOFO"}
                        </span>
                        {opp.expectedOpeningTimelineMonths && (
                          <span className="bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-md">
                            ⏱️ Launch: ~{opp.expectedOpeningTimelineMonths} Months
                          </span>
                        )}
                      </div>

                      {/* Rejection / Correction Banner */}
                      {opp.rejectionReason && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs space-y-1">
                          <span className="font-bold flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            Review Compliance Feedback:
                          </span>
                          <p>{opp.rejectionReason}</p>
                        </div>
                      )}

                      {opp.correctionNotes && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs space-y-1">
                          <span className="font-bold flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-amber-600" />
                            Brokerage Corrections Requested:
                          </span>
                          <p>{opp.correctionNotes}</p>
                        </div>
                      )}

                      {/* Summary */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {opp.summary || "Complete franchise package with verified unit margins and operating manuals."}
                      </p>

                      {/* Financial & Operational Grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[11px] font-medium">Total Investment</span>
                          <span className="font-bold text-navy-900 block mt-0.5">
                            ₹{((opp.totalInvestmentMin || 0) / 100000).toFixed(1)}L - ₹{((opp.totalInvestmentMax || 0) / 100000).toFixed(1)}L
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px] font-medium">Franchise Fee</span>
                          <span className="font-bold text-navy-900 block mt-0.5">
                            ₹{((opp.initialFranchiseFee || 0) / 100000).toFixed(1)}L
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px] font-medium">Royalty Structure</span>
                          <span className="font-bold text-navy-900 block mt-0.5">
                            {opp.royaltyPercentage}% Gross
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px] font-medium">Space Requirement</span>
                          <span className="font-bold text-navy-900 block mt-0.5">
                            {opp.commercialSpaceMinSqFt} - {opp.commercialSpaceMaxSqFt} sq ft
                          </span>
                        </div>
                      </div>

                      {/* Territories / Locations */}
                      <div className="text-xs text-slate-500 space-y-1">
                        <span className="font-medium text-slate-700 block">Available Territories:</span>
                        <p className="text-slate-600 truncate">
                          {Array.isArray(opp.availableTerritories) && opp.availableTerritories.length > 0
                            ? opp.availableTerritories.join(", ")
                            : Array.isArray(opp.targetLocations) && opp.targetLocations.length > 0
                            ? opp.targetLocations.join(", ")
                            : "Pan-India Expansion"}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditOppModal(opp)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit Opportunity
                        </button>
                        {isPublished && (
                          <Link
                            href={`/franchises/${opp._id}`}
                            className="text-blue-600 hover:text-blue-800 font-bold text-xs inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Marketplace View
                          </Link>
                        )}
                      </div>

                      {isDraftOrRejected && (
                        <button
                          onClick={() => handleSubmitOpportunityForReview(opp._id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Submit for Review
                        </button>
                      )}

                      {isUnderReview && (
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                          ⏳ Under Compliance Review
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FRANCHISE READINESS INDEX */}
      {activeTab === "readiness" && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Diagnostic Benchmark
                </span>
                <h2 className="text-2xl font-bold text-navy-900 mt-1">The 8 Pillars of Franchise Readiness</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluated on financial repeatability, documentation integrity, and management capacity.
                </p>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-4xl font-extrabold text-navy-900">
                  {assessment?.overallScore || 88}
                  <span className="text-sm font-semibold text-slate-400">/100</span>
                </div>
                <StatusBadge status={assessment?.status || "certified_ready"} />
              </div>
            </div>

            {/* 8 Pillars Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {[
                { name: "Brand Strength & Market Differentiation", key: "brandStrength", score: 92 },
                { name: "Unit Economics & Store Margins", key: "unitEconomics", score: 90 },
                { name: "SOP Codification & Operations Manuals", key: "sopDocumentation", score: 85 },
                { name: "Legal FDD Disclosures & IP Protection", key: "legalAndIpReadiness", score: 88 },
                { name: "Supply Chain & Vendor Traceability", key: "supplyChainReadiness", score: 86 },
                { name: "Training Academy & Manager Curriculum", key: "trainingSystemReadiness", score: 84 },
                { name: "Unit Repeatability Across Territories", key: "unitRepeatability", score: 89 },
                { name: "Expansion & Franchisee Support Capacity", key: "expansionCapacity", score: 90 },
              ].map((pillar) => {
                const actualScore = assessment?.pillars?.[pillar.key]?.score || pillar.score;
                return (
                  <div key={pillar.key} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-navy-900">
                      <span>{pillar.name}</span>
                      <span className="text-blue-600">{actualScore}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          actualScore >= 80 ? "bg-emerald-500" : actualScore >= 60 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${actualScore}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Recommendation */}
            <div className="bg-blue-50/70 border border-blue-200 p-6 rounded-2xl space-y-2 text-xs">
              <span className="font-bold text-blue-900 uppercase tracking-wider block">Brokerage Advisory Summary:</span>
              <p className="text-slate-700 text-sm leading-relaxed">
                {assessment?.summaryRecommendation ||
                  "Your business demonstrates strong unit economics, high brand equity, and repeatable operational systems. Approved for multi-unit franchisee investor recruitment."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: MULTI-LOCATION OUTLETS MANAGEMENT */}
      {activeTab === "outlets" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-navy-900">Multi-Location Outlets Directory</h3>
              <p className="text-xs text-slate-500">
                Track live store operations, regional store managers, fitout milestones, and unit-level revenues.
              </p>
            </div>
            <button
              onClick={() => setIsAddOutletOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Add New Outlet
            </button>
          </div>

          {/* Outlets Grid */}
          {outlets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              No outlets registered yet. Click &quot;Add New Outlet&quot; to register your first unit.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {outlets.map((outlet) => (
                <div
                  key={outlet._id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {outlet.unitCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          outlet.status === "operating"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {outlet.status.replace("_", " ")}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-navy-900 text-base">{outlet.outletName}</h4>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span>{outlet.city}, {outlet.state}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{outlet.address}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Carpet Area</span>
                        <span className="font-semibold text-slate-700">{outlet.sizeSqFt} sq.ft</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Unit Type</span>
                        <span className="font-semibold text-slate-700 capitalize">{outlet.storeType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Manager</span>
                        <span className="font-semibold text-slate-700 truncate block">{outlet.managerName || "Assigned"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Monthly Run Rate</span>
                        <span className="font-semibold text-emerald-600 font-mono">
                          {outlet.monthlyRevenue > 0 ? formatCurrency(outlet.monthlyRevenue) : "Pre-Launch"}
                        </span>
                      </div>
                    </div>

                    {outlet.status !== "operating" && (
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                          <span>Fitout Completion</span>
                          <span>{outlet.fitoutProgressPercent || 60}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full"
                            style={{ width: `${outlet.fitoutProgressPercent || 60}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Outlet Modal */}
          {isAddOutletOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-lg text-navy-900">Add New Franchise Outlet</h3>
                  <button
                    onClick={() => setIsAddOutletOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateOutlet} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Outlet Display Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., RoastCraft - Koramangala Hub"
                      value={newOutlet.outletName}
                      onChange={(e) => setNewOutlet({ ...newOutlet, outletName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Unit Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., KOR-004"
                        value={newOutlet.unitCode}
                        onChange={(e) => setNewOutlet({ ...newOutlet, unitCode: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 border rounded-xl uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Store Format</label>
                      <select
                        value={newOutlet.storeType}
                        onChange={(e) => setNewOutlet({ ...newOutlet, storeType: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl"
                      >
                        <option value="standard">Standard Inline</option>
                        <option value="flagship">Flagship Lounge</option>
                        <option value="kiosk">Express Kiosk</option>
                        <option value="cloud_kitchen">Cloud Kitchen</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">City *</label>
                      <input
                        type="text"
                        required
                        placeholder="Bangalore"
                        value={newOutlet.city}
                        onChange={(e) => setNewOutlet({ ...newOutlet, city: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">State *</label>
                      <input
                        type="text"
                        required
                        placeholder="Karnataka"
                        value={newOutlet.state}
                        onChange={(e) => setNewOutlet({ ...newOutlet, state: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Street Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="100ft Road, 4th Block"
                      value={newOutlet.address}
                      onChange={(e) => setNewOutlet({ ...newOutlet, address: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Carpet Area (Sq.Ft) *</label>
                      <input
                        type="number"
                        required
                        min={100}
                        value={newOutlet.sizeSqFt}
                        onChange={(e) => setNewOutlet({ ...newOutlet, sizeSqFt: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Status</label>
                      <select
                        value={newOutlet.status}
                        onChange={(e) => setNewOutlet({ ...newOutlet, status: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl"
                      >
                        <option value="operating">Operating</option>
                        <option value="under_fitout">Under Fitout</option>
                        <option value="permitting">Permitting</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Store Manager Name</label>
                      <input
                        type="text"
                        placeholder="Rahul Verma"
                        value={newOutlet.managerName}
                        onChange={(e) => setNewOutlet({ ...newOutlet, managerName: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Manager Phone</label>
                      <input
                        type="text"
                        placeholder="+91 98765 43210"
                        value={newOutlet.managerPhone}
                        onChange={(e) => setNewOutlet({ ...newOutlet, managerPhone: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsAddOutletOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                    >
                      Save Outlet
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: FRANCHISE EXPANSION ROADMAP */}
      {activeTab === "roadmap" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  National Rollout Roadmap
                </span>
                <h2 className="text-2xl font-bold text-navy-900 mt-1">
                  {expansionPlan?.planName || "National Franchise Expansion Plan"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Target: {expansionPlan?.targetTotalOutlets || 25} total units across Tier 1 & 2 clusters.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Overall Rollout Progress</span>
                <div className="text-3xl font-extrabold text-blue-600 font-mono">
                  {expansionPlan?.overallProgressPercent || 38}%
                </div>
              </div>
            </div>

            {/* 8 Milestone Stages Cards */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                8-Stage Franchise Rollout Milestones
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(expansionPlan?.milestones || []).map((m: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 ${
                      m.status === "completed"
                        ? "bg-emerald-50/60 border-emerald-200"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            m.status === "completed"
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-300 text-slate-700"
                          }`}
                        >
                          {m.status === "completed" ? "✓" : idx + 1}
                        </span>
                        <h4 className="font-bold text-navy-900 text-xs sm:text-sm">{m.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 pl-7">{m.description}</p>
                      {m.deliverables && m.deliverables.length > 0 && (
                        <div className="pl-7 pt-1 flex flex-wrap gap-1">
                          {m.deliverables.map((d: string, dIdx: number) => (
                            <span
                              key={dIdx}
                              className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-medium"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleMilestone(m.stageKey, m.status)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border whitespace-nowrap transition ${
                        m.status === "completed"
                          ? "bg-emerald-600 text-white border-emerald-500"
                          : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {m.status === "completed" ? "Completed" : "Mark Done"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Cities Expansion Matrix */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Target Cities & Territory Priority Matrix
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                      <th className="py-2.5">City & State</th>
                      <th className="py-2.5">Cluster Tier</th>
                      <th className="py-2.5">Planned Units</th>
                      <th className="py-2.5">Priority</th>
                      <th className="py-2.5">Current Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(expansionPlan?.targetCities || []).map((city: any, cIdx: number) => (
                      <tr key={cIdx} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 font-bold text-navy-900">{city.cityName}, {city.state}</td>
                        <td className="py-2.5">{city.tier}</td>
                        <td className="py-2.5 font-mono">{city.plannedOutlets} Outlets</td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              city.priority === "High"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {city.priority}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span className="font-semibold text-slate-700">{city.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SOP MANUALS */}
      {activeTab === "sops" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-navy-900">Standard Operating Procedures (SOPs)</h3>
              <p className="text-xs text-slate-500">
                Digital operating manuals ensuring consistent execution across every franchise outlet
              </p>
            </div>
            <button
              onClick={() => setIsSopModalOpen(true)}
              className="bg-blue-600 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              New Procedure Manual
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sops.map((sop) => (
              <div key={sop._id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 capitalize">
                    {sop.category?.replace(/_/g, " ")}
                  </span>
                  <StatusBadge status={sop.status} />
                </div>

                <div>
                  <h4 className="text-base font-bold text-navy-900">{sop.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{sop.summary}</p>
                </div>

                {sop.checklists?.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Mandatory Checkpoints ({sop.checklists.length}):
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {sop.checklists.map((item: any, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{item.item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {sop.fileUrl && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block truncate max-w-[170px]">
                          {sop.fileName || "SOP_Procedure_Manual.pdf"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {sop.fileSizeBytes ? `${(sop.fileSizeBytes / 1024).toFixed(0)} KB` : "PDF Document"}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`http://localhost:5000${sop.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View / Download PDF
                    </a>
                  </div>
                )}

                <div className="text-[11px] text-slate-400 pt-2 flex justify-between border-t border-slate-100">
                  <span>Version {sop.version}.0</span>
                  <span>Jurisdiction: {sop.jurisdiction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LEGAL FDD DISCLOSURES */}
      {activeTab === "legal" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-navy-900">Legal Disclosures & Franchise Documents</h3>
            <p className="text-xs text-slate-500">
              Jurisdiction-compliant documentation (FDD 23 Items / Franchise Information Memorandums)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {legalDocs.map((doc) => (
              <div key={doc._id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {doc.documentType?.replace(/_/g, " ")}
                  </span>
                  <StatusBadge status={doc.status} />
                </div>

                <div>
                  <h4 className="text-base font-bold text-navy-900">{doc.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">File: {doc.originalFileName}</p>
                </div>

                {doc.complianceChecklist?.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Verified Clauses:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {doc.complianceChecklist.map((c: any, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{c.clause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {doc.legalReviewNotes && (
                  <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 border border-slate-100">
                    <span className="font-bold text-slate-700 block">Counsel Feedback:</span>
                    {doc.legalReviewNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: INVESTOR APPLICATIONS */}
      {activeTab === "applications" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-navy-900">Investor Expansion Applications</h3>
            <p className="text-xs text-slate-500">
              Applications submitted by prospective multi-unit operators for your brand
            </p>
          </div>

          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
                No investor applications received yet. Ensure your franchise listing is published.
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app._id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-sm font-bold text-navy-900">
                        Candidate: {app.investorProfile?.fullName || "Verified Investor"}
                      </span>
                      <span className="text-xs text-slate-500 ml-2">({app.proposedLocationCity})</span>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Proposed Units</span>
                      <span className="font-bold text-navy-900 mt-0.5 block">{app.unitsInterested} Outlets</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Investment Budget</span>
                      <span className="font-bold text-navy-900 mt-0.5 block">
                        {formatCurrency(app.investmentBudget)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Liquid Capital</span>
                      <span className="font-bold text-navy-900 mt-0.5 block">
                        {formatCurrency(app.availableLiquidCapital)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Timeline</span>
                      <span className="font-bold text-navy-900 mt-0.5 block capitalize">
                        {app.timeline?.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl text-xs text-slate-700">
                    <span className="font-bold text-slate-800 block mb-1">Operating Background:</span>
                    {app.businessBackgroundSummary}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: MEETINGS */}
      {activeTab === "meetings" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-navy-900">Scheduled Brokerage & Advisory Meetings</h3>
            <p className="text-xs text-slate-500">Consultations with franchise brokers, attorneys, and vetted operators</p>
          </div>

          <div className="space-y-4">
            {meetings.map((m) => (
              <div key={m._id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-navy-900">{m.title}</h4>
                  <StatusBadge status={m.status} />
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-4">
                  <span>📅 {new Date(m.scheduledStartTime).toLocaleString()}</span>
                  <span>Duration: 45 Mins</span>
                </div>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  Agenda: {m.agenda}
                </p>
                {m.meetingUrl && (
                  <a
                    href={m.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                  >
                    Join Video Conference
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New SOP Modal */}
      {isSopModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-navy-900">Create SOP Document</h3>
              <button
                onClick={() => setIsSopModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSop} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={sopForm.title}
                  onChange={(e) => setSopForm({ ...sopForm, title: e.target.value })}
                  placeholder="e.g. Daily Barista Calibration & Opening Checklist"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Operational Category *</label>
                <select
                  value={sopForm.category}
                  onChange={(e) => setSopForm({ ...sopForm, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="daily_operations">Daily Operations</option>
                  <option value="employee_training">Employee Training</option>
                  <option value="customer_service">Customer Service</option>
                  <option value="inventory_management">Inventory Management</option>
                  <option value="quality_control">Quality Control</option>
                  <option value="health_and_safety">Health & Safety</option>
                  <option value="opening_closing_procedures">Opening & Closing</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Executive Summary *</label>
                <textarea
                  rows={2}
                  required
                  value={sopForm.summary}
                  onChange={(e) => setSopForm({ ...sopForm, summary: e.target.value })}
                  placeholder="Summary of the process and standards expected..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-700 font-medium">Checklist Verification Items:</label>
                <input
                  type="text"
                  placeholder="1. First mandatory checkpoint..."
                  value={sopForm.checklist1}
                  onChange={(e) => setSopForm({ ...sopForm, checklist1: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="2. Second checkpoint..."
                  value={sopForm.checklist2}
                  onChange={(e) => setSopForm({ ...sopForm, checklist2: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="3. Third checkpoint..."
                  value={sopForm.checklist3}
                  onChange={(e) => setSopForm({ ...sopForm, checklist3: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Upload PDF Section */}
              <div className="pt-2">
                <label className="block text-slate-700 font-bold mb-1">
                  Upload SOP Manual (PDF Document)
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/80">
                  <input
                    type="file"
                    id="sopPdfInput"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setSelectedPdf(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="sopPdfInput" className="cursor-pointer block space-y-1.5">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                    {selectedPdf ? (
                      <div>
                        <span className="font-bold text-emerald-600 text-xs block">{selectedPdf.name}</span>
                        <span className="text-[10px] text-slate-400">
                          ({(selectedPdf.size / 1024).toFixed(1)} KB) • Click to change document
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs font-bold text-blue-600 hover:underline">
                          Click to select PDF Manual from computer
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Standard operating procedure manuals (.PDF, .DOC, .DOCX up to 25MB)
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsSopModalOpen(false);
                    setSelectedPdf(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingSop}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isUploadingSop ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading PDF & Saving...
                    </>
                  ) : (
                    "Save & Codify SOP Manual"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Franchise Opportunity Create / Edit Modal (Milestone 3) */}
      {isCreateOppModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl border border-slate-200 my-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-navy-900">
                  {isEditingOpp ? "Edit Franchise Opportunity" : "Create New Franchise Opportunity"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Package investment model, capital breakdown, store dimensions, and royalty structure.
                </p>
              </div>
              <button
                onClick={() => setIsCreateOppModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveOpportunity} className="space-y-6 text-xs">
              {/* 1. Basic Opportunity Identity */}
              <div className="space-y-3">
                <h4 className="font-bold text-navy-900 text-sm border-b pb-1">1. Opportunity Overview & Model</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-medium mb-1">Opportunity Title *</label>
                    <input
                      type="text"
                      required
                      value={oppForm.opportunityTitle}
                      onChange={(e) => setOppForm({ ...oppForm, opportunityTitle: e.target.value })}
                      placeholder="e.g. Master Franchise & Multi-Unit Cafes (Tier-1 Metros)"
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Brand Name *</label>
                    <input
                      type="text"
                      required
                      value={oppForm.brandName}
                      onChange={(e) => setOppForm({ ...oppForm, brandName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Franchise Model Type *</label>
                    <select
                      value={oppForm.businessModel}
                      onChange={(e) => setOppForm({ ...oppForm, businessModel: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-xs bg-white"
                    >
                      <option value="FOFO">FOFO (Franchise Owned, Franchise Operated)</option>
                      <option value="FOCO">FOCO (Franchise Owned, Company Operated)</option>
                      <option value="COCO">COCO (Company Owned, Company Operated)</option>
                      <option value="Master Franchise">Master Franchise / Regional Developer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Category *</label>
                    <select
                      value={oppForm.category}
                      onChange={(e) => setOppForm({ ...oppForm, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-xs bg-white"
                    >
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Retail">Retail</option>
                      <option value="Health & Wellness">Health & Wellness</option>
                      <option value="Education">Education</option>
                      <option value="Automotive">Automotive</option>
                      <option value="Beauty & Salon">Beauty & Salon</option>
                      <option value="Technology">Technology</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Industry Segment *</label>
                    <input
                      type="text"
                      required
                      value={oppForm.industry}
                      onChange={(e) => setOppForm({ ...oppForm, industry: e.target.value })}
                      placeholder="e.g. Specialty Coffee / QSR"
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Capital Architecture & Fees */}
              <div className="space-y-3">
                <h4 className="font-bold text-navy-900 text-sm border-b pb-1">
                  2. Financial Architecture (stored in integer paise, entered in INR ₹)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Min Total Investment (₹) *
                      <span className="text-slate-400 font-normal ml-1">
                        (₹{(oppForm.totalInvestmentMin / 100000).toFixed(1)} Lakhs)
                      </span>
                    </label>
                    <input
                      type="number"
                      required
                      min={10000}
                      step={10000}
                      value={oppForm.totalInvestmentMin}
                      onChange={(e) => setOppForm({ ...oppForm, totalInvestmentMin: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Max Total Investment (₹) *
                      <span className="text-slate-400 font-normal ml-1">
                        (₹{(oppForm.totalInvestmentMax / 100000).toFixed(1)} Lakhs)
                      </span>
                    </label>
                    <input
                      type="number"
                      required
                      min={10000}
                      step={10000}
                      value={oppForm.totalInvestmentMax}
                      onChange={(e) => setOppForm({ ...oppForm, totalInvestmentMax: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Initial Franchise Fee (₹) *</label>
                    <input
                      type="number"
                      required
                      value={oppForm.initialFranchiseFee}
                      onChange={(e) => setOppForm({ ...oppForm, initialFranchiseFee: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Setup / Interior Costs (₹)</label>
                    <input
                      type="number"
                      value={oppForm.setupCosts}
                      onChange={(e) => setOppForm({ ...oppForm, setupCosts: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Equipment Costs (₹)</label>
                    <input
                      type="number"
                      value={oppForm.equipmentCosts}
                      onChange={(e) => setOppForm({ ...oppForm, equipmentCosts: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Working Capital (₹)</label>
                    <input
                      type="number"
                      value={oppForm.workingCapitalEstimate}
                      onChange={(e) => setOppForm({ ...oppForm, workingCapitalEstimate: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Royalty Percentage (%) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      step={0.5}
                      value={oppForm.royaltyPercentage}
                      onChange={(e) => setOppForm({ ...oppForm, royaltyPercentage: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-medium mb-1">Royalty Structure Description</label>
                    <input
                      type="text"
                      value={oppForm.royaltyDescription}
                      onChange={(e) => setOppForm({ ...oppForm, royaltyDescription: e.target.value })}
                      placeholder="e.g. 6% monthly gross revenue royalty + 2% national marketing fund"
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Physical Space & Operations */}
              <div className="space-y-3">
                <h4 className="font-bold text-navy-900 text-sm border-b pb-1">3. Space, Staffing & Launch Timeline</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Min Carpet Area (sq ft) *</label>
                    <input
                      type="number"
                      required
                      min={50}
                      value={oppForm.commercialSpaceMinSqFt}
                      onChange={(e) => setOppForm({ ...oppForm, commercialSpaceMinSqFt: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Max Carpet Area (sq ft) *</label>
                    <input
                      type="number"
                      required
                      min={50}
                      value={oppForm.commercialSpaceMaxSqFt}
                      onChange={(e) => setOppForm({ ...oppForm, commercialSpaceMaxSqFt: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Staff Required (Min - Max)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={1}
                        value={oppForm.staffRequiredMin}
                        onChange={(e) => setOppForm({ ...oppForm, staffRequiredMin: parseInt(e.target.value) || 1 })}
                        className="w-1/2 px-2 py-2 border rounded-lg text-xs"
                      />
                      <input
                        type="number"
                        min={1}
                        value={oppForm.staffRequiredMax}
                        onChange={(e) => setOppForm({ ...oppForm, staffRequiredMax: parseInt(e.target.value) || 1 })}
                        className="w-1/2 px-2 py-2 border rounded-lg text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Launch Timeline (Months) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={24}
                      value={oppForm.expectedOpeningTimelineMonths}
                      onChange={(e) => setOppForm({ ...oppForm, expectedOpeningTimelineMonths: parseInt(e.target.value) || 2 })}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Target Locations (Comma-separated) *</label>
                    <input
                      type="text"
                      required
                      value={oppForm.targetLocations}
                      onChange={(e) => setOppForm({ ...oppForm, targetLocations: e.target.value })}
                      placeholder="Mumbai, Pune, Bengaluru, Hyderabad"
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Available Territories</label>
                    <input
                      type="text"
                      value={oppForm.availableTerritories}
                      onChange={(e) => setOppForm({ ...oppForm, availableTerritories: e.target.value })}
                      placeholder="Western Region, Delhi NCR, South Zone"
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Training, Profile & Summary */}
              <div className="space-y-3">
                <h4 className="font-bold text-navy-900 text-sm border-b pb-1">4. Training, Support & Franchisee Criteria</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Training Duration (Weeks) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={oppForm.trainingDurationWeeks}
                      onChange={(e) => setOppForm({ ...oppForm, trainingDurationWeeks: parseInt(e.target.value) || 2 })}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-medium mb-1">Training & Operational Support Details</label>
                    <input
                      type="text"
                      value={oppForm.trainingSupportDetails}
                      onChange={(e) => setOppForm({ ...oppForm, trainingSupportDetails: e.target.value })}
                      placeholder="e.g. 2-week barista & manager certification, store launch team on-site for 10 days"
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Ideal Franchisee Profile / Criteria *</label>
                  <textarea
                    rows={2}
                    required
                    value={oppForm.idealFranchiseeProfile}
                    onChange={(e) => setOppForm({ ...oppForm, idealFranchiseeProfile: e.target.value })}
                    placeholder="e.g. Passionate entrepreneur with hospitality experience, liquid net worth of ₹50L+..."
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Executive Summary *</label>
                  <textarea
                    rows={2}
                    required
                    value={oppForm.summary}
                    onChange={(e) => setOppForm({ ...oppForm, summary: e.target.value })}
                    placeholder="Short compelling summary highlighting unit ROI, store payback, and operational moat..."
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Brand Story & Heritage</label>
                  <textarea
                    rows={2}
                    value={oppForm.brandStory}
                    onChange={(e) => setOppForm({ ...oppForm, brandStory: e.target.value })}
                    placeholder="Story of the brand origins, customer loyalty, and market leadership..."
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Submission CTA */}
              <div className="pt-4 border-t flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  <span>New opportunities will be created in </span>
                  <span className="font-semibold text-slate-800">DRAFT</span>
                  <span> status. You can review before submitting.</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOppModalOpen(false)}
                    className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={oppSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {oppSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving Opportunity...
                      </>
                    ) : isEditingOpp ? (
                      "Save Opportunity Changes"
                    ) : (
                      "Create Franchise Opportunity"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

