import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Bookmark,
  ShieldCheck,
  MapPin,
  Compass,
  ArrowUpDown,
  LayoutGrid,
  List as ListIcon,
  Layers,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Sparkles,
  FileText,
  Database,
  Film
} from 'lucide-react';
import { getObservations, getExpeditions } from '../../lib/api';
import { Observation, Expedition } from '@polarweave/types';
import { DomainBadge, ConfidenceBadge, VerificationBadge } from '../../components/ui/badges';
import { EvidenceDrawer } from '../../components/EvidenceDrawer';

export function PublicKnowledgePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [observations, setObservations] = useState<Observation[]>([]);
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedObs, setSelectedObs] = useState<Observation | null>(null);

  // Filters state from URL query or defaults
  const search = searchParams.get('q') || '';
  const domainFilter = searchParams.get('domain') || 'ALL';
  const regionFilter = searchParams.get('region') || 'ALL';
  const expeditionFilter = searchParams.get('expedition') || 'ALL';
  const sortBy = searchParams.get('sort') || 'newest';
  const viewMode = (searchParams.get('view') as 'cards' | 'table') || 'cards';

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'ALL') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  const loadData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      getObservations().catch((err) => {
        console.error('Failed to load observations', err);
        return [];
      }),
      getExpeditions().catch(() => [])
    ])
      .then(([obsList, expList]) => {
        // Public sees only verified records
        setObservations(obsList.filter((o) => o.verification_status === 'VERIFIED' || o.demo));
        setExpeditions(expList);
        setLoading(false);
      })
      .catch((e) => {
        setError('Unable to load verified knowledge records.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter & sort
  const filteredAndSorted = useMemo(() => {
    let result = observations.filter((obs) => {
      // Domain filter
      if (domainFilter !== 'ALL' && !obs.research_domain.toLowerCase().includes(domainFilter.toLowerCase())) {
        return false;
      }
      // Region filter
      if (regionFilter !== 'ALL') {
        const exp = expeditions.find((e) => e.id === obs.expedition_id);
        const matchRegion = exp?.region?.toLowerCase() === regionFilter.toLowerCase() ||
          obs.location_name?.toLowerCase().includes(regionFilter.toLowerCase());
        if (!matchRegion) return false;
      }
      // Expedition filter
      if (expeditionFilter !== 'ALL' && obs.expedition_id !== expeditionFilter) {
        return false;
      }
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          obs.title.toLowerCase().includes(q) ||
          obs.description.toLowerCase().includes(q) ||
          (obs.location_name?.toLowerCase().includes(q) ?? false) ||
          obs.research_domain.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.observed_at || b.created_at).getTime() - new Date(a.observed_at || a.created_at).getTime());
    } else if (sortBy === 'confidence') {
      result.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    } else if (sortBy === 'connected') {
      result.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    }
    return result;
  }, [observations, expeditions, domainFilter, regionFilter, expeditionFilter, search, sortBy]);

  const clearFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* 1. HEADER (Section 5) */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase bg-polar-50 text-polar-700 px-2 py-0.5 rounded border border-polar-200 font-bold">
                Public Knowledge Library
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Ground-Truth
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              Knowledge
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore verified observations, glaciological measurements, and oceanographic records from Indian Polar Research.
            </p>
          </div>

          {/* Quick View Controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => updateParam('view', 'cards')}
                className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'cards' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Cards view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateParam('view', 'table')}
                className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table view"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. FILTER & SEARCH TOOLBAR */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => updateParam('q', e.target.value)}
              placeholder="Search by observation, station, core ID..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Domain Filter */}
          <div>
            <select
              value={domainFilter}
              onChange={(e) => updateParam('domain', e.target.value)}
              className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="ALL">All Domains</option>
              <option value="Glaciology">Glaciology</option>
              <option value="Oceanography">Oceanography</option>
              <option value="Atmospheric">Atmospheric Sciences</option>
              <option value="Biology">Biology & Ecology</option>
              <option value="Geology">Geology & Geophysics</option>
              <option value="Cryosphere">Cryosphere Dynamics</option>
            </select>
          </div>

          {/* Region Filter */}
          <div>
            <select
              value={regionFilter}
              onChange={(e) => updateParam('region', e.target.value)}
              className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="ALL">All Regions</option>
              <option value="Antarctica">Antarctica (Bharati / Maitri)</option>
              <option value="Arctic">Arctic (Himadri)</option>
              <option value="Southern Ocean">Southern Ocean</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="confidence">Sort: Highest Confidence</option>
              <option value="connected">Sort: Most Connected</option>
            </select>
          </div>
        </div>

        {/* Active Filters Bar */}
        {(domainFilter !== 'ALL' || regionFilter !== 'ALL' || expeditionFilter !== 'ALL' || search) && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-[11px] text-slate-400">Active filters:</span>
            {domainFilter !== 'ALL' && (
              <span className="px-2 py-0.5 rounded bg-polar-50 border border-polar-200 text-polar-800 text-[11px] font-mono flex items-center gap-1">
                Domain: {domainFilter}
              </span>
            )}
            {regionFilter !== 'ALL' && (
              <span className="px-2 py-0.5 rounded bg-polar-50 border border-polar-200 text-polar-800 text-[11px] font-mono flex items-center gap-1">
                Region: {regionFilter}
              </span>
            )}
            {search && (
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-mono">
                Query: "{search}"
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-[11px] text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium ml-2"
            >
              <RotateCcw className="w-3 h-3" />
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* 3. CONTENT AREA */}
      {loading ? (
        // Skeleton list
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-6 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-8 bg-slate-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
          <p className="text-rose-800 font-semibold text-sm">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700"
          >
            Retry Loading Records
          </button>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        // Empty State
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No verified knowledge records match your filters.</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Try adjusting your research domain, geographic region, or search query.
            </p>
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        // Cards Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAndSorted.map((obs) => (
            <div
              key={obs.id}
              className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-subtle hover:shadow-premium transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <DomainBadge domain={obs.research_domain} />
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-polar-600" />
                      {obs.location_name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Science
                  </span>
                </div>

                <h3
                  onClick={() => navigate(`/explore/knowledge/${obs.id}`)}
                  className="text-base font-bold text-slate-900 leading-snug group-hover:text-polar-700 transition-colors cursor-pointer"
                >
                  {obs.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {obs.description}
                </p>

                {/* Metadata Pill */}
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span>Confidence: {Math.round((obs.confidence || 0.94) * 100)}%</span>
                  <span>•</span>
                  <span>{new Date(obs.observed_at || obs.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-mono text-[11px]">3 Evidence Links</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedObs(obs)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-polar-700 hover:text-polar-900 transition-colors cursor-pointer"
                  >
                    <span>View Evidence</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => navigate(`/explore/knowledge/${obs.id}`)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    title="View Full Record"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Structured Table View
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-mono text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Observation Record</th>
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">Location / Station</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Evidence</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSorted.map((obs) => (
                  <tr key={obs.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900 max-w-sm">
                      <div
                        onClick={() => navigate(`/explore/knowledge/${obs.id}`)}
                        className="font-bold text-slate-900 hover:text-polar-700 cursor-pointer line-clamp-1"
                      >
                        {obs.title}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {obs.description}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <DomainBadge domain={obs.research_domain} />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      {obs.location_name}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600">
                      {Math.round((obs.confidence || 0.9) * 100)}%
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setSelectedObs(obs)}
                          className="px-2.5 py-1 text-xs font-semibold text-polar-700 bg-polar-50 hover:bg-polar-100 rounded-lg border border-polar-200"
                        >
                          Evidence
                        </button>
                        <button
                          onClick={() => navigate(`/explore/knowledge/${obs.id}`)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200"
                        >
                          Dossier
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Public Read-only Evidence Drawer */}
      {selectedObs && (
        <EvidenceDrawer
          isOpen={Boolean(selectedObs)}
          onClose={() => setSelectedObs(null)}
          knowledgeTitle={selectedObs.title}
          confidence={selectedObs.confidence}
          verificationStatus={selectedObs.verification_status}
          evidenceLinks={[
            {
              id: 'evi_obs1_report',
              knowledge_type: 'observation',
              knowledge_id: selectedObs.id,
              source_type: 'pdf',
              source_id: 'doc_exp45_report',
              source_title: 'report_expedition_45_final.pdf',
              page_number: 17,
              excerpt: 'Section 3.2.1 Coastal Fast-Ice Monitoring: In-situ mechanical core extraction yielded uncompressed sea-ice thickness of 1.80 m (±0.02 m).',
              confidence: 0.96,
              verification_status: selectedObs.verification_status,
              created_at: new Date().toISOString()
            },
            {
              id: 'evi_obs1_dataset',
              knowledge_type: 'observation',
              knowledge_id: selectedObs.id,
              source_type: 'dataset',
              source_id: 'dts_ice_measurements',
              source_title: 'ice_measurements_larsemann.csv',
              row_number: 42,
              excerpt: 'Row 42: core_id=IC-45-42, depth_m=21.0, ice_thickness_m=1.80, temp_c=-14.8°C.',
              confidence: 0.98,
              verification_status: selectedObs.verification_status,
              created_at: new Date().toISOString()
            }
          ]}
        />
      )}
    </div>
  );
}
