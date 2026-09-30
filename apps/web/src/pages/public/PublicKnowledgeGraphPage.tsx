import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge
} from '@xyflow/react';
import {
  Compass,
  Database,
  Film,
  FileText,
  ShieldCheck,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  X,
  Filter,
  ArrowRight,
  Maximize2,
  MapPin,
  Calendar
} from 'lucide-react';
import { getKnowledgeGraph } from '../../lib/api';

export function PublicKnowledgeGraphPage() {
  const navigate = useNavigate();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter toggles
  const [showExpeditions, setShowExpeditions] = useState(true);
  const [showLocations, setShowLocations] = useState(true);
  const [showObservations, setShowObservations] = useState(true);
  const [showDatasets, setShowDatasets] = useState(true);
  const [showMedia, setShowMedia] = useState(true);

  useEffect(() => {
    getKnowledgeGraph()
      .then((data) => {
        const publicNodes: Node[] = (data.nodes || []).map((n: any) => {
          let borderClass = 'border-slate-300 bg-white text-slate-900';
          let badgeText = n.type;
          let badgeClass = 'text-slate-500 bg-slate-100';

          if (n.type === 'expedition') {
            borderClass = 'border-polar-600 bg-polar-50/70 text-slate-900 shadow-sm';
            badgeText = 'Expedition';
            badgeClass = 'text-polar-700 bg-polar-100';
          } else if (n.type === 'observation') {
            borderClass = 'border-emerald-500 bg-emerald-50/60 text-slate-900 shadow-sm';
            badgeText = 'Verified Science';
            badgeClass = 'text-emerald-700 bg-emerald-100';
          } else if (n.type === 'location' || n.type === 'station') {
            borderClass = 'border-amber-400 bg-amber-50/60 text-slate-900';
            badgeText = 'Station / Location';
            badgeClass = 'text-amber-800 bg-amber-100';
          } else if (n.type === 'dataset') {
            borderClass = 'border-indigo-400 bg-indigo-50/60 text-slate-900';
            badgeText = 'Calibrated Dataset';
            badgeClass = 'text-indigo-800 bg-indigo-100';
          } else if (n.type === 'media' || n.type === 'report') {
            borderClass = 'border-purple-400 bg-purple-50/60 text-slate-900';
            badgeText = 'Source Evidence';
            badgeClass = 'text-purple-800 bg-purple-100';
          }

          return {
            id: n.id,
            position: n.position || { x: Math.random() * 400, y: Math.random() * 400 },
            data: {
              ...n.data,
              nodeType: n.type,
              label: (
                <div className="p-3 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${badgeClass}`}>
                      {badgeText}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 line-clamp-2">
                    {n.data.title || n.id}
                  </div>
                  {n.data.domain && (
                    <div className="text-[10px] text-polar-700 font-mono mt-1 font-semibold">
                      {n.data.domain}
                    </div>
                  )}
                </div>
              )
            },
            className: `rounded-xl border transition-all cursor-pointer min-w-[170px] max-w-[220px] shadow-subtle hover:shadow-premium ${borderClass}`
          };
        });

        setNodes(publicNodes);
        setEdges(data.edges || []);
        if (publicNodes.length > 0) {
          const defaultSelect = publicNodes.find((n) => n.id.includes('obs')) || publicNodes[0];
          setSelectedNode(defaultSelect);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Filter visible nodes based on active toggles
  const visibleNodes = useMemo(() => {
    return nodes.filter((n) => {
      const type = n.data?.nodeType || 'observation';
      if (type === 'expedition' && !showExpeditions) return false;
      if ((type === 'location' || type === 'station') && !showLocations) return false;
      if (type === 'observation' && !showObservations) return false;
      if (type === 'dataset' && !showDatasets) return false;
      if ((type === 'media' || type === 'report') && !showMedia) return false;
      return true;
    });
  }, [nodes, showExpeditions, showLocations, showObservations, showDatasets, showMedia]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* 1. HEADER (Section 12) */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase bg-polar-50 text-polar-700 px-2 py-0.5 rounded border border-polar-200 font-bold">
                Ontological Graph
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-mono">Semantic Entity Map</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              Knowledge Graph
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore how expeditions, places, observations, researchers and evidence connect across India's polar research programs.
            </p>
          </div>

          {/* Category Toggle Pills */}
          <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
            <button
              onClick={() => setShowExpeditions(!showExpeditions)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all border ${
                showExpeditions
                  ? 'bg-polar-50 text-polar-800 border-polar-300'
                  : 'bg-white text-slate-400 border-slate-200 opacity-60'
              }`}
            >
              ● Expeditions
            </button>
            <button
              onClick={() => setShowObservations(!showObservations)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all border ${
                showObservations
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-slate-400 border-slate-200 opacity-60'
              }`}
            >
              ● Observations
            </button>
            <button
              onClick={() => setShowLocations(!showLocations)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all border ${
                showLocations
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-400 border-slate-200 opacity-60'
              }`}
            >
              ● Stations
            </button>
            <button
              onClick={() => setShowDatasets(!showDatasets)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all border ${
                showDatasets
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                  : 'bg-white text-slate-400 border-slate-200 opacity-60'
              }`}
            >
              ● Datasets
            </button>
            <button
              onClick={() => setShowMedia(!showMedia)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all border ${
                showMedia
                  ? 'bg-purple-50 text-purple-800 border-purple-300'
                  : 'bg-white text-slate-400 border-slate-200 opacity-60'
              }`}
            >
              ● Media
            </button>
          </div>
        </div>
      </div>

      {/* 2. GRAPH CANVAS & PUBLIC INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Graph Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-slate-50/50 rounded-3xl border border-slate-200 h-[620px] relative overflow-hidden shadow-subtle">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
              Generating semantic relationship canvas...
            </div>
          ) : (
            <ReactFlow
              nodes={visibleNodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              fitView
              minZoom={0.2}
              maxZoom={2.0}
            >
              <Background color="#cbd5e1" gap={20} size={1} />
              <Controls position="bottom-right" className="bg-white rounded-xl shadow-md border border-slate-200 p-1" />
            </ReactFlow>
          )}

          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-500 shadow-xs">
            Interactive Canvas • Click node to inspect public dossier
          </div>
        </div>

        {/* Right Inspector Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle space-y-6">
          {selectedNode ? (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase bg-polar-50 text-polar-700 px-2 py-0.5 rounded border border-polar-200 font-bold">
                    {selectedNode.data?.nodeType || 'Node Entity'}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Public Record
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mt-2 leading-snug">
                  {selectedNode.data?.title || selectedNode.id}
                </h3>

                {selectedNode.data?.domain && (
                  <div className="text-xs font-mono text-polar-700 mt-1 font-medium">
                    Domain: {selectedNode.data.domain}
                  </div>
                )}
              </div>

              {/* Public Attributes */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  Entity Details
                </div>
                <div className="space-y-1.5 font-mono text-[11px] text-slate-700">
                  {selectedNode.data?.code && <div>Mission Code: {selectedNode.data.code}</div>}
                  {selectedNode.data?.station && <div>Operating Station: {selectedNode.data.station}</div>}
                  {selectedNode.data?.region && <div>Geographic Sector: {selectedNode.data.region}</div>}
                  {selectedNode.data?.confidence && <div>Confidence Level: {Math.round(selectedNode.data.confidence * 100)}%</div>}
                  {selectedNode.data?.rows && <div>Calibrated Observations: {selectedNode.data.rows} Rows</div>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => navigate('/explore/evidence')}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Inspect Linked Evidence</span>
                </button>

                <button
                  onClick={() => navigate('/explore/knowledge')}
                  className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <span>Explore Knowledge Records</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              Select any node in the relationship canvas to view public metadata and connected evidence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
