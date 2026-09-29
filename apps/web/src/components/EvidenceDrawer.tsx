import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  Database,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Play
} from 'lucide-react';
import { EvidenceLink } from '@polarweave/types';
import { ConfidenceBadge, VerificationBadge } from './ui/badges';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  knowledgeTitle: string;
  confidence: number;
  verificationStatus: string;
  evidenceLinks: EvidenceLink[];
  onApprove?: () => void;
}

export function EvidenceDrawer({
  isOpen,
  onClose,
  knowledgeTitle,
  confidence,
  verificationStatus,
  evidenceLinks,
  onApprove
}: EvidenceDrawerProps) {
  const [selectedSource, setSelectedSource] = useState<EvidenceLink | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'documents' | 'datasets' | 'media'>('all');

  const filteredLinks = evidenceLinks.filter((link) => {
    if (activeTab === 'documents') return link.source_type === 'pdf' || link.source_type === 'docx';
    if (activeTab === 'datasets') return link.source_type === 'dataset';
    if (activeTab === 'media') return link.source_type === 'video' || link.source_type === 'image';
    return true;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]"
          />

          {/* Slide-over Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-polar-700 bg-polar-50 px-2 py-0.5 rounded border border-polar-200">
                      Evidence Trace
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">Multi-Modal Provenance Chain</span>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 leading-snug">
                    {knowledgeTitle}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status & Confidence row */}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-200/60 text-xs">
                <div>
                  <span className="text-slate-500 mr-2">Extraction Confidence:</span>
                  <ConfidenceBadge confidence={confidence} />
                </div>
                <div>
                  <span className="text-slate-500 mr-2">Verification:</span>
                  <VerificationBadge status={verificationStatus} />
                </div>
                <div className="ml-auto text-slate-400">
                  {evidenceLinks.length} corroborating source(s)
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-6 py-2.5 border-b border-slate-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-1">
                {(['all', 'documents', 'datasets', 'media'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-400 italic font-mono">
                "Show me why you believe this"
              </span>
            </div>

            {/* Evidence Chain Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {filteredLinks.map((link, idx) => {
                  const isPdf = link.source_type === 'pdf';
                  const isDataset = link.source_type === 'dataset';
                  const isVideo = link.source_type === 'video';
                  const isImage = link.source_type === 'image';

                  return (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative group bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-subtle hover:shadow-premium transition-all"
                    >
                      {/* Node indicator on vertical line */}
                      <span className="absolute -left-[30px] top-5 w-3.5 h-3.5 rounded-full border-2 border-white bg-polar-600 ring-2 ring-polar-100" />

                      {/* Header with Type & Reference */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {isPdf && <FileText className="w-4 h-4 text-rose-600" />}
                          {isDataset && <Database className="w-4 h-4 text-emerald-600" />}
                          {isVideo && <Video className="w-4 h-4 text-blue-600" />}
                          {isImage && <ImageIcon className="w-4 h-4 text-purple-600" />}

                          <span className="text-xs font-semibold text-slate-900">
                            {link.source_title}
                          </span>

                          {link.page_number && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-mono">
                              Page {link.page_number}
                            </span>
                          )}

                          {link.row_number && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-mono border border-emerald-200">
                              Row #{link.row_number}
                            </span>
                          )}

                          {link.timestamp_start !== undefined && link.timestamp_start !== null && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-mono border border-blue-200 flex items-center gap-1">
                              <Play className="w-2.5 h-2.5 fill-current" />
                              {Math.floor(link.timestamp_start / 60)}:
                              {Math.floor(link.timestamp_start % 60).toString().padStart(2, '0')}
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-400 font-mono">
                          {Math.round(link.confidence * 100)}% match
                        </span>
                      </div>

                      {/* Excerpt Body */}
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-700 font-mono leading-relaxed">
                        {link.excerpt}
                      </div>

                      {/* Video Player Mockup if video */}
                      {isVideo && (
                        <div className="mt-3 p-3 bg-slate-900 rounded-lg text-white text-xs">
                          <div className="flex items-center justify-between text-slate-300 mb-2">
                            <span>scientist_interview.mp4</span>
                            <span className="font-mono text-polar-400">Seek: 12:43 / 20:45</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-polar-500 h-full w-[61%]" />
                          </div>
                          <p className="mt-2 text-slate-400 italic">
                            Speaker: Dr. Rajesh Sharma (Lead Glaciologist, NCPOR)
                          </p>
                        </div>
                      )}

                      {/* Image Preview if image */}
                      {isImage && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative group/img">
                          <img
                            src="https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80"
                            alt="Fast-ice field site"
                            className="w-full h-36 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2.5">
                            <span className="text-white text-[11px] font-mono">
                              GPS: 69.4089° S, 76.1872° E (EXIF Authenticated)
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Action Links */}
                      <div className="mt-3 pt-2 flex items-center justify-between border-t border-slate-100">
                        <span className="text-[11px] text-slate-400">
                          Provenance: Direct Ingestion
                        </span>
                        <button
                          onClick={() => setSelectedSource(link)}
                          className="inline-flex items-center gap-1 text-xs text-polar-600 hover:text-polar-700 font-medium hover:underline"
                        >
                          <span>Inspect Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer with Verification Action */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Ready for human scientist sign-off</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
                {onApprove && verificationStatus !== 'VERIFIED' && (
                  <button
                    onClick={() => {
                      onApprove();
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Approve Observation
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
