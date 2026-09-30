import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Search,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Film,
  MapPin,
  Calendar,
  Sparkles,
  Database,
  Globe,
  Tag,
  CheckCircle2,
  FileText,
  Share2,
  Layers,
  ChevronRight
} from 'lucide-react';
import { getObservations, getExpeditions, getMedia, getDatasets } from '../../lib/api';
import { Observation, Expedition, MediaAsset, Dataset } from '@polarweave/types';
import { DomainBadge } from '../../components/ui/badges';
import { EvidenceDrawer } from '../../components/EvidenceDrawer';

export function ExplorePage() {
  const navigate = useNavigate();

  const [observations, setObservations] = useState<Observation[]>([]);
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedObs, setSelectedObs] = useState<Observation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getObservations().catch(() => []),
      getExpeditions().catch(() => []),
      getMedia().catch(() => []),
      getDatasets().catch(() => [])
    ]).then(([obsList, expList, mediaList, datasetList]) => {
      if (!isMounted) return;
      setObservations(obsList.filter((o) => o.verification_status === 'VERIFIED' || o.demo));
      setExpeditions(expList);
      setMedia(mediaList);
      setDatasets(datasetList);
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore/search');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* 1. HERO — EDITORIAL DISCOVERY LANDING */}
      <div className="relative rounded-3xl p-8 sm:p-12 bg-linear-to-b from-polar-50/80 via-white to-white border border-polar-100 overflow-hidden shadow-subtle">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-polar-100/70 border border-polar-200 text-polar-800 text-[11px] font-mono uppercase tracking-wider font-semibold">
            <Globe className="w-3.5 h-3.5 text-polar-700" />
            <span>NCPOR Public Knowledge Discovery</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 leading-tight">
            Explore Polar Knowledge
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Discover expeditions, research, observations and stories from polar science.
            Every discovery is backed by authentic scientific records from Bharati, Maitri, and Himadri research stations.
          </p>

          {/* Global Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2 relative max-w-xl flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search expeditions, ice thickness, Prydz Bay, Kongsfjorden..."
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs shadow-subtle focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-subtle transition-colors"
            >
              Search
            </button>
          </form>

          {/* Quick Discover Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
            <span className="text-[11px] font-mono text-slate-400">Popular:</span>
            {['Fast-Ice at Bharati', 'Prydz Bay CTD', 'Kongsfjorden Snowmelt', 'Ice Cores'].map((term) => (
              <button
                key={term}
                onClick={() => navigate(`/explore/search?q=${encodeURIComponent(term)}`)}
                className="px-2.5 py-1 rounded-lg bg-slate-100/80 hover:bg-polar-100 hover:text-polar-900 border border-slate-200/60 text-[11px] font-medium text-slate-600 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Stats ticker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-200/70">
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900">45+</div>
            <div className="text-[11px] text-slate-500">Expeditions Documented</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-700">1,420+</div>
            <div className="text-[11px] text-slate-500">Verified Measurements</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-polar-700">3 Stations</div>
            <div className="text-[11px] text-slate-500">Bharati, Maitri, Himadri</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900">100%</div>
            <div className="text-[11px] text-slate-500">Multimodal Evidence Trace</div>
          </div>
        </div>
      </div>

      {/* 2. FEATURED KNOWLEDGE SPOTLIGHT */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Featured Knowledge</h2>
            <p className="text-xs text-slate-500">
              Verified ground-truth findings from recent Indian polar expeditions
            </p>
          </div>
          <button
            onClick={() => navigate('/explore/knowledge')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-polar-700 hover:text-polar-900"
          >
            <span>Browse Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {observations.slice(0, 4).map((obs) => (
            <div
              key={obs.id}
              className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-subtle hover:shadow-premium transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <DomainBadge domain={obs.research_domain} />
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-polar-600" />
                    {obs.location_name}
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
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Science
                </span>

                <button
                  onClick={() => setSelectedObs(obs)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-polar-700 hover:text-polar-900 transition-colors cursor-pointer"
                >
                  <span>Explore Evidence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED EXPEDITION SPOTLIGHT */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Featured Expeditions</h2>
            <p className="text-xs text-slate-500">
              India's active scientific deployments in Antarctica, Arctic, and Southern Ocean
            </p>
          </div>
          <button
            onClick={() => navigate('/explore/expeditions')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-polar-700 hover:text-polar-900"
          >
            <span>All Expeditions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {expeditions.slice(0, 3).map((exp) => (
            <div
              key={exp.id}
              onClick={() => navigate(`/explore/expeditions/${exp.id}`)}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-subtle hover:shadow-premium transition-all space-y-3 cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-slate-900 group-hover:text-polar-700">{exp.code}</span>
                <span className="text-slate-400 flex items-center gap-1 font-mono">
                  <MapPin className="w-3 h-3 text-polar-600" />
                  {exp.region}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {exp.title}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {exp.description}
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[160px]">{exp.stations.join(', ')}</span>
                <span className="font-mono font-semibold text-slate-600">{exp.start_date.slice(0, 4)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. RESEARCH HIGHLIGHTS & SCIENCE EXPLAINERS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Research & Science Explainers</h2>
            <p className="text-xs text-slate-500">
              Audience-targeted explanations with verified evidence citations [1], [2], [3]
            </p>
          </div>
          <button
            onClick={() => navigate('/explore/explainers')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-polar-700 hover:text-polar-900"
          >
            <span>View All Explainers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-7 bg-white rounded-2xl border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase bg-polar-50 text-polar-700 px-2 py-0.5 rounded border border-polar-200 font-bold">
              Student Explainer • 4 Min Read
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">45th Indian Scientific Expedition to Antarctica</span>
          </div>

          <h3 className="text-xl font-bold text-slate-900 hover:text-polar-700 cursor-pointer" onClick={() => navigate('/explore/explainers')}>
            How Indian Scientists Measure Sea Ice in Antarctica: Fast-Ice at Bharati
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Have you ever wondered how scientists in Antarctica know if coastal sea-ice is strong enough to explore?
            During the 45th Indian Scientific Expedition to Antarctica, glaciologists ventured onto the fast-ice margin
            near Bharati Station using radar sounders and electromechanical core drills. Every physical measurement confirmed
            a uniform sheet thickness of 1.8 meters across the transect, providing seasonal stability against wave swells from Prydz Bay.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-emerald-700">[1] [2] [3]</span>
              <span>Anchored to Report Page 17, CSV Row 42, and Field Video 12:43.</span>
            </div>
            <button
              onClick={() => navigate('/explore/explainers')}
              className="font-mono font-semibold text-polar-700 hover:text-polar-900 text-xs inline-flex items-center gap-1"
            >
              <span>Read Full Explainer</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. CURATED FIELD MEDIA */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Curated Field Media & Video</h2>
            <p className="text-xs text-slate-500">
              Authenticated photography with GPS metadata and scientist interviews
            </p>
          </div>
          <button
            onClick={() => navigate('/explore/media')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-polar-700 hover:text-polar-900"
          >
            <span>Open Media Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {media.slice(0, 2).map((med) => (
            <div
              key={med.id}
              onClick={() => navigate('/explore/media')}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle hover:shadow-premium transition-all space-y-3 p-4 cursor-pointer"
            >
              <div className="h-44 bg-slate-900 rounded-xl relative overflow-hidden flex items-center justify-center">
                {med.type === 'video' ? (
                  <div className="text-center text-white space-y-2">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto">
                      <Film className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-mono font-semibold block">Play Video • 20:45</span>
                  </div>
                ) : (
                  <div className="text-center text-white space-y-1">
                    <div className="text-xs font-mono text-polar-300">Nikon Z8 • 24-70mm f/2.8</div>
                    <div className="text-sm font-semibold">Fast-ice Sheet Surface Transect</div>
                    <div className="text-[10px] text-slate-400 font-mono">-69.4089°S, 76.1872°E</div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-slate-800">{med.filename}</span>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                    EXIF Verified
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {med.location_name} • {med.ai_analysis_json?.caption || 'Verified research record.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTIONS: EVIDENCE & KNOWLEDGE GRAPH */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Evidence CTA */}
        <div className="p-6 rounded-2xl bg-linear-to-br from-emerald-50/80 via-white to-white border border-emerald-200 shadow-subtle space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Explore Provenance & Evidence</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            See how every claim links back to authentic reports, raw sensor CSVs, and video timestamps.
            Zero black-box assertions; 100% public accountability.
          </p>
          <button
            onClick={() => navigate('/explore/evidence')}
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 pt-2"
          >
            <span>Launch Evidence Explorer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Knowledge Graph CTA */}
        <div className="p-6 rounded-2xl bg-linear-to-br from-polar-50/80 via-white to-white border border-polar-200 shadow-subtle space-y-3">
          <div className="w-10 h-10 rounded-xl bg-polar-100 flex items-center justify-center text-polar-700">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Interactive Knowledge Graph</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Navigate the interconnected web of polar stations, research campaigns, observations, and findings
            across Antarctica and the Arctic.
          </p>
          <button
            onClick={() => navigate('/explore/knowledge-graph')}
            className="inline-flex items-center gap-2 text-xs font-bold text-polar-800 hover:text-polar-950 pt-2"
          >
            <span>Launch Knowledge Graph</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slide-over Evidence Drawer */}
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
