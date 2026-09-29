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
  Sparkles
} from 'lucide-react';
import { getObservations, getExpeditions, getMedia } from '../../lib/api';
import { Observation, Expedition, MediaAsset } from '@polarweave/types';
import { DomainBadge, VerificationBadge } from '../../components/ui/badges';
import { EvidenceDrawer } from '../../components/EvidenceDrawer';

export function ExplorePage() {
  const navigate = useNavigate();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [selectedObs, setSelectedObs] = useState<Observation | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getObservations().then((list) => {
      // Show verified observations to public (Section 26 & 32)
      setObservations(list.filter((o) => o.verification_status === 'VERIFIED' || o.demo));
    });
    getExpeditions().then(setExpeditions);
    getMedia().then(setMedia);
  }, []);

  const filteredObs = observations.filter((o) =>
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.description.toLowerCase().includes(search.toLowerCase()) ||
    o.research_domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Public Header */}
      <header className="border-b border-slate-200/80 px-6 py-4 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-polar-600 flex items-center justify-center text-white font-bold text-xs">
                PW
              </div>
              <span className="font-bold text-sm text-slate-900 tracking-tight">POLARWEAVE</span>
            </button>
            <span className="text-xs text-slate-300">|</span>
            <span className="text-xs text-slate-500 font-medium">Public Polar Science Portal</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/workspace')}
              className="text-xs font-semibold text-polar-700 bg-polar-50 hover:bg-polar-100 border border-polar-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Open Workspace
            </button>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <div className="py-12 px-6 border-b border-slate-100 bg-slate-50/50">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <span className="text-[11px] font-mono uppercase tracking-wider text-polar-700 font-semibold bg-polar-50 px-2 py-0.5 rounded border border-polar-200">
            NCPOR Scientific Knowledge Repository
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-950">
            Explore Indian Polar Discoveries
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Verified scientific facts, fast-ice borehole profiles, oceanic warming anomalies, and expedition archives from Bharati, Maitri, and Himadri research stations.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto pt-2 relative">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search polar observations, e.g. 'ice thickness', 'salinity', 'Antarctica'..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs shadow-subtle focus:outline-none focus:border-polar-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* SECTION: LATEST EXPEDITIONS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Key Indian Polar Expeditions
              </h2>
              <p className="text-xs text-slate-500">
                Major scientific deployments in Antarctica, Arctic, and Southern Ocean
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {expeditions.map((exp) => (
              <div
                key={exp.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-subtle hover:shadow-premium transition-all space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-slate-900">{exp.code}</span>
                  <span className="text-slate-400 flex items-center gap-1 font-mono">
                    <MapPin className="w-3 h-3 text-polar-600" />
                    {exp.region}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {exp.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {exp.description}
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Stations: {exp.stations.join(', ')}</span>
                  <span className="font-mono">{exp.start_date.slice(0, 4)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: VERIFIED OBSERVATIONS CATALOG */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Verified Scientific Observations
              </h2>
              <p className="text-xs text-slate-500">
                All records backed by traceable reports, sensor data, and video records
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {filteredObs.length} Verified Records
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredObs.map((obs) => (
              <div
                key={obs.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-subtle hover:shadow-premium transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DomainBadge domain={obs.research_domain} />
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{obs.location_name}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {obs.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {obs.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified Science
                  </span>

                  <button
                    onClick={() => setSelectedObs(obs)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-polar-700 hover:text-polar-900"
                  >
                    <span>View Provenance</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: CURATED MULTIMODAL ARCHIVE */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Curated Field Media & Video
            </h2>
            <p className="text-xs text-slate-500">
              Photographs and synchronized field interviews from Indian polar stations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {media.map((med) => (
              <div
                key={med.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle space-y-3"
              >
                <div className="h-44 relative bg-slate-100 overflow-hidden">
                  <img
                    src={med.thumbnail_path}
                    alt={med.filename}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-mono">
                    {med.type.toUpperCase()} • {med.location_name || 'Antarctica'}
                  </div>
                </div>
                <div className="p-4 pt-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {med.filename}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {med.ai_analysis_json?.caption || 'Expedition documentation recording'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Slide-over Evidence Drawer for Public Evaluation */}
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
              excerpt: 'Section 3.2.1 Coastal Fast-Ice Monitoring: In-situ mechanical core extraction at station perimeter point IC-45-42 yielded an uncompressed sea-ice thickness of 1.80 m (±0.02 m).',
              confidence: 0.96,
              verification_status: 'VERIFIED',
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
              excerpt: 'Row 42: core_id=IC-45-42, depth_m=21.0, ice_thickness_m=1.80, density_kg_m3=918, temp_c=-14.8',
              confidence: 0.98,
              verification_status: 'VERIFIED',
              created_at: new Date().toISOString()
            },
            {
              id: 'evi_obs1_video',
              knowledge_type: 'observation',
              knowledge_id: selectedObs.id,
              source_type: 'video',
              source_id: 'med_vid_interview',
              source_title: 'scientist_interview.mp4',
              timestamp_start: 758,
              timestamp_end: 778,
              excerpt: 'When we extracted Core 42, the manual caliper and thermistor probe confirmed the fast-ice sheet stood at exactly 1.8 meters thick.',
              confidence: 0.94,
              verification_status: 'VERIFIED',
              created_at: new Date().toISOString()
            },
            {
              id: 'evi_obs1_image',
              knowledge_type: 'observation',
              knowledge_id: selectedObs.id,
              source_type: 'image',
              source_id: 'med_img_larsemann',
              source_title: 'IMG_2041.jpg',
              excerpt: 'EXIF GPS -69.4089°S, 76.1872°E at 2026-01-14T07:15:00Z. Visual identification confirms fast-ice sheet drilling site with Larsemann iceberg backdrop.',
              confidence: 0.97,
              verification_status: 'VERIFIED',
              created_at: new Date().toISOString()
            }
          ]}
        />
      )}
    </div>
  );
}
