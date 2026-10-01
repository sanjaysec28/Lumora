import React from 'react';
import { ConversationTurn, MediaDetailItem } from '../../types';
import { RecallCoreCanvas } from './RecallCoreCanvas';
import {
  Sparkles,
  MessageSquareText,
  Send,
  Loader2,
  Clock,
  Terminal,
  Sun,
  ShieldCheck,
  HelpCircle,
  Camera,
  Film,
  ArrowRight,
  ChevronRight,
  Info,
  Calendar,
} from 'lucide-react';
import { getOptimizedImageUrl } from '../../lib/cloudinary';

interface MemoryRecallStudioViewProps {
  askQuery: string;
  setAskQuery: (q: string) => void;
  isAsking: boolean;
  recallPhase: 'idle' | 'understanding' | 'searching' | 'synthesizing';
  conversationHistory: ConversationTurn[];
  onSubmitAsk: (e?: React.FormEvent) => void;
  onSelectSuggestion: (q: string) => void;
  resolveMediaItem: (id: string) => MediaDetailItem | null;
  onSelectMedia: (item: MediaDetailItem) => void;
  onExploreGraphNode?: (nodeId: string) => void;
  currentTitle: string;
}

export const MemoryRecallStudioView: React.FC<MemoryRecallStudioViewProps> = ({
  askQuery,
  setAskQuery,
  isAsking,
  recallPhase,
  conversationHistory,
  onSubmitAsk,
  onSelectSuggestion,
  resolveMediaItem,
  onSelectMedia,
  onExploreGraphNode,
  currentTitle,
}) => {
  const suggestionCards = [
    {
      query: 'Show our final presentation.',
      label: 'Stage Presentation',
      icon: Sparkles,
      color: 'from-[#6D5DFB]/15 via-[#B8A7FF]/10 to-transparent',
      borderColor: 'border-[#6D5DFB]/30',
    },
    {
      query: 'What happened before that?',
      label: 'Temporal Sequence',
      icon: Clock,
      color: 'from-[#B8A7FF]/15 via-[#F4A7D8]/10 to-transparent',
      borderColor: 'border-[#B8A7FF]/35',
    },
    {
      query: 'Find our coding moments.',
      label: 'Deep Work & Build',
      icon: Terminal,
      color: 'from-[#69E1D4]/15 via-[#8DDCFF]/10 to-transparent',
      borderColor: 'border-[#69E1D4]/35',
    },
    {
      query: 'Show the moments from the afternoon.',
      label: 'Afternoon Milestones',
      icon: Sun,
      color: 'from-[#F4A7D8]/15 via-[#FFE8B8]/15 to-transparent',
      borderColor: 'border-[#F4A7D8]/35',
    },
  ];

  return (
    <div className="space-y-12">
      {/* ================================================== */}
      {/* HERO & 3D RECALL CORE */}
      {/* ================================================== */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto pt-4">
        {/* Subtle 3D Conversational Orb */}
        <div className="mb-4">
          <RecallCoreCanvas isAsking={isAsking} />
        </div>

        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6D5DFB] mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#6D5DFB]" />
          <span>Conversational Recall Engine</span>
        </div>

        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#171522] tracking-tight">
          ASK YOUR MEMORY
        </h2>

        <p className="mt-3 text-base sm:text-lg text-[#665F78] max-w-xl font-normal">
          Ask about a moment. Lumora finds the story around it.
        </p>

        {/* ================================================== */}
        {/* LARGE ELEGANT INPUT FIELD (CENTRAL STAGE) */}
        {/* ================================================== */}
        <form onSubmit={onSubmitAsk} className="w-full mt-8">
          <div className="relative flex items-center rounded-full bg-white/95 backdrop-blur-xl border-2 border-[#B8A7FF]/40 shadow-[0_12px_40px_rgba(109,93,251,0.12)] p-2 sm:p-2.5 pl-6 sm:pl-8 focus-within:border-[#6D5DFB] focus-within:shadow-[0_16px_50px_rgba(109,93,251,0.22)] focus-within:ring-4 focus-within:ring-[#6D5DFB]/12 transition-all">
            <span className="text-[#6D5DFB] mr-3 font-semibold text-lg select-none">✦</span>
            <input
              type="text"
              value={askQuery}
              onChange={(e) => setAskQuery(e.target.value)}
              disabled={isAsking}
              placeholder={isAsking ? 'Gemini is querying story context...' : 'What do you want to remember?'}
              className="w-full text-base sm:text-lg text-[#171522] placeholder:text-[#665F78]/60 bg-transparent focus:outline-none font-medium disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isAsking || !askQuery.trim()}
              className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#6D5DFB] via-[#7869FB] to-[#3B267E] text-white text-sm sm:text-base font-semibold shadow-[0_6px_20px_rgba(109,93,251,0.3)] hover:shadow-[0_8px_26px_rgba(109,93,251,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer shrink-0 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAsking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>Ask</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* ================================================== */}
        {/* 4 VISUALLY DISTINCT SUGGESTION CARDS */}
        {/* ================================================== */}
        <div className="w-full mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {suggestionCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.query}
                type="button"
                disabled={isAsking}
                onClick={() => onSelectSuggestion(card.query)}
                className={`group text-left p-4 rounded-2xl bg-white/80 hover:bg-white border ${card.borderColor} bg-gradient-to-br ${card.color} shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#6D5DFB] font-bold">
                    {card.label}
                  </span>
                  <Icon className="w-3.5 h-3.5 text-[#6D5DFB] group-hover:scale-115 transition-transform" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#171522] group-hover:text-[#6D5DFB] transition-colors leading-snug">
                  "{card.query}"
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================================================== */}
      {/* ACTIVE ASKING PROGRESSIVE PHASES */}
      {/* ================================================== */}
      {isAsking && (
        <div className="max-w-3xl mx-auto p-5 rounded-3xl bg-white border border-[#6D5DFB]/40 shadow-sm space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs text-[#3B267E] font-semibold">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6D5DFB] animate-spin" style={{ animationDuration: '3s' }} />
              <span>
                {recallPhase === 'understanding'
                  ? 'Interpreting temporal context and semantic intent...'
                  : recallPhase === 'searching'
                  ? 'Traversing memory constellation & grounding visual evidence...'
                  : 'Synthesizing narrative recall with Gemini intelligence...'}
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase text-[#6D5DFB] bg-[#6D5DFB]/10 px-2 py-0.5 rounded-full font-bold">
              {recallPhase === 'understanding'
                ? 'Phase 1 · Reading'
                : recallPhase === 'searching'
                ? 'Phase 2 · Evidence'
                : 'Phase 3 · Synthesis'}
            </span>
          </div>

          <div className="w-full bg-[#EDE6F7] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#6D5DFB] via-[#F4A7D8] to-[#69E1D4] h-full rounded-full transition-all duration-300"
              style={{
                width: recallPhase === 'understanding' ? '35%' : recallPhase === 'searching' ? '70%' : '95%',
              }}
            />
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* CINEMATIC MEMORY ANSWERS FEED */}
      {/* ================================================== */}
      <div className="max-w-4xl mx-auto space-y-10">
        {conversationHistory.map((item, index) => {
          const rawIds = Array.from(
            new Set([...(item.mediaIds || []), ...(item.momentIds || [])])
          );
          const resolvedMediaList = rawIds
            .map((id) => resolveMediaItem(id))
            .filter((m): m is MediaDetailItem => Boolean(m && m.secure_url));
          const mediaToDisplay = resolvedMediaList;
          const primaryMedia = resolvedMediaList[0] || null;
          const secondaryMedia1 = resolvedMediaList[1] || null;
          const secondaryMedia2 = resolvedMediaList[2] || null;

          return (
            <article
              key={item.id || index}
              className="rounded-[32px] sm:rounded-[40px] bg-white border border-[#B8A7FF]/35 shadow-[0_24px_70px_rgba(59,38,126,0.08)] p-7 sm:p-10 lg:p-12 space-y-8"
            >
              {/* Question Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#3B267E]/8">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#6D5DFB] font-bold block mb-1">
                    YOU ASKED
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#171522]">
                    "{item.user}"
                  </h3>
                </div>

                {item.timestamp && (
                  <span className="text-xs font-mono text-[#665F78]/80 shrink-0">
                    {item.timestamp}
                  </span>
                )}
              </div>

              {/* Lumora Answer Block */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6D5DFB]">
                    <Sparkles className="w-4 h-4 text-[#6D5DFB]" />
                    <span>LUMORA FOUND · {mediaToDisplay.length} Connected Moments</span>
                  </div>

                  {/* Clean unboxed confidence indicator */}
                  <div className="text-xs text-[#665F78] font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10B981]" />
                    <span>High Confidence</span>
                    <span aria-hidden="true" className="text-[#B8A7FF]">·</span>
                    <span className="text-[#3B267E]">Grounded in visual evidence</span>
                  </div>
                </div>

                {/* Answer Editorial Prose */}
                <p className="font-display text-lg sm:text-xl text-[#171522] leading-relaxed font-normal">
                  {item.lumora}
                </p>

                {/* Graph Node Exploration Shortcut */}
                {item.relevantGraphNodes && item.relevantGraphNodes.length > 0 && onExploreGraphNode && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => onExploreGraphNode(item.relevantGraphNodes![0])}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#6D5DFB] hover:text-[#3B267E] transition-colors cursor-pointer"
                    >
                      <span>Explore "{item.relevantGraphNodes[0]}" in Memory Constellation</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* ================================================== */}
              {/* MEDIA EVIDENCE HIERARCHY (1 LARGE + 2 SECONDARY) */}
              {/* ================================================== */}
              {mediaToDisplay.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-[#3B267E]/8">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#665F78] font-bold flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5 text-[#6D5DFB]" />
                    <span>Grounded Media Evidence</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                    {/* Primary Large Image */}
                    {primaryMedia && (
                      <div
                        onClick={() => onSelectMedia(primaryMedia)}
                        className={`group relative rounded-3xl overflow-hidden bg-black cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 ${
                          secondaryMedia1 ? 'md:col-span-7 aspect-[16/10]' : 'md:col-span-12 aspect-[16/9]'
                        }`}
                      >
                        {primaryMedia.secure_url && (
                          <img
                            src={getOptimizedImageUrl(primaryMedia.secure_url, { width: 900, height: 600, crop: 'fill' })}
                            alt={primaryMedia.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md text-white font-mono text-[11px]">
                          Primary Signal · {primaryMedia.time}
                        </div>

                        <div className="absolute bottom-4 inset-x-4 text-white">
                          <h4 className="text-base sm:text-lg font-bold truncate group-hover:text-[#69E1D4] transition-colors">
                            {primaryMedia.title}
                          </h4>
                          <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
                            {primaryMedia.context}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Secondary Stacked Media */}
                    {(secondaryMedia1 || secondaryMedia2) && (
                      <div className="md:col-span-5 flex flex-col gap-4">
                        {secondaryMedia1 && (
                          <div
                            onClick={() => onSelectMedia(secondaryMedia1)}
                            className="group relative rounded-2xl overflow-hidden bg-black flex-1 min-h-[140px] cursor-pointer shadow-sm hover:shadow-lg transition-all"
                          >
                            {secondaryMedia1.secure_url && (
                              <img
                                src={getOptimizedImageUrl(secondaryMedia1.secure_url, { width: 500, height: 320, crop: 'fill' })}
                                alt={secondaryMedia1.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                            <div className="absolute bottom-2.5 inset-x-3 text-white">
                              <h5 className="text-xs font-bold truncate group-hover:text-[#69E1D4]">
                                {secondaryMedia1.title}
                              </h5>
                              <span className="text-[10px] text-white/70 font-mono">
                                {secondaryMedia1.time}
                              </span>
                            </div>
                          </div>
                        )}

                        {secondaryMedia2 && (
                          <div
                            onClick={() => onSelectMedia(secondaryMedia2)}
                            className="group relative rounded-2xl overflow-hidden bg-black flex-1 min-h-[140px] cursor-pointer shadow-sm hover:shadow-lg transition-all"
                          >
                            {secondaryMedia2.secure_url && (
                              <img
                                src={getOptimizedImageUrl(secondaryMedia2.secure_url, { width: 500, height: 320, crop: 'fill' })}
                                alt={secondaryMedia2.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                            <div className="absolute bottom-2.5 inset-x-3 text-white">
                              <h5 className="text-xs font-bold truncate group-hover:text-[#69E1D4]">
                                {secondaryMedia2.title}
                              </h5>
                              <span className="text-[10px] text-white/70 font-mono">
                                {secondaryMedia2.time}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ================================================== */}
              {/* CONTEXTUAL MEMORY TIMELINE: WHY ANSWER WAS RETURNED */}
              {/* ================================================== */}
              <div className="pt-4 border-t border-[#3B267E]/8">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#665F78] font-bold block mb-3">
                  TEMPORAL RECONSTRUCTION
                </span>

                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="px-3 py-1.5 rounded-full bg-[#EDE6F7] text-[#6D5DFB] font-semibold">
                    BEFORE: Arrival & Prototyping
                  </span>
                  <span className="text-[#B8A7FF]">→</span>
                  <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#6D5DFB] to-[#3B267E] text-white font-bold shadow-xs">
                    MATCH: {primaryMedia?.title || 'Key Narrative Anchor'}
                  </span>
                  <span className="text-[#B8A7FF]">→</span>
                  <span className="px-3 py-1.5 rounded-full bg-[#EDE6F7] text-[#6D5DFB] font-semibold">
                    AFTER: Celebration & Recognition
                  </span>
                </div>
              </div>

              {/* ================================================== */}
              {/* FOLLOW-UP EXPERIENCE */}
              {/* ================================================== */}
              {item.followUps && item.followUps.length > 0 && (
                <div className="pt-4 border-t border-[#3B267E]/8 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#665F78]">
                    <Sparkles className="w-3.5 h-3.5 text-[#6D5DFB]" />
                    <span>EXPLORE THIS MEMORY:</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.followUps.map((q) => (
                      <button
                        key={q}
                        type="button"
                        disabled={isAsking}
                        onClick={() => onSelectSuggestion(q)}
                        className="px-4 py-2 rounded-full bg-[#FFF9FC] hover:bg-white border border-[#B8A7FF]/40 text-[#3B267E] hover:text-[#6D5DFB] text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50 text-left"
                      >
                        "{q}"
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};
