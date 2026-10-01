import React, { useState, useMemo } from 'react';
import { Route, CategoryFilter, MemoryCollectionItem } from '../types';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { mockMemoryCollection } from '../lib/mockData';
import { getOptimizedImageUrl } from '../lib/cloudinary';
import { isFirebaseConfigured } from '../lib/firebase';
import {
  Search,
  Plus,
  ArrowRight,
  Film,
  Camera,
  MapPin,
  Calendar,
  Sparkles,
  FolderHeart,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (route: Route) => void;
  onOpenLogin: () => void;
  onOpenSearch: () => void;
  onOpenProfile: () => void;
  memories?: MemoryCollectionItem[];
  onSelectMemory?: (memory: MemoryCollectionItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenLogin,
  onOpenSearch,
  onOpenProfile,
  memories = mockMemoryCollection,
  onSelectMemory,
}) => {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const featuredMemory = useMemo(() => {
    return memories.find((m) => m.featured) || memories[0];
  }, [memories]);

  const filteredCollection = useMemo(() => {
    let list = memories;

    if (activeFilter === 'Trips') {
      list = list.filter((m) => m.category === 'Trips');
    } else if (activeFilter === 'Events') {
      list = list.filter((m) => m.category === 'Events');
    } else if (activeFilter === 'Projects') {
      list = list.filter((m) => m.category === 'Projects');
    } else if (activeFilter === 'Recent') {
      list = list.slice(0, 3);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.subtitle.toLowerCase().includes(q) ||
          m.location.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [memories, activeFilter, searchQuery]);

  const handleOpenMemory = (mem: MemoryCollectionItem) => {
    if (onSelectMemory) {
      onSelectMemory(mem);
    } else {
      onNavigate('/memory/demo');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBE4F7] via-[#F4EEFA] to-[#E5DCF8] py-3 sm:py-6 lg:py-8 px-2 sm:px-4 lg:px-8">
      <main className="max-w-[1480px] mx-auto bg-[#FFF9FC] rounded-[24px] sm:rounded-[36px] md:rounded-[44px] shadow-[0_24px_90px_rgba(59,38,126,0.13)] border border-white/80 overflow-hidden relative">
        {/* Soft Background Auras */}
        <div className="absolute top-0 right-0 w-[550px] h-[450px] bg-gradient-to-bl from-[#B8A7FF]/20 via-[#F4A7D8]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[40%] left-[-80px] w-[500px] h-[500px] bg-gradient-to-tr from-[#69E1D4]/15 via-[#8DDCFF]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <Navigation
          currentRoute="/dashboard"
          onNavigate={onNavigate}
          onOpenLogin={onOpenLogin}
          onOpenSearch={onOpenSearch}
          onOpenProfile={onOpenProfile}
        />

        <div className="px-6 sm:px-10 lg:px-16 py-8 sm:py-12">
          {/* Workspace Hero Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#3B267E]/8">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#6D5DFB] uppercase tracking-wider mb-2">
                <FolderHeart className="w-3.5 h-3.5" />
                <span>Personal Media Workspace</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#171522]">
                Your memories
              </h1>
              <p className="text-base text-[#665F78] mt-2 font-normal">
                Stories created from the moments that matter.
              </p>
              <div className="mt-3 flex items-center gap-2">
                {isFirebaseConfigured() ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#6D5DFB]/10 text-[#6D5DFB] border border-[#6D5DFB]/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                    <span>Live Vault Active</span>
                    <span className="text-[10px] text-[#665F78]">· Firestore Persistent</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Demo Sandbox Mode</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Secondary Inline Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#665F78] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your memories..."
                  className="w-56 sm:w-64 pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#B8A7FF]/35 text-xs sm:text-sm text-[#171522] placeholder:text-neutral-400 focus:outline-none focus:border-[#6D5DFB] focus:ring-2 focus:ring-[#6D5DFB]/15 shadow-2xs"
                />
              </div>

              {/* Primary + Create Memory Button */}
              <button
                onClick={() => onNavigate('/create')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#6D5DFB] to-[#3B267E] text-white text-xs sm:text-sm font-semibold shadow-[0_4px_16px_rgba(109,93,251,0.28)] hover:shadow-[0_6px_22px_rgba(109,93,251,0.42)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Memory</span>
              </button>
            </div>
          </div>

          {/* Hackathon Demo Readiness Banner (Module 4) */}
          <div className="mt-6 mb-8 p-4 rounded-2xl bg-gradient-to-r from-[#EDE6F7] via-white to-[#EDE6F7] border border-[#B8A7FF]/35 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#69E1D4] shadow-[0_0_8px_#69E1D4]" />
              <div>
                <span className="text-xs font-bold text-[#171522]">
                  Hackathon Demo Mode Active:
                </span>
                <span className="text-xs text-[#665F78] ml-1.5">
                  Pre-populated with real Cloudinary assets, timeline moments, and conversational memory intelligence.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  if (onSelectMemory) onSelectMemory(featuredMemory);
                  onNavigate('/memory/demo');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#6D5DFB]/10 hover:bg-[#6D5DFB]/20 text-[#6D5DFB] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Interactive Demo</span>
              </button>
              <button
                onClick={() => onNavigate('/create')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#B8A7FF]/40 text-[#3B267E] hover:text-[#6D5DFB] text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Your Media</span>
              </button>
            </div>
          </div>

          {/* FEATURED MEMORY: Large Cinematic Card */}
          <div className="mt-10 mb-14">
            <div
              onClick={() => handleOpenMemory(featuredMemory)}
              className="group relative rounded-3xl sm:rounded-[32px] overflow-hidden bg-gradient-to-br from-[#271556] via-[#3B267E] to-[#171522] text-white p-7 sm:p-12 shadow-[0_20px_60px_rgba(59,38,126,0.28)] border border-white/20 cursor-pointer transition-all duration-500 hover:shadow-[0_28px_80px_rgba(59,38,126,0.38)] hover:-translate-y-0.5"
            >
              {/* Cinematic Background Atmosphere with subtle zoom */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-[#3B267E]/40 to-transparent z-10 pointer-events-none" />
              <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-bl from-[#F4A7D8]/30 via-[#6D5DFB]/30 to-transparent blur-3xl pointer-events-none group-hover:scale-115 transition-transform duration-700" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-[#69E1D4]/25 to-transparent blur-3xl pointer-events-none" />

              {/* Decorative Geometric 3D vector accent */}
              <div className="absolute right-8 bottom-6 sm:right-16 sm:bottom-10 opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none">
                <svg viewBox="0 0 200 200" className="w-48 h-48 sm:w-64 sm:h-64">
                  <ellipse cx="100" cy="100" rx="90" ry="40" transform="rotate(-25 100 100)" stroke="white" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                  <ellipse cx="100" cy="100" rx="60" ry="26" transform="rotate(35 100 100)" stroke="#B8A7FF" strokeWidth="1.5" fill="none" />
                  <circle cx="100" cy="100" r="18" fill="white" />
                </svg>
              </div>

              <div className="relative z-20 max-w-2xl">
                {/* Featured Badge */}
                <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 font-bold uppercase tracking-wider text-[#8DDCFF]">
                    <Sparkles className="w-3.5 h-3.5 text-[#69E1D4]" />
                    Featured Story Capsule
                  </span>
                  <span className="flex items-center gap-1 text-white/80">
                    <MapPin className="w-3.5 h-3.5 text-[#B8A7FF]" />
                    {featuredMemory.location} · {featuredMemory.monthYear}
                  </span>
                </div>

                <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white group-hover:text-[#FFF9FC] transition-colors">
                  {featuredMemory.title.toUpperCase()}
                </h2>

                <p className="mt-3 text-base sm:text-lg text-white/85 leading-relaxed font-normal">
                  "{featuredMemory.subtitle}"
                </p>

                {/* Metrics & Hover State */}
                <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-white/90">
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-xs">
                    <Camera className="w-4 h-4 text-[#F4A7D8]" />
                    <strong className="text-white">{featuredMemory.assetCount}</strong> moments
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-xs">
                    <Film className="w-4 h-4 text-[#8DDCFF]" />
                    <strong className="text-white">{featuredMemory.videoCount}</strong> videos
                  </span>
                </div>

                {/* CTA Action */}
                <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-white group-hover:text-[#8DDCFF] transition-colors">
                  <span>Open Memory</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: "Your memories" + Filter Bar */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#171522]">
                  Your memories
                </h3>
                <span className="text-xs text-[#665F78]">
                  Showing {filteredCollection.length} {filteredCollection.length === 1 ? 'capsule' : 'capsules'}
                </span>
              </div>

              {/* Segmented Filter Control */}
              <div className="inline-flex p-1 rounded-2xl bg-white border border-[#B8A7FF]/35 shadow-2xs">
                {(['All', 'Recent', 'Trips', 'Events', 'Projects'] as CategoryFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3.5 sm:px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      activeFilter === filter
                        ? 'bg-gradient-to-r from-[#6D5DFB] to-[#3B267E] text-white shadow-2xs'
                        : 'text-[#665F78] hover:text-[#171522]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Memory Collection Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCollection.map((mem) => (
                <div
                  key={mem.id}
                  onClick={() => handleOpenMemory(mem)}
                  className="group rounded-3xl bg-white border border-[#B8A7FF]/30 p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Visual Cover Canvas */}
                    <div
                      className={`relative aspect-[16/10] rounded-2xl overflow-hidden mb-4 bg-black p-4 flex flex-col justify-between text-white shadow-inner group-hover:scale-[1.01] transition-transform`}
                    >
                      {mem.coverImageUrl ? (
                        <img
                          src={getOptimizedImageUrl(mem.coverImageUrl, { width: 600, height: 400, crop: 'fill' })}
                          alt={mem.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-tr ${mem.coverGradient}`} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

                      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono">
                        <span className="bg-black/30 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                          {mem.category}
                        </span>
                        <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full font-sans text-[11px] font-semibold">
                          {mem.assetCount} assets
                        </span>
                      </div>

                      <div className="relative z-10">
                        <div className="text-[11px] uppercase tracking-wider text-white/80 font-mono">
                          {mem.monthYear} · {mem.location}
                        </div>
                        <div className="text-base font-bold text-white drop-shadow-xs mt-0.5">
                          {mem.title}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-display font-bold text-lg text-[#171522] group-hover:text-[#6D5DFB] transition-colors">
                        {mem.title}
                      </h4>
                      <span className="text-xs font-semibold text-[#665F78]">
                        {mem.date.split(',')[0]}
                      </span>
                    </div>

                    <p className="text-xs text-[#665F78] leading-relaxed line-clamp-2">
                      {mem.subtitle}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {mem.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-[#EDE6F7] text-[#3B267E] font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-neutral-100 flex items-center justify-between text-xs text-[#3B267E]">
                    <span className="font-semibold group-hover:text-[#6D5DFB] transition-colors">
                      Open Memory
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#6D5DFB] transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>

            {filteredCollection.length === 0 && (
              <div className="text-center py-16 text-[#665F78] space-y-2">
                <Sparkles className="w-8 h-8 text-[#B8A7FF] mx-auto animate-pulse" />
                <div className="text-base font-semibold text-[#171522]">
                  No memories found matching your criteria.
                </div>
                <button
                  onClick={() => {
                    setActiveFilter('All');
                    setSearchQuery('');
                  }}
                  className="text-xs font-semibold text-[#6D5DFB] hover:underline cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>

        <Footer onNavigate={onNavigate} />
      </main>
    </div>
  );
};
