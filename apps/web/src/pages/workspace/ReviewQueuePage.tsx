import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';
import { getObservations } from '../../lib/api';
import { Observation } from '@polarweave/types';
import { VerificationBadge, ConfidenceBadge, DomainBadge } from '../../components/ui/badges';

export function ReviewQueuePage() {
  const navigate = useNavigate();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [filter, setFilter] = useState<'all' | 'needs_review' | 'verified'>('all');

  useEffect(() => {
    getObservations().then(setObservations);
  }, []);

  const filtered = observations.filter((o) => {
    if (filter === 'needs_review') return o.verification_status === 'NEEDS_REVIEW' || o.verification_status === 'AI_EXTRACTED';
    if (filter === 'verified') return o.verification_status === 'VERIFIED';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Human-In-The-Loop
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">Scientific Verification Queue</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Verification Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review and sign-off on AI-structured polar observations and linked evidence before publication.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-subtle">
          {(['all', 'needs_review', 'verified'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Observation Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-subtle divide-y divide-slate-100 overflow-hidden">
        {filtered.map((obs) => (
          <div
            key={obs.id}
            onClick={() => navigate(`/workspace/review/${obs.id}`)}
            className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer group"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <DomainBadge domain={obs.research_domain} />
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-mono">
                  {obs.expedition_title || 'Expedition 45'}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">{obs.location_name}</span>
              </div>

              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-polar-700 transition-colors">
                {obs.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">
                {obs.description}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <ConfidenceBadge confidence={obs.confidence} />
              <VerificationBadge status={obs.verification_status} />
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-polar-100 group-hover:text-polar-700 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
