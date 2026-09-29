import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  FileText
} from 'lucide-react';
import { getObservations, getExpeditions, getDatasets, getMedia } from '../../lib/api';
import { Observation, Expedition, Dataset, MediaAsset } from '@polarweave/types';
import { ConfidenceBadge, VerificationBadge, DomainBadge } from '../../components/ui/badges';
import { EvidenceDrawer } from '../../components/EvidenceDrawer';
import { getActiveUser } from '../../lib/supabase';

export function DashboardPage() {
  const navigate = useNavigate();
  const user = getActiveUser();

  const [observations, setObservations] = useState<Observation[]>([]);
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);

  // Evidence Drawer state
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

  const needsReviewCount = observations.filter((o) => o.verification_status === 'NEEDS_REVIEW' || o.verification_status === 'AI_EXTRACTED').length;
  const verifiedCount = observations.filter((o) => o.verification_status === 'VERIFIED').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 1. WELCOME HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Good morning, {user.name.split(' ')[1] || user.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            National Centre for Polar and Ocean Research • {needsReviewCount} observation(s) awaiting verification sign-off.
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
            <span>Review Queue ({needsReviewCount})</span>
          </button>
        </div>
      </div>

      {/* 2. KNOWLEDGE PIPELINE FUNNEL (Section 10) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Knowledge Structuring Pipeline
            </h2>
            <p className="text-xs text-slate-500">
              Autonomous ingestion to human-verified dissemination funnel
            </p>
          </div>
          <span className="text-xs font-mono text-polar-700 bg-polar-50 px-2 py-0.5 rounded border border-polar-200">
            Realtime Repository Status
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Step 1 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              1. Raw Material
            </div>
            <div className="text-xl font-bold text-slate-900">124</div>
            <div className="text-[11px] text-slate-500 mt-1">PDFs, CSVs, Audio/Video</div>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              2. Structured
            </div>
            <div className="text-xl font-bold text-slate-900">87</div>
            <div className="text-[11px] text-slate-500 mt-1">Entities Parsed</div>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80">
            <div className="text-[11px] font-mono text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>3. Needs Review</span>
            </div>
            <div className="text-xl font-bold text-amber-900">{needsReviewCount}</div>
            <div className="text-[11px] text-amber-700 mt-1">Awaiting Sign-off</div>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
            <div className="text-[11px] font-mono text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>4. Verified</span>
            </div>
            <div className="text-xl font-bold text-emerald-900">{verifiedCount}</div>
            <div className="text-[11px] text-emerald-700 mt-1">Scientist Approved</div>
          </div>

          {/* Step 5 */}
          <div className="p-3.5 bg-polar-50/60 rounded-xl border border-polar-200/80">
            <div className="text-[11px] font-mono text-polar-700 uppercase tracking-wider mb-1">
              5. Published
            </div>
            <div className="text-xl font-bold text-polar-900">41</div>
            <div className="text-[11px] text-polar-700 mt-1">Outreach Ready</div>
          </div>
        </div>
      </div>

      {/* 3. RECENT INGESTION & EVIDENCE HIGHLIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Ingested Knowledge Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Recent Ingested Observations
                </h3>
                <p className="text-xs text-slate-500">
                  Structured facts extracted from multimodal expedition packages
                </p>
              </div>
              <button
                onClick={() => navigate('/workspace/knowledge')}
                className="text-xs text-polar-600 hover:text-polar-700 font-medium flex items-center gap-1"
              >
                <span>View All ({observations.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {observations.slice(0, 4).map((obs) => (
                <div
                  key={obs.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <DomainBadge domain={obs.research_domain} />
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">{obs.location_name}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">
                      {obs.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <VerificationBadge status={obs.verification_status} />
                    <ConfidenceBadge confidence={obs.confidence} />
                    <button
                      onClick={() => setSelectedObsForEvidence(obs)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-polar-50 hover:text-polar-700 rounded-md border border-slate-200 transition-colors"
                    >
                      Show Evidence
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Grounding: 100% tied to expedition records</span>
            <span className="font-mono text-slate-400">EXP-45-ANT Focus</span>
          </div>
        </div>

        {/* Right Col: Knowledge Coverage Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Repository Coverage
            </h3>
            <p className="text-xs text-slate-500">
              Active knowledge domains & assets
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-polar-600" />
                <span className="font-medium text-slate-800">Expeditions</span>
              </div>
              <span className="font-mono font-semibold text-slate-900">{expeditions.length} active</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-slate-800">Sensor Datasets</span>
              </div>
              <span className="font-mono font-semibold text-slate-900">2,270 rows</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Film className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-slate-800">Timestamped Media</span>
              </div>
              <span className="font-mono font-semibold text-slate-900">{media.length} assets</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-slate-800">Evidence Links</span>
              </div>
              <span className="font-mono font-semibold text-slate-900">10 chains</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/workspace/evidence')}
              className="w-full py-2 px-3 rounded-xl bg-polar-50 hover:bg-polar-100 text-polar-800 border border-polar-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-subtle"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Explore Evidence Trace</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Evidence Drawer when "Show Evidence" clicked */}
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
              excerpt: 'Row 42: core_id=IC-45-42, depth_m=21.0, ice_thickness_m=1.80, density_kg_m3=918, temp_c=-14.8',
              confidence: 0.98,
              verification_status: selectedObsForEvidence.verification_status,
              created_at: new Date().toISOString()
            },
            {
              id: 'evi_obs1_video',
              knowledge_type: 'observation',
              knowledge_id: selectedObsForEvidence.id,
              source_type: 'video',
              source_id: 'med_vid_interview',
              source_title: 'scientist_interview.mp4',
              timestamp_start: 758,
              timestamp_end: 778,
              excerpt: 'When we extracted Core 42, the manual caliper and thermistor probe confirmed the fast-ice sheet stood at exactly 1.8 meters thick.',
              confidence: 0.94,
              verification_status: selectedObsForEvidence.verification_status,
              created_at: new Date().toISOString()
            },
            {
              id: 'evi_obs1_image',
              knowledge_type: 'observation',
              knowledge_id: selectedObsForEvidence.id,
              source_type: 'image',
              source_id: 'med_img_larsemann',
              source_title: 'IMG_2041.jpg',
              excerpt: 'EXIF GPS -69.4089°S, 76.1872°E at 2026-01-14T07:15:00Z. Visual identification confirms fast-ice sheet drilling site with Larsemann iceberg backdrop.',
              confidence: 0.97,
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
