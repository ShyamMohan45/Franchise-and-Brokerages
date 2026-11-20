"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  Phone,
  Mail,
  MoreVertical,
  CheckSquare,
  Lock,
  X,
  Edit3,
  UserCheck,
  ChevronRight,
  ExternalLink,
  DollarSign,
  Award,
  Video,
  FileText,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Download,
  CreditCard,
  FileSpreadsheet,
  Bell,
  Check,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { api, API_V1_URL } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";

const STAGES = [
  { key: "NEW_ENQUIRY", label: "New Enquiry", color: "border-l-blue-500 bg-blue-50/30" },
  { key: "INITIAL_CONTACT", label: "Initial Contact", color: "border-l-sky-500 bg-sky-50/30" },
  { key: "QUALIFICATION", label: "Qualification", color: "border-l-indigo-500 bg-indigo-50/30" },
  { key: "BRAND_MATCHING", label: "Brand Matching", color: "border-l-purple-500 bg-purple-50/30" },
  { key: "MEETING_SCHEDULED", label: "Meeting Scheduled", color: "border-l-amber-500 bg-amber-50/30" },
  { key: "NEGOTIATION", label: "Negotiation", color: "border-l-orange-500 bg-orange-50/30" },
  { key: "DUE_DILIGENCE", label: "Due Diligence", color: "border-l-cyan-500 bg-cyan-50/30" },
  { key: "AGREEMENT", label: "Agreement", color: "border-l-teal-500 bg-teal-50/30" },
  { key: "CLOSED_WON", label: "Closed Won", color: "border-l-emerald-500 bg-emerald-50/30" },
  { key: "CLOSED_LOST", label: "Closed Lost", color: "border-l-rose-500 bg-rose-50/30" },
];

