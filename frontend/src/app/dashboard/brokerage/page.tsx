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
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DealPipelineStage {
  stage: string;
  count: number;
  value: number;
}

export default function BrokerageDashboardPage() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLead, setSearchLead] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [tasks, setTasks] = useState([
    { id: "1", title: "Verify liquid capital proof for Sunil Mehra ( Indiranagar)", dueDate: "Today", done: false, priority: "high" },
    { id: "2", title: "Send FDD Item 19 audit addendum to Rajesh Singhania", dueDate: "Tomorrow", done: false, priority: "high" },
    { id: "3", title: "Schedule territory inspection call with RoastCraft Founder", dueDate: "10 Nov", done: true, priority: "medium" },
    { id: "4", title: "Follow up on Bandra West multi-unit NDA execution", dueDate: "12 Nov", done: false, priority: "low" },
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [dealRes, leadRes] = await Promise.all([
          api.get<any[]>("/admin/deals"),
          api.get<any[]>("/admin/leads"),
        ]);
        if (dealRes.success && dealRes.data) setDeals(dealRes.data);
        if (leadRes.success && leadRes.data) setLeads(leadRes.data);
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

  const filteredLeads = leads.filter(
    (l) =>
      l.fullName?.toLowerCase().includes(searchLead.toLowerCase()) ||
      l.email?.toLowerCase().includes(searchLead.toLowerCase()) ||
      l.company?.toLowerCase().includes(searchLead.toLowerCase())
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Header */}
        <div className="bg-[#14243A] text-white rounded-2xl p-8 border border-[#1C2A3E] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#315EFB]/20 text-[#6092FB] border border-[#315EFB]/30 text-xs font-semibold">
              <Briefcase className="w-3.5 h-3.5" />
              Brokerage & Transaction Desk
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Expansion Deal Pipeline & Brokerage CRM
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Track investor inquiries, manage due diligence pipelines, monitor virtual deal rooms, and oversee contractual territory closings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/deal-room"
              className="btn-primary py-2.5 px-5 text-xs font-semibold"
            >
              Open Digital Deal Rooms
            </Link>
          </div>
        </div>

        {/* 4 Executive Metric Cards (Ramp / Linear style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="surface-card p-5 space-y-2">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Total Inbound Leads
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#14243A]">
              {leads.length || 24}
            </div>
            <span className="text-[11px] text-[#159D8B] font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +18% MoM Growth
            </span>
          </div>

          <div className="surface-card p-5 space-y-2">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Qualified Operators
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#315EFB]">
              {leads.filter((l) => l.priority === "high").length || 14}
            </div>
            <span className="text-[11px] text-[#64748B]">Liquid Capital Verified</span>
          </div>

          <div className="surface-card p-5 space-y-2">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Active Deal Rooms
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#14243A]">
              {deals.length || 8}
            </div>
            <span className="text-[11px] text-[#159D8B] font-semibold">Under Active Diligence</span>
          </div>

          <div className="surface-card p-5 space-y-2">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Pipeline Gross Volume
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#14243A]">
              ₹4.85 Cr
            </div>
            <span className="text-[11px] text-[#64748B]">Expected 5% Success Brokerage</span>
          </div>
        </div>

        {/* Kanban Pipeline Overview */}
        <div className="surface-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF2]">
            <div>
              <h3 className="text-base font-bold text-[#14243A]">Territory Deal Pipeline Overview</h3>
              <p className="text-xs text-[#64748B]">Active transactions across each diligence stage</p>
            </div>
            <span className="text-xs text-[#64748B] font-medium">Stage Velocity: ~14 Days</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                stage: "1. Qualification & Discovery",
                count: 6,
                deals: ["RoastCraft - Bengaluru (₹45L)", "FitPulse - Gurugram (₹85L)"],
                color: "border-l-blue-500",
              },
              {
                stage: "2. FDD Review & NDA Signed",
                count: 4,
                deals: ["RoastCraft - Indiranagar (₹55L)", "LittleSparks - Whitefield (₹60L)"],
                color: "border-l-indigo-500",
              },
              {
                stage: "3. Agreement Negotiation",
                count: 3,
                deals: ["BiryaniDarbar - Hyderabad (₹1.2Cr)"],
                color: "border-l-amber-500",
              },
              {
                stage: "4. E-Signed & Closed",
                count: 5,
                deals: ["RoastCraft - Koramangala (₹50L)", "FitPulse - Pune (₹75L)"],
                color: "border-l-emerald-500",
              },
            ].map((col, idx) => (
              <div key={idx} className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E7ECF2] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#14243A] truncate">{col.stage}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border border-[#E7ECF2] text-[#64748B]">
                    {col.count}
                  </span>
                </div>
                <div className="space-y-2">
                  {col.deals.map((d, dIdx) => (
                    <div
                      key={dIdx}
                      className={`p-3 rounded-lg bg-white border border-[#E7ECF2] text-xs font-medium text-[#14243A] shadow-subtle border-l-4 ${col.color}`}
                    >
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2 Columns: Leads Table & Task Management */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Lead Management Table (8 cols) */}
          <div className="lg:col-span-8 surface-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7ECF2]">
              <div>
                <h3 className="text-base font-bold text-[#14243A]">Inbound Investor Enquiries</h3>
                <p className="text-xs text-[#64748B]">Pre-vetted leads seeking franchise territory rights</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter leads..."
                  value={searchLead}
                  onChange={(e) => setSearchLead(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#E7ECF2] focus:outline-none focus:border-[#315EFB]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E7ECF2] text-[#64748B] uppercase font-bold text-[10px]">
                    <th className="pb-3">Candidate / Investor</th>
                    <th className="pb-3">Capital Capacity</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7ECF2]">
                  {(filteredLeads.length > 0 ? filteredLeads : [
                    { fullName: "Sunil Mehra", company: "Mehra Retail Ventures", budgetMin: 5000000, budgetMax: 12000000, priority: "high", status: "qualified" },
                    { fullName: "Rajesh Singhania", company: "Singhania Investments", budgetMin: 8000000, budgetMax: 20000000, priority: "high", status: "diligence_in_progress" },
                    { fullName: "Pooja Hegde", company: "South Bay Foods", budgetMin: 3500000, budgetMax: 7000000, priority: "medium", status: "new" },
                    { fullName: "Aman Kapoor", company: "Kapoor Family Trust", budgetMin: 10000000, budgetMax: 25000000, priority: "high", status: "qualified" },
                  ]).map((lead, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC]">
                      <td className="py-3">
                        <div className="font-bold text-[#14243A]">{lead.fullName}</div>
                        <div className="text-[11px] text-[#64748B]">{lead.company || "Independent Operator"}</div>
                      </td>
                      <td className="py-3 font-semibold text-[#14243A]">
                        {formatCurrency(lead.budgetMin)} - {formatCurrency(lead.budgetMax)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            lead.priority === "high"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {lead.priority}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-[11px] font-semibold text-[#159D8B] bg-[#E6F7F5] px-2 py-0.5 rounded">
                          {lead.status?.replace("_", " ") || "Qualified"}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href="/deal-room"
                          className="text-[#315EFB] hover:text-[#2144EB] font-semibold inline-flex items-center gap-1"
                        >
                          Open Room <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Follow-Up & Tasks Management (4 cols) */}
          <div className="lg:col-span-4 surface-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF2]">
              <h3 className="text-base font-bold text-[#14243A]">Pending Follow-Ups</h3>
              <span className="text-xs text-[#64748B]">4 Tasks</span>
            </div>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    task.done
                      ? "bg-[#F8FAFC] border-[#E7ECF2] opacity-60"
                      : "bg-white border-[#E7ECF2] hover:border-[#315EFB]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-[#315EFB]"
                  />
                  <div className="space-y-1 flex-1">
                    <p
                      className={`text-xs leading-relaxed ${
                        task.done ? "line-through text-[#64748B]" : "font-medium text-[#14243A]"
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Due {task.dueDate}
                      </span>
                      <span
                        className={`font-bold uppercase ${
                          task.priority === "high" ? "text-rose-600" : "text-[#315EFB]"
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
      </div>
    </div>
  );
}
