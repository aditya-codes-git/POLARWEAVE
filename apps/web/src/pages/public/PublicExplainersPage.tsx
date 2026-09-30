import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Clock,
  Layers,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  MapPin,
  CheckCircle2,
  ChevronRight,
  X,
  FileText,
  Database
} from 'lucide-react';
import { DomainBadge } from '../../components/ui/badges';

export interface ExplainerArticle {
  id: string;
  title: string;
  reading_time_min: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  domain: string;
  summary: string;
  banner_color: string;
  expedition: string;
  key_concepts: string[];
  full_content: {
    lead: string;
    sections: {
      heading: string;
      body: string;
      evidence_tag?: string;
    }[];
    grounded_citations: {
      citation: string;
      source: string;
      reference: string;
    }[];
  };
}

const EXPLAINERS: ExplainerArticle[] = [];

export function PublicExplainersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedExplainer, setSelectedExplainer] = useState<ExplainerArticle | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');

  const filteredExplainers = EXPLAINERS.filter((exp) => {
    if (difficultyFilter !== 'ALL' && exp.difficulty !== difficultyFilter) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* 1. HEADER (Section 9) */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase bg-polar-50 text-polar-700 px-2 py-0.5 rounded border border-polar-200 font-bold">
                Science Education & Outreach
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-mono">Curriculum & Public Learning</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              Science Explainers
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Understand complex polar science through simple, visual explanations grounded in verified Indian expedition findings.
            </p>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl border border-slate-200">
            {['ALL', 'Beginner', 'Intermediate'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  difficultyFilter === diff
                    ? 'bg-white shadow-xs text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {diff === 'ALL' ? 'All Levels' : diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. EXPLAINER CARDS GRID */}
      {filteredExplainers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-subtle">
          <div className="w-12 h-12 rounded-2xl bg-polar-50 text-polar-600 flex items-center justify-center mx-auto border border-polar-200">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">No Science Explainers Published</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Science explainers crafted from verified polar research findings will appear here once approved by Knowledge Administrators.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExplainers.map((article) => (
          <div
            key={article.id}
            className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-subtle hover:shadow-premium transition-all overflow-hidden flex flex-col justify-between group"
          >
            {/* Gradient Top Banner */}
            <div className={`h-28 bg-linear-to-r ${article.banner_color} p-5 flex flex-col justify-between text-white relative overflow-hidden`}>
              <div className="flex items-center justify-between z-10">
                <span className="px-2.5 py-0.5 rounded-full bg-black/20 backdrop-blur-xs text-[11px] font-mono font-semibold uppercase tracking-wider">
                  {article.domain}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-mono">
                  {article.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono opacity-90 z-10">
                <Clock className="w-3.5 h-3.5" />
                <span>{article.reading_time_min} Min Read</span>
                <span>•</span>
                <span className="truncate">{article.expedition}</span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2.5">
                <h3
                  onClick={() => setSelectedExplainer(article)}
                  className="text-lg font-bold text-slate-900 leading-snug group-hover:text-polar-700 transition-colors cursor-pointer"
                >
                  {article.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {article.summary}
                </p>
              </div>

              {/* Key Concepts Pills */}
              <div className="pt-2">
                <div className="flex flex-wrap gap-1.5">
                  {article.key_concepts.map((concept) => (
                    <span
                      key={concept}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer with action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Grounded Citations
                </span>

                <button
                  onClick={() => setSelectedExplainer(article)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-polar-700 group-hover:text-polar-900"
                >
                  <span>Read Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

      {/* 3. STORY READER MODAL / SLIDE-OVER */}
      {selectedExplainer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex justify-center p-4 sm:p-8">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">
            {/* Modal Header */}
            <div className={`p-6 sm:p-8 bg-linear-to-r ${selectedExplainer.banner_color} text-white relative`}>
              <button
                onClick={() => setSelectedExplainer(null)}
                className="absolute top-5 right-5 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 uppercase font-bold">
                    {selectedExplainer.domain}
                  </span>
                  <span>•</span>
                  <span>{selectedExplainer.reading_time_min} Min Read</span>
                  <span>•</span>
                  <span>{selectedExplainer.difficulty} Level</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold leading-tight">
                  {selectedExplainer.title}
                </h2>
                <p className="text-xs sm:text-sm text-white/90 font-mono">
                  Origin: {selectedExplainer.expedition}
                </p>
              </div>
            </div>

            {/* Modal Article Content */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 leading-relaxed text-sm">
              <p className="text-base font-medium text-slate-900 border-l-4 border-polar-600 pl-4 py-1 italic bg-slate-50 rounded-r-xl">
                {selectedExplainer.full_content.lead}
              </p>

              {selectedExplainer.full_content.sections.map((sec, i) => (
                <div key={i} className="space-y-2">
                  <h4 className="text-base font-bold text-slate-950">{sec.heading}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{sec.body}</p>
                  {sec.evidence_tag && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-mono flex items-center justify-between">
                      <span className="font-semibold">{sec.evidence_tag}</span>
                      <button
                        onClick={() => {
                          setSelectedExplainer(null);
                          navigate('/explore/evidence');
                        }}
                        className="text-emerald-900 font-bold underline hover:text-emerald-950"
                      >
                        Inspect Raw Source
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Citations Box */}
              <div className="pt-6 border-t border-slate-200 space-y-3">
                <h5 className="text-xs font-mono uppercase text-slate-500 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified Evidence Citations</span>
                </h5>
                <div className="space-y-2">
                  {selectedExplainer.full_content.grounded_citations.map((cite, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-emerald-700 mr-2">{cite.citation}</span>
                        <span className="font-medium text-slate-900">{cite.source}</span>
                        <span className="text-slate-500 font-mono text-[11px] block">{cite.reference}</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedExplainer(null);
                          navigate('/explore/evidence');
                        }}
                        className="text-polar-700 font-semibold text-xs hover:text-polar-900 flex items-center gap-1"
                      >
                        <span>Evidence</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">NCPOR Public Outreach Series</span>
              <button
                onClick={() => setSelectedExplainer(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800"
              >
                Close Explainer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
