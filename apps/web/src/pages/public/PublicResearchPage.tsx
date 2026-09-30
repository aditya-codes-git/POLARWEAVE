import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Database,
  FileText,
  Search,
  BookOpen,
  Download,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  Table,
  FileCode,
  Sparkles
} from 'lucide-react';
import { getDatasets, getObservations, getExpeditions } from '../../lib/api';
import { Dataset, Observation, Expedition } from '@polarweave/types';
import { DomainBadge } from '../../components/ui/badges';

interface Publication {
  id: string;
  title: string;
  authors: string[];
  year: number;
  domain: string;
  journal: string;
  doi: string;
  expedition_code: string;
  abstract: string;
  source_count: number;
  dataset_id?: string;
}

const PUBLIC_PUBLICATIONS: Publication[] = [];

export function PublicResearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedDomain = searchParams.get('domain') || 'ALL';
  const searchQuery = searchParams.get('q') || '';

  const updateDomain = (dom: string) => {
    const next = new URLSearchParams(searchParams);
    if (dom === 'ALL') next.delete('domain');
    else next.set('domain', dom);
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    Promise.all([
      getDatasets().catch(() => []),
      getObservations().catch(() => [])
    ]).then(([dList, oList]) => {
      setDatasets(dList);
      setObservations(oList.filter((o) => o.verification_status === 'VERIFIED' || o.demo));
      setLoading(false);
    });
  }, []);

  const domainsList = [
    { id: 'ALL', label: 'All Domains' },
    { id: 'Glaciology', label: 'Glaciology & Ice Sheets' },
    { id: 'Oceanography', label: 'Physical Oceanography' },
    { id: 'Atmospheric Sciences', label: 'Atmospheric Sciences' },
    { id: 'Cryosphere Dynamics', label: 'Cryosphere & Snow' },
    { id: 'Biology & Ecology', label: 'Marine & Cryo Biology' }
  ];

  const filteredPubs = useMemo(() => {
    return PUBLIC_PUBLICATIONS.filter((p) => {
      if (selectedDomain !== 'ALL' && !p.domain.toLowerCase().includes(selectedDomain.toLowerCase())) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.abstract.toLowerCase().includes(q) || p.authors.some(a => a.toLowerCase().includes(q));
      }
      return true;
    });
  }, [selectedDomain, searchQuery]);

  const filteredDatasets = useMemo(() => {
    return datasets.filter((d) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return d.title.toLowerCase().includes(q) || d.filename.toLowerCase().includes(q);
      }
      return true;
    });
  }, [datasets, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* 1. HEADER (Section 7) */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase bg-polar-50 text-polar-700 px-2 py-0.5 rounded border border-polar-200 font-bold">
                Scientific Index
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-mono">Open Polar Science</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              Research & Publications
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Peer-reviewed technical reports, observational datasets, and domain-specific polar science produced by NCPOR.
            </p>
          </div>

          <div className="relative max-w-xs self-start sm:self-auto">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const next = new URLSearchParams(searchParams);
                if (e.target.value) next.set('q', e.target.value);
                else next.delete('q');
                setSearchParams(next, { replace: true });
              }}
              placeholder="Filter publications & datasets..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Domain Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-6 border-t border-slate-100 pt-3">
          {domainsList.map((dom) => (
            <button
              key={dom.id}
              onClick={() => updateDomain(dom.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDomain === dom.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {dom.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. RESEARCH DOMAINS SUMMARY */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Research Focus Areas</h2>
          <p className="text-xs text-slate-500">
            Core scientific disciplines monitored continuously across India's polar stations
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold font-mono text-polar-700">GLACIOLOGY & ICE CORES</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Monitoring ice shelf grounding line dynamics, sub-glacial bedrock topography, and electromechanical ice cores.
            </p>
            <div className="text-[11px] text-slate-400 font-mono">Stations: Bharati, Maitri</div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold font-mono text-emerald-700">POLAR OCEANOGRAPHY</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Investigating Circumpolar Deep Water (CDW) shelf intrusions, sea surface salinity, and Southern Ocean carbon export fluxes.
            </p>
            <div className="text-[11px] text-slate-400 font-mono">Stations: ORV Sagar Kanya, Bharati</div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold font-mono text-purple-700">ATMOSPHERIC SCIENCES</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tracking greenhouse gases, black carbon aerosols during Katabatic storms, and geomagnetic Pc5 pulsations.
            </p>
            <div className="text-[11px] text-slate-400 font-mono">Stations: Maitri, Himadri</div>
          </div>
        </div>
      </section>

      {/* 3. PEER-REVIEWED PUBLICATIONS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Featured Publications & Technical Reports</h2>
            <p className="text-xs text-slate-500">
              Grounded articles with direct links to raw data and multimodal evidence
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {filteredPubs.length} Documents
          </span>
        </div>

        {filteredPubs.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
            No publications match this domain or query.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPubs.map((pub) => (
              <div
                key={pub.id}
                className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-subtle hover:shadow-premium transition-all space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <DomainBadge domain={pub.domain} />
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-slate-500 text-[11px]">{pub.expedition_code}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">DOI: {pub.doi}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {pub.title}
                </h3>

                <p className="text-xs font-mono text-slate-500">
                  Authors: {pub.authors.join(', ')} ({pub.year}) • <span className="italic">{pub.journal}</span>
                </p>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  {pub.abstract}
                </p>

                <div className="pt-2 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {pub.source_count} Multimodal Citations
                    </span>
                    {pub.dataset_id && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-polar-700 bg-polar-50 px-2 py-0.5 rounded border border-polar-200">
                        <Database className="w-3.5 h-3.5" />
                        Linked Dataset
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => navigate('/explore/evidence')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-polar-700 hover:text-polar-900"
                  >
                    <span>View Grounded Evidence</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. ASSOCIATED DATASETS */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Observational Datasets</h2>
          <p className="text-xs text-slate-500">
            Open calibrated tabular data from scientific sensors and core drills
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDatasets.map((d) => (
            <div
              key={d.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-subtle hover:shadow-premium transition-all space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-700 font-semibold flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-polar-600" />
                  {d.filename}
                </span>
                <span className="font-mono text-[10px] uppercase bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                  CSV • {d.row_count} Rows
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900">
                {d.title}
              </h4>

              <div className="text-xs text-slate-500 space-y-1">
                <div className="font-mono text-[11px]">
                  Columns: {d.columns?.map((c) => c.name).join(', ') || 'timestamp, depth_m, temp_c'}
                </div>
                <div className="text-[11px] text-slate-400">
                  Region: {d.region} • Status: {d.processing_status}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Calibrated
                </span>
                <button
                  onClick={() => navigate('/explore/evidence')}
                  className="font-semibold text-polar-700 hover:text-polar-900 inline-flex items-center gap-1 text-xs"
                >
                  <span>Trace Provenance</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
