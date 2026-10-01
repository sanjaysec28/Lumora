import React, { useState } from 'react';
import { Route } from '../types';
import {
  Calendar,
  Network,
  MessageSquareText,
  Search,
  Sparkles,
  ArrowRight,
  MapPin,
  Volume2,
  Film,
  Compass,
  Mountain,
} from 'lucide-react';

interface MemoryExperiencePreviewProps {
  onNavigate: (route: Route) => void;
}

export const MemoryExperiencePreview: React.FC<MemoryExperiencePreviewProps> = ({
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'graph' | 'ask'>('timeline');

  // Interactive query state for "Ask Your Memory"
  const [queryInput, setQueryInput] = useState<string>(
    'Show me sunset moments along the river where we listened to acoustic music'
  );
  const [hasSearched, setHasSearched] = useState<boolean>(true);

  // Sample quick queries
  const sampleQueries = [
    'Sunset moments along the river with acoustic music',
    'Scenic highway roadtrips near the coast',
    'When did we reach the alpine summit trail in the Dolomites?',
    'Quiet morning coffee in the historic town square',
  ];

  // Graph state: selected node
  const [selectedNode, setSelectedNode] = useState<'florence' | 'chianti' | 'dolomites' | 'coast' | 'solstice'>('florence');

  const nodeDetails = {
    florence: {
      name: 'Florence',
      type: 'Geographic Hub',
      stat: '420 media items · 8 story chapters',
      description: 'Historical city center, Arno riverbanks, terracotta rooftops, and open-air street piazzas.',
    },
    chianti: {
      name: 'Chianti Hills',
      type: 'Roadtrip Arc',
      stat: '164 media items · Cypress route',
      description: 'Winding hillside roads, olive groves, rustic vineyard tastings, and rural detours.',
    },
    dolomites: {
      name: 'Dolomites',
      type: 'Alpine Expedition',
      stat: '210 media items · 3 mountain passes',
      description: 'High-altitude ridges, sunrise traverses, packrafting gear, and panoramic summits.',
    },
    coast: {
      name: 'Pacific Highway',
      type: 'Coastal Route',
      stat: '185 media items · Ocean vista',
      description: 'Winding cliffside roadtrips, sea-spray turnouts, and golden hour coastal horizons.',
    },
    solstice: {
      name: 'Summer Solstice',
      type: 'Seasonal Chapter',
      stat: '96 media items · June 21-24',
      description: 'Longest daylight hours, warm twilight gatherings, and midnight acoustic riverwalks.',
    },
  };

  return (
    <section className="relative px-6 sm:px-10 lg:px-16 py-20 sm:py-28">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#6D5DFB]">
            Interactive Demonstration
          </span>
          <h2
            className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#171522] tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            The Lumora Memory Experience.
          </h2>
          <p
            className="mt-4 text-base sm:text-lg text-[#665F78]"
            style={{ textWrap: 'balance' }}
          >
            Experience how multi-modal intelligence transforms raw media into an intuitive, living tapestry.
          </p>
        </div>

        {/* Tab Controls (Segmented Surface) */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-full bg-white/80 border border-[#B8A7FF]/30 shadow-xs backdrop-blur-md">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === 'timeline'
                  ? 'bg-gradient-to-r from-[#6D5DFB] to-[#3B267E] text-white shadow-[0_4px_14px_rgba(109,93,251,0.28)]'
                  : 'text-[#665F78] hover:text-[#171522]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>1. Living Timeline</span>
            </button>

            <button
              onClick={() => setActiveTab('graph')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === 'graph'
                  ? 'bg-gradient-to-r from-[#6D5DFB] to-[#3B267E] text-white shadow-[0_4px_14px_rgba(109,93,251,0.28)]'
                  : 'text-[#665F78] hover:text-[#171522]'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>2. Memory Graph</span>
            </button>

            <button
              onClick={() => setActiveTab('ask')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === 'ask'
                  ? 'bg-gradient-to-r from-[#6D5DFB] to-[#3B267E] text-white shadow-[0_4px_14px_rgba(109,93,251,0.28)]'
                  : 'text-[#665F78] hover:text-[#171522]'
              }`}
            >
              <MessageSquareText className="w-4 h-4" />
              <span>3. Ask Your Memory</span>
            </button>
          </div>
        </div>

        {/* Presentation Surface Container */}
        <div className="glass-panel rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 border border-white shadow-[0_24px_80px_rgba(59,38,126,0.08)] min-h-[540px] flex flex-col justify-between">
          
          {/* TAB 1: LIVING TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-8">
              {/* Timeline Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#3B267E]/8">
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#171522]">
                    Chronological & Narrative Horizon
                  </h3>
                  <p className="text-xs sm:text-sm text-[#665F78] mt-0.5">
                    Moments clustered by geographical routes and narrative chapters rather than flat upload folders.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('/memory/demo')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6D5DFB] hover:text-[#3B267E] cursor-pointer"
                >
                  <span>Open Full Interactive Reel</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Horizontal Timeline Track */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Milestone Card 1 */}
                <div className="rounded-2xl p-5 bg-white/95 border border-[#B8A7FF]/30 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between text-xs text-[#665F78] mb-3">
                    <span className="font-mono font-semibold text-[#6D5DFB]">June 21 · 19:42</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#3B267E]">
                      <MapPin className="w-3 h-3 text-[#6D5DFB]" />
                      Piazzale Michelangelo
                    </span>
                  </div>

                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-gradient-to-tr from-[#3B267E] via-[#6D5DFB] to-[#F4A7D8] p-4 flex flex-col justify-between text-white shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider bg-black/35 backdrop-blur-md px-2 py-0.5 rounded">
                        Golden Hour
                      </span>
                      <Film className="w-4 h-4 text-[#8DDCFF]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Sunset Panorama Over Florence</div>
                      <div className="text-[11px] text-white/80">Ambient sound: Street guitar + city murmur</div>
                    </div>
                  </div>

                  <p className="text-xs text-[#665F78] leading-relaxed">
                    Arriving at the terrace just as the sunset turned the river into a ribbon of liquid amber.
                  </p>

                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-[#3B267E]">
                    <span className="font-medium">18 Photos · 4 Video Clips</span>
                    <span className="text-[#6D5DFB] font-semibold">Chapter 01</span>
                  </div>
                </div>

                {/* Milestone Card 2 */}
                <div className="rounded-2xl p-5 bg-white/95 border border-[#B8A7FF]/30 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between text-xs text-[#665F78] mb-3">
                    <span className="font-mono font-semibold text-[#6D5DFB]">June 22 · 14:15</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#3B267E]">
                      <MapPin className="w-3 h-3 text-[#6D5DFB]" />
                      Chianti Vineyards
                    </span>
                  </div>

                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-gradient-to-tr from-[#6D5DFB] via-[#69E1D4] to-[#FFF9FC] p-4 flex flex-col justify-between text-[#171522] shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider bg-white/60 backdrop-blur-md px-2 py-0.5 rounded">
                        Country Route
                      </span>
                      <Volume2 className="w-4 h-4 text-[#3B267E]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#171522]">Cypress Road Through Tuscany</div>
                      <div className="text-[11px] text-[#3B267E]/80">Wind sweep & countryside gravel</div>
                    </div>
                  </div>

                  <p className="text-xs text-[#665F78] leading-relaxed">
                    Following winding backroads through olive trees and ancient stone farmhouses under clear summer skies.
                  </p>

                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-[#3B267E]">
                    <span className="font-medium">32 Clips · 4K Drone Footage</span>
                    <span className="text-[#6D5DFB] font-semibold">Chapter 02</span>
                  </div>
                </div>

                {/* Milestone Card 3 */}
                <div className="rounded-2xl p-5 bg-white/95 border border-[#B8A7FF]/30 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between text-xs text-[#665F78] mb-3">
                    <span className="font-mono font-semibold text-[#6D5DFB]">June 24 · 23:50</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#3B267E]">
                      <MapPin className="w-3 h-3 text-[#6D5DFB]" />
                      Ponte Vecchio
                    </span>
                  </div>

                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-gradient-to-tr from-[#171522] via-[#3B267E] to-[#6D5DFB] p-4 flex flex-col justify-between text-white shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider bg-white/20 backdrop-blur-md px-2 py-0.5 rounded">
                        Twilight
                      </span>
                      <Sparkles className="w-4 h-4 text-[#F4A7D8]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Midnight Walk Along the Arno</div>
                      <div className="text-[11px] text-white/80">Reflections on water & stone bridge</div>
                    </div>
                  </div>

                  <p className="text-xs text-[#665F78] leading-relaxed">
                    Strolling across the illuminated arches of Ponte Vecchio with late-night street cello echoes.
                  </p>

                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-[#3B267E]">
                    <span className="font-medium">14 Moments · Long Exposure</span>
                    <span className="text-[#6D5DFB] font-semibold">Chapter 03</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEMORY GRAPH */}
          {activeTab === 'graph' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#3B267E]/8">
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#171522]">
                    Relational Knowledge Constellation
                  </h3>
                  <p className="text-xs sm:text-sm text-[#665F78] mt-0.5">
                    Click any node to see how Lumora connects places, routes, activities, and seasonal story chapters.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#665F78]">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#6D5DFB]" /> Geographic Hub</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#69E1D4]" /> Roadtrip Arc</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F4A7D8]" /> Alpine Trail</span>
                </div>
              </div>

              {/* Interactive Graph Canvas */}
              <div className="relative w-full h-[360px] rounded-2xl bg-gradient-to-br from-[#1B1435] via-[#26184C] to-[#3B267E] p-6 overflow-hidden flex items-center justify-center shadow-lg">
                {/* Orbital concentric rings */}
                <div className="absolute w-[240px] h-[240px] rounded-full border border-white/10 animate-spin" style={{ animationDuration: '40s' }} />
                <div className="absolute w-[350px] h-[350px] rounded-full border border-white/5" />

                {/* Connecting light beams (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line x1="50%" y1="50%" x2="25%" y2="28%" stroke="#B8A7FF" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="4 4" />
                  <line x1="50%" y1="50%" x2="76%" y2="28%" stroke="#69E1D4" strokeWidth="1.5" strokeOpacity="0.5" />
                  <line x1="50%" y1="50%" x2="28%" y2="74%" stroke="#F4A7D8" strokeWidth="1.5" strokeOpacity="0.5" />
                  <line x1="50%" y1="50%" x2="72%" y2="74%" stroke="#8DDCFF" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="3 3" />
                  <line x1="25%" y1="28%" x2="28%" y2="74%" stroke="#6D5DFB" strokeWidth="1" strokeOpacity="0.3" />
                  <line x1="76%" y1="28%" x2="72%" y2="74%" stroke="#69E1D4" strokeWidth="1" strokeOpacity="0.3" />
                </svg>

                {/* Central Hub Node: Florence */}
                <button
                  onClick={() => setSelectedNode('florence')}
                  className={`relative z-20 w-24 h-24 rounded-full bg-gradient-to-tr from-[#6D5DFB] via-[#8576FF] to-[#F4A7D8] shadow-[0_0_30px_rgba(109,93,251,0.7)] flex flex-col items-center justify-center text-white cursor-pointer transition-transform duration-200 hover:scale-105 ${
                    selectedNode === 'florence' ? 'ring-4 ring-white' : ''
                  }`}
                >
                  <MapPin className="w-5 h-5 mb-0.5" />
                  <span className="text-xs font-bold">Florence</span>
                  <span className="text-[10px] text-white/80">Hub · 420 items</span>
                </button>

                {/* Node 1: Chianti */}
                <button
                  onClick={() => setSelectedNode('chianti')}
                  className={`absolute top-[20%] left-[18%] z-20 w-16 h-16 rounded-full bg-[#69E1D4] border border-white/50 shadow-md flex flex-col items-center justify-center text-[#171522] cursor-pointer transition-transform duration-200 hover:scale-110 ${
                    selectedNode === 'chianti' ? 'ring-2 ring-white scale-105' : ''
                  }`}
                >
                  <Compass className="w-4 h-4 mb-0.5 text-[#171522]" />
                  <span className="text-[11px] font-bold">Chianti</span>
                  <span className="text-[9px] text-[#171522]/80">Hillside</span>
                </button>

                {/* Node 2: Dolomites */}
                <button
                  onClick={() => setSelectedNode('dolomites')}
                  className={`absolute top-[20%] right-[18%] z-20 w-16 h-16 rounded-full bg-[#F4A7D8] border border-white/50 shadow-md flex flex-col items-center justify-center text-[#171522] cursor-pointer transition-transform duration-200 hover:scale-110 ${
                    selectedNode === 'dolomites' ? 'ring-2 ring-white scale-105' : ''
                  }`}
                >
                  <Mountain className="w-4 h-4 mb-0.5 text-[#3B267E]" />
                  <span className="text-[11px] font-bold">Dolomites</span>
                  <span className="text-[9px] text-[#3B267E]/80">Summit</span>
                </button>

                {/* Node 3: Coastal Highway */}
                <button
                  onClick={() => setSelectedNode('coast')}
                  className={`absolute bottom-[18%] left-[22%] z-20 w-16 h-16 rounded-full bg-[#6D5DFB] border border-white/50 shadow-md flex flex-col items-center justify-center text-white cursor-pointer transition-transform duration-200 hover:scale-110 ${
                    selectedNode === 'coast' ? 'ring-2 ring-white scale-105' : ''
                  }`}
                >
                  <Film className="w-4 h-4 mb-0.5 text-[#8DDCFF]" />
                  <span className="text-[11px] font-bold">Coast</span>
                  <span className="text-[9px] text-white/80">Highway</span>
                </button>

                {/* Node 4: Summer Solstice */}
                <button
                  onClick={() => setSelectedNode('solstice')}
                  className={`absolute bottom-[18%] right-[22%] z-20 w-16 h-16 rounded-full bg-[#8DDCFF] border border-white/50 shadow-md flex flex-col items-center justify-center text-[#171522] cursor-pointer transition-transform duration-200 hover:scale-110 ${
                    selectedNode === 'solstice' ? 'ring-2 ring-white scale-105' : ''
                  }`}
                >
                  <Calendar className="w-4 h-4 mb-0.5 text-[#171522]" />
                  <span className="text-[11px] font-bold">Solstice</span>
                  <span className="text-[9px] text-[#171522]/80">Chapter</span>
                </button>
              </div>

              {/* Selected Node Details Box */}
              <div className="p-4.5 rounded-2xl bg-white/90 border border-[#B8A7FF]/30 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6D5DFB]" />
                    <span className="font-bold text-sm text-[#171522]">
                      {nodeDetails[selectedNode].name}
                    </span>
                    <span className="text-[#6D5DFB] font-medium">· {nodeDetails[selectedNode].type}</span>
                    <span className="text-neutral-400">· {nodeDetails[selectedNode].stat}</span>
                  </div>
                  <p className="text-xs text-[#665F78] mt-1">
                    {nodeDetails[selectedNode].description}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('/memory/demo')}
                  className="px-4 py-2 rounded-full bg-[#EDE6F7] hover:bg-[#6D5DFB] text-[#3B267E] hover:text-white font-semibold transition-colors cursor-pointer text-xs shrink-0"
                >
                  Explore in Demo →
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ASK YOUR MEMORY */}
          {activeTab === 'ask' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#3B267E]/8">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#171522]">
                  Natural Language Recall
                </h3>
                <p className="text-xs sm:text-sm text-[#665F78] mt-0.5">
                  Ask your media collection questions using natural speech to retrieve grounded moments and actual video/photo evidence.
                </p>
              </div>

              {/* Search Bar Input Simulation */}
              <div className="relative">
                <div className="flex items-center rounded-2xl bg-white border border-[#6D5DFB]/40 shadow-sm p-2 pl-4 focus-within:border-[#6D5DFB] focus-within:ring-2 focus-within:ring-[#6D5DFB]/20 transition-all">
                  <Search className="w-5 h-5 text-[#6D5DFB] shrink-0 mr-3" />
                  <input
                    type="text"
                    value={queryInput}
                    onChange={(e) => {
                      setQueryInput(e.target.value);
                      setHasSearched(true);
                    }}
                    placeholder="Search by activity, scenic location, time of day, or ambient sound..."
                    className="w-full text-sm sm:text-base text-[#171522] placeholder:text-neutral-400 bg-transparent focus:outline-none font-medium"
                  />
                  <button
                    onClick={() => setHasSearched(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#3B267E] text-white text-xs sm:text-sm font-semibold shadow hover:opacity-95 transition-opacity cursor-pointer shrink-0"
                  >
                    Ask
                  </button>
                </div>

                {/* Query Quick Suggestions */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-[#665F78] font-medium mr-1">Try asking:</span>
                  {sampleQueries.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQueryInput(q);
                        setHasSearched(true);
                      }}
                      className="text-[11px] px-3 py-1.5 rounded-full bg-white/80 hover:bg-white border border-[#B8A7FF]/30 text-[#3B267E] hover:text-[#6D5DFB] transition-colors cursor-pointer"
                    >
                      "{q}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Simulated Answer Capsule */}
              {hasSearched && (
                <div className="rounded-2xl p-6 bg-gradient-to-br from-[#FFF9FC] to-[#F5EFFF] border border-[#B8A7FF]/30 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#6D5DFB]">
                    <Sparkles className="w-4 h-4 text-[#6D5DFB]" />
                    <span>Lumora Grounded Narrative · 4 Verified Moments</span>
                  </div>

                  <p className="text-sm text-[#171522] leading-relaxed">
                    "I found 4 moments matching your query along the riverbank in Florence. On June 21, 2026, at Piazzale Michelangelo, the camera captured sunset street guitar acoustics overlooking the illuminated city arches, followed by an open-air dinner along the Arno."
                  </p>

                  {/* 4 Mini Result Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-white border border-neutral-200/70 shadow-2xs">
                      <div className="aspect-[4/3] rounded-lg bg-gradient-to-tr from-[#6D5DFB] to-[#F4A7D8] mb-2 flex items-center justify-center text-white text-xs font-bold">
                        Piazzale Sunset
                      </div>
                      <div className="text-[11px] font-bold text-[#171522] truncate">June 21 · 19:42</div>
                      <div className="text-[10px] text-[#665F78]">Ambient Guitar Solo</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-neutral-200/70 shadow-2xs">
                      <div className="aspect-[4/3] rounded-lg bg-gradient-to-tr from-[#3B267E] to-[#69E1D4] mb-2 flex items-center justify-center text-white text-xs font-bold">
                        Arno Riverbank
                      </div>
                      <div className="text-[11px] font-bold text-[#171522] truncate">June 22 · 20:15</div>
                      <div className="text-[10px] text-[#665F78]">4K Video Clip</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-neutral-200/70 shadow-2xs">
                      <div className="aspect-[4/3] rounded-lg bg-gradient-to-tr from-[#F4A7D8] to-[#8DDCFF] mb-2 flex items-center justify-center text-[#171522] text-xs font-bold">
                        Piazza Santo Spirito
                      </div>
                      <div className="text-[11px] font-bold text-[#171522] truncate">June 23 · 21:30</div>
                      <div className="text-[10px] text-[#665F78]">Live Photo Burst</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-neutral-200/70 shadow-2xs">
                      <div className="aspect-[4/3] rounded-lg bg-gradient-to-tr from-[#6D5DFB] to-[#3B267E] mb-2 flex items-center justify-center text-white text-xs font-bold">
                        Ponte Vecchio
                      </div>
                      <div className="text-[11px] font-bold text-[#171522] truncate">June 24 · 23:50</div>
                      <div className="text-[10px] text-[#665F78]">Evening Cello Notes</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Card Navigation Mirror */}
          <div className="pt-6 mt-6 border-t border-[#3B267E]/8 flex flex-wrap items-center justify-between gap-4 text-xs text-[#665F78]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6D5DFB]" />
              <span>Tested with real-world multi-format photo & video archives</span>
            </div>
            <button
              onClick={() => onNavigate('/memory/demo')}
              className="font-semibold text-[#6D5DFB] hover:text-[#3B267E] cursor-pointer"
            >
              Experience the Full Tuscan Demo Story →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
