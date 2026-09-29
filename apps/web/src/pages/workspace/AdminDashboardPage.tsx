import React from 'react';
import {
  Shield,
  Users,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';

export function AdminDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            Institutional Governance
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500 font-mono">MoES / NCPOR Administration</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Admin Hub & Repository Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor multimodal ingestion health, taxonomy mappings, user roles, and verification audit trails.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle">
          <div className="text-[11px] font-mono uppercase text-slate-400">Total Ingested Files</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">124</div>
          <div className="text-[11px] text-emerald-600 mt-1">✓ 100% Parsing Health</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle">
          <div className="text-[11px] font-mono uppercase text-slate-400">Verified Observations</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">63</div>
          <div className="text-[11px] text-slate-500 mt-1">14 in review queue</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle">
          <div className="text-[11px] font-mono uppercase text-slate-400">Active Researchers</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">18</div>
          <div className="text-[11px] text-slate-500 mt-1">NCPOR Glaciology / Physics</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle">
          <div className="text-[11px] font-mono uppercase text-slate-400">Dissemination Output</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">41</div>
          <div className="text-[11px] text-polar-700 mt-1">Evidence-Locked Articles</div>
        </div>
      </div>

      {/* Audit Trail & Taxonomy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Audit Trail */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Recent Verification Audit Log
          </h3>

          <div className="divide-y divide-slate-100 text-xs font-mono space-y-2">
            <div className="py-2.5 flex items-start justify-between">
              <div>
                <span className="font-semibold text-slate-900">Dr. Rajesh Sharma</span>
                <p className="text-[11px] text-slate-500">Approved Obs #1: Surface ice 1.8m measurement</p>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                VERIFIED
              </span>
            </div>

            <div className="py-2.5 flex items-start justify-between">
              <div>
                <span className="font-semibold text-slate-900">Dr. Ananya Menon</span>
                <p className="text-[11px] text-slate-500">Approved Obs #2: Prydz Bay MCDW warming anomaly</p>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                VERIFIED
              </span>
            </div>

            <div className="py-2.5 flex items-start justify-between">
              <div>
                <span className="font-semibold text-slate-900">Dr. Sunita Bose</span>
                <p className="text-[11px] text-slate-500">Queued Obs #3: Maitri black carbon aerosol surge</p>
              </div>
              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                NEEDS_REVIEW
              </span>
            </div>
          </div>
        </div>

        {/* Taxonomy Categories */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Polar Science Taxonomy Domains
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-800">Glaciology & Cryosphere Dynamics</span>
              <span className="font-mono text-slate-500">42 observations</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-800">Physical & Chemical Oceanography</span>
              <span className="font-mono text-slate-500">28 observations</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-800">Atmospheric Sciences & Meteorology</span>
              <span className="font-mono text-slate-500">19 observations</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-800">Biology & Polar Ecology</span>
              <span className="font-mono text-slate-500">14 observations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
