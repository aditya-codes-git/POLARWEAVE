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
import { getObservations, getExpeditions, getDatasets, getMedia } from '../../lib/api';
import { Observation, Expedition, Dataset, MediaAsset } from '@polarweave/types';
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
  const [loading, setLoading] = useState(true);
  const [selectedObsForEvidence, setSelectedObsForEvidence] = useState<Observation | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [obs, exps, dts, med] = await Promise.all([
          getObservations(),
          getExpeditions(),
          getDatasets(),
          getMedia()
        ]);
        setObservations(obs);
        setExpeditions(exps);
        setDatasets(dts);
        setMedia(med);
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
              <span>Review Queue (8 Awaiting)</span>
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
            <div className="text-2xl font-bold text-slate-900">8</div>
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
                Pending Publication
              </span>
              <Send className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-slate-900">3</div>
            <div className="text-[11px] text-purple-700 mt-1">Outreach dispatches ready</div>
          </div>

          <div
            onClick={() => navigate('/workspace/admin/activity')}
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-subtle hover:border-rose-400 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                Failed Processing
              </span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">2</div>
            <div className="text-[11px] text-rose-600 mt-1">Audio codec retries queued</div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-subtle">
            <div className="flex items-center justify-between text-emerald-700 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold">
                Verified Records
              </span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-slate-900">42</div>
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
                <span>View All 8 Items</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {observations.slice(0, 3).map((obs) => (
                <div
                  key={obs.id}
                  onClick={() => navigate(`/workspace/review/${obs.id}`)}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 p-2 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <DomainBadge domain={obs.research_domain} />
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 truncate">{obs.location_name}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-polar-700 transition-colors truncate">
                      {obs.title}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Author: Dr. Rajesh Sharma • 4 linked evidence modalities
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <VerificationBadge status={obs.verification_status} />
                    <button className="text-xs font-medium text-polar-700 bg-polar-50 hover:bg-polar-100 px-3 py-1 rounded-lg border border-polar-200 transition-colors">
                      Review
                    </button>
                  </div>
                </div>
              ))}
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
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RESEARCHER DASHBOARD (CREATE)
  // ==========================================
  const needsReviewCount = 1;
  const verifiedCount = 4;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 1. WELCOME HEADER (Section 3) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Good morning, Dr. Rajesh
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

      {/* 2. KNOWLEDGE PIPELINE (Section 3 & 26: 5 uploads, 2 processing, 1 needs review, 4 verified) */}
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
            Expedition 45 Contributor
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Step 1 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              1. My Uploads
            </div>
            <div className="text-xl font-bold text-slate-900">5</div>
            <div className="text-[11px] text-slate-500 mt-1">PDF, CSV, MP4, EXIF</div>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              2. Processing
            </div>
            <div className="text-xl font-bold text-slate-900">2</div>
            <div className="text-[11px] text-slate-500 mt-1">LLM Structuring</div>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80">
            <div className="text-[11px] font-mono text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>3. Needs Review</span>
            </div>
            <div className="text-xl font-bold text-amber-900">1</div>
            <div className="text-[11px] text-amber-700 mt-1">Awaiting My Sign-off</div>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
            <div className="text-[11px] font-mono text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>4. Verified</span>
            </div>
            <div className="text-xl font-bold text-emerald-900">4</div>
            <div className="text-[11px] text-emerald-700 mt-1">Author Verified</div>
          </div>

          {/* Step 5 */}
          <div className="p-3.5 bg-polar-50/60 rounded-xl border border-polar-200/80">
            <div className="text-[11px] font-mono text-polar-700 uppercase tracking-wider mb-1">
              5. Published
            </div>
            <div className="text-xl font-bold text-polar-900">12</div>
            <div className="text-[11px] text-polar-700 mt-1">Public Dispatches</div>
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
            {observations.slice(0, 3).map((obs) => (
              <div
                key={obs.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <DomainBadge domain={obs.research_domain} />
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{obs.location_name}</span>
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
                    Source: Report p.17 • CSV row 42
                  </span>
                  <button
                    onClick={() => setSelectedObsForEvidence(obs)}
                    className="text-polar-700 hover:text-polar-900 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <Shield className="w-3 h-3" />
                    <span>Show Evidence</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Ingestion Files & Assets */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Recent Ingestion Materials
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium text-slate-800 truncate">report_expedition_45_final.pdf</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-mono shrink-0">Parsed</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Database className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-800 truncate">ice_measurements_larsemann.csv</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-mono shrink-0">1,420 rows</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Film className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-medium text-slate-800 truncate">scientist_interview.mp4</span>
              </div>
              <span className="text-[10px] text-polar-600 font-mono shrink-0">12:43 timestamp</span>
            </div>
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
          onClose={() => setSelectedObsForEvidence(null)}
          knowledgeTitle={selectedObsForEvidence.title}
          confidence={selectedObsForEvidence.confidence}
          verificationStatus={selectedObsForEvidence.verification_status}
          evidenceLinks={[
            {
              id: 'evi_obs1_report',
              knowledge_type: 'observation',
              knowledge_id: selectedObsForEvidence.id,
              source_type: 'pdf',
              source_id: 'doc_exp45_report',
              source_title: 'report_expedition_45_final.pdf',
              page_number: 17,
              excerpt: 'Section 3.2.1 Coastal Fast-Ice Monitoring: In-situ mechanical core extraction yielded uncompressed sea-ice thickness of 1.80 m (±0.02 m).',
              confidence: 0.96,
              verification_status: selectedObsForEvidence.verification_status,
              created_at: new Date().toISOString()
            },
            {
              id: 'evi_obs1_dataset',
              knowledge_type: 'observation',
              knowledge_id: selectedObsForEvidence.id,
              source_type: 'dataset',
              source_id: 'dts_ice_measurements',
              source_title: 'ice_measurements_larsemann.csv',
              row_number: 42,
              excerpt: 'Row 42: core_id=IC-45-42, depth_m=21.0, ice_thickness_m=1.80, temp_c=-14.8°C.',
              confidence: 0.98,
              verification_status: selectedObsForEvidence.verification_status,
              created_at: new Date().toISOString()
            }
          ]}
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
