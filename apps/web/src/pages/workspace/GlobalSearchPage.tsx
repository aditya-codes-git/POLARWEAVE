import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  Database,
  Film,
  FileText
} from 'lucide-react';
import { searchRepository, askTheEvidenceQuery } from '../../lib/api';
import { VerificationBadge, ConfidenceBadge, DomainBadge } from '../../components/ui/badges';

export function GlobalSearchPage() {
  const [query, setQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Grounded Q&A toggle
  const [groundedAnswer, setGroundedAnswer] = useState<any | null>(null);

  const executeSearch = async (q: string) => {
    setLoading(true);
    try {
      const res = await searchRepository(q, {
        domain: domainFilter !== 'ALL' ? domainFilter : '',
        type: typeFilter !== 'ALL' ? typeFilter : ''
      });
      setResults(res.results || []);
      setTotal(res.total || 0);

      // If user asks a question, also evaluate "Ask the Evidence"
      if (q.includes('?') || q.toLowerCase().includes('what') || q.toLowerCase().includes('how') || q.toLowerCase().includes('evidence')) {
        const ans = await askTheEvidenceQuery(q);
        setGroundedAnswer(ans);
      } else {
        setGroundedAnswer(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch('');
  }, [domainFilter, typeFilter]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-polar-700 bg-polar-50 px-2 py-0.5 rounded border border-polar-200">
            Repository Search
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500 font-mono">Verified Polar Knowledge Engine</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Global Knowledge Search
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Search across structured observations, expedition archives, sensor datasets, and media transcripts.
        </p>
      </div>

      {/* Search Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          executeSearch(query);
        }}
        className="relative"
      >
        <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search polar observations, e.g. '1.8m ice thickness', 'MCDW warming', 'Maitri black carbon'..."
          className="w-full pl-12 pr-28 py-3 bg-white border border-slate-200 focus:border-polar-500 focus:outline-none rounded-2xl text-sm shadow-subtle text-slate-900"
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 top-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-slate-500 font-medium">Filters:</span>

        {/* Domain Filter */}
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 focus:outline-none"
        >
          <option value="ALL">All Domains</option>
          <option value="Glaciology">Glaciology</option>
          <option value="Oceanography">Oceanography</option>
          <option value="Atmospheric Sciences">Atmospheric Sciences</option>
          <option value="Biology & Ecology">Biology & Ecology</option>
          <option value="Cryosphere Dynamics">Cryosphere Dynamics</option>
        </select>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 focus:outline-none"
        >
          <option value="ALL">All Entity Types</option>
          <option value="observation">Observations</option>
          <option value="expedition">Expeditions</option>
          <option value="dataset">Datasets</option>
          <option value="media">Media</option>
        </select>

        <span className="ml-auto text-slate-400 font-mono">
          {total} result(s) returned
        </span>
      </div>

      {/* Grounded AI Synthesis if question was asked */}
      {groundedAnswer && groundedAnswer.found && (
        <div className="p-5 bg-polar-50/70 border border-polar-200 rounded-2xl space-y-3 shadow-subtle">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-polar-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-polar-800">
              Source-Grounded Answer (NCPOR Repository Grounded)
            </span>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed font-sans">
            {groundedAnswer.answer}
          </p>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-3">
        {results.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl shadow-subtle hover:shadow-premium transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                  {item.type}
                </span>
                {item.domain && <DomainBadge domain={item.domain} />}
                {item.subtitle && (
                  <span className="text-xs text-slate-400 font-mono">
                    • {item.subtitle}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {item.confidence !== undefined && <ConfidenceBadge confidence={item.confidence} />}
                {item.verification_status && <VerificationBadge status={item.verification_status} />}
              </div>
            </div>

            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-polar-700 transition-colors">
              {item.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {item.summary}
            </p>

            {item.evidence_count && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {item.evidence_count} corroborating evidence link(s)
                </span>
                <a
                  href="/workspace/evidence"
                  className="text-polar-600 hover:text-polar-700 font-medium flex items-center gap-1"
                >
                  <span>Trace Provenance</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
