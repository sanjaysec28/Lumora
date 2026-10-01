import React from 'react';
import { GraphNodeItem, MediaDetailItem, TimelineMoment } from '../../types';
import { ConstellationCanvas } from './ConstellationCanvas';
import { Sparkles, ArrowRight, MessageSquareText, Network, Camera, MapPin, Activity, CheckCircle2 } from 'lucide-react';
import { getOptimizedImageUrl } from '../../lib/cloudinary';

interface MemoryConstellationViewProps {
  nodes: GraphNodeItem[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  centerTitle: string;
  totalMoments: number;
  activeGraphNode: GraphNodeItem;
  relatedMedia: MediaDetailItem[];
  onSelectMedia: (item: MediaDetailItem) => void;
  onAskAboutNode: (query: string) => void;
}

export const MemoryConstellationView: React.FC<MemoryConstellationViewProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  centerTitle,
  totalMoments,
  activeGraphNode,
  relatedMedia,
  onSelectMedia,
  onAskAboutNode,
}) => {
  return (
    <div className="space-y-10">
      {/* ================================================== */}
      {/* SECTION HEADER */}
      {/* ================================================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#3B267E]/8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6D5DFB] mb-2">
            <Network className="w-4 h-4 text-[#6D5DFB]" />
            <span>Relational Constellation</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#171522] tracking-tight">
            MEMORY CONSTELLATION
          </h2>
          <p className="mt-2 text-base text-[#665F78] max-w-xl font-normal">
            Explore the relationships connecting your moments.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#665F78]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6D5DFB] shadow-[0_0_8px_#6D5DFB]" /> Primary Nodes
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#69E1D4] shadow-[0_0_8px_#69E1D4]" /> Activity & Craft
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F4A7D8] shadow-[0_0_8px_#F4A7D8]" /> Chapters
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8DDCFF] shadow-[0_0_8px_#8DDCFF]" /> Milestones
          </span>
        </div>
      </div>

      {/* ================================================== */}
      {/* CONSTELLATION CANVAS */}
      {/* ================================================== */}
      <ConstellationCanvas
        nodes={nodes}
        selectedNodeId={selectedNodeId}
        onSelectNode={onSelectNode}
        centerTitle={centerTitle}
        totalMoments={totalMoments}
      />

      {/* ================================================== */}
      {/* ELEGANT FLOATING CONTEXTUAL INSPECTOR PANEL */}
      {/* Part of the constellation space */}
      {/* ================================================== */}
      <div className="rounded-3xl sm:rounded-[36px] bg-white/90 backdrop-blur-xl border border-white/90 p-7 sm:p-10 shadow-[0_20px_60px_rgba(59,38,126,0.08)] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#3B267E]/8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#6D5DFB] shadow-[0_0_10px_#6D5DFB]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[#6D5DFB] font-bold">
                {activeGraphNode.category}
              </span>
              <span aria-hidden="true" className="text-[#B8A7FF]">·</span>
              <span className="text-xs font-mono text-[#665F78]">
                {activeGraphNode.momentCount} connected moments
              </span>
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#171522] mt-1">
              {activeGraphNode.label}
            </h3>

            <p className="text-sm sm:text-base text-[#665F78] mt-2 max-w-2xl leading-relaxed">
              {activeGraphNode.description}
            </p>
          </div>

          {/* Quick Ask CTA */}
          <button
            type="button"
            onClick={() => onAskAboutNode(`Tell me about ${activeGraphNode.label} during this memory.`)}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#6D5DFB] to-[#3B267E] text-white text-xs sm:text-sm font-semibold shadow-[0_6px_20px_rgba(109,93,251,0.28)] hover:shadow-[0_8px_28px_rgba(109,93,251,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer shrink-0"
          >
            <MessageSquareText className="w-4 h-4 text-[#8DDCFF]" />
            <span>Ask about this memory →</span>
          </button>
        </div>

        {/* Node's Connected Media Thumbnails Grid */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#665F78] mb-4">
            <Camera className="w-3.5 h-3.5 text-[#6D5DFB]" />
            <span>Visual Evidence for "{activeGraphNode.label}" ({relatedMedia.length} moments)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedMedia.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectMedia(item)}
                className="group relative rounded-2xl overflow-hidden bg-black aspect-[4/3] cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                {item.secure_url ? (
                  <img
                    src={getOptimizedImageUrl(item.secure_url, { width: 500, height: 380, crop: 'fill' })}
                    alt={item.title}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-tr ${item.coverGradient}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-white font-mono text-[10px]">
                  {item.time}
                </div>

                <div className="absolute bottom-3 inset-x-3 text-white">
                  <h4 className="text-xs font-bold truncate group-hover:text-[#69E1D4] transition-colors">
                    {item.title}
                  </h4>
                  <div className="text-[10px] text-white/70 font-mono truncate mt-0.5">
                    {item.scene || item.tags[0] || 'Grounded moment'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
