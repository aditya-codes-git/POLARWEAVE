import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Search,
  X,
  FileText,
  Database,
  Video,
  Image as ImageIcon,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { askTheEvidenceQuery } from '../lib/api';
import { EvidenceLink } from '@polarweave/types';

interface AskTheEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEvidence?: (evidence: EvidenceLink) => void;
}

export function AskTheEvidenceModal({
  isOpen,
  onClose,
  onSelectEvidence
}: AskTheEvidenceModalProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    answer: string;
    evidence: EvidenceLink[];
    found: boolean;
  } | null>(null);

  const sampleQueries = [
    'What evidence supports the ice observation from Expedition 45?',
    'Show measurements of subsurface warming in Prydz Bay',
    'What are the black carbon aerosol levels recorded at Maitri Station?'
  ];

  const handleSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setQuery(queryText);
    try {
      const res = await askTheEvidenceQuery(queryText);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-elevated border border-slate-200 overflow-hidden z-10"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-polar-500/10 flex items-center justify-center text-polar-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Ask the Evidence
                  </h3>
                  <p className="text-xs text-slate-500">
                    Source-grounded scientific knowledge retrieval (No hallucination)
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Bar */}
            <div className="p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch(query);
                }}
                className="relative"
              >
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a scientific question, e.g. What evidence supports ice observation from Expedition 45?"
                  className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-200 focus:border-polar-500 focus:bg-white focus:outline-none rounded-xl text-sm transition-all shadow-subtle"
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="absolute right-1.5 top-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  {loading ? 'Retrieving...' : 'Query'}
                </button>
              </form>

              {/* Sample Queries */}
              {!result && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-slate-500 mb-2">
                    Try suggested queries:
                  </p>
                  <div className="space-y-1.5">
                    {sampleQueries.map((sq, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearch(sq)}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 bg-slate-50 hover:bg-polar-50 hover:text-polar-900 rounded-lg border border-slate-200/60 transition-colors flex items-center justify-between group"
                      >
                        <span>{sq}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-polar-600 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Result Answer & Corroborating Sources */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-4"
                >
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        Verified Evidence Synthesis
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line font-sans">
                      {result.answer}
                    </p>
                  </div>

                  {result.evidence.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-700">
                          Corroborating Evidence Sources ({result.evidence.length})
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Click to inspect provenance
                        </span>
                      </div>

                      <div className="space-y-2">
                        {result.evidence.map((link) => (
                          <div
                            key={link.id}
                            onClick={() => onSelectEvidence && onSelectEvidence(link)}
                            className="p-3 bg-white border border-slate-200 hover:border-polar-300 rounded-lg shadow-subtle hover:shadow-premium transition-all cursor-pointer flex items-start justify-between gap-3 group"
                          >
                            <div className="flex items-start gap-2.5">
                              {link.source_type === 'pdf' && <FileText className="w-4 h-4 text-rose-500 mt-0.5" />}
                              {link.source_type === 'dataset' && <Database className="w-4 h-4 text-emerald-500 mt-0.5" />}
                              {link.source_type === 'video' && <Video className="w-4 h-4 text-blue-500 mt-0.5" />}
                              {link.source_type === 'image' && <ImageIcon className="w-4 h-4 text-purple-500 mt-0.5" />}
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-slate-900 group-hover:text-polar-600 transition-colors">
                                    {link.source_title}
                                  </span>
                                  {link.page_number && (
                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                                      p.{link.page_number}
                                    </span>
                                  )}
                                  {link.row_number && (
                                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-mono border border-emerald-200">
                                      row {link.row_number}
                                    </span>
                                  )}
                                  {link.timestamp_start !== undefined && (
                                    <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-mono border border-blue-200">
                                      {Math.floor(link.timestamp_start / 60)}:{Math.floor(link.timestamp_start % 60).toString().padStart(2, '0')}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2 mt-1 font-mono">
                                  "{link.excerpt}"
                                </p>
                              </div>
                            </div>
                            <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex-shrink-0">
                              Verified
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Grounding: Strict NCPOR Verified Repository</span>
              <button
                onClick={() => {
                  setResult(null);
                  setQuery('');
                }}
                className="text-slate-600 hover:text-slate-900 font-medium"
              >
                Clear Query
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
