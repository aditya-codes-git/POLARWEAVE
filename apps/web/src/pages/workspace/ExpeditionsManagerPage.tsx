import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  Database,
  Film,
  FileText
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getExpeditions } from '../../lib/api';
import { Expedition } from '@polarweave/types';

// Fix Leaflet marker icons in React
const customStationIcon = new L.DivIcon({
  className: 'custom-station-pin',
  html: `<div style="background-color:#0284c7; width:14px; height:14px; border-radius:50%; border:2px solid white; box-shadow:0 0 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

export function ExpeditionsManagerPage() {
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [selectedExpId, setSelectedExpId] = useState<string>('exp_45_ant');

  useEffect(() => {
    getExpeditions().then((res) => {
      setExpeditions(res);
    });
  }, []);

  const selectedExp = expeditions.find((e) => e.id === selectedExpId) || expeditions[0];

  const stations = [
    { name: 'Bharati Research Station', lat: -69.4089, lng: 76.1872, region: 'Larsemann Hills, Antarctica' },
    { name: 'Maitri Research Station', lat: -70.7667, lng: 11.7333, region: 'Schirmacher Oasis, Antarctica' },
    { name: 'Himadri Research Station', lat: 78.9236, lng: 11.9225, region: 'Ny-Ålesund, Svalbard, Arctic' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-polar-700 bg-polar-50 px-2 py-0.5 rounded border border-polar-200">
            Expedition Knowledge Aggregation
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500 font-mono">Antarctic & Arctic Campaigns</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Polar Expeditions Catalog
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore structured mission reports, physical sensor logs, and verified cryospheric observations aggregated per expedition.
        </p>
      </div>

      {/* Expedition Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {expeditions.map((exp) => (
          <div
            key={exp.id}
            onClick={() => setSelectedExpId(exp.id)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              selectedExp?.id === exp.id
                ? 'bg-white border-polar-600 shadow-premium ring-1 ring-polar-600'
                : 'bg-white border-slate-200 shadow-subtle hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                {exp.code}
              </span>
              <span className="text-xs font-mono uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {exp.status}
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 leading-snug">
              {exp.title}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 mt-2">
              {exp.description}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {exp.region}
              </span>
              <span>{exp.stations.join(', ')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Expedition Detail & Interactive Station Map (Section 27) */}
      {selectedExp && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Details Column */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-mono uppercase text-slate-400">Mission Overview</span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                {selectedExp.title}
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {selectedExp.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Lead Institution</span>
                <span className="font-semibold text-slate-900">{selectedExp.lead_agency}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Campaign Window</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {selectedExp.start_date} to {selectedExp.end_date || 'Ongoing'}
                </span>
              </div>
            </div>

            {/* Aggregated Counts */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-800 block">
                Aggregated Expedition Knowledge Records:
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-900 font-mono">12</div>
                  <div className="text-[11px] text-slate-500">Observations</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-900 font-mono">2</div>
                  <div className="text-[11px] text-slate-500">Datasets</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-900 font-mono">3</div>
                  <div className="text-[11px] text-slate-500">Media Assets</div>
                </div>
              </div>
            </div>
          </div>

          {/* Leaflet Map Column */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Geospatial Station Coverage
                </h3>
                <p className="text-xs text-slate-800 font-medium">
                  Active Indian Antarctic & Arctic Research Bases
                </p>
              </div>
              <span className="text-xs font-mono text-polar-700 bg-polar-50 px-2 py-0.5 rounded border border-polar-200">
                Leaflet Geospatial Map
              </span>
            </div>

            <div className="h-72 rounded-xl overflow-hidden border border-slate-200 relative">
              <MapContainer
                center={[-70.0, 45.0]}
                zoom={2}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {stations.map((st, i) => (
                  <Marker key={i} position={[st.lat, st.lng]} icon={customStationIcon}>
                    <Popup>
                      <div className="text-xs">
                        <strong>{st.name}</strong><br />
                        {st.region}<br />
                        <span className="font-mono">{st.lat.toFixed(4)}°, {st.lng.toFixed(4)}°</span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
