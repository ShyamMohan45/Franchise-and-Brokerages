"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Plus,
  AlertCircle,
  FileCheck2,
  Clock,
  Layers,
  Settings,
  ListOrdered,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"metrics" | "pipeline" | "leads" | "businesses" | "users" | "audit" | "settings">("metrics");
  const [metrics, setMetrics] = useState<any | null>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // New Lead Modal state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadForm, setLeadForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    leadType: "multi_unit_operator",
    priority: "high",
    budgetMin: 5000000,
    budgetMax: 15000000,
    internalNotes: "",
  });

  useEffect(() => {
    if (!isLoading) {
      if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
        router.push("/login");
        return;
      }
    }

    async function loadAdminData() {
      try {
        setLoading(true);
        const [metRes, dealRes, leadRes, bizRes, userRes, auditRes, setRes] = await Promise.all([
          api.get<any>("/admin/dashboard"),
          api.get<any[]>("/admin/deals"),
          api.get<any[]>("/admin/leads"),
          api.get<any[]>("/admin/businesses"),
          api.get<any[]>("/admin/users"),
          api.get<any[]>("/admin/audit-logs"),
          api.get<any>("/admin/settings"),
        ]);

        if (metRes.success && metRes.data) setMetrics(metRes.data);
        if (dealRes.success && dealRes.data) setDeals(dealRes.data);
        if (leadRes.success && leadRes.data) setLeads(leadRes.data);
        if (bizRes.success && bizRes.data) setBusinesses(bizRes.data);
        if (userRes.success && userRes.data) setUsersList(userRes.data);
        if (auditRes.success && auditRes.data) setAuditLogs(auditRes.data);
        if (setRes.success && setRes.data) setSettings(setRes.data);
      } catch (err) {
        console.error("Admin data load error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user && (user.role === "admin" || user.role === "super_admin")) {
      loadAdminData();
    }
  }, [user, isLoading, router]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/admin/leads", leadForm);
      if (res.success && res.data) {
        setLeads([res.data, ...leads]);
        setIsLeadModalOpen(false);
        setLeadForm({
          fullName: "",
          email: "",
          phone: "",
          company: "",
          leadType: "multi_unit_operator",
          priority: "high",
          budgetMin: 5000000,
          budgetMax: 15000000,
          internalNotes: "",
        });
      }
    } catch (err: any) {
      alert(err.message || "Failed to create lead");
    }
  };

  const handleUpdateDealStage = async (dealId: string, newStage: string) => {
    try {
      const res = await api.patch(`/admin/deals/${dealId}`, {
        stage: newStage,
        stageChangeNote: `Admin moved deal to ${newStage.replace(/_/g, " ")}`,
      });
      if (res.success && res.data) {
        setDeals(deals.map((d) => (d._id === dealId ? res.data : d)));
      }
    } catch (err: any) {
      alert(err.message || "Failed to update deal stage");
    }
  };

  const handleUpdateBusinessStatus = async (bizId: string, status: string) => {
    try {
      const res = await api.patch(`/admin/businesses/${bizId}/status`, {
        status,
        adminReviewNotes: `Approved by ${user?.fullName}`,
      });
      if (res.success && res.data) {
        setBusinesses(businesses.map((b) => (b._id === bizId ? res.data : b)));
      }
    } catch (err: any) {
      alert(err.message || "Failed to update business status");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Accessing Brokerage Management Engine...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-[#0B1220] text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/50 text-blue-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Executive Brokerage CRM & Operations Control Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Brokerage Central: {user?.fullName}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Real-time pipeline analytics, franchisee matching, FDD compliance reviews, and deal commission management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsLeadModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create CRM Lead
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-xs font-semibold">
        {[
          { id: "metrics", label: "Executive Analytics", icon: TrendingUp },
          { id: "pipeline", label: `Deal Pipeline (${deals.length})`, icon: DollarSign },
          { id: "leads", label: `CRM Leads (${leads.length})`, icon: Briefcase },
          { id: "businesses", label: `Brands Review (${businesses.length})`, icon: Building2 },
          { id: "users", label: `Users & Roles (${usersList.length})`, icon: Users },
          { id: "audit", label: `Audit Trail (${auditLogs.length})`, icon: ListOrdered },
          { id: "settings", label: "Brokerage Policies", icon: Settings },
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

      {/* TAB 1: EXECUTIVE ANALYTICS */}
      {activeTab === "metrics" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase">Active Deal Pipeline</span>
              <div className="text-3xl font-extrabold text-navy-900">
                {formatCurrency(metrics?.pipelineValue || 22500000)}
              </div>
              <p className="text-[11px] text-slate-500">{metrics?.activeDealsCount || 2} deals currently in negotiation</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase">Projected Commissions</span>
              <div className="text-3xl font-extrabold text-emerald-600">
                {formatCurrency(metrics?.projectedCommission || 1125000)}
              </div>
              <p className="text-[11px] text-slate-500">Based on default 5% brokerage rate</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase">Total Users</span>
              <div className="text-3xl font-extrabold text-navy-900">{metrics?.totalUsers || 7}</div>
              <p className="text-[11px] text-slate-500">
                {metrics?.totalBusinessOwners || 3} Franchisors • {metrics?.totalInvestors || 2} Investors
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase">Published Franchises</span>
              <div className="text-3xl font-extrabold text-navy-900">{metrics?.publishedFranchises || 3}</div>
              <p className="text-[11px] text-slate-500">{metrics?.totalApplications || 2} investor applications</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEAL PIPELINE BOARD */}
      {activeTab === "pipeline" && (
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-navy-900">Brokerage Deal Pipeline</h3>
            <p className="text-xs text-slate-500">
              Stages: Lead Received &rarr; Qualification &rarr; Matching &rarr; Discussion &rarr; FDD Review &rarr; Negotiation &rarr; Closed
            </p>
          </div>

          <div className="space-y-4">
            {deals.map((deal) => (
              <div key={deal._id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-navy-900">{deal.dealTitle}</h4>
                    <span className="text-xs text-slate-500">
                      Brand: {deal.franchiseListing?.brandName} • Investor: {deal.investor?.fullName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={deal.stage} />
                    <select
                      value={deal.stage}
                      onChange={(e) => handleUpdateDealStage(deal._id, e.target.value)}
                      className="text-xs border rounded-lg px-2 py-1 bg-slate-50 font-semibold text-slate-700"
                    >
                      <option value="lead_received">Lead Received</option>
                      <option value="qualification">Qualification</option>
                      <option value="matching">Matching</option>
                      <option value="initial_discussion">Initial Discussion</option>
                      <option value="documentation_review">Documentation Review</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="agreement_pending">Agreement Pending</option>
                      <option value="deal_closed">Deal Closed</option>
                      <option value="lost_cancelled">Lost / Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Expected Deal Value</span>
                    <span className="font-bold text-navy-900 mt-0.5 block">{formatCurrency(deal.dealValue)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Initial Franchise Fee</span>
                    <span className="font-bold text-navy-900 mt-0.5 block">{formatCurrency(deal.franchiseFee)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Commission Rate</span>
                    <span className="font-bold text-navy-900 mt-0.5 block">
                      {(deal.commissionRate * 100).toFixed(1)}% ({formatCurrency(deal.expectedCommission)})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Assigned Broker</span>
                    <span className="font-bold text-navy-900 mt-0.5 block">
                      {deal.assignedBroker?.fullName || "Broker Admin"}
                    </span>
                  </div>
                </div>

                {deal.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    Broker Notes: {deal.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CRM LEADS */}
      {activeTab === "leads" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-navy-900">CRM Lead Registry</h3>
              <p className="text-xs text-slate-500">Inbound and prospective franchisor/franchisee leads</p>
            </div>
            <button
              onClick={() => setIsLeadModalOpen(true)}
              className="bg-blue-600 text-white font-semibold text-xs px-4 py-2 rounded-xl"
            >
              Add Lead
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leads.map((lead) => (
              <div key={lead._id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 capitalize">
                    {lead.leadType?.replace(/_/g, " ")}
                  </span>
                  <StatusBadge status={lead.status} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-navy-900">{lead.fullName}</h4>
                  <p className="text-xs text-slate-500">{lead.company} • {lead.email} • {lead.phone}</p>
                </div>
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                  {lead.internalNotes || "No notes recorded"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BRANDS REVIEW */}
      {activeTab === "businesses" && (
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-navy-900">Brand Profiles Review</h3>
            <p className="text-xs text-slate-500">Approve or request revisions for businesses seeking franchise readiness</p>
          </div>

          <div className="space-y-4">
            {businesses.map((biz) => (
              <div key={biz._id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-navy-900">{biz.businessName}</h4>
                    <span className="text-xs text-slate-500">
                      Founder: {biz.founderName} • {biz.headquarters?.city} • {biz.numberOfOutlets} Existing Outlets
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={biz.approvalStatus} />
                    {biz.approvalStatus !== "approved" && (
                      <button
                        onClick={() => handleUpdateBusinessStatus(biz._id, "approved")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                      >
                        Approve Brand
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{biz.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: USERS & ROLES */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-navy-900">User Management</h3>
            <p className="text-xs text-slate-500">Platform users across all stakeholder roles</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3 text-left">User</th>
                  <th className="px-6 py-3 text-left">Role</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-navy-900">
                      {u.fullName}
                      <span className="block text-slate-400 font-normal">{u.email}</span>
                    </td>
                    <td className="px-6 py-4 capitalize font-medium">{u.role.replace("_", " ")}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT TRAIL */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-navy-900">System Audit Trail</h3>
            <p className="text-xs text-slate-500">Immutable record of critical status changes and approvals</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 text-xs">
              {auditLogs.map((log) => (
                <div key={log._id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="space-y-0.5">
                    <span className="font-bold text-navy-900">{log.action}</span>
                    <span className="text-slate-400 block">
                      Actor: {log.actorEmail} ({log.actorRole}) • Entity: {log.entityType}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{formatDate(log.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SETTINGS */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 max-w-xl shadow-sm">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-navy-900">Platform & Brokerage Policies</h3>
            <p className="text-xs text-slate-500">Configure default brokerage fee economics and compliance rules</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Default Brokerage Commission</label>
              <input
                type="text"
                disabled
                value={`${(settings?.defaultCommissionRate || 0.05) * 100}% of Franchise Deal Capital`}
                className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-700 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Jurisdiction Governance</label>
              <input
                type="text"
                disabled
                value="Global / Dual Mode (US FTC 23-Item & India FIM/Contract Framework)"
                className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-700 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">NDA Requirement</label>
              <input
                type="text"
                disabled
                value="Mandatory before direct investor contact disclosure"
                className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-700 font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Lead Modal */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-navy-900">Register CRM Lead</h3>
              <button
                onClick={() => setIsLeadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={leadForm.fullName}
                  onChange={(e) => setLeadForm({ ...leadForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Company / Group</label>
                <input
                  type="text"
                  value={leadForm.company}
                  onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Internal Broker Notes</label>
                <textarea
                  rows={2}
                  value={leadForm.internalNotes}
                  onChange={(e) => setLeadForm({ ...leadForm, internalNotes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLeadModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
