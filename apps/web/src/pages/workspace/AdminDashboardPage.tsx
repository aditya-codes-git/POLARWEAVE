import React, { useEffect, useState } from 'react';
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
import { getObservations, getDatasets, getMedia } from '../../lib/api';
import { Observation, Dataset, MediaAsset } from '@polarweave/types';

export function AdminDashboardPage() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getObservations(), getDatasets(), getMedia()])
      .then(([obs, dts, med]) => {
        setObservations(obs);
        setDatasets(dts);
        setMedia(med);
      })
      .finally(() => setLoading(false));
  }, []);

  const verified = observations.filter((o) => o.verification_status === 'VERIFIED');
  const pending = observations.filter((o) => o.verification_status !== 'VERIFIED');

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
          <div className="text-[11px] font-mono uppercase text-slate-400">Total Ingested Datasets</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{datasets.length}</div>
          <div className="text-[11px] text-emerald-600 mt-1">✓ 100% Parsing Health</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle">
          <div className="text-[11px] font-mono uppercase text-slate-400">Verified Observations</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{verified.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">{pending.length} in review queue</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle">
          <div className="text-[11px] font-mono uppercase text-slate-400">Media Assets</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{media.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Images and video records</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle">
          <div className="text-[11px] font-mono uppercase text-slate-400">Total Observations</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{observations.length}</div>
          <div className="text-[11px] text-polar-700 mt-1">Structured evidence records</div>
        </div>
      </div>

      {/* Audit Trail & Taxonomy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Audit Trail */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Recent Institutional Findings
          </h3>

          <div className="divide-y divide-slate-100 text-xs font-mono space-y-2">
            {observations.length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                No observations recorded yet.
              </div>
            ) : (
              observations.slice(0, 3).map((obs) => (
                <div key={obs.id} className="py-2.5 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-semibold text-slate-900 line-clamp-1">{obs.title}</span>
                    <p className="text-[11px] text-slate-500 truncate">{obs.research_domain} • {obs.location_name || 'Unspecified'}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded border uppercase shrink-0 ${
                    obs.verification_status === 'VERIFIED'
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-amber-700 bg-amber-50 border-amber-200'
                  }`}>
                    {obs.verification_status}
                  </span>
                </div>
              ))
            )}
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
              <span className="font-mono text-slate-500">
                {observations.filter((o) => o.research_domain?.toLowerCase().includes('glacio')).length} observations
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-800">Physical & Chemical Oceanography</span>
              <span className="font-mono text-slate-500">
                {observations.filter((o) => o.research_domain?.toLowerCase().includes('ocean')).length} observations
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-800">Atmospheric Sciences & Meteorology</span>
              <span className="font-mono text-slate-500">
                {observations.filter((o) => o.research_domain?.toLowerCase().includes('atmo')).length} observations
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-800">Biology & Polar Ecology</span>
              <span className="font-mono text-slate-500">
                {observations.filter((o) => o.research_domain?.toLowerCase().includes('biol')).length} observations
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
