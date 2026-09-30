import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Database,
  Film,
  Image as ImageIcon,
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
import { Observation, EvidenceLink } from '@polarweave/types';
import { ConfidenceBadge, VerificationBadge, DomainBadge } from '../../components/ui/badges';
import { EvidenceDrawer } from '../../components/EvidenceDrawer';

export function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [obs, setObs] = useState<(Observation & { measurements?: any[]; evidence?: EvidenceLink[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDesc, setEditedDesc] = useState('');

  useEffect(() => {
    async function load() {
      if (!id) {
        navigate('/workspace/review');
        return;
      }
      try {
        const data = await getObservationById(id);
        setObs(data);
        setEditedTitle(data.title);
        setEditedDesc(data.description);
      } catch (e) {
        console.error('Failed to load observation:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate]);

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading observation review...</div>;
  }

  if (!obs) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Observation Not Found</h2>
        <p className="text-xs text-slate-500">The requested observation could not be found or has not been processed.</p>
        <button
          onClick={() => navigate('/workspace/review')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to Review Queue
        </button>
      </div>
    );
  }

  const handleApprove = async () => {
    await submitReview('observation', obs.id, { action: 'approve' });
    setObs({ ...obs, verification_status: 'VERIFIED' });
    setStatusMessage('Observation approved and verified.');
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
    setObs({ ...obs, title: editedTitle, description: editedDesc });
    setIsEditing(false);
    setStatusMessage('Metadata updated successfully.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const evidenceList = obs.evidence || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Navigation & Status */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/workspace/review')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
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
            <span>Show Evidence Provenance ({evidenceList.length})</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="font-bold">×</button>
        </div>
      )}

      {/* 3-COLUMN REVIEW WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMN 1: SOURCE MATERIAL (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                1. Source Material
              </h2>
              <p className="text-xs text-slate-800 font-medium">
                Uploaded source evidence
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">PROVENANCE</span>
          </div>

          {/* Render authentic evidence links if present */}
          {evidenceList.length > 0 ? (
            evidenceList.map((evi) => (
              <div key={evi.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    {evi.source_type === 'pdf' || evi.source_type === 'docx' ? (
                      <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : evi.source_type === 'dataset' ? (
                      <Database className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : evi.source_type === 'video' ? (
                      <Film className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-purple-600 shrink-0" />
                    )}
                    <span className="truncate max-w-[200px]" title={evi.source_title}>
                      {evi.source_title}
                    </span>
                  </span>
                  {evi.page_number && (
                    <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 shrink-0">
                      Page {evi.page_number}
                    </span>
                  )}
                  {evi.row_number && (
                    <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 shrink-0">
                      Row {evi.row_number}
                    </span>
                  )}
                </div>

                <div className="text-xs font-mono text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/60 leading-relaxed break-words">
                  "{evi.excerpt}"
                </div>

                {evi.media_url && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 max-h-48 bg-slate-900 flex items-center justify-center">
                    <img src={evi.media_url} alt={evi.source_title} className="object-contain max-h-48 w-full" />
                  </div>
                )}
              </div>
            ))
          ) : (
            /* Fallback to observation's own source provenance */
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="truncate max-w-[200px]">
                    {obs.source_file_name || (obs.source_file_id ? `Source: ${obs.source_file_id}` : 'Direct Upload')}
                  </span>
                </span>
                {obs.page_number && (
                  <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 shrink-0">
                    Page {obs.page_number}
                  </span>
                )}
              </div>
              <div className="text-xs font-mono text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                "{obs.excerpt || obs.description}"
              </div>
            </div>
          )}

          {obs.processing_job_id && (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-mono text-slate-500 flex items-center justify-between">
              <span>Job ID:</span>
              <span className="text-slate-800 font-semibold">{obs.processing_job_id}</span>
            </div>
          )}
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
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DomainBadge domain={obs.research_domain} />
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 font-mono">
                    {obs.location_name || 'Unspecified Location'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {obs.title}
                </h3>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                {obs.description}
              </div>

              {/* Extracted Calibration Variables (Dynamic) */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-900 block mb-2">
                  Calibrated Measurements
                </span>
                {obs.measurements && obs.measurements.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {obs.measurements.map((m, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-mono uppercase text-slate-400 block">
                          {m.variable?.replace(/_/g, ' ') || 'Metric'}
                        </span>
                        <span className="text-sm font-bold text-slate-900 font-mono">
                          {m.value} {m.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    No quantitative measurements extracted from this source material.
                  </p>
                )}
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
              <span className="font-mono text-slate-900">{Math.round(obs.confidence * 100)}%</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Location:</span>
              <span className="font-medium text-slate-900 truncate max-w-[130px]" title={obs.location_name}>
                {obs.location_name || 'Unspecified'}
              </span>
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
        evidenceLinks={evidenceList}
      />
    </div>
  );
}
