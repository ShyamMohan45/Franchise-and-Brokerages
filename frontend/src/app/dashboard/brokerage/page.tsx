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
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";

export default function BrokerageDashboardPage() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchEnquiry, setSearchEnquiry] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Detail Modal / Drawer state
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [internalNoteText, setInternalNoteText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [tasks, setTasks] = useState([
    { id: "1", title: "Verify liquid capital proof for Sunil Mehra (Indiranagar)", dueDate: "Today", done: false, priority: "high" },
    { id: "2", title: "Send FDD Item 19 audit addendum to Rajesh Singhania", dueDate: "Tomorrow", done: false, priority: "high" },
    { id: "3", title: "Schedule territory inspection call with RoastCraft Founder", dueDate: "10 Nov", done: true, priority: "medium" },
    { id: "4", title: "Follow up on Bandra West multi-unit NDA execution", dueDate: "12 Nov", done: false, priority: "low" },
  ]);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [dealRes, leadRes, enqRes] = await Promise.all([
          api.get<any[]>("/admin/deals"),
          api.get<any[]>("/admin/leads"),
          api.get<any[]>("/applications/broker"),
        ]);
        if (dealRes.success && dealRes.data) setDeals(dealRes.data);
        if (leadRes.success && leadRes.data) setLeads(leadRes.data);
        if (enqRes.success && enqRes.data) setEnquiries(enqRes.data);
      } catch (err) {
        console.error("Brokerage dashboard error", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const handleOpenDetail = (enquiry: any) => {
    setSelectedEnquiry(enquiry);
    setInternalNoteText(enquiry.internalNotes || "");
  };

  const handleUpdateStatus = async (enquiryId: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      const res = await api.patch<any>(`/applications/${enquiryId}/status`, {
        status: newStatus,
      });
      if (res.success) {
        setEnquiries((prev) =>
          prev.map((e) => (e._id === enquiryId ? { ...e, status: newStatus } : e))
        );
        if (selectedEnquiry && selectedEnquiry._id === enquiryId) {
          setSelectedEnquiry((prev: any) => ({ ...prev, status: newStatus }));
        }
        showFeedback("success", `Enquiry status updated to ${newStatus}`);
      }
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignToMe = async (enquiryId: string) => {
    try {
      setIsUpdating(true);
      const res = await api.post<any>(`/applications/${enquiryId}/assign`, {
        brokerId: user?.id || user?._id,
      });
      if (res.success) {
        setEnquiries((prev) =>
          prev.map((e) =>
            e._id === enquiryId
              ? { ...e, assignedBroker: user, status: e.status === "NEW" ? "ASSIGNED" : e.status }
              : e
          )
        );
        if (selectedEnquiry && selectedEnquiry._id === enquiryId) {
          setSelectedEnquiry((prev: any) => ({
            ...prev,
            assignedBroker: user,
            status: prev.status === "NEW" ? "ASSIGNED" : prev.status,
          }));
        }
        showFeedback("success", "Enquiry assigned to your desk.");
      }
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to assign advisor");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveInternalNote = async (enquiryId: string) => {
    try {
      setIsUpdating(true);
      const res = await api.patch<any>(`/applications/${enquiryId}/status`, {
        internalNotes: internalNoteText,
      });
      if (res.success) {
        setEnquiries((prev) =>
          prev.map((e) => (e._id === enquiryId ? { ...e, internalNotes: internalNoteText } : e))
        );
        if (selectedEnquiry && selectedEnquiry._id === enquiryId) {
          setSelectedEnquiry((prev: any) => ({ ...prev, internalNotes: internalNoteText }));
        }
        showFeedback("success", "Internal brokerage notes saved securely.");
      }
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to save internal notes");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesStatus =
      statusFilter === "ALL" || e.status?.toUpperCase() === statusFilter.toUpperCase();
    const query = searchEnquiry.toLowerCase();
    const matchesSearch =
      !query ||
      e.referenceNumber?.toLowerCase().includes(query) ||
      e.brandName?.toLowerCase().includes(query) ||
      e.proposedLocationCity?.toLowerCase().includes(query) ||
      e.investorUser?.fullName?.toLowerCase().includes(query) ||
      e.investorUser?.email?.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
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

        {/* Welcome Header */}
        <div className="bg-[#14243A] text-white rounded-3xl p-8 border border-[#1C2A3E] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#315EFB]/20 text-[#6092FB] border border-[#315EFB]/30 text-xs font-semibold">
              <Briefcase className="w-3.5 h-3.5" />
              Brokerage & Transaction Desk
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Investor Enquiries & Expansion Deal Pipeline
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Track investor inquiries, assign advisors, review diligence packets, manage internal brokerage notes, and orchestrate territory closings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/deal-room"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-5 text-xs rounded-xl shadow-md transition-all"
            >
              Open Digital Deal Rooms
            </Link>
          </div>
        </div>

        {/* 4 Executive Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Inbound Enquiries
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#14243A]">
              {enquiries.length || leads.length || 0}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Live Institutional Flow
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              New Unassigned
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">
              {enquiries.filter((e) => e.status === "NEW" || !e.assignedBroker).length}
            </div>
            <span className="text-[11px] text-slate-500">Requires Broker Assignment</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Qualified & In Diligence
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">
              {enquiries.filter((e) => ["QUALIFIED", "IN_PROGRESS", "ASSIGNED"].includes(e.status)).length}
            </div>
            <span className="text-[11px] text-indigo-600 font-semibold">Active Capital Matches</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Converted & Closed Deals
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
              {enquiries.filter((e) => ["CONVERTED", "CLOSED"].includes(e.status)).length}
            </div>
            <span className="text-[11px] text-slate-500">Executing Territory Agreements</span>
          </div>
        </div>

        {/* Milestone 4: Investor Enquiries CRM Management Desk */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-navy-900">Inbound Investor Enquiries Desk</h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {filteredEnquiries.length} Enquiries
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Manage candidate submissions, assign broker representatives, record internal confidential notes, and update statuses.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ref #, brand, city, or investor..."
                value={searchEnquiry}
                onChange={(e) => setSearchEnquiry(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {["ALL", "NEW", "ASSIGNED", "CONTACTED", "QUALIFIED", "IN_PROGRESS", "CONVERTED", "CLOSED"].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    statusFilter === st
                      ? "bg-navy-900 text-white border-navy-900 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {st === "ALL" ? "All Enquiries" : st}
                </button>
              )
            )}
          </div>

          {/* Enquiries Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="pb-3">Reference / Date</th>
                  <th className="pb-3">Investor Candidate</th>
                  <th className="pb-3">Target Franchise Brand</th>
                  <th className="pb-3">Budget / Liquid</th>
                  <th className="pb-3">Location & Units</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Assigned Advisor</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No investor enquiries matching current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEnquiries.map((enq) => (
                    <tr key={enq._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px] block w-fit">
                          {enq.referenceNumber || "ENQ-PENDING"}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {formatDate(enq.createdAt)}
                        </span>
                      </td>

                      <td className="py-4">
                        <div className="font-bold text-navy-900">
                          {enq.investorUser?.fullName || enq.investorProfile?.fullName || "Verified Investor"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {enq.investorUser?.email || enq.investorUser?.phone || "Contact via portal"}
                        </div>
                      </td>

                      <td className="py-4">
                        <div className="font-bold text-navy-900">
                          {enq.franchise?.brandName || enq.brandName || "Franchise Listing"}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {enq.franchise?.category || "Expansion"}
                        </span>
                      </td>

                      <td className="py-4">
                        <div className="font-bold text-navy-900">
                          {formatCurrency(enq.investmentBudget || enq.investorProfile?.investmentBudgetMax)}
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          Reserve: {formatCurrency(enq.availableLiquidCapital || enq.investorProfile?.liquidCapital)}
                        </span>
                      </td>

                      <td className="py-4">
                        <div className="font-semibold text-slate-800">
                          {enq.proposedLocationCity || enq.investorProfile?.city || "Unspecified"}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {enq.unitsInterested || 1} Unit(s)
                        </span>
                      </td>

                      <td className="py-4">
                        <StatusBadge status={enq.status} />
                      </td>

                      <td className="py-4">
                        {enq.assignedBroker ? (
                          <div className="font-medium text-slate-700 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span>{enq.assignedBroker.fullName || enq.assignedBroker.name || enq.assignedBroker.email}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAssignToMe(enq._id)}
                            className="text-[11px] text-blue-600 font-bold bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
                          >
                            Assign to Me
                          </button>
                        )}
                      </td>

                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleOpenDetail(enq)}
                          className="bg-navy-900 hover:bg-navy-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm transition-all"
                        >
                          Manage &rarr;
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Territory Deal Pipeline Kanban Overview */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-navy-900">Territory Deal Pipeline Overview</h3>
              <p className="text-xs text-slate-500">Active transactions across each diligence stage</p>
            </div>
            <span className="text-xs text-slate-500 font-medium">Stage Velocity: ~14 Days</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                stage: "1. Qualification & Discovery",
                count: enquiries.filter((e) => ["NEW", "ASSIGNED", "CONTACTED"].includes(e.status)).length || 4,
                deals: ["RoastCraft - Bengaluru (₹45L)", "FitPulse - Gurugram (₹85L)"],
                color: "border-l-blue-500",
              },
              {
                stage: "2. FDD Review & NDA Signed",
                count: enquiries.filter((e) => e.status === "QUALIFIED").length || 3,
                deals: ["RoastCraft - Indiranagar (₹55L)", "LittleSparks - Whitefield (₹60L)"],
                color: "border-l-indigo-500",
              },
              {
                stage: "3. Agreement Negotiation",
                count: enquiries.filter((e) => e.status === "IN_PROGRESS").length || 2,
                deals: ["BiryaniDarbar - Hyderabad (₹1.2Cr)"],
                color: "border-l-amber-500",
              },
              {
                stage: "4. E-Signed & Closed",
                count: enquiries.filter((e) => ["CONVERTED", "CLOSED"].includes(e.status)).length || 5,
                deals: ["RoastCraft - Koramangala (₹50L)", "FitPulse - Pune (₹75L)"],
                color: "border-l-emerald-500",
              },
            ].map((col, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy-900 truncate">{col.stage}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                    {col.count}
                  </span>
                </div>
                <div className="space-y-2">
                  {col.deals.map((d, dIdx) => (
                    <div
                      key={dIdx}
                      className={`p-3 rounded-xl bg-white border border-slate-200 text-xs font-medium text-navy-900 shadow-sm border-l-4 ${col.color}`}
                    >
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Management */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm max-w-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-navy-900">Pending Brokerage Follow-Ups</h3>
            <span className="text-xs text-slate-500">{tasks.filter((t) => !t.done).length} Tasks Active</span>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                  task.done
                    ? "bg-slate-50 border-slate-200 opacity-60"
                    : "bg-white border-slate-200 hover:border-blue-500"
                }`}
              >
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => {}}
                  className="mt-0.5 rounded text-blue-600"
                />
                <div className="space-y-1 flex-1">
                  <p
                    className={`text-xs leading-relaxed ${
                      task.done ? "line-through text-slate-400" : "font-medium text-navy-900"
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Due {task.dueDate}
                    </span>
                    <span
                      className={`font-bold uppercase ${
                        task.priority === "high" ? "text-rose-600" : "text-blue-600"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DETAIL & MANAGEMENT MODAL / DRAWER */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg text-xs border border-blue-200">
                    {selectedEnquiry.referenceNumber || "ENQ-PENDING"}
                  </span>
                  <StatusBadge status={selectedEnquiry.status} />
                </div>
                <h3 className="text-xl font-extrabold text-navy-900 mt-2">
                  {selectedEnquiry.franchise?.brandName || selectedEnquiry.brandName || "Franchise Opportunity"}
                </h3>
                <p className="text-xs text-slate-500">
                  Candidate: {selectedEnquiry.investorUser?.fullName || selectedEnquiry.investorProfile?.fullName || "Verified Investor"}
                </p>
              </div>

              <button
                onClick={() => setSelectedEnquiry(null)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate & Deal Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Candidate Email</span>
                <span className="font-semibold text-navy-900 mt-0.5 block truncate">
                  {selectedEnquiry.investorUser?.email || "—"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone</span>
                <span className="font-semibold text-navy-900 mt-0.5 block">
                  {selectedEnquiry.investorUser?.phone || selectedEnquiry.investorProfile?.phone || "—"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Target City</span>
                <span className="font-semibold text-navy-900 mt-0.5 block">
                  {selectedEnquiry.proposedLocationCity || "—"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Pledged Budget</span>
                <span className="font-bold text-emerald-700 mt-0.5 block">
                  {formatCurrency(selectedEnquiry.investmentBudget || selectedEnquiry.investorProfile?.investmentBudgetMax)}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Liquid Reserve</span>
                <span className="font-bold text-navy-900 mt-0.5 block">
                  {formatCurrency(selectedEnquiry.availableLiquidCapital || selectedEnquiry.investorProfile?.liquidCapital)}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Timeline</span>
                <span className="font-semibold text-navy-900 mt-0.5 block capitalize">
                  {selectedEnquiry.timeline?.replace(/_/g, " ") || "Flexible"}
                </span>
              </div>
            </div>

            {/* Status Transition Control */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider">
                Update Deal Progression Status
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {["NEW", "ASSIGNED", "CONTACTED", "QUALIFIED", "IN_PROGRESS", "CONVERTED", "CLOSED"].map(
                  (st) => (
                    <button
                      key={st}
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(selectedEnquiry._id, st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        selectedEnquiry.status === st
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Broker Assignment Control */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider">
                  Assigned Advisor Desk
                </label>
                {selectedEnquiry.assignedBroker ? (
                  <span className="text-xs text-blue-700 font-semibold">
                    Current: {selectedEnquiry.assignedBroker.fullName || selectedEnquiry.assignedBroker.name || selectedEnquiry.assignedBroker.email}
                  </span>
                ) : (
                  <span className="text-xs text-amber-600 font-semibold">Unassigned</span>
                )}
              </div>
              <button
                onClick={() => handleAssignToMe(selectedEnquiry._id)}
                disabled={isUpdating}
                className="w-full bg-slate-100 hover:bg-slate-200 text-navy-900 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4 text-blue-600" />
                Assign Opportunity to Me
              </button>
            </div>

            {/* CRUCIAL SECURITY REQUIREMENT: Internal Brokerage Notes */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider">
                    Internal Brokerage Notes
                  </label>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  🔒 Strictly Confidential (Broker/Admin Only)
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                These notes are never visible to the investor and are sanitized from candidate API responses.
              </p>
              <textarea
                rows={3}
                value={internalNoteText}
                onChange={(e) => setInternalNoteText(e.target.value)}
                placeholder="Record candidate net worth verification, franchisor reaction, negotiation notes, credit background..."
                className="w-full p-3 text-xs border rounded-2xl border-slate-200 focus:outline-none focus:border-blue-500 font-mono text-slate-800"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => handleSaveInternalNote(selectedEnquiry._id)}
                  disabled={isUpdating}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-6 py-2 rounded-xl text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  {isUpdating ? "Saving Note..." : "Save Internal Notes"}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              {(selectedEnquiry.franchise?.slug || selectedEnquiry.franchise?._id) && (
                <Link
                  href={`/franchises/${selectedEnquiry.franchise?.slug || selectedEnquiry.franchise?._id}`}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  View Marketplace Listing <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2 rounded-xl text-xs transition-colors"
              >
                Close Desk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
