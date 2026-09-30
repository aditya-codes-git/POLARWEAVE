import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  UploadCloud,
  FileCheck,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Film,
  Compass,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  Cpu,
  Send,
  Users
} from 'lucide-react';
import { getObservations, getExpeditions, getDatasets, getMedia, getEvidenceTrace, getProcessingJobs } from '../../lib/api';
import { Observation, Expedition, Dataset, MediaAsset, EvidenceLink, ProcessingJob } from '@polarweave/types';
import { ConfidenceBadge, VerificationBadge, DomainBadge } from '../../components/ui/badges';
import { EvidenceDrawer } from '../../components/EvidenceDrawer';
import { useRole } from '../../context/RoleContext';

export function DashboardPage() {
  const navigate = useNavigate();
  const { role, user } = useRole();

  const [observations, setObservations] = useState<Observation[]>([]);
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedObsForEvidence, setSelectedObsForEvidence] = useState<Observation | null>(null);
  const [drawerLinks, setDrawerLinks] = useState<EvidenceLink[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [obs, exps, dts, med, jobList] = await Promise.all([
          getObservations(),
          getExpeditions(),
          getDatasets(),
          getMedia(),
          getProcessingJobs()
        ]);
        setObservations(obs);
        setExpeditions(exps);
        setDatasets(dts);
        setMedia(med);
        setJobs(jobList);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Public Explorer belongs in /explore
  if (role === 'public') {
    return <Navigate to="/explore" replace />;
  }

  // ==========================================
  // KNOWLEDGE ADMIN DASHBOARD (GOVERN)
  // ==========================================
  if (role === 'admin') {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Institutional Governance
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-mono">NCPOR Knowledge Management</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Knowledge Operations
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review, verify and govern institutional knowledge.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/workspace/review')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <FileCheck className="w-4 h-4 text-amber-400" />
              <span>
                Review Queue ({observations.filter((o) => o.verification_status === 'NEEDS_REVIEW' || o.verification_status === 'AI_EXTRACTED').length} Awaiting)
              </span>
            </button>
            <button
              onClick={() => navigate('/workspace/admin/publishing')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-subtle transition-all"
            >
              <Send className="w-4 h-4 text-polar-600" />
              <span>Publishing Gate</span>
            </button>
          </div>
        </div>

        {/* Operational KPI Cards (Section 4 & 26) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            onClick={() => navigate('/workspace/review')}
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-subtle hover:border-amber-400 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-amber-700 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold">
                Pending Verification
              </span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {observations.filter((o) => o.verification_status === 'NEEDS_REVIEW' || o.verification_status === 'AI_EXTRACTED').length}
            </div>
            <div className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
              <span>Primary operational queue</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => navigate('/workspace/admin/publishing')}
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-subtle hover:border-purple-400 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-purple-700 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold">
                Total Datasets
              </span>
              <Database className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{datasets.length}</div>
            <div className="text-[11px] text-purple-700 mt-1">Calibrated sensor streams</div>
          </div>

          <div
            onClick={() => navigate('/workspace/media')}
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-subtle hover:border-blue-400 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                Media Assets
              </span>
              <Film className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{media.length}</div>
            <div className="text-[11px] text-slate-600 mt-1">Multimodal media records</div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-subtle">
            <div className="flex items-center justify-between text-emerald-700 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold">
                Verified Records
              </span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {observations.filter((o) => o.verification_status === 'VERIFIED').length}
            </div>
            <div className="text-[11px] text-emerald-600 mt-1">100% cryptographically logged</div>
          </div>
        </div>

        {/* Operational Sections: Institutional Review Queue & System Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Institutional Review Queue (Spans 2 cols) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Institutional Review Queue
                </h3>
                <p className="text-xs text-slate-500">
                  Items requiring scientific administrator sign-off before archive entry
                </p>
              </div>
              <button
                onClick={() => navigate('/workspace/review')}
                className="text-xs font-semibold text-polar-700 hover:text-polar-900 flex items-center gap-1"
              >
                <span>View Queue ({observations.filter((o) => o.verification_status !== 'VERIFIED').length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {observations.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No observations pending review. Ingest new files to begin verification.
                </div>
              ) : (
                observations.slice(0, 5).map((obs) => (
                  <div
                    key={obs.id}
                    onClick={() => navigate(`/workspace/review/${obs.id}`)}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 p-2 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <DomainBadge domain={obs.research_domain} />
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500 truncate">{obs.location_name || 'Unspecified Location'}</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-900 group-hover:text-polar-700 transition-colors truncate">
                        {obs.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {obs.source_file_name ? `Source: ${obs.source_file_name}` : 'Uploaded finding'}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <VerificationBadge status={obs.verification_status} />
                      <button className="text-xs font-medium text-polar-700 bg-polar-50 hover:bg-polar-100 px-3 py-1 rounded-lg border border-polar-200 transition-colors">
                        Review
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Institutional Governance Links */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Governance Quick Actions
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => navigate('/workspace/admin/users')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-xs text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-slate-800">Manage Researchers</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/workspace/admin/taxonomy')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-xs text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800">Polar Science Taxonomy</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/workspace/admin/publishing')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-xs text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Send className="w-4 h-4 text-polar-600" />
                  <span className="font-semibold text-slate-800">Public Dissemination Gate</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/workspace/admin/activity')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-xs text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-slate-800">System Telemetry & Logs</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Compact Ingestion & Processing Status */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-500 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-polar-600" />
                  Ingestion Pipeline Status
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  {jobs.filter((j) => j.status === 'processing' || j.status === 'queued').length > 0
                    ? `${jobs.filter((j) => j.status === 'processing' || j.status === 'queued').length} Active`
                    : 'Idle / Healthy'}
                </span>
              </div>
              <div className="space-y-1.5">
                {jobs.length === 0 ? (
                  <p className="text-[11px] text-slate-400">No background ingestion jobs logged.</p>
                ) : (
                  jobs.slice(0, 2).map((j) => (
                    <div
                      key={j.id}
                      onClick={() => navigate(`/workspace/processing?jobId=${j.id}`)}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-between text-[11px] cursor-pointer transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-medium text-slate-800 truncate block">{j.filename}</span>
                        <span className="text-[10px] font-mono text-slate-400">{j.id}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 uppercase font-semibold ${
                        j.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : j.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}>
                        {j.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RESEARCHER DASHBOARD (CREATE)
  // ==========================================
  const needsReviewCount = observations.filter((o) => o.verification_status === 'NEEDS_REVIEW' || o.verification_status === 'AI_EXTRACTED').length;
  const verifiedCount = observations.filter((o) => o.verification_status === 'VERIFIED').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 1. WELCOME HEADER (Section 3) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Good morning, {user?.name || 'Researcher'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here's the state of your research material.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/workspace/ingest')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Ingest Research Material</span>
          </button>
          <button
            onClick={() => navigate('/workspace/review')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-subtle transition-all"
          >
            <FileCheck className="w-4 h-4 text-amber-600" />
            <span>My Submissions ({needsReviewCount})</span>
          </button>
        </div>
      </div>

      {/* 2. KNOWLEDGE PIPELINE (Dynamic) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Knowledge Pipeline
            </h2>
            <p className="text-xs text-slate-500">
              Status of your uploaded expedition field data and structured observations
            </p>
          </div>
          <span className="text-xs font-mono text-polar-700 bg-polar-50 px-2 py-0.5 rounded border border-polar-200">
            Active Workspace
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Step 1 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              1. Datasets & Media
            </div>
            <div className="text-xl font-bold text-slate-900">{datasets.length + media.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">{datasets.length} CSVs, {media.length} Media</div>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              2. Total Observations
            </div>
            <div className="text-xl font-bold text-slate-900">{observations.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">Structured findings</div>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80">
            <div className="text-[11px] font-mono text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>3. Awaiting Admin Review</span>
            </div>
            <div className="text-xl font-bold text-amber-900">{needsReviewCount}</div>
            <div className="text-[11px] text-amber-700 mt-1">Pending Governance</div>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
            <div className="text-[11px] font-mono text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>4. Verified Findings</span>
            </div>
            <div className="text-xl font-bold text-emerald-900">{verifiedCount}</div>
            <div className="text-[11px] text-emerald-700 mt-1">Locked by Admin</div>
          </div>
        </div>
      </div>

      {/* 3. RECENT INGESTION & NEEDS REVIEW (Section 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Needs Review & Recent Knowledge (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Needs Review & Recent Knowledge
              </h3>
              <p className="text-xs text-slate-500">
                Extracted facts linked to source evidence waiting for peer confirmation
              </p>
            </div>
            <button
              onClick={() => navigate('/workspace/review')}
              className="text-xs font-semibold text-polar-700 hover:text-polar-900 flex items-center gap-1"
            >
              <span>Review Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {observations.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No observations yet. Ingest research files to extract structured scientific knowledge.
              </div>
            ) : (
              observations.slice(0, 4).map((obs) => (
                <div
                  key={obs.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <DomainBadge domain={obs.research_domain} />
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">{obs.location_name || 'Unspecified Location'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ConfidenceBadge confidence={obs.confidence} />
                      <VerificationBadge status={obs.verification_status} />
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900">{obs.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {obs.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 text-xs">
                    <span className="text-[11px] font-mono text-slate-400">
                      {obs.source_file_name ? `Source: ${obs.source_file_name}` : 'Uploaded document'}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedObsForEvidence(obs);
                        getEvidenceTrace(obs.id).then((t) => setDrawerLinks(t.evidence_chain || []));
                      }}
                      className="text-polar-700 hover:text-polar-900 font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <Shield className="w-3 h-3" />
                      <span>Show Evidence</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Ingestion Files & Assets */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Recent Ingestion Materials
          </h3>

          <div className="space-y-2.5 text-xs">
            {datasets.length === 0 && media.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No recent files uploaded.
              </div>
            ) : (
              <>
                {datasets.slice(0, 2).map((d) => (
                  <div key={d.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Database className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{d.filename}</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-mono shrink-0">{d.row_count} rows</span>
                  </div>
                ))}
                {media.slice(0, 2).map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Film className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{m.filename}</span>
                    </div>
                    <span className="text-[10px] text-polar-600 font-mono shrink-0">{m.type.toUpperCase()}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/workspace/ingest')}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-subtle"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Ingest More Material</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Evidence Drawer */}
      {selectedObsForEvidence && (
        <EvidenceDrawer
          isOpen={Boolean(selectedObsForEvidence)}
          onClose={() => {
            setSelectedObsForEvidence(null);
            setDrawerLinks([]);
          }}
          knowledgeTitle={selectedObsForEvidence.title}
          confidence={selectedObsForEvidence.confidence}
          verificationStatus={selectedObsForEvidence.verification_status}
          evidenceLinks={drawerLinks}
          onApprove={() => {
            setObservations((prev) =>
              prev.map((o) => (o.id === selectedObsForEvidence.id ? { ...o, verification_status: 'VERIFIED' } : o))
            );
          }}
        />
      )}
    </div>
  );
}