export default function BrokerageDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"leads" | "pipeline" | "tasks" | "meetings" | "analytics" | "commissions" | "reminders">("leads");

  // Core Data States
  const [metrics, setMetrics] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [pipelineDeals, setPipelineDeals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any>(null);
  const [notifPreferences, setNotifPreferences] = useState<any>(null);
  const [analyticsOverview, setAnalyticsOverview] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [statementModal, setStatementModal] = useState<any | null>(null);
  const [paymentModalAgreement, setPaymentModalAgreement] = useState<any | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: 100000,
    paymentReference: "",
    paymentMethod: "RTGS",
    payerName: "",
    payerRole: "brand",
    notes: "",
  });
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchLead, setSearchLead] = useState("");
  const [leadTypeFilter, setLeadTypeFilter] = useState("ALL");
  const [qualificationFilter, setQualificationFilter] = useState("ALL");
  const [industryFilter, setIndustryFilter] = useState("ALL");

  // Drawer / Modal states
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [qualifyModalLead, setQualifyModalLead] = useState<any | null>(null);
  const [convertModalLead, setConvertModalLead] = useState<any | null>(null);
  const [stageModalDeal, setStageModalDeal] = useState<any | null>(null);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [activityText, setActivityText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Qualification form state
  const [qualBudgetMin, setQualBudgetMin] = useState<number>(5000000);
  const [qualBudgetMax, setQualBudgetMax] = useState<number>(10000000);
  const [qualReadiness, setQualReadiness] = useState<string>("ready_to_invest");
  const [qualStatus, setQualStatus] = useState<string>("QUALIFIED");
  const [qualNotes, setQualNotes] = useState<string>("");
  const [qualTimeline, setQualTimeline] = useState<string>("1_3_months");
  const [qualExperience, setQualExperience] = useState<string>("");

  // Deal conversion form state
  const [convDealTitle, setConvDealTitle] = useState("");
  const [convDealValue, setConvDealValue] = useState(5000000);
  const [convFranchiseFee, setConvFranchiseFee] = useState(500000);
  const [convListingId, setConvListingId] = useState("");
  const [convNotes, setConvNotes] = useState("");

  // Stage change form state
  const [targetStage, setTargetStage] = useState("");
  const [stageChangeNote, setStageChangeNote] = useState("");

  // New Meeting form state
  const [newMeetingTitle, setNewMeetingTitle] = useState("");
  const [newMeetingType, setNewMeetingType] = useState("franchise_intro");
  const [newMeetingStartTime, setNewMeetingStartTime] = useState("");
  const [newMeetingEndTime, setNewMeetingEndTime] = useState("");
  const [newMeetingAgenda, setNewMeetingAgenda] = useState("");
  const [newMeetingLeadId, setNewMeetingLeadId] = useState("");

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  async function loadData() {
    try {
      setLoading(true);
      const [
        metricsRes,
        leadsRes,
        dealsRes,
        tasksRes,
        meetingsRes,
        enqRes,
        commsRes,
        remRes,
        prefRes,
        analyticsRes,
      ] = await Promise.all([
        api.get<any>("/crm/metrics"),
        api.get<any>("/crm/leads"),
        api.get<any>("/crm/pipeline"),
        api.get<any>("/crm/tasks"),
        api.get<any>("/crm/meetings"),
        api.get<any>("/applications/broker"),
        api.get<any>("/commissions/agreements").catch(() => ({ success: false, data: [] })),
        api.get<any>("/notifications/reminders").catch(() => ({ success: false, data: null })),
        api.get<any>("/notifications/preferences").catch(() => ({ success: false, data: null })),
        api.get<any>("/analytics/dashboard").catch(() => ({ success: false, data: null })),
      ]);

      if (metricsRes.success && metricsRes.data) setMetrics(metricsRes.data);
      if (leadsRes.success && leadsRes.data) {
        setLeads(Array.isArray(leadsRes.data) ? leadsRes.data : leadsRes.data.leads || []);
      }
      if (dealsRes.success && dealsRes.data) {
        setPipelineDeals(Array.isArray(dealsRes.data) ? dealsRes.data : dealsRes.data.deals || []);
      }
      if (tasksRes.success && tasksRes.data) {
        setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
      }
      if (meetingsRes.success && meetingsRes.data) {
        setMeetings(Array.isArray(meetingsRes.data) ? meetingsRes.data : []);
      }
      if (enqRes.success && enqRes.data) {
        setEnquiries(Array.isArray(enqRes.data) ? enqRes.data : []);
      }
      if (commsRes.success && commsRes.data) {
        setAgreements(Array.isArray(commsRes.data) ? commsRes.data : commsRes.data.data || []);
      }
      if (remRes.success && remRes.data) {
        setReminders(remRes.data);
      }
      if (prefRes.success && prefRes.data) {
        setNotifPreferences(prefRes.data);
      }
      if (analyticsRes.success && analyticsRes.data) {
        setAnalyticsOverview(analyticsRes.data);
      }
    } catch (err) {
      console.error("CRM dashboard load error", err);
    } finally {
      setLoading(false);
    }
  }

  const handleDownloadCsv = async (endpoint: string, filename: string) => {
    try {
      setIsExporting(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("fb_auth_token") : null;
      const res = await fetch(`${API_V1_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to export CSV report");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showFeedback("success", `Downloaded ${filename}`);
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to download CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalAgreement) return;
    try {
      setIsUpdating(true);
      const res = await api.post<any>("/commissions/payments", {
        agreementId: paymentModalAgreement._id,
        amount: Number(paymentForm.amount),
        paymentReference: paymentForm.paymentReference,
        paymentMethod: paymentForm.paymentMethod,
        payerName: paymentForm.payerName || user?.fullName || "Brand Representative",
        payerRole: paymentForm.payerRole,
        notes: paymentForm.notes,
      });
      if (res.success) {
        showFeedback("success", `Payment ₹${paymentForm.amount} recorded successfully!`);
        setPaymentModalAgreement(null);
        await loadData();
      }
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to record payment");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewStatement = async (agreementId: string) => {
    try {
      setIsUpdating(true);
      const res = await api.get<any>(`/commissions/agreements/${agreementId}/statement`);
      if (res.success && res.data) {
        setStatementModal(res.data);
      }
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to load commission statement");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTogglePreference = async (key: string, value: boolean) => {
    try {
      const updated = { ...notifPreferences, [key]: value };
      setNotifPreferences(updated);
      await api.put<any>("/notifications/preferences", { [key]: value });
      showFeedback("success", "Preferences saved.");
    } catch (err: any) {
      showFeedback("error", "Failed to update preference");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- ACTIONS ---

  const handleAssignToMe = async (leadId: string) => {
    try {
      setIsUpdating(true);
      const res = await api.post<any>(`/crm/leads/${leadId}/assign`, {
        brokerId: user?.id || user?._id,
        note: `Self-assigned by ${user?.fullName || "Broker"}`,
      });
      if (res.success) {
        showFeedback("success", "Lead assigned to your desk.");
        await loadData();
      }
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to assign lead");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenQualifyModal = (lead: any) => {
    setQualifyModalLead(lead);
    setQualBudgetMin(lead.budgetMin || 5000000);
    setQualBudgetMax(lead.budgetMax || 10000000);
    setQualReadiness(lead.investmentReadiness || "ready_to_invest");
    setQualStatus(lead.qualificationStatus || "QUALIFIED");
    setQualNotes(lead.qualificationNotes || "");
    setQualTimeline(lead.investmentTimeline || "1_3_months");
    setQualExperience(lead.businessExperience || "");
  };

  const handleSaveQualification = async () => {
    if (!qualifyModalLead) return;
    try {
      setIsUpdating(true);
      const res = await api.post<any>(`/crm/leads/${qualifyModalLead._id}/qualify`, {
        budgetMin: Number(qualBudgetMin),
        budgetMax: Number(qualBudgetMax),
        investmentReadiness: qualReadiness,
        qualificationStatus: qualStatus,
        qualificationNotes: qualNotes,
        investmentTimeline: qualTimeline,
        businessExperience: qualExperience,
      });
      if (res.success) {
        showFeedback("success", `Lead qualified as ${qualStatus}`);
        setQualifyModalLead(null);
        await loadData();
      }
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to qualify investor lead");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenConvertModal = (lead: any) => {
    setConvertModalLead(lead);
    setConvDealTitle(`${lead.fullName} — Franchise Rollout`);
    setConvDealValue(lead.budgetMin || 5000000);
    setConvFranchiseFee(750000);
    setConvNotes(`Converted from qualified CRM Lead #${lead._id}`);
  };

  const handleExecuteConversion = async () => {
    if (!convertModalLead) return;
    try {
      setIsUpdating(true);
      const res = await api.post<any>(`/crm/leads/${convertModalLead._id}/convert-to-deal`, {
        dealTitle: convDealTitle,
        dealValue: Number(convDealValue),
        franchiseFee: Number(convFranchiseFee),
        notes: convNotes,
      });
      if (res.success) {
        showFeedback("success", "Lead successfully converted to pipeline deal!");
        setConvertModalLead(null);
        setActiveTab("pipeline");
        await loadData();
      }
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to convert lead to deal");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenStageModal = (deal: any, newStage: string) => {
    setStageModalDeal(deal);
    setTargetStage(newStage);
    setStageChangeNote(`Progressing deal from ${deal.stage} to ${newStage}`);
  };

  const handleConfirmStageChange = async () => {
    if (!stageModalDeal || !targetStage) return;
    try {
      setIsUpdating(true);
      const res = await api.patch<any>(`/crm/deals/${stageModalDeal._id}/stage`, {
        stage: targetStage,
        stageChangeNote: stageChangeNote,
        actualCommissionEarned: targetStage === "CLOSED_WON" ? Math.round(stageModalDeal.dealValue * 0.05) : undefined,
        paymentStatus: targetStage === "CLOSED_WON" ? "paid" : undefined,
      });
      if (res.success) {
        showFeedback("success", `Deal moved to stage: ${targetStage}`);
        setStageModalDeal(null);
        await loadData();
      }
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to update deal stage");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const res = await api.post<any>("/crm/meetings", {
        title: newMeetingTitle,
        meetingType: newMeetingType,
        participantIds: [user?.id || user?._id],
        scheduledStartTime: newMeetingStartTime,
        scheduledEndTime: newMeetingEndTime,
        relatedLead: newMeetingLeadId || undefined,
        agenda: newMeetingAgenda,
      });
      if (res.success) {
        showFeedback("success", "Investor-Brand meeting scheduled successfully!");
        setMeetingModalOpen(false);
        setNewMeetingTitle("");
        setNewMeetingAgenda("");
        await loadData();
      }
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to schedule meeting");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteMeeting = async (meetingId: string) => {
    try {
      const res = await api.patch<any>(`/crm/meetings/${meetingId}/status`, {
        status: "completed",
        notes: "Meeting completed successfully with parties aligned.",
      });
      if (res.success) {
        showFeedback("success", "Meeting marked as completed.");
        await loadData();
      }
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to update meeting status");
    }
  };

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    const q = searchLead.toLowerCase();
    const matchesSearch =
      !q ||
      l.fullName?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.company?.toLowerCase().includes(q) ||
      l.preferredCity?.toLowerCase().includes(q);
    const matchesType = leadTypeFilter === "ALL" || l.leadType === leadTypeFilter;
    const matchesQual = qualificationFilter === "ALL" || l.qualificationStatus === qualificationFilter;
    const matchesInd =
      industryFilter === "ALL" ||
      l.preferredIndustry?.toLowerCase().includes(industryFilter.toLowerCase()) ||
      l.targetIndustry?.toLowerCase().includes(industryFilter.toLowerCase());

    return matchesSearch && matchesType && matchesQual && matchesInd;
  });

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border shadow-sm transition-all ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{feedback.text}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Executive Banner */}
        <div className="bg-[#14243A] text-white rounded-3xl p-8 border border-[#1C2A3E] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#315EFB]/20 text-[#6092FB] border border-[#315EFB]/30 text-xs font-semibold">
              <Briefcase className="w-3.5 h-3.5" />
              Brokerage CRM & Deal Execution Desk
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Investor Enquiries, Deal Pipeline & Brokerage Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Unified institutional CRM for franchise leads, broker assignment, multi-stage transaction progression, task reminders, and scheduled diligence calls.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setMeetingModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" /> Schedule Diligence Meeting
            </button>
            <button
              onClick={loadData}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl border border-slate-700 transition-colors"
              title="Refresh CRM Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 8 Core Milestone 5 CRM Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Leads</span>
            <div className="text-xl font-extrabold text-[#14243A]">{metrics?.totalLeads ?? leads.length}</div>
            <span className="text-[10px] text-blue-600 font-semibold">All Inbounds</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">New Enquiries</span>
            <div className="text-xl font-extrabold text-blue-600">
              {metrics?.newEnquiries ?? enquiries.filter((e) => e.status === "NEW").length}
            </div>
            <span className="text-[10px] text-slate-500">Unprocessed</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Qualified</span>
            <div className="text-xl font-extrabold text-indigo-600">
              {metrics?.qualifiedInvestors ?? leads.filter((l) => l.qualificationStatus === "QUALIFIED").length}
            </div>
            <span className="text-[10px] text-indigo-600 font-semibold">Capital Ready</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Deals</span>
            <div className="text-xl font-extrabold text-amber-600">{metrics?.activeDeals ?? pipelineDeals.length}</div>
            <span className="text-[10px] text-amber-600 font-semibold">In Pipeline</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Meetings</span>
            <div className="text-xl font-extrabold text-purple-600">
              {metrics?.meetingsScheduled ?? meetings.length}
            </div>
            <span className="text-[10px] text-purple-600 font-semibold">Scheduled</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Deals Won</span>
            <div className="text-xl font-extrabold text-emerald-600">
              {metrics?.dealsWon ?? pipelineDeals.filter((d) => d.stage === "CLOSED_WON").length}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">Closed</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Deals Lost</span>
            <div className="text-xl font-extrabold text-rose-600">
              {metrics?.dealsLost ?? pipelineDeals.filter((d) => d.stage === "CLOSED_LOST").length}
            </div>
            <span className="text-[10px] text-rose-500">Archived</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overdue Tasks</span>
            <div className="text-xl font-extrabold text-rose-600">
              {metrics?.overdueFollowups ?? metrics?.overdueFollowUps ?? 0}
            </div>
            <span className="text-[10px] text-rose-500 font-semibold">Action Required</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 space-x-1 sm:space-x-3 overflow-x-auto">
          {[
            { id: "leads", label: "Leads & Enquiries Desk", count: leads.length },
            { id: "pipeline", label: "10-Stage Deal Pipeline", count: pipelineDeals.length },
            { id: "tasks", label: "Follow-Up Tasks", count: tasks.length },
            { id: "meetings", label: "Scheduled Meetings", count: meetings.length },
            { id: "analytics", label: "Operations & Analytics", count: metrics?.brokerPerformance?.length || 0 },
            { id: "commissions", label: "Commission Agreements", count: agreements.length },
            {
              id: "reminders",
              label: "Reminders & Alerts",
              count: (reminders?.upcomingFollowUps?.length || 0) + (reminders?.tasks?.length || 0),
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab.id ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* TAB 1: LEADS & ENQUIRIES DESK */}
        {activeTab === "leads" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-extrabold text-navy-900">Institutional Leads & Investor Enquiries</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Qualify candidate wealth profiles, assign brokers with full audit logs, log outreach activities, and spawn territory deals.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full lg:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search lead name, email, city, company..."
                  value={searchLead}
                  onChange={(e) => setSearchLead(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Type Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400">Type:</span>
                {["ALL", "franchise_investor", "brand_partnership", "brand_owner"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setLeadTypeFilter(t)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                      leadTypeFilter === t
                        ? "bg-navy-900 text-white border-navy-900"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {t === "ALL" ? "All Types" : t.replace(/_/g, " ")}
                  </button>
                ))}
              </div>

              {/* Qualification Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400">Status:</span>
                {["ALL", "NEW", "CONTACTED", "QUALIFIED", "NOT_QUALIFIED"].map((q) => (
                  <button
                    key={q}
                    onClick={() => setQualificationFilter(q)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                      qualificationFilter === q
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Leads Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                    <th className="pb-3">Candidate / Type</th>
                    <th className="pb-3">Target Industry & City</th>
                    <th className="pb-3">Investment Budget</th>
                    <th className="pb-3">Readiness & Qualification</th>
                    <th className="pb-3">Assigned Broker</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No leads match current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4">
                          <div className="font-bold text-navy-900">{lead.fullName}</div>
                          <div className="text-[11px] text-slate-500">{lead.email} | {lead.phone}</div>
                          <span className="text-[10px] font-mono uppercase bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 mt-1 inline-block">
                            {lead.leadType?.replace(/_/g, " ")} &bull; {lead.source}
                          </span>
                        </td>

                        <td className="py-4">
                          <div className="font-semibold text-slate-800">
                            {lead.preferredIndustry || lead.targetIndustry || "General Franchising"}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {lead.preferredCity || "Any City"}, {lead.preferredState || "India"}
                          </div>
                        </td>

                        <td className="py-4">
                          <div className="font-bold text-navy-900">
                            {formatCurrency(lead.budgetMin || 5000000)} &ndash; {formatCurrency(lead.budgetMax || 10000000)}
                          </div>
                          {lead.liquidCapital && (
                            <div className="text-[10px] text-slate-400">
                              Liquid: {formatCurrency(lead.liquidCapital)}
                            </div>
                          )}
                        </td>

                        <td className="py-4 space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              lead.qualificationStatus === "QUALIFIED"
                                ? "bg-emerald-100 text-emerald-800"
                                : lead.qualificationStatus === "NOT_QUALIFIED"
                                ? "bg-rose-100 text-rose-800"
                                : lead.qualificationStatus === "CONTACTED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {lead.qualificationStatus || "NEW"}
                          </span>
                          <div className="text-[10px] text-slate-500 capitalize">
                            Readiness: {lead.investmentReadiness?.replace(/_/g, " ") || "exploring"}
                          </div>
                        </td>

                        <td className="py-4">
                          {lead.assignedBroker ? (
                            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                              <span>{lead.assignedBroker.fullName || lead.assignedBroker.email}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAssignToMe(lead._id)}
                              className="text-[11px] text-blue-600 font-bold bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 transition-colors"
                            >
                              Assign to Me
                            </button>
                          )}
                        </td>

                        <td className="py-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenQualifyModal(lead)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                          >
                            Qualify
                          </button>
                          {lead.convertedToDeal ? (
                            <span className="text-[11px] text-emerald-600 font-bold px-2 py-1 bg-emerald-50 rounded-lg">
                              Converted ✓
                            </span>
                          ) : (
                            <button
                              onClick={() => handleOpenConvertModal(lead)}
                              className="bg-navy-900 hover:bg-navy-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm transition-all"
                            >
                              Convert to Deal &rarr;
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: 10-STAGE DEAL PIPELINE KANBAN */}
        {activeTab === "pipeline" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-navy-900">Territory Deal Pipeline (10 Formal Stages)</h3>
                <p className="text-xs text-slate-500">
                  Track expansion contracts from initial discovery through FDD due diligence, negotiation, and closed won execution.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
                Active Deals: {pipelineDeals.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
              {STAGES.map((col) => {
                const columnDeals = pipelineDeals.filter((d) => d.stage === col.key);
                return (
                  <div
                    key={col.key}
                    className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 min-w-[240px] shadow-sm flex flex-col"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-navy-900 truncate">{col.label}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {columnDeals.length}
                      </span>
                    </div>

                    <div className="space-y-2.5 flex-1 min-h-[140px]">
                      {columnDeals.length === 0 ? (
                        <div className="text-center py-8 text-slate-300 text-xs italic">No deals in stage</div>
                      ) : (
                        columnDeals.map((deal) => (
                          <div
                            key={deal._id}
                            className={`p-3 rounded-xl border border-slate-200 shadow-sm space-y-2 border-l-4 ${col.color}`}
                          >
                            <div className="font-bold text-xs text-navy-900 leading-tight">{deal.dealTitle}</div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-emerald-700">
                                {formatCurrency(deal.dealValue || 5000000)}
                              </span>
                              <span className="text-slate-400 text-[10px]">
                                Fee: {formatCurrency(deal.franchiseFee || 500000)}
                              </span>
                            </div>

                            {/* Stage Mover Selector */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] text-slate-400">Move:</span>
                              <select
                                value={deal.stage}
                                onChange={(e) => handleOpenStageModal(deal, e.target.value)}
                                className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg p-1 text-slate-700 focus:outline-none focus:border-blue-500"
                              >
                                {STAGES.map((s) => (
                                  <option key={s.key} value={s.key}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: FOLLOW-UP TASKS */}
        {activeTab === "tasks" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-extrabold text-navy-900">CRM Follow-Up & Diligence Tasks</h3>
                <p className="text-xs text-slate-500">
                  Track overdue milestones, territory inspections, FDD disclosures, and franchise agreement reviews.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                {tasks.length} Total Registered
              </span>
            </div>

            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">No active tasks recorded.</div>
              ) : (
                tasks.map((task) => {
                  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "completed";
                  return (
                    <div
                      key={task._id}
                      className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                        task.status === "completed"
                          ? "bg-slate-50/60 border-slate-200 opacity-60"
                          : isOverdue
                          ? "bg-rose-50/30 border-rose-200"
                          : "bg-white border-slate-200 shadow-sm"
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-xs ${
                              task.status === "completed" ? "line-through text-slate-400" : "text-navy-900"
                            }`}
                          >
                            {task.title}
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                              OVERDUE
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              task.priority === "urgent" || task.priority === "high"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{task.description}</p>
                        <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Due: {formatDate(task.dueDate)}
                          </span>
                          {task.relatedLead && <span>Lead: {task.relatedLead.fullName}</span>}
                          {task.relatedDeal && <span>Deal: {task.relatedDeal.dealTitle}</span>}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-mono text-slate-500 uppercase">{task.status}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SCHEDULED MEETINGS */}
        {activeTab === "meetings" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-extrabold text-navy-900">Investor-Brand Diligence Meetings</h3>
                <p className="text-xs text-slate-500">
                  Tri-party videoconferences, site walk-throughs, and legal agreement alignment sessions.
                </p>
              </div>

              <button
                onClick={() => setMeetingModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 self-start"
              >
                <Plus className="w-4 h-4" /> Schedule New Meeting
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meetings.length === 0 ? (
                <div className="col-span-3 py-10 text-center text-slate-400 text-xs">
                  No scheduled meetings currently on the calendar.
                </div>
              ) : (
                meetings.map((m) => (
                  <div key={m._id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-navy-900 line-clamp-1">{m.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          m.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : m.status === "cancelled"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">{m.agenda}</p>

                    <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>{new Date(m.scheduledStartTime).toLocaleString()}</span>
                      </div>
                      {m.meetingUrl && (
                        <div className="flex items-center gap-1.5 text-blue-600 truncate">
                          <Video className="w-3.5 h-3.5" />
                          <a href={m.meetingUrl} target="_blank" rel="noreferrer" className="underline">
                            Join Video Link
                          </a>
                        </div>
                      )}
                    </div>

                    {m.status === "scheduled" && (
                      <button
                        onClick={() => handleCompleteMeeting(m._id)}
                        className="w-full text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                      >
                        Mark as Completed ✓
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: BUSINESS OPERATIONS ANALYTICS & CSV REPORTING */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-extrabold text-navy-900">Operations & Financial Analytics</h3>
                  <p className="text-xs text-slate-500">
                    Live database-backed conversion metrics, deal volume closed, and brokerage revenue performance.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleDownloadCsv("/reports/deals/csv", `franchisebridge_deals_${Date.now()}.csv`)}
                    disabled={isExporting}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>{isExporting ? "Exporting..." : "Export Deals CSV"}</span>
                  </button>
                  <button
                    onClick={() => handleDownloadCsv("/reports/commissions/csv", `franchisebridge_commissions_${Date.now()}.csv`)}
                    disabled={isExporting}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
                    <span>{isExporting ? "Exporting..." : "Export Commission CSV"}</span>
                  </button>
                </div>
              </div>

              {/* 5 Core Operations KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Conversion Rate</span>
                  <div className="text-2xl font-black text-indigo-700">
                    {analyticsOverview?.summary?.conversionRate ?? 0}%
                  </div>
                  <span className="text-[10px] text-indigo-600 font-semibold">Won vs Closed</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Deal Size</span>
                  <div className="text-2xl font-black text-navy-900">
                    {formatCurrency(analyticsOverview?.summary?.averageDealValue || 0)}
                  </div>
                  <span className="text-[10px] text-slate-500">Per Mandate</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Deal Volume</span>
                  <div className="text-2xl font-black text-blue-600">
                    {formatCurrency(analyticsOverview?.summary?.totalDealValue || 0)}
                  </div>
                  <span className="text-[10px] text-blue-600 font-semibold">Pipeline Gross Value</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expected Commission</span>
                  <div className="text-2xl font-black text-amber-600">
                    {formatCurrency(analyticsOverview?.summary?.expectedCommission || 0)}
                  </div>
                  <span className="text-[10px] text-amber-600 font-semibold">Contracted Fee</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verified Revenue</span>
                  <div className="text-2xl font-black text-emerald-600">
                    {formatCurrency(analyticsOverview?.summary?.receivedRevenue || 0)}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold">Realized Bank Inflows</span>
                </div>
              </div>

              {/* Monthly Trend & Industry Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-extrabold text-navy-900 uppercase tracking-wider">
                    Monthly Performance Trends
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold text-[10px] uppercase">
                          <th className="pb-2">Month</th>
                          <th className="pb-2">Deals Closed</th>
                          <th className="pb-2">Volume</th>
                          <th className="pb-2 text-right">Commission</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(analyticsOverview?.monthlyPerformance || []).length === 0 ? (
                          <tr><td colSpan={4} className="py-4 text-center text-slate-400">No monthly records yet.</td></tr>
                        ) : (
                          (analyticsOverview?.monthlyPerformance || []).map((m: any) => (
                            <tr key={m.month} className="hover:bg-slate-100/50">
                              <td className="py-2.5 font-bold text-slate-700">{m.month}</td>
                              <td className="py-2.5 text-slate-600">{m.dealsCount}</td>
                              <td className="py-2.5 font-medium text-navy-900">{formatCurrency(m.volume || 0)}</td>
                              <td className="py-2.5 font-bold text-emerald-700 text-right">{formatCurrency(m.revenue || 0)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-extrabold text-navy-900 uppercase tracking-wider">
                    Industry Sector Distribution
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold text-[10px] uppercase">
                          <th className="pb-2">Industry</th>
                          <th className="pb-2">Deals</th>
                          <th className="pb-2">Gross Value</th>
                          <th className="pb-2 text-right">Won</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(analyticsOverview?.industryPerformance || []).length === 0 ? (
                          <tr><td colSpan={4} className="py-4 text-center text-slate-400">No sector records yet.</td></tr>
                        ) : (
                          (analyticsOverview?.industryPerformance || []).map((ind: any) => (
                            <tr key={ind.industry} className="hover:bg-slate-100/50">
                              <td className="py-2.5 font-bold text-navy-900">{ind.industry}</td>
                              <td className="py-2.5 text-slate-600">{ind.dealCount}</td>
                              <td className="py-2.5 font-medium text-navy-900">{formatCurrency(ind.totalValue || 0)}</td>
                              <td className="py-2.5 font-bold text-emerald-700 text-right">{ind.dealsWon}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Broker Leaderboard */}
              <div className="pt-2">
                <h4 className="text-xs font-extrabold text-navy-900 uppercase tracking-wider mb-3">
                  Advisor Performance Leaderboard
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                        <th className="pb-3">Advisor / Broker</th>
                        <th className="pb-3">Assigned Leads</th>
                        <th className="pb-3">Qualified Leads</th>
                        <th className="pb-3">Active Pipeline</th>
                        <th className="pb-3">Deals Won</th>
                        <th className="pb-3">Volume Closed</th>
                        <th className="pb-3 text-right">Commission Earned</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(analyticsOverview?.brokerPerformance || metrics?.brokerPerformance || []).length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            No broker performance records available.
                          </td>
                        </tr>
                      ) : (
                        (analyticsOverview?.brokerPerformance || metrics?.brokerPerformance || []).map((bp: any) => (
                          <tr key={bp.brokerId} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4">
                              <div className="font-bold text-navy-900">{bp.brokerName || bp.name}</div>
                              <div className="text-[11px] text-slate-500">{bp.email}</div>
                            </td>
                            <td className="py-4 font-semibold text-slate-700">{bp.totalDeals ?? bp.assignedLeads ?? 0}</td>
                            <td className="py-4 font-bold text-indigo-700">{bp.qualifiedLeads ?? 0}</td>
                            <td className="py-4 font-semibold text-amber-700">{bp.activeDeals ?? 0}</td>
                            <td className="py-4 font-bold text-emerald-700">{bp.dealsWon ?? 0}</td>
                            <td className="py-4 font-bold text-navy-900">{formatCurrency(bp.totalVolume ?? bp.volumeWon ?? 0)}</td>
                            <td className="py-4 font-extrabold text-emerald-700 text-right">
                              {formatCurrency(bp.earnedCommission ?? bp.commissionEarned ?? 0)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: COMMISSION AGREEMENTS & REVENUE TRACKING */}
        {activeTab === "commissions" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-extrabold text-navy-900">Commission Agreements & Verified Revenue</h3>
                <p className="text-xs text-slate-500">
                  Track contracted percentage and fixed fees, milestone triggers, and verified INR payment settlements.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  {agreements.length} Total Agreement{agreements.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                    <th className="pb-3">Agreement #</th>
                    <th className="pb-3">Deal Title</th>
                    <th className="pb-3">Payer & Basis</th>
                    <th className="pb-3">Expected Fee</th>
                    <th className="pb-3">Received Revenue</th>
                    <th className="pb-3">Pending Balance</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {agreements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No commission agreements recorded for your assigned deals yet.
                      </td>
                    </tr>
                  ) : (
                    agreements.map((a: any) => (
                      <tr key={a._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 font-mono font-bold text-navy-900">{a.agreementNumber}</td>
                        <td className="py-4">
                          <div className="font-bold text-navy-900">{a.deal?.dealTitle || "Franchise Deal"}</div>
                          <div className="text-[11px] text-slate-500">Brand: {a.brand?.fullName || "Brand Owner"}</div>
                        </td>
                        <td className="py-4">
                          <span className="uppercase font-semibold text-[11px] text-slate-700 block">{a.payer}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{a.commissionType} ({a.calculationBasis})</span>
                        </td>
                        <td className="py-4 font-bold text-navy-900">{formatCurrency(a.expectedCommission || 0)}</td>
                        <td className="py-4 font-bold text-emerald-700">{formatCurrency(a.receivedRevenue || 0)}</td>
                        <td className="py-4 font-bold text-amber-700">{formatCurrency(a.pendingCommission || 0)}</td>
                        <td className="py-4">
                          <StatusBadge status={a.status} />
                        </td>
                        <td className="py-4 text-right space-x-1.5 whitespace-nowrap">
                          {a.pendingCommission > 0 && (
                            <button
                              onClick={() => {
                                setPaymentModalAgreement(a);
                                setPaymentForm({
                                  amount: a.pendingCommission,
                                  paymentReference: "",
                                  paymentMethod: "RTGS",
                                  payerName: a.brand?.fullName || "",
                                  payerRole: a.payer === "investor" ? "investor" : "brand",
                                  notes: `Milestone settlement for ${a.agreementNumber}`,
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                            >
                              Record Payment
                            </button>
                          )}
                          <button
                            onClick={() => handleViewStatement(a._id)}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                          >
                            Statement
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: OPERATIONAL REMINDERS & NOTIFICATION PREFERENCES */}
        {activeTab === "reminders" && (
          <div className="space-y-6 animate-fade-in">
            {/* Operational Reminders Overview */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-xl font-extrabold text-navy-900">Operational Reminders & Deadlines</h3>
                <p className="text-xs text-slate-500">
                  Aggregated time-sensitive actions across follow-ups, overdue tasks, discovery conferences, and outstanding payments.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Upcoming Follow-ups */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">Lead Follow-ups</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      {reminders?.upcomingFollowUps?.length || 0}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                    {(reminders?.upcomingFollowUps || []).length === 0 ? (
                      <p className="text-slate-400 py-3 text-center">No scheduled follow-ups.</p>
                    ) : (
                      (reminders?.upcomingFollowUps || []).map((f: any) => (
                        <div key={f.leadId} className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                          <div className="font-bold text-navy-900 flex justify-between">
                            <span>{f.leadName}</span>
                            {f.isOverdue && <span className="text-[10px] text-rose-600 font-bold">OVERDUE</span>}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Due: {new Date(f.followUpDate).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. Tasks */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">Action Tasks</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {reminders?.tasks?.length || 0}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                    {(reminders?.tasks || []).length === 0 ? (
                      <p className="text-slate-400 py-3 text-center">No pending tasks.</p>
                    ) : (
                      (reminders?.tasks || []).map((t: any) => (
                        <div key={t.taskId} className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                          <div className="font-bold text-navy-900 flex justify-between">
                            <span className="truncate pr-2">{t.title}</span>
                            {t.isOverdue && <span className="text-[10px] text-rose-600 font-bold shrink-0">OVERDUE</span>}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Due: {new Date(t.dueDate).toLocaleDateString()} • {t.priority}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 3. Upcoming Meetings */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">Scheduled Conferences</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                      {reminders?.meetings?.length || 0}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                    {(reminders?.meetings || []).length === 0 ? (
                      <p className="text-slate-400 py-3 text-center">No scheduled meetings.</p>
                    ) : (
                      (reminders?.meetings || []).map((m: any) => (
                        <div key={m.meetingId} className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                          <div className="font-bold text-navy-900">{m.title}</div>
                          <div className="text-[11px] text-slate-500">
                            {new Date(m.scheduledStartTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Preferences Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="pb-4 border-b border-slate-100 flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-xl font-extrabold text-navy-900">Notification Channels & Delivery Preferences</h3>
                  <p className="text-xs text-slate-500">
                    Control in-app alerts and notifications dispatched for deals, leads, meetings, documents, and payments.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {[
                  { key: "inAppNotifications", label: "In-App Alerts", desc: "Notification drawer and banner badges" },
                  { key: "emailNotifications", label: "Email Notifications", desc: "Dispatched to registered mailbox" },
                  { key: "leadAlerts", label: "New Lead & Enquiry Alerts", desc: "Inbounds assigned to your desk" },
                  { key: "dealAlerts", label: "Deal Pipeline Changes", desc: "Stage advancements and conversions" },
                  { key: "commissionAlerts", label: "Commission & Payment Alerts", desc: "Due milestones and received bank remittances" },
                  { key: "meetingReminders", label: "Meeting Reminders", desc: "Calendar invites & conference links" },
                  { key: "documentAlerts", label: "Document Uploads", desc: "Deal room document submissions" },
                  { key: "diligenceAlerts", label: "Due Diligence Updates", desc: "Review approvals and clarification tickets" },
                ].map((item) => {
                  const isChecked = notifPreferences ? !!notifPreferences[item.key] : true;
                  return (
                    <label
                      key={item.key}
                      className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleTogglePreference(item.key, e.target.checked)}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-bold text-navy-900">{item.label}</div>
                        <div className="text-[11px] text-slate-500">{item.desc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: QUALIFY INVESTOR LEAD */}
      {qualifyModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                  Investor Qualification Desk
                </span>
                <h3 className="text-lg font-extrabold text-navy-900 mt-1">{qualifyModalLead.fullName}</h3>
                <p className="text-xs text-slate-500">{qualifyModalLead.company || "Independent Investor"}</p>
              </div>
              <button onClick={() => setQualifyModalLead(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Budget Min (INR)</label>
                  <input
                    type="number"
                    value={qualBudgetMin}
                    onChange={(e) => setQualBudgetMin(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Budget Max (INR)</label>
                  <input
                    type="number"
                    value={qualBudgetMax}
                    onChange={(e) => setQualBudgetMax(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Readiness Level</label>
                  <select
                    value={qualReadiness}
                    onChange={(e) => setQualReadiness(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="ready_to_invest">Ready to Invest</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="exploring">Exploring</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Qualification Status</label>
                  <select
                    value={qualStatus}
                    onChange={(e) => setQualStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 font-bold"
                  >
                    <option value="QUALIFIED">QUALIFIED</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="NEW">NEW</option>
                    <option value="NOT_QUALIFIED">NOT_QUALIFIED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Business & Franchise Experience</label>
                <input
                  type="text"
                  value={qualExperience}
                  onChange={(e) => setQualExperience(e.target.value)}
                  placeholder="e.g., 8 years QSR multi-unit operator"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Confidential Qualification Notes</label>
                <textarea
                  rows={3}
                  value={qualNotes}
                  onChange={(e) => setQualNotes(e.target.value)}
                  placeholder="Record verified liquid proof, net worth, territory fit..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 font-mono text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setQualifyModalLead(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQualification}
                disabled={isUpdating}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-sm transition-all disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Save Qualification"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONVERT LEAD TO ACTIVE DEAL */}
      {convertModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                  Lead Conversion Pipeline
                </span>
                <h3 className="text-lg font-extrabold text-navy-900 mt-1">Convert Lead to Live Deal</h3>
                <p className="text-xs text-slate-500">Candidate: {convertModalLead.fullName}</p>
              </div>
              <button onClick={() => setConvertModalLead(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Deal Title</label>
                <input
                  type="text"
                  value={convDealTitle}
                  onChange={(e) => setConvDealTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Deal Value (INR)</label>
                  <input
                    type="number"
                    value={convDealValue}
                    onChange={(e) => setConvDealValue(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Franchise Fee (INR)</label>
                  <input
                    type="number"
                    value={convFranchiseFee}
                    onChange={(e) => setConvFranchiseFee(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Broker Notes</label>
                <textarea
                  rows={2}
                  value={convNotes}
                  onChange={(e) => setConvNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setConvertModalLead(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteConversion}
                disabled={isUpdating}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-sm transition-all disabled:opacity-50"
              >
                {isUpdating ? "Converting..." : "Convert to Deal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: STAGE PROGRESSION CONFIRMATION */}
      {stageModalDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                  Stage Transition Audit
                </span>
                <h3 className="text-base font-extrabold text-navy-900 mt-1">{stageModalDeal.dealTitle}</h3>
              </div>
              <button onClick={() => setStageModalDeal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-medium">Previous: {stageModalDeal.stage}</span>
                <ArrowRight className="w-4 h-4 text-blue-600" />
                <span className="font-extrabold text-navy-900">New: {targetStage}</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Reason / Diligence Note for Stage Change
                </label>
                <textarea
                  rows={3}
                  value={stageChangeNote}
                  onChange={(e) => setStageChangeNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setStageModalDeal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStageChange}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-sm transition-all disabled:opacity-50"
              >
                {isUpdating ? "Updating..." : "Confirm Stage Move"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: SCHEDULE MEETING */}
      {meetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">
                  Calendar Scheduler
                </span>
                <h3 className="text-lg font-extrabold text-navy-900 mt-1">Schedule Diligence Meeting</h3>
              </div>
              <button onClick={() => setMeetingModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleMeeting} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Meeting Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Discovery Conference: RoastCraft & Sunil Mehra"
                  value={newMeetingTitle}
                  onChange={(e) => setNewMeetingTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newMeetingStartTime}
                    onChange={(e) => setNewMeetingStartTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newMeetingEndTime}
                    onChange={(e) => setNewMeetingEndTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Agenda & Meeting Goal</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Review unit economics, territory availability, opening timeline..."
                  value={newMeetingAgenda}
                  onChange={(e) => setNewMeetingAgenda(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMeetingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  {isUpdating ? "Scheduling..." : "Schedule Conference"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: RECORD COMMISSION PAYMENT */}
      {paymentModalAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                  Commission Revenue Settlement
                </span>
                <h3 className="text-lg font-extrabold text-navy-900 mt-1">
                  Record Verified Payment
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Agreement #{paymentModalAgreement.agreementNumber} • Pending: {formatCurrency(paymentModalAgreement.pendingCommission)}
                </p>
              </div>
              <button
                onClick={() => setPaymentModalAgreement(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800">
                <span className="font-bold">Duplicate Guard:</span> Each transaction requires a unique UTR or bank reference number. Duplicate references are automatically rejected with HTTP 409.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Amount (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="RTGS">RTGS</option>
                    <option value="NEFT">NEFT</option>
                    <option value="IMPS">IMPS</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Unique Transaction Reference / UTR *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR-HDFC-2026-998811"
                  value={paymentForm.paymentReference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentReference: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Payer Name
                  </label>
                  <input
                    type="text"
                    value={paymentForm.payerName}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payerName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Payer Role
                  </label>
                  <select
                    value={paymentForm.payerRole}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payerRole: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="brand">Brand</option>
                    <option value="investor">Investor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Internal Notes
                </label>
                <textarea
                  rows={2}
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Verified against company bank account statement..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPaymentModalAgreement(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  {isUpdating ? "Recording..." : "Record & Verify Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: COMMISSION STATEMENT */}
      {statementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                  Official Financial Statement
                </span>
                <h3 className="text-lg font-extrabold text-navy-900 mt-1">
                  {statementModal.statementNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  Deal: {statementModal.dealTitle} • Agreement #{statementModal.agreementNumber}
                </p>
              </div>
              <button
                onClick={() => setStatementModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contracted</span>
                <div className="text-base font-extrabold text-navy-900 mt-0.5">
                  {formatCurrency(statementModal.financialSummary?.expectedCommission || 0)}
                </div>
              </div>
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Received</span>
                <div className="text-base font-extrabold text-emerald-800 mt-0.5">
                  {formatCurrency(statementModal.financialSummary?.receivedRevenue || 0)}
                </div>
              </div>
              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Pending</span>
                <div className="text-base font-extrabold text-amber-800 mt-0.5">
                  {formatCurrency(statementModal.financialSummary?.pendingCommission || 0)}
                </div>
              </div>
            </div>

            {/* Verified Payments Ledger */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">Verified Remittances Ledger</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-2.5">Reference / UTR</th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Method</th>
                      <th className="p-2.5">Amount (INR)</th>
                      <th className="p-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(statementModal.payments || statementModal.verifiedPayments || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400">
                          No payment transactions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      (statementModal.payments || statementModal.verifiedPayments || []).map((p: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono text-[11px] font-bold text-slate-800">{p.paymentReference}</td>
                          <td className="p-2.5 text-slate-600">{new Date(p.paymentDate).toLocaleDateString()}</td>
                          <td className="p-2.5 text-slate-600 uppercase">{p.paymentMethod}</td>
                          <td className="p-2.5 font-bold text-emerald-700">{formatCurrency(p.amount)}</td>
                          <td className="p-2.5 text-right">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStatementModal(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
