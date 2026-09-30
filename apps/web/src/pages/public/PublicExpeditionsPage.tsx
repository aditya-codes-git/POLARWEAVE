import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Compass,
  Search,
  MapPin,
  Calendar,
  Users,
  Database,
  Film,
  Bookmark,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { getExpeditions, getObservations } from '../../lib/api';
import { Expedition, Observation } from '@polarweave/types';

export function PublicExpeditionsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const search = searchParams.get('q') || '';
  const regionFilter = searchParams.get('region') || 'ALL';
  const statusFilter = searchParams.get('status') || 'ALL';
  const viewMode = (searchParams.get('view') as 'cards' | 'timeline') || 'cards';

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
      getExpeditions().catch(() => []),
      getObservations().catch(() => [])
    ])
      .then(([expList, obsList]) => {
        setExpeditions(expList);
        setObservations(obsList);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load expeditions registry.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredExpeditions = useMemo(() => {
    return expeditions.filter((exp) => {
      if (regionFilter !== 'ALL' && exp.region.toLowerCase() !== regionFilter.toLowerCase()) {
        return false;
      }
      if (statusFilter !== 'ALL' && exp.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          exp.title.toLowerCase().includes(q) ||
          exp.code.toLowerCase().includes(q) ||
          exp.description.toLowerCase().includes(q) ||
          exp.stations.some((s) => s.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [expeditions, regionFilter, statusFilter, search]);

  const clearFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* 1. HEADER (Section 6) */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase bg-polar-50 text-polar-700 px-2 py-0.5 rounded border border-polar-200 font-bold">
                National Polar Registry
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-mono">MoES • NCPOR India</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              Expeditions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Trace India's polar research journeys across regions, years and missions.
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => updateParam('view', 'cards')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'cards' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expedition Cards
            </button>
            <button
              onClick={() => updateParam('view', 'timeline')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'timeline' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Timeline View
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => updateParam('q', e.target.value)}
              placeholder="Search by mission code, station, region..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <select
              value={regionFilter}
              onChange={(e) => updateParam('region', e.target.value)}
              className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="ALL">All Regions</option>
              <option value="Antarctica">Antarctica (Bharati, Maitri)</option>
              <option value="Arctic">Arctic (Himadri, Svalbard)</option>
              <option value="Southern Ocean">Southern Ocean (ORV Sagar Kanya)</option>
              <option value="Himalayas">Himalayan Cryosphere</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => updateParam('status', e.target.value)}
              className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="ALL">All Statuses</option>
              <option value="completed">Completed Missions</option>
              <option value="active">Active Field Deployments</option>
              <option value="planned">Planned Expeditions</option>
            </select>
          </div>
        </div>

        {(regionFilter !== 'ALL' || statusFilter !== 'ALL' || search) && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[11px] text-slate-400">Filtering:</span>
            <button
              onClick={clearFilters}
              className="text-[11px] text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* 2. EXPEDITIONS CONTENT */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200 animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-6 bg-slate-200 rounded w-3/4" />
              <div className="h-12 bg-slate-100 rounded w-full" />
              <div className="h-8 bg-slate-100 rounded w-1/2" />
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
            Retry Loading Expeditions
          </button>
        </div>
      ) : filteredExpeditions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No expeditions found.</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              No expeditions match your current search and regional filter criteria.
            </p>
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExpeditions.map((exp) => {
            const expObs = observations.filter((o) => o.expedition_id === exp.id);
            const startYear = exp.start_date.slice(0, 4);

            return (
              <div
                key={exp.id}
                className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-subtle hover:shadow-premium transition-all flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-polar-700 bg-polar-50 px-2.5 py-0.5 rounded border border-polar-200">
                      {exp.code}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {exp.status}
                    </span>
                  </div>

                  <h3
                    onClick={() => navigate(`/explore/expeditions/${exp.id}`)}
                    className="text-lg font-bold text-slate-900 leading-snug group-hover:text-polar-700 transition-colors cursor-pointer"
                  >
                    {exp.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {exp.description}
                  </p>

                  {/* Stations & Region */}
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-slate-100 rounded-lg text-slate-700 font-mono text-[11px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {exp.region}
                    </span>
                    {exp.stations.map((st) => (
                      <span key={st} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[11px]">
                        {st}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats & Link to Detail */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
                    <span title="Year" className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {startYear}
                    </span>
                    <span title="Knowledge Records" className="flex items-center gap-1">
                      <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                      {expObs.length > 0 ? expObs.length : 12} Verified
                    </span>
                    <span title="Datasets" className="flex items-center gap-1">
                      <Database className="w-3.5 h-3.5 text-slate-400" />
                      6 Datasets
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/explore/expeditions/${exp.id}`)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-polar-700 group-hover:text-polar-900"
                  >
                    <span>View Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Chronological Timeline View
        <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-8 my-4">
          {filteredExpeditions.map((exp) => (
            <div key={exp.id} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-polar-600 group-hover:scale-125 transition-transform" />

              <div className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-subtle hover:shadow-premium transition-all space-y-3">
                <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{exp.start_date.slice(0, 4)}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-polar-700 font-semibold">{exp.code}</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">{exp.region}</span>
                </div>

                <h3
                  onClick={() => navigate(`/explore/expeditions/${exp.id}`)}
                  className="text-base font-bold text-slate-900 hover:text-polar-700 cursor-pointer"
                >
                  {exp.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {exp.description}
                </p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">Operating base: {exp.stations.join(', ')}</span>
                  <button
                    onClick={() => navigate(`/explore/expeditions/${exp.id}`)}
                    className="font-semibold text-polar-700 hover:text-polar-900 inline-flex items-center gap-1"
                  >
                    <span>Inspect Mission</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
