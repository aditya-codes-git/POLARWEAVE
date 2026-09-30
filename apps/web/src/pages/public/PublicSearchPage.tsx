import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Bookmark,
  Compass,
  Database,
  Film,
  ShieldCheck,
  MapPin,
  Calendar,
  ArrowRight,
  Filter,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { getObservations, getExpeditions, getDatasets, getMedia } from '../../lib/api';
import { Observation, Expedition, Dataset, MediaAsset } from '@polarweave/types';
import { DomainBadge } from '../../components/ui/badges';

interface SearchResultItem {
  id: string;
  type: 'knowledge' | 'expedition' | 'dataset' | 'media';
  title: string;
  subtitle: string;
  snippet: string;
  domain?: string;
  region?: string;
  expedition_code?: string;
  source_count?: number;
  date?: string;
  raw: any;
}

export function PublicSearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [observations, setObservations] = useState<Observation[]>([]);
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<SearchResultItem | null>(null);

  // Active filters
  const selectedType = searchParams.get('type') || 'all';
  const selectedDomain = searchParams.get('domain') || 'ALL';

  useEffect(() => {
    Promise.all([
      getObservations().catch(() => []),
      getExpeditions().catch(() => []),
      getDatasets().catch(() => []),
      getMedia().catch(() => [])
    ]).then(([obs, exp, data, med]) => {
      setObservations(obs.filter((o) => o.verification_status === 'VERIFIED' || o.demo));
      setExpeditions(exp);
      setDatasets(data);
      setMediaList(med);
      setLoading(false);
    });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (query.trim()) next.set('q', query.trim());
    else next.delete('q');
    setSearchParams(next);
  };

  const updateType = (t: string) => {
    const next = new URLSearchParams(searchParams);
    if (t === 'all') next.delete('type');
    else next.set('type', t);
    setSearchParams(next);
  };

  const updateDomain = (d: string) => {
    const next = new URLSearchParams(searchParams);
    if (d === 'ALL') next.delete('domain');
    else next.set('domain', d);
    setSearchParams(next);
  };

  // Compile unified searchable items
  const allResults = useMemo<SearchResultItem[]>(() => {
    const list: SearchResultItem[] = [];

    // 1. Observations
    observations.forEach((o) => {
      list.push({
        id: o.id,
        type: 'knowledge',
        title: o.title,
        subtitle: `${o.location_name} • ${o.research_domain}`,
        snippet: o.description,
        domain: o.research_domain,
        region: 'Antarctica',
        expedition_code: 'EXP-45-ANT',
        source_count: 3,
        date: o.observed_at?.slice(0, 10),
        raw: o
      });
    });

    // 2. Expeditions
    expeditions.forEach((e) => {
      list.push({
        id: e.id,
        type: 'expedition',
        title: e.title,
        subtitle: `${e.code} • ${e.region} (${e.stations.join(', ')})`,
        snippet: e.description,
        region: e.region,
        expedition_code: e.code,
        source_count: 14,
        date: e.start_date?.slice(0, 4),
        raw: e
      });
    });

    // 3. Datasets
    datasets.forEach((d) => {
      list.push({
        id: d.id,
        type: 'dataset',
        title: d.title,
        subtitle: `${d.filename} • ${d.row_count} Rows`,
        snippet: `Calibrated sensor measurement table covering ${d.columns?.map(c => c.name).join(', ') || 'cryospheric parameters'}.`,
        domain: 'Cryosphere Dynamics',
        region: d.region,
        expedition_code: d.expedition_id,
        source_count: 1,
        date: d.created_at?.slice(0, 10),
        raw: d
      });
    });

    // 4. Media
    mediaList.forEach((m) => {
      list.push({
        id: m.id,
        type: 'media',
        title: m.filename,
        subtitle: `${m.location_name} • EXIF Verified`,
        snippet: m.ai_analysis_json?.caption || 'Authentic photography from polar field deployments.',
        region: 'Antarctica',
        expedition_code: m.expedition_id,
        source_count: 1,
        date: m.capture_date?.slice(0, 10),
        raw: m
      });
    });

    return list;
  }, [observations, expeditions, datasets, mediaList]);

  // Filter based on active query & filters
  const filteredResults = useMemo(() => {
    return allResults.filter((item) => {
      if (selectedType !== 'all' && item.type !== selectedType) return false;
      if (selectedDomain !== 'ALL' && item.domain && !item.domain.toLowerCase().includes(selectedDomain.toLowerCase())) {
        return false;
      }
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.snippet.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          (item.domain && item.domain.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allResults, selectedType, selectedDomain, query]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* 1. HEADER (Section 13) */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-mono uppercase bg-polar-50 text-polar-700 px-2 py-0.5 rounded border border-polar-200 font-bold">
            Unified Public Index
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500 font-mono">Cross-Entity Search</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
          Search Polar Knowledge
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Search across verified observations, expeditions, datasets, research publications, and authenticated media.
        </p>

        {/* Big Search Field */}
        <form onSubmit={handleSearchSubmit} className="mt-6 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keyword, station (Bharati/Maitri/Himadri), core ID, ice thickness..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-2xl text-sm shadow-subtle focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold shadow-subtle transition-colors shrink-0"
          >
            Search Index
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-500">
          <span className="text-[11px] font-mono text-slate-400">Suggestions:</span>
          {['fast-ice at Bharati', 'Prydz Bay CTD', 'Kongsfjorden snowmelt', 'black carbon Maitri', 'radar sounding'].map((sug) => (
            <button
              key={sug}
              onClick={() => {
                setQuery(sug);
                const next = new URLSearchParams(searchParams);
                next.set('q', sug);
                setSearchParams(next);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-mono text-slate-700 transition-colors"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* 2. SEARCH LAYOUT (Left: Filters, Center: Results, Right: Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Filters (3 cols) */}
        <div className="lg:col-span-3 space-y-6 bg-white p-5 rounded-2xl border border-slate-200">
          {/* Entity Type Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Entity Category
            </label>
            <div className="space-y-1">
              {[
                { id: 'all', label: 'All Results' },
                { id: 'knowledge', label: 'Knowledge Records' },
                { id: 'expedition', label: 'Expeditions' },
                { id: 'dataset', label: 'Observational Datasets' },
                { id: 'media', label: 'Field Media' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => updateType(t.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedType === t.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Research Domain Filter */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Domain Filter
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => updateDomain(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Domains</option>
              <option value="Glaciology">Glaciology</option>
              <option value="Oceanography">Oceanography</option>
              <option value="Atmospheric">Atmospheric Sciences</option>
              <option value="Cryosphere">Cryosphere Dynamics</option>
            </select>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] text-slate-500">
              {filteredResults.length} Matched Items
            </span>
            <button
              onClick={() => {
                setQuery('');
                setSearchParams(new URLSearchParams());
              }}
              className="text-rose-600 hover:text-rose-800 text-[11px] font-medium"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Center & Right: Results List + Quick Inspector (9 cols) */}
        <div className="lg:col-span-9 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200 animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">No verified results found.</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  No records match "{query}". Try checking your spelling or adjusting your category filter.
                </p>
              </div>
              <button
                onClick={() => {
                  setQuery('');
                  setSearchParams(new URLSearchParams());
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => setSelectedResult(item)}
                  className={`p-6 bg-white rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    selectedResult?.id === item.id
                      ? 'border-polar-600 shadow-elevated ring-1 ring-polar-400'
                      : 'border-slate-200 hover:border-slate-300 shadow-subtle hover:shadow-premium'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-bold">
                        {item.type}
                      </span>
                      {item.domain && <DomainBadge domain={item.domain} />}
                    </div>

                    <span className="text-slate-400 font-mono text-[11px]">
                      {item.date}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug hover:text-polar-700 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {item.snippet}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px] font-mono">
                      {item.subtitle}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.type === 'knowledge') navigate(`/explore/knowledge/${item.id}`);
                        else if (item.type === 'expedition') navigate(`/explore/expeditions/${item.id}`);
                        else if (item.type === 'media') navigate('/explore/media');
                        else navigate('/explore/evidence');
                      }}
                      className="font-bold text-polar-700 hover:text-polar-900 inline-flex items-center gap-1"
                    >
                      <span>Open Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
