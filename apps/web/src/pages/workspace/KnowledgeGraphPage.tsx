import React, { useState, useEffect, useCallback } from 'react';
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
  X
} from 'lucide-react';
import { getKnowledgeGraph, getObservations } from '../../lib/api';
import { ConfidenceBadge, VerificationBadge } from '../../components/ui/badges';

export function KnowledgeGraphPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getKnowledgeGraph().then((data) => {
      // Map nodes with custom styling according to Section 46
      const styledNodes: Node[] = data.nodes.map((n: any) => {
        let borderClass = 'border-slate-200 bg-white text-slate-900';
        if (n.type === 'expedition') {
          borderClass = 'border-polar-600 bg-polar-50/50 text-slate-900';
        } else if (n.type === 'observation') {
          borderClass = 'border-emerald-500 bg-emerald-50/30 text-slate-900';
        } else if (n.type === 'location') {
          borderClass = 'border-slate-400 bg-slate-50 text-slate-900';
        }

        return {
          id: n.id,
          position: n.position,
          data: {
            ...n.data,
            label: (
              <div className="p-3 text-left">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold mb-0.5">
                  {n.type}
                </div>
                <div className="text-xs font-bold text-slate-900 line-clamp-1">
                  {n.data.title || n.id}
                </div>
                {n.data.domain && (
                  <div className="text-[10px] text-polar-700 mt-1">
                    {n.data.domain}
                  </div>
                )}
              </div>
            )
          },
          className: `rounded-xl border shadow-subtle hover:shadow-premium transition-all cursor-pointer min-w-[180px] ${borderClass}`
        };
      });

      setNodes(styledNodes);
      setEdges(data.edges);
      setSelectedNode(styledNodes.length > 0 ? styledNodes[0] : null);
      setLoading(false);
    });
  }, []);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-polar-700 bg-polar-50 px-2 py-0.5 rounded border border-polar-200">
              Semantic Graph
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">Cross-Modal Knowledge Topology</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Connected Polar Knowledge Network
          </h1>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-subtle">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-polar-600" /> Expedition
            </span>
            <span className="flex items-center gap-1.5 ml-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Observation
            </span>
            <span className="flex items-center gap-1.5 ml-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Location
            </span>
          </div>
        </div>
      </div>

      {/* Main Canvas & Right-side Inspector */}
      <div className="flex-1 flex gap-4 min-h-0 relative">
        {/* React Flow Canvas (Section 46: white canvas, very subtle grid, thin lines) */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-subtle relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
          >
            <Background color="#CBD5E1" gap={24} size={1} />
            <Controls />
          </ReactFlow>
        </div>

        {/* Right-Side Inspector Panel (Section 19 & 46) */}
        {selectedNode && (
          <div className="w-80 bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-mono uppercase text-slate-400 font-semibold">
                  Node Inspector
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-polar-50 text-polar-700 border border-polar-200">
                  {selectedNode.type || 'Entity'}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-2">
                  {(selectedNode.data as any).title || selectedNode.id}
                </h3>
                {(selectedNode.data as any).code && (
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    {(selectedNode.data as any).code}
                  </p>
                )}
              </div>

              {/* Node Details */}
              <div className="space-y-2 text-xs">
                {(selectedNode.data as any).domain && (
                  <div className="flex justify-between border-b border-slate-100 py-1.5">
                    <span className="text-slate-500">Domain:</span>
                    <span className="font-semibold text-slate-800">{(selectedNode.data as any).domain}</span>
                  </div>
                )}
                {(selectedNode.data as any).confidence !== undefined && (
                  <div className="flex justify-between border-b border-slate-100 py-1.5">
                    <span className="text-slate-500">Confidence:</span>
                    <ConfidenceBadge confidence={(selectedNode.data as any).confidence} />
                  </div>
                )}
                {(selectedNode.data as any).status && (
                  <div className="flex justify-between border-b border-slate-100 py-1.5">
                    <span className="text-slate-500">Verification:</span>
                    <VerificationBadge status={(selectedNode.data as any).status} />
                  </div>
                )}
                {(selectedNode.data as any).station && (
                  <div className="flex justify-between border-b border-slate-100 py-1.5">
                    <span className="text-slate-500">Station:</span>
                    <span className="font-semibold text-slate-800">{(selectedNode.data as any).station}</span>
                  </div>
                )}
                {(selectedNode.data as any).rows && (
                  <div className="flex justify-between border-b border-slate-100 py-1.5">
                    <span className="text-slate-500">Rows:</span>
                    <span className="font-mono text-slate-800">{(selectedNode.data as any).rows} records</span>
                  </div>
                )}
              </div>

              {/* Evidence Provenance Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1.5">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Corroborated Evidence
                </span>
                <p className="text-[11px] text-slate-500 font-mono">
                  Linked across Report p.17, CSV row 42, and scientist interview video.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <a
                href="/workspace/evidence"
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Open Evidence Trace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
