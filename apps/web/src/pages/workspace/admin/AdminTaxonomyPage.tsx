import React, { useState } from 'react';
import {
  GitBranch,
  FolderTree,
  Plus,
  Compass,
  Database,
  Layers,
  CheckCircle2,
  Tag,
  Search
} from 'lucide-react';

interface DomainTaxonomy {
  id: string;
  name: string;
  code: string;
  description: string;
  subfields: string[];
  entityCount: number;
  stations: string[];
}

const TAXONOMIES: DomainTaxonomy[] = [
  {
    id: 'tax_glaciology',
    name: 'Glaciology & Ice Dynamics',
    code: 'GLAC',
    description: 'Physical behavior, radar sounding, core stratigraphy, and ice-shelf grounding line stability.',
    subfields: ['Fast-Ice Thickness', 'Firn Compaction', 'Subglacial Topography', 'Albedo Dynamics'],
    entityCount: 48,
    stations: ['Bharati', 'Maitri', 'Himadri']
  },
  {
    id: 'tax_oceanography',
    name: 'Physical & Polar Oceanography',
    code: 'OCEN',
    description: 'Thermohaline circulations, deep water watermass intrusions, CTD profiles, and sea-ice fluxes.',
    subfields: ['Modified Circumpolar Deep Water (MCDW)', 'Pycnocline Gradients', 'Prydz Bay Continental Shelf'],
    entityCount: 34,
    stations: ['Bharati Offing', 'ORV Sagar Kanya']
  },
  {
    id: 'tax_atmosphere',
    name: 'Atmospheric Physics & Aeronomy',
    code: 'ATMO',
    description: 'Boundary layer meteorology, katabatic wind dynamics, black carbon aerosols, and ozone soundings.',
    subfields: ['Katabatic Drainage Inversion', 'Aethalometer Black Carbon', 'Pc5 Geomagnetic Pulsations'],
    entityCount: 29,
    stations: ['Maitri', 'Bharati', 'Himadri']
  },
  {
    id: 'tax_biology',
    name: 'Cryosphere Biology & Ecology',
    code: 'BIOL',
    description: 'Microbial mats, endolithic communities, cryoconite ecosystems, and marine food webs.',
    subfields: ['Cryoconite Cyanobacteria', 'Phormidium Mats', 'Krill Biomass Distribution'],
    entityCount: 21,
    stations: ['Schirmacher Oasis', 'Larsemann Hills']
  }
];

export function AdminTaxonomyPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = TAXONOMIES.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Institutional Governance
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">Scientific Ontology</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Polar Science Taxonomy & Domain Ontology
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Standardize scientific domains, controlled measurement variables, and cross-expedition semantic mappings.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all">
          <Plus className="w-4 h-4" />
          <span>Add Domain Category</span>
        </button>
      </div>

      {/* Domain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-polar-700 bg-polar-50 px-2 py-0.5 rounded border border-polar-200">
                    {item.code}
                  </span>
                  <h3 className="font-semibold text-sm text-slate-900">{item.name}</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {item.entityCount} entities
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-[11px] font-medium text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-slate-400" />
                <span>Controlled Subfields & Synonyms:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.subfields.map((sf, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded"
                  >
                    {sf}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 font-mono">
              <span>Stations: {item.stations.join(', ')}</span>
              <span className="text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Standardized
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
