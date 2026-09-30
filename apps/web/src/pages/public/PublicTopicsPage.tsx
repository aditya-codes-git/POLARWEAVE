import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Layers,
  Compass,
  Database,
  Film,
  Bookmark,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Activity,
  Globe,
  Radio,
  Snowflake,
  Waves,
  Wind
} from 'lucide-react';

interface TopicItem {
  id: string;
  name: string;
  category: string;
  icon: any;
  color_accent: string;
  description: string;
  stats: {
    observations: number;
    expeditions: number;
    datasets: number;
    media: number;
    explainers: number;
  };
  key_questions: string[];
  sample_findings: string[];
}

const TOPICS: TopicItem[] = [
  {
    id: 'glaciology-fast-ice',
    name: 'Glaciology & Coastal Fast Ice',
    category: 'Cryosphere Physics',
    icon: Snowflake,
    color_accent: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    description: 'The physical behavior, thickness dynamics, and seasonal stability of ice attached to coastal Antarctica and Arctic fjords.',
    stats: {
      observations: 18,
      expeditions: 3,
      datasets: 4,
      media: 12,
      explainers: 2
    },
    key_questions: [
      'What controls coastal fast-ice thickness along Queen Maud Land?',
      'How do tidal flexure zones impact vehicular traversal near Bharati Station?',
      'Can radar sounding accurately predict seasonal ice break-up dates?'
    ],
    sample_findings: [
      'Consistent 1.80m fast-ice line verified across Larsemann Hills',
      'Dual-frequency radar soundings calibrated with mechanical core IC-45-42',
      'Swell attenuation provides seasonal protection for station moorings'
    ]
  },
  {
    id: 'oceanography-deep-water',
    name: 'Polar Oceanography & Deep Water',
    category: 'Ocean & Climate',
    icon: Waves,
    color_accent: 'text-blue-600 bg-blue-50 border-blue-200',
    description: 'Thermohaline circulation, Modified Circumpolar Deep Water (MCDW) intrusions, and carbon sink dynamics in the Southern Ocean.',
    stats: {
      observations: 14,
      expeditions: 2,
      datasets: 5,
      media: 8,
      explainers: 1
    },
    key_questions: [
      'Are warm deep-water intrusions reaching the Amery Ice Shelf grounding cavity?',
      'How does sea-ice formation regulate Antarctic Bottom Water (AABW) export?',
      'What is the net seasonal air-sea CO2 flux across the polar frontal zone?'
    ],
    sample_findings: [
      'Subsurface +0.42°C thermal anomaly observed at 150m depth in Prydz Bay',
      'CTD hydrography profile validated by ORV Sagar Kanya cast series'
    ]
  },
  {
    id: 'atmospheric-aerosols',
    name: 'Atmospheric Physics & Aerosol Transport',
    category: 'Atmosphere',
    icon: Wind,
    color_accent: 'text-purple-600 bg-purple-50 border-purple-200',
    description: 'Boundary layer meteorology, black carbon transport during Katabatic drainage storms, and solar wind-geomagnetic Pc5 pulsations.',
    stats: {
      observations: 11,
      expeditions: 2,
      datasets: 3,
      media: 6,
      explainers: 1
    },
    key_questions: [
      'How do episodic katabatic winds transport continental dust and aerosols?',
      'What are the geomagnetic signatures of solar wind compressions at high latitudes?'
    ],
    sample_findings: [
      'Peak black carbon levels of 82 ng/m³ detected during 48-hour katabatic storm',
      'Pc5 geomagnetic pulsations at 150s periods correlated with ACE satellite data'
    ]
  },
  {
    id: 'subzero-ecology',
    name: 'Polar Marine & Extremophile Ecology',
    category: 'Life Sciences',
    icon: Activity,
    color_accent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    description: 'Endolithic cyanobacteria in Schirmacher Oasis, cryoconite microbial ecosystems, and marine benthic community responses to warming.',
    stats: {
      observations: 9,
      expeditions: 2,
      datasets: 2,
      media: 10,
      explainers: 1
    },
    key_questions: [
      'How do cyanobacterial mats survive extreme desiccation and sub-zero temperatures?',
      'What metabolic pathways allow cryoconite hole communities to thrive under ice?'
    ],
    sample_findings: [
      'Phormidium cyanobacteria species dominant in Schirmacher cryoconite holes',
      'Microscopic sequencing confirms active photosynthesis under glacial meltwater'
    ]
  },
  {
    id: 'polar-stations',
    name: 'Research Stations & Infrastructure',
    category: 'Field Operations',
    icon: Radio,
    color_accent: 'text-amber-600 bg-amber-50 border-amber-200',
    description: 'Architectural engineering, clean energy systems, and scientific logistics at Bharati, Maitri, and Himadri research stations.',
    stats: {
      observations: 15,
      expeditions: 3,
      datasets: 3,
      media: 16,
      explainers: 2
    },
    key_questions: [
      'How does Bharati Station maintain zero-emission waste standards in Antarctica?',
      'What structural designs prevent snow drift accumulation at Maitri?'
    ],
    sample_findings: [
      'Elevated aerodynamic stilt design at Bharati reduces snow drift by 80%',
      'Satellite real-time broadband link transmits scientific sensor telemetries to NCPOR Goa'
    ]
  },
  {
    id: 'arctic-climate-change',
    name: 'Arctic Fjord Dynamics & Albedo Decay',
    category: 'High Arctic Climate',
    icon: Globe,
    color_accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    description: 'Multi-year monitoring of Svalbard fjord hydrology, snowpack albedo feedbacks, and glacial retreat at Ny-Ålesund.',
    stats: {
      observations: 12,
      expeditions: 1,
      datasets: 3,
      media: 8,
      explainers: 1
    },
    key_questions: [
      'Why is Arctic warming progressing at three times the global average?',
      'How does early snowmelt shift Kongsfjorden marine ecosystem productivity?'
    ],
    sample_findings: [
      'Snowmelt onset occurred 9 days early, causing surface albedo to plummet to 0.54',
      'Himadri automated radiation sensors recorded accelerated fjord heat absorption'
    ]
  }
];

