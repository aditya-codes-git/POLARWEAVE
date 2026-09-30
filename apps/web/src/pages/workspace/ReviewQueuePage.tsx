import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
  Filter,
  FileText,
  Sparkles,
  Info
} from 'lucide-react';
import { getObservations } from '../../lib/api';
import { Observation } from '@polarweave/types';
import { VerificationBadge, ConfidenceBadge, DomainBadge } from '../../components/ui/badges';
import { useRole } from '../../context/RoleContext';

export function ReviewQueuePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const { role } = useRole();

  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<'real' | 'demo' | 'all'>(jobId ? 'real' : 'real');
  const [filter, setFilter] = useState<'all' | 'needs_review' | 'verified'>('all');

  useEffect(() => {
    setLoading(true);
    getObservations({
      job_id: jobId || undefined,
      scope: jobId ? 'real' : scope
    })
      .then((data) => {
        setObservations(data);
      })
      .catch((err) => {
        console.error('Failed to load observations:', err);
        setObservations([]);
      })
      .finally(() => setLoading(false));
  }, [jobId, scope]);

  const filtered = observations.filter((o) => {
    if (filter === 'needs_review') return o.verification_status === 'NEEDS_REVIEW' || o.verification_status === 'AI_EXTRACTED';
    if (filter === 'verified') return o.verification_status === 'VERIFIED';
    return true;
  });

  const isAdmin = role === 'admin';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`text-[11px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded border ${
                isAdmin
                  ? 'text-purple-700 bg-purple-50 border-purple-200'
                  : 'text-amber-700 bg-amber-50 border-amber-200'
              }`}
            >
              {isAdmin ? 'NCPOR Institutional Governance' : 'Author Peer Verification'}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">
              {isAdmin ? 'INSTITUTIONAL REVIEW QUEUE' : 'MY SUBMISSIONS'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isAdmin ? 'Institutional Review Queue' : 'My Submissions Review'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin
              ? 'Institution-wide verification queue. Sign-off on researcher findings before institutional archiving and public dissemination.'
              : 'Inspect and sign-off on structured observations extracted from your uploaded research materials.'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Real vs Demo Scope Selector (Section 13) */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-subtle">
            <button
              onClick={() => {
                setSearchParams({});
                setScope('real');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                scope === 'real' && !jobId
                  ? 'bg-polar-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Uploaded Material
            </button>
            <button
              onClick={() => {
                setSearchParams({});
                setScope('demo');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                scope === 'demo'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Demo Archives
            </button>
            <button
              onClick={() => {
                setSearchParams({});
                setScope('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                scope === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              All
            </button>
          </div>

          {/* Verification Status Filter */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-subtle shrink-0">
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
      </div>

      {/* Active Job Alert Banner if job_id query param is present */}
      {jobId && (
        <div className="p-3.5 bg-polar-50/80 border border-polar-200 rounded-xl flex items-center justify-between text-xs text-polar-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-polar-600 shrink-0" />
            <span>
              Showing findings exclusively scoped to Processing Job: <code className="font-mono font-bold bg-polar-100 px-1.5 py-0.5 rounded">{jobId}</code>
            </span>
          </div>
          <button
            onClick={() => setSearchParams({})}
            className="text-xs font-semibold text-polar-700 hover:underline"
          >
            Show All Uploads
          </button>
        </div>
      )}

      {/* Observation Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-subtle divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading review queue findings...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="text-sm font-semibold text-slate-700">No observations found</div>
            <p className="text-xs text-slate-400">
              {jobId
                ? 'No structured scientific findings were extracted from this specific job upload.'
                : scope === 'real'
                ? 'No real uploaded findings staged. Ingest a research package to create findings.'
                : 'No observations match the current filter.'}
            </p>
          </div>
        ) : (
          filtered.map((obs) => (
            <div
              key={obs.id}
              onClick={() => navigate(`/workspace/review/${obs.id}`)}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <DomainBadge domain={obs.research_domain} />
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-mono text-slate-600">
                    Source: {obs.source_file_name || (obs.source_file_id ? `File ${obs.source_file_id}` : (obs.demo ? 'Expedition 45 Fixture' : 'Uploaded File'))}
                  </span>
                  {obs.processing_job_id && (
                    <>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-[11px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        {obs.processing_job_id}
                      </span>
                    </>
                  )}
                  {obs.demo && (
                    <span className="text-[10px] font-mono uppercase bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">
                      Demo Fixture
                    </span>
                  )}
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{obs.location_name || 'Unspecified Location'}</span>
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
          ))
        )}
      </div>
    </div>
  );
}
