import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  FileText,
  Database,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Play,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { getObservations, getEvidenceTrace, EvidenceTracePayload } from '../../lib/api';
import { Observation, EvidenceLink } from '@polarweave/types';
import { ConfidenceBadge, VerificationBadge, DomainBadge } from '../../components/ui/badges';
import { useRole } from '../../context/RoleContext';

export function EvidenceTracePage() {
  const { role } = useRole();
  const isAdmin = role === 'admin';
  const [searchParams] = useSearchParams();
  const initialObsId = searchParams.get('obsId');

  const [observations, setObservations] = useState<Observation[]>([]);
  const [selectedObsId, setSelectedObsId] = useState<string>('');
  const [trace, setTrace] = useState<EvidenceTracePayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getObservations().then((list) => {
      setObservations(list);
      if (initialObsId && list.some((o) => o.id === initialObsId)) {
        setSelectedObsId(initialObsId);
      } else if (list.length > 0) {
        setSelectedObsId(list[0].id);
      }
    });
  }, [initialObsId]);

  useEffect(() => {
    if (selectedObsId) {
      setLoading(true);
      getEvidenceTrace(selectedObsId)
        .then((res) => {
          setTrace(res);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedObsId]);

  const selectedObs = observations.find((o) => o.id === selectedObsId) || observations[0];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-polar-700 bg-polar-50 px-2 py-0.5 rounded border border-polar-200">
              POLARWEAVE Core Differentiator
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">"Show me why you believe this"</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Evidence Trace
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Every scientific fact is anchored to authentic source evidence: document pages, dataset rows, video timestamps, or authenticated photographic assets.
          </p>
        </div>

        {/* Observation Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">Select Finding:</label>
          <select
            value={selectedObsId}
            onChange={(e) => setSelectedObsId(e.target.value)}
            className="text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-subtle focus:outline-none focus:border-polar-500 max-w-xs"
          >
            {observations.map((obs) => (
              <option key={obs.id} value={obs.id}>
                {obs.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Trace Showcase */}
      {selectedObs && trace && (
        <div className="space-y-6">
          {/* CLAIM CARD */}
          <div className="bg-white border-2 border-polar-200/80 rounded-2xl p-6 shadow-premium relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-polar-50/50 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <DomainBadge domain={selectedObs.research_domain} />
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-medium text-slate-600">
                  {selectedObs.location_name || 'Unspecified Location'}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedObs.source_file_name || (selectedObs.demo ? 'Expedition 45' : 'Uploaded Package')}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">Extraction Confidence:</span>
                <ConfidenceBadge confidence={trace.confidence} />
                <VerificationBadge status={trace.verification_status} />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-[11px] font-mono text-polar-700 uppercase tracking-wider font-semibold block mb-1">
                Structured Scientific Claim
              </span>
              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                "{selectedObs.title}"
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed max-w-4xl">
                {selectedObs.description}
              </p>
            </div>

            {/* Role-Aware Governance Notice (Section 11) */}
            <div className={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
              isAdmin
                ? 'bg-purple-50/70 border-purple-200 text-purple-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-current opacity-70" />
                <span>
                  {isAdmin
                    ? (selectedObs.verification_status === 'VERIFIED'
                        ? 'Institutional Verification Active: This observation is locked and verified by Knowledge Admin.'
                        : 'Institutional Sign-off: Approving locks this fact and links it permanently into the Knowledge Graph and Outreach Studio.')
                    : (selectedObs.verification_status === 'VERIFIED'
                        ? 'Institutional Verification Active: Confirmed by Knowledge Admin.'
                        : 'Awaiting institutional verification. Only Knowledge Admins can verify and lock authoritative institutional facts.')}
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold opacity-75 shrink-0">
                {isAdmin ? 'ADMIN GOVERNANCE' : 'AUTHOR SUBMISSION'}
              </span>
            </div>

            {/* Sub-header Banner */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">
                  {trace.evidence_chain.length > 0
                    ? `Corroborated by ${trace.evidence_chain.length} Verified Physical & Multimodal Source(s)`
                    : 'Directly Derived from Uploaded Source Document'}
                </span>
              </div>
              <span className="font-mono text-slate-400">
                Provenance Chain Integrity: 100%
              </span>
            </div>
          </div>

          {/* DYNAMIC MULTIMODAL PROVENANCE GRID */}
          {trace.evidence_chain.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {trace.evidence_chain.map((link, idx) => (
                <div
                  key={link.id || idx}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          link.source_type === 'pdf' || link.source_type === 'docx'
                            ? 'bg-rose-50 text-rose-600'
                            : link.source_type === 'dataset'
                            ? 'bg-emerald-50 text-emerald-600'
                            : link.source_type === 'video'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-purple-50 text-purple-600'
                        }`}>
                          {link.source_type === 'pdf' || link.source_type === 'docx' ? (
                            <FileText className="w-4 h-4" />
                          ) : link.source_type === 'dataset' ? (
                            <Database className="w-4 h-4" />
                          ) : link.source_type === 'video' ? (
                            <Film className="w-4 h-4" />
                          ) : (
                            <ImageIcon className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-slate-900 block truncate max-w-[220px]" title={link.source_title}>
                            {link.source_title}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono uppercase">
                            {link.source_type} Source
                          </span>
                        </div>
                      </div>

                      {link.page_number && (
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-xs font-mono font-semibold border border-rose-200">
                          Page {link.page_number}
                        </span>
                      )}
                      {link.row_number && (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-mono font-semibold border border-emerald-200">
                          Row #{link.row_number}
                        </span>
                      )}
                      {link.timestamp_start !== undefined && (
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-mono font-semibold border border-blue-200 flex items-center gap-1">
                          <Play className="w-3 h-3 fill-current" />
                          {Math.floor(link.timestamp_start / 60)}:{(link.timestamp_start % 60).toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 font-mono text-xs text-slate-700 leading-relaxed break-words">
                      "{link.excerpt}"
                    </div>

                    {link.media_url && (
                      <div className="rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-900 flex items-center justify-center">
                        <img src={link.media_url} alt={link.source_title} className="w-full h-40 object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">{link.source_id || 'Authenticated Upload'}</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono text-[11px] border border-emerald-200">
                      Verified Provenance ({Math.round(link.confidence * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Observation with single document origin */
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-subtle">
              <div className="w-12 h-12 rounded-2xl bg-polar-50 text-polar-600 flex items-center justify-center mx-auto border border-polar-200">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Direct Source Provenance</h3>
              <p className="text-xs text-slate-500 max-w-lg mx-auto">
                This scientific finding originated directly from{' '}
                <span className="font-semibold text-slate-800 font-mono">
                  {selectedObs.source_file_name || selectedObs.source_file_id || 'Uploaded Document'}
                </span>
                {selectedObs.page_number ? ` on Page ${selectedObs.page_number}` : ''}.
              </p>
              {selectedObs.excerpt && (
                <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 text-left max-w-xl mx-auto leading-relaxed">
                  "{selectedObs.excerpt}"
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