export function PublicTopicsPage() {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<TopicItem>(TOPICS[0]);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* 1. HEADER (Section 10) */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-mono uppercase bg-polar-50 text-polar-700 px-2 py-0.5 rounded border border-polar-200 font-bold">
            Scientific Taxonomy & Themes
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500 font-mono">Cross-Disciplinary Index</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
          Topics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Navigate interconnected polar research areas, ecosystems, and scientific themes across all Indian polar expeditions.
        </p>
      </div>

      {/* 2. TOPICS TAXONOMY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TOPICS.map((topic) => {
          const Icon = topic.icon;
          const isSelected = selectedTopic.id === topic.id;

          return (
            <div
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className={`p-6 bg-white rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 group ${
                isSelected
                  ? 'border-slate-900 shadow-elevated ring-1 ring-slate-900'
                  : 'border-slate-200 hover:border-slate-300 shadow-subtle hover:shadow-premium'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${topic.color_accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
                    {topic.category}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-polar-700 transition-colors">
                  {topic.name}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {topic.description}
                </p>
              </div>

              {/* Stats badges */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                <div className="flex items-center gap-3">
                  <span>{topic.stats.observations} Records</span>
                  <span>•</span>
                  <span>{topic.stats.expeditions} Expeditions</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-slate-900' : 'text-slate-400 group-hover:translate-x-1'}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. SELECTED TOPIC RELATIONSHIP EXPLORER */}
      {selectedTopic && (
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-subtle space-y-8">
          <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase text-polar-700 font-bold mb-1">
                Selected Topic Dossier • {selectedTopic.category}
              </div>
              <h2 className="text-2xl font-bold text-slate-950">
                {selectedTopic.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                {selectedTopic.description}
              </p>
            </div>

            <button
              onClick={() => navigate(`/explore/knowledge?domain=${encodeURIComponent(selectedTopic.name.split(' ')[0])}`)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 self-start sm:self-auto"
            >
              <span>Explore All Records</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Key Research Questions */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                <Compass className="w-4 h-4 text-polar-600" />
                <span>Primary Scientific Inquiries</span>
              </h4>
              <div className="space-y-2.5">
                {selectedTopic.key_questions.map((q, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 font-medium">
                    {q}
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Findings in this Topic */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-emerald-600" />
                <span>Verified Findings & Ground-Truth Findings</span>
              </h4>
              <div className="space-y-2.5">
                {selectedTopic.sample_findings.map((f, i) => (
                  <div key={i} className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Navigation into the Ecosystem */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
              <span>Datasets: {selectedTopic.stats.datasets} Available</span>
              <span>•</span>
              <span>Explainers: {selectedTopic.stats.explainers} Published</span>
              <span>•</span>
              <span>Media: {selectedTopic.stats.media} Photos & Clips</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/explore/evidence')}
                className="font-bold text-polar-700 hover:text-polar-900 inline-flex items-center gap-1"
              >
                <span>Inspect Evidence Links</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
