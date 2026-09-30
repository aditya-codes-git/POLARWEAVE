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
  Info,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { getObservationById, submitReview } from '../../lib/api';
import { Observation, EvidenceLink } from '@polarweave/types';
import { ConfidenceBadge, VerificationBadge, DomainBadge } from '../../components/ui/badges';
import { EvidenceDrawer } from '../../components/EvidenceDrawer';
import { useRole } from '../../context/RoleContext';

export function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role, user } = useRole();
  const isAdmin = role === 'admin';

  const [obs, setObs] = useState<(Observation & { measurements?: any[]; evidence?: EvidenceLink[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  // Clear stale authorization or error banners when role or observation changes
  useEffect(() => {
    setErrorMessage(null);
    setStatusMessage(null);
  }, [role, id]);

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
          {isAdmin ? 'Return to Verification Queue' : 'Return to My Submissions'}
        </button>
      </div>
    );
  }

  const handleApprove = async () => {
    try {
      setErrorMessage(null);
      await submitReview('observation', obs.id, { action: 'approve' });
      setObs({ ...obs, verification_status: 'VERIFIED' });
      setStatusMessage('Observation institutionally approved and verified.');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unauthorized: Only Knowledge Admins can verify submissions.');
      setTimeout(() => setErrorMessage(null), 6000);
    }
  };

  const handleReject = async () => {
    try {
      setErrorMessage(null);
      await submitReview('observation', obs.id, { action: 'reject' });
      setObs({ ...obs, verification_status: 'REJECTED' });
      setStatusMessage('Observation marked as rejected.');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unauthorized: Only Knowledge Admins can reject submissions.');
      setTimeout(() => setErrorMessage(null), 6000);
    }
  };

  const handleSaveEdit = async () => {
    try {
      setErrorMessage(null);
      await submitReview('observation', obs.id, {
        action: 'edit',
        edited_data: { title: editedTitle, description: editedDesc }
      });
      setObs({
        ...obs,
        title: editedTitle,
        description: editedDesc,
        verification_status: obs.verification_status === 'VERIFIED' && !isAdmin ? 'PENDING_ADMIN_REVIEW' : obs.verification_status
      });
      setIsEditing(false);
      setStatusMessage('Metadata updated successfully.');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update metadata.');
      setTimeout(() => setErrorMessage(null), 6000);
    }
  };

  const evidenceList = obs.evidence || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Navigation & Status */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(obs.processing_job_id ? `/workspace/review?jobId=${obs.processing_job_id}` : '/workspace/review')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isAdmin ? 'Back to Verification Queue' : 'Back to My Submissions'}</span>
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
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="font-bold">×</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="font-bold text-rose-600 hover:text-rose-900">×</button>
        </div>
      )}

      {/* WORKSPACE LAYOUT: 70% MAIN CONTENT + 30% STICKY REVIEW DECISION PANEL */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT / MAIN SECTION: ~70% WIDTH */}
        <div className="w-full lg:w-[68%] xl:w-[70%] space-y-6">
          {/* FLOW HEADER BANNER */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-xl">
            <span className="font-semibold text-slate-800">SOURCE MATERIAL</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-polar-700">EXTRACTED KNOWLEDGE</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-purple-700">{isAdmin ? 'ADMIN VERIFICATION' : 'AUTHOR STATUS'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* 1. SOURCE MATERIAL: ~40% OF MAIN (5 cols out of 12 = 41.7%) */}
            <div className="md:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      1. Source Material
                    </h2>
                  </div>
                  <p className="text-xs text-slate-800 font-medium mt-0.5">
                    Uploaded source evidence
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                  PROVENANCE
                </span>
              </div>

              {/* Render authentic evidence links if present */}
              {evidenceList.length > 0 ? (
                evidenceList.map((evi) => (
                  <div key={evi.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 min-w-0">
                        {evi.source_type === 'pdf' || evi.source_type === 'docx' ? (
                          <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                        ) : evi.source_type === 'dataset' ? (
                          <Database className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : evi.source_type === 'video' ? (
                          <Film className="w-4 h-4 text-blue-600 shrink-0" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-purple-600 shrink-0" />
                        )}
                        <span className="truncate" title={evi.source_title}>
                          {evi.source_title}
                        </span>
                      </span>
                      {evi.page_number && (
                        <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-medium shrink-0">
                          p. {evi.page_number}
                        </span>
                      )}
                      {evi.row_number && (
                        <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-medium shrink-0">
                          row {evi.row_number}
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-mono text-slate-700 bg-white p-3 rounded-lg border border-slate-200/70 leading-relaxed break-words shadow-2xs">
                      "{evi.excerpt}"
                    </div>

                    {evi.media_url && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 max-h-56 bg-slate-900 flex items-center justify-center">
                        <img src={evi.media_url} alt={evi.source_title} className="object-contain max-h-56 w-full" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                /* Fallback to observation's own source provenance */
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 min-w-0">
                      <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="truncate" title={obs.source_file_name || obs.source_file_id || 'Direct Upload'}>
                        {obs.source_file_name || (obs.source_file_id ? `Source: ${obs.source_file_id}` : 'Direct Upload')}
                      </span>
                    </span>
                    {obs.page_number && (
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-medium shrink-0">
                        p. {obs.page_number}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-slate-700 bg-white p-3 rounded-lg border border-slate-200/70 leading-relaxed break-words shadow-2xs">
                    "{obs.excerpt || obs.description}"
                  </div>
                </div>
              )}

              {/* Provenance Metadata Details */}
              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                {obs.processing_job_id && (
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                    <span className="text-slate-400">Processing Job:</span>
                    <span className="text-slate-800 font-semibold">{obs.processing_job_id}</span>
                  </div>
                )}
                {obs.expedition_title && (
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span className="text-slate-400">Expedition:</span>
                    <span className="text-slate-800 font-medium truncate max-w-[150px]">{obs.expedition_title}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. EXTRACTED KNOWLEDGE: ~60% OF MAIN (7 cols out of 12 = 58.3%) */}
            <div className="md:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-polar-500"></span>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-polar-700">
                      2. Extracted Knowledge
                    </h2>
                  </div>
                  <p className="text-xs text-slate-800 font-medium mt-0.5">
                    Structured scientific finding
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
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-polar-500"
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
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-polar-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <DomainBadge domain={obs.research_domain} />
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-mono">
                        {obs.location_name || 'Unspecified Location'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {obs.title}
                    </h3>
                  </div>

                  <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                    {obs.description}
                  </div>

                  {/* Extracted Calibration Variables (Dynamic) */}
                  <div className="pt-2">
                    <span className="text-xs font-semibold text-slate-900 block mb-2">
                      Calibrated Measurements & Variables
                    </span>
                    {obs.measurements && obs.measurements.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2.5">
                        {obs.measurements.map((m, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 shadow-2xs">
                            <span className="text-[10px] font-mono uppercase text-slate-400 block">
                              {m.variable?.replace(/_/g, ' ') || 'Metric'}
                            </span>
                            <span className="text-sm font-bold text-slate-900 font-mono mt-0.5 block">
                              {m.value} {m.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                        No quantitative calibrated measurements extracted from this source material.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT / REVIEW STATUS PANEL: ~30% WIDTH (STICKY WHILE SCROLLING) */}
        <div className="w-full lg:w-[32%] xl:w-[30%] lg:sticky lg:top-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle space-y-5">
          {isAdmin ? (
            /* ADMIN VIEW: INSTITUTIONAL GOVERNANCE & VERIFICATION */
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 text-purple-700 font-semibold text-[11px] font-mono uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Institutional Governance</span>
                </div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  3. Review Decision
                </h2>
                <p className="text-xs text-slate-800 font-medium">
                  Authoritative administrative sign-off
                </p>
              </div>

              {/* Status & Reviewer Indication */}
              {obs.verification_status === 'VERIFIED' ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Status: VERIFIED</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Verified by Dr. Sunita Bose (Knowledge Admin)
                  </p>
                </div>
              ) : obs.verification_status === 'REJECTED' ? (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-rose-800">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Status: REJECTED</span>
                  </div>
                  <p className="text-[11px] text-rose-700">
                    Rejected by Knowledge Admin. Returned to author.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-purple-900">
                    <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
                    <span>Admin Verification Required</span>
                  </div>
                  <p className="text-[11px] text-purple-700 leading-relaxed">
                    Institutional governance decision. Your review locks this fact for public dissemination.
                  </p>
                </div>
              )}

              {/* Submission Information Table */}
              <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Current Status:</span>
                  <VerificationBadge status={obs.verification_status} />
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Confidence:</span>
                  <span className="font-mono font-semibold text-slate-900">{Math.round(obs.confidence * 100)}%</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Submitter:</span>
                  <span className="font-medium text-slate-900 truncate max-w-[130px]" title={obs.created_by_name || 'Dr. Rajesh Sharma'}>
                    {obs.created_by_name || 'Dr. Rajesh Sharma'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Location:</span>
                  <span className="font-medium text-slate-900 truncate max-w-[130px]" title={obs.location_name}>
                    {obs.location_name || 'Unspecified'}
                  </span>
                </div>
              </div>

              {/* Grouped Actions at Bottom of Panel */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                {obs.verification_status !== 'VERIFIED' && (
                  <button
                    onClick={handleApprove}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Approve & Verify</span>
                  </button>
                )}

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-medium shadow-subtle flex items-center justify-center gap-2 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                  <span>{isEditing ? 'Close Editing' : 'Edit Metadata'}</span>
                </button>

                {obs.verification_status !== 'REJECTED' && (
                  <button
                    onClick={handleReject}
                    className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium flex items-center justify-center gap-2 transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Reject Observation</span>
                  </button>
                )}
              </div>

              <div className="p-3 bg-polar-50/60 rounded-xl border border-polar-200/60 text-xs text-polar-800 space-y-1">
                <span className="font-semibold block">Evidence Trace Anchored</span>
                <p className="text-[11px] text-polar-700 leading-relaxed">
                  Approving locks this fact and links it permanently into the Knowledge Graph and Outreach Studio.
                </p>
              </div>
            </div>
          ) : (
            /* RESEARCHER / CONTRIBUTOR VIEW: AUTHOR PEER STATUS */
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 text-amber-700 font-semibold text-[11px] font-mono uppercase tracking-wider mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Author Peer Status</span>
                </div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  3. Submission Status
                </h2>
                <p className="text-xs text-slate-800 font-medium">
                  Tracking institutional verification
                </p>
              </div>

              {/* Status Banner */}
              {obs.verification_status === 'VERIFIED' ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Status: VERIFIED</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    Verified by Dr. Sunita Bose (Knowledge Admin). Your finding is now locked and eligible for public exploration.
                  </p>
                </div>
              ) : obs.verification_status === 'REJECTED' ? (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-rose-800">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Status: REJECTED</span>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-relaxed">
                    Knowledge Admin requested revision or rejected the finding. Edit metadata or consult reviewer notes.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Awaiting Knowledge Admin Review</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Your submission is ready for institutional verification.
                  </p>
                  <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[10px] text-amber-800 font-mono">
                    <span className="bg-amber-100/70 px-1.5 py-0.5 rounded">Pending Admin Review</span>
                    <span>By: {obs.created_by_name || 'Dr. Rajesh Sharma'}</span>
                  </div>
                </div>
              )}

              {/* Submission Information Table */}
              <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Current Status:</span>
                  <VerificationBadge status={obs.verification_status} />
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Confidence:</span>
                  <span className="font-mono font-semibold text-slate-900">{Math.round(obs.confidence * 100)}%</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Location:</span>
                  <span className="font-medium text-slate-900 truncate max-w-[130px]" title={obs.location_name}>
                    {obs.location_name || 'Unspecified'}
                  </span>
                </div>
              </div>

              {/* Action Controls for Researcher */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                {obs.verification_status !== 'VERIFIED' && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Close Editing' : 'Edit Metadata'}</span>
                  </button>
                )}

                <button
                  onClick={() => setIsEvidenceDrawerOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-medium shadow-subtle flex items-center justify-center gap-2 transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-polar-600" />
                  <span>View Evidence Provenance</span>
                </button>

                <button
                  onClick={() => navigate(obs.processing_job_id ? `/workspace/review?jobId=${obs.processing_job_id}` : '/workspace/review')}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                  <span>Back to My Submissions</span>
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <span className="font-semibold text-slate-800 block">Separation of Duties</span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Awaiting institutional verification. Researchers may inspect and edit unverified findings, but only Knowledge Admins can grant official sign-off.
                </p>
              </div>
            </div>
          )}
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
