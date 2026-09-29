import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Database,
  Film,
  CheckCircle2,
  XCircle,
  Edit3,
  ArrowLeft,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { getObservationById, submitReview } from '../../lib/api';
import { Observation } from '@polarweave/types';
import { ConfidenceBadge, VerificationBadge, DomainBadge } from '../../components/ui/badges';
import { EvidenceDrawer } from '../../components/EvidenceDrawer';

export function ReviewDetailPage() {
  const { id = 'obs_ice_thickness' } = useParams();
  const navigate = useNavigate();

  const [obs, setObs] = useState<Observation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDesc, setEditedDesc] = useState('');

  useEffect(() => {
    async function load() {
      const data = await getObservationById(id);
      setObs(data);
      setEditedTitle(data.title);
      setEditedDesc(data.description);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading || !obs) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading observation review...</div>;
  }

  const handleApprove = async () => {
    await submitReview('observation', obs.id, { action: 'approve' });
    setObs({ ...obs, verification_status: 'VERIFIED' });
    setStatusMessage('Observation approved and verified by researcher.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleReject = async () => {
    await submitReview('observation', obs.id, { action: 'reject' });
    setObs({ ...obs, verification_status: 'REJECTED' });
    setStatusMessage('Observation marked as rejected.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSaveEdit = async () => {
    await submitReview('observation', obs.id, {
      action: 'edit',
      edited_data: { title: editedTitle, description: editedDesc }
    });
    setObs({ ...obs, title: editedTitle, description: editedDesc, verification_status: 'VERIFIED' });
    setIsEditing(false);
    setStatusMessage('Observation updated and verified.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Bar with Back Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/workspace/review')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Verification Queue</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEvidenceDrawerOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-polar-50 hover:bg-polar-100 text-polar-800 border border-polar-200 text-xs font-semibold shadow-subtle flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-polar-600" />
            <span>Show Full Evidence Trace</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="font-bold">×</button>
        </div>
      )}

      {/* 3-COLUMN REVIEW WORKSPACE (Section 17) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMN 1: SOURCE MATERIAL (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                1. Source Material
              </h2>
              <p className="text-xs text-slate-800 font-medium">
                Physical reports & datasets
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">PDF / CSV / MP4</span>
          </div>

          {/* PDF Source Snippet */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-rose-600" />
                report_expedition_45_final.pdf
              </span>
              <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                Page 17
              </span>
            </div>
            <div className="text-xs font-mono text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
              "Section 3.2.1 Coastal Fast-Ice Monitoring: In-situ mechanical core extraction at station perimeter point IC-45-42 yielded an uncompressed sea-ice thickness of 1.80 m (±0.02 m)."
            </div>
          </div>

          {/* Dataset Source Snippet */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-600" />
                ice_measurements_larsemann.csv
              </span>
              <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                Row 42
              </span>
            </div>
            <div className="text-xs font-mono text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
              core_id: IC-45-42<br />
              depth_m: 21.0<br />
              ice_thickness_m: 1.80<br />
              density_kg_m3: 918<br />
              temp_c: -14.8
            </div>
          </div>

          {/* Video Interview Snippet */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Film className="w-4 h-4 text-blue-600" />
                scientist_interview.mp4
              </span>
              <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                12:43 – 12:58
              </span>
            </div>
            <div className="text-xs font-mono text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
              "When we extracted Core 42, the manual caliper and thermistor probe confirmed the fast-ice sheet stood at exactly 1.8 meters thick."
            </div>
          </div>
        </div>

        {/* COLUMN 2: STRUCTURED KNOWLEDGE (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                2. Extracted Knowledge
              </h2>
              <p className="text-xs text-slate-800 font-medium">
                Structured scientific record
              </p>
            </div>
            <ConfidenceBadge confidence={obs.confidence} />
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Observation Title
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Scientific Description
                </label>
                <textarea
                  rows={4}
                  value={editedDesc}
                  onChange={(e) => setEditedDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium"
                >
                  Save & Approve
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <DomainBadge domain={obs.research_domain} />
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{obs.location_name}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 leading-snug">
                  {obs.title}
                </h3>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                {obs.description}
              </div>

              {/* Extracted Calibration Variables */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-900 block mb-2">
                  Calibrated Measurements (Sensor Linked)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Fast-Ice Thickness</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">1.80 m</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Basal Core Temp</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">-14.8 °C</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COLUMN 3: EVIDENCE AUDIT & ACTIONS (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              3. Verification & Sign-off
            </h2>
            <p className="text-xs text-slate-800 font-medium">
              Scientist audit trail
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Current Status:</span>
              <VerificationBadge status={obs.verification_status} />
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Confidence:</span>
              <span className="font-mono text-slate-900">{Math.round(obs.confidence * 100)}% (High)</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Target Station:</span>
              <span className="font-medium text-slate-900">Bharati</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handleApprove}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Approve & Verify</span>
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-medium shadow-subtle flex items-center justify-center gap-2 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
              <span>Edit Metadata</span>
            </button>

            <button
              onClick={handleReject}
              className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium flex items-center justify-center gap-2 transition-all"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Reject Observation</span>
            </button>
          </div>

          <div className="p-3 bg-polar-50/60 rounded-xl border border-polar-200/60 text-xs text-polar-800 space-y-1">
            <span className="font-semibold block">Evidence Trace Anchored</span>
            <p className="text-[11px] text-polar-700 leading-relaxed">
              Approving locks this fact and links it permanently into the Knowledge Graph and Outreach Studio.
            </p>
          </div>
        </div>
      </div>

      {/* Slide-over Evidence Drawer */}
      <EvidenceDrawer
        isOpen={isEvidenceDrawerOpen}
        onClose={() => setIsEvidenceDrawerOpen(false)}
        knowledgeTitle={obs.title}
        confidence={obs.confidence}
        verificationStatus={obs.verification_status}
        evidenceLinks={[
          {
            id: 'evi_obs1_report',
            knowledge_type: 'observation',
            knowledge_id: obs.id,
            source_type: 'pdf',
            source_id: 'doc_exp45_report',
            source_title: 'report_expedition_45_final.pdf',
            page_number: 17,
            excerpt: 'Section 3.2.1 Coastal Fast-Ice Monitoring: In-situ mechanical core extraction at station perimeter point IC-45-42 yielded an uncompressed sea-ice thickness of 1.80 m (±0.02 m).',
            confidence: 0.96,
            verification_status: obs.verification_status,
            created_at: new Date().toISOString()
          },
          {
            id: 'evi_obs1_dataset',
            knowledge_type: 'observation',
            knowledge_id: obs.id,
            source_type: 'dataset',
            source_id: 'dts_ice_measurements',
            source_title: 'ice_measurements_larsemann.csv',
            row_number: 42,
            excerpt: 'Row 42: core_id=IC-45-42, depth_m=21.0, ice_thickness_m=1.80, density_kg_m3=918, temp_c=-14.8',
            confidence: 0.98,
            verification_status: obs.verification_status,
            created_at: new Date().toISOString()
          },
          {
            id: 'evi_obs1_video',
            knowledge_type: 'observation',
            knowledge_id: obs.id,
            source_type: 'video',
            source_id: 'med_vid_interview',
            source_title: 'scientist_interview.mp4',
            timestamp_start: 758,
            timestamp_end: 778,
            excerpt: 'When we extracted Core 42, the manual caliper and thermistor probe confirmed the fast-ice sheet stood at exactly 1.8 meters thick.',
            confidence: 0.94,
            verification_status: obs.verification_status,
            created_at: new Date().toISOString()
          },
          {
            id: 'evi_obs1_image',
            knowledge_type: 'observation',
            knowledge_id: obs.id,
            source_type: 'image',
            source_id: 'med_img_larsemann',
            source_title: 'IMG_2041.jpg',
            excerpt: 'EXIF GPS -69.4089°S, 76.1872°E at 2026-01-14T07:15:00Z. Visual identification confirms fast-ice sheet drilling site with Larsemann iceberg backdrop.',
            confidence: 0.97,
            verification_status: obs.verification_status,
            created_at: new Date().toISOString()
          }
        ]}
        onApprove={handleApprove}
      />
    </div>
  );
}
