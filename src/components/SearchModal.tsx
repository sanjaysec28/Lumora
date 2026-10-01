import React, { useState, useMemo } from 'react';
import { mockMediaDetails } from '../lib/mockData';
import { MediaDetailItem, MemoryCollectionItem, Route } from '../types';
import { Search, X, Film, Camera, ArrowRight, Sparkles, FolderHeart } from 'lucide-react';
import { getOptimizedImageUrl } from '../lib/cloudinary';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (item: MediaDetailItem) => void;
  onNavigate: (route: Route) => void;
  memories?: MemoryCollectionItem[];
  isDemoMode?: boolean;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectMedia,
  onNavigate,
  memories = [],
  isDemoMode = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState<'All' | 'Photos' | 'Videos' | 'Moments'>('All');

  const allItems = useMemo<MediaDetailItem[]>(() => {
    if (isDemoMode) {
      return Object.values(mockMediaDetails);
    }

    // In Live Mode: strictly extract only real media with a verified secure_url
    const items: MediaDetailItem[] = [];
    memories.forEach((mem) => {
      if (mem.mediaItems && mem.mediaItems.length > 0) {
        mem.mediaItems.forEach((m) => {
          const url = m.secure_url || m.cloudinaryAsset?.secure_url;
          if (url) {
            items.push({
              id: m.id,
              filename: m.filename,
              type: m.type,
              size: m.size || '4.0 MB',
              title: m.title,
              time: m.time || mem.date,
              context: m.aiInsight?.context || m.title,
              tags: m.aiInsight?.tags || ['Live Vault'],
              relatedMoments: [],
              coverGradient: m.gradient || 'from-[#6D5DFB] to-[#F4A7D8]',
              secure_url: url,
              cloudinaryAsset: m.cloudinaryAsset,
              scene: m.aiInsight?.scene,
              activity: m.aiInsight?.activity,
              objects: m.aiInsight?.objects,
              momentType: m.aiInsight?.momentType,
              aiInsight: m.aiInsight,
            });
          }
        });
      } else if (mem.timelineMoments && mem.timelineMoments.length > 0) {
        mem.timelineMoments.forEach((t) => {
          if (t.secure_url) {
            items.push({
              id: t.id,
              filename: `${t.title.toLowerCase().replace(/\s+/g, '_')}.${t.mediaType === 'video' ? 'mp4' : 'jpg'}`,
              type: t.mediaType,
              size: '4.2 MB',
              title: t.title,
              time: t.time,
              context: t.context || t.description,
              tags: t.tags || ['Live Vault'],
              relatedMoments: t.relatedMomentIds || [],
              coverGradient: t.coverGradient,
              secure_url: t.secure_url,
              cloudinaryAsset: t.cloudinaryAsset,
              scene: t.scene,
              activity: t.activity,
              objects: t.objects,
              momentType: t.momentType,
              aiInsight: t.aiInsight,
            });
          }
        });
      }
    });

    return items;
  }, [isDemoMode, memories]);

  const filteredItems = useMemo(() => {
    let result = allItems;

    if (activeTypeFilter === 'Photos') {
      result = result.filter((i) => i.type === 'photo');
    } else if (activeTypeFilter === 'Videos') {
      result = result.filter((i) => i.type === 'video');
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.context.toLowerCase().includes(q) ||
          (i.scene && i.scene.toLowerCase().includes(q)) ||
          (i.activity && i.activity.toLowerCase().includes(q)) ||
          (i.momentType && i.momentType.toLowerCase().includes(q)) ||
          (i.objects && i.objects.some((obj) => obj.toLowerCase().includes(q))) ||
          (i.aiInsight?.description && i.aiInsight.description.toLowerCase().includes(q)) ||
          i.tags.some((t) => t.toLowerCase().includes(q)) ||
          i.filename.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allItems, searchTerm, activeTypeFilter]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#FFF9FC] border border-white shadow-[0_24px_80px_rgba(59,38,126,0.3)] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input Row */}
        <div className="p-4 sm:p-5 border-b border-[#3B267E]/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#6D5DFB] shrink-0 ml-2" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search across all moments, people, tags (try 'team', 'presentation', 'sunset')..."
            className="w-full text-sm sm:text-base text-[#171522] placeholder:text-neutral-400 bg-transparent focus:outline-none font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-neutral-400 hover:text-[#171522] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[#665F78] transition-colors cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Filter Type Pills */}
        <div className="px-5 py-3 border-b border-[#3B267E]/8 flex items-center justify-between gap-2 overflow-x-auto bg-[#FFF9FC]">
          <div className="flex items-center gap-2">
            {(['All', 'Photos', 'Videos', 'Moments'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveTypeFilter(filter)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  activeTypeFilter === filter
                    ? 'bg-[#6D5DFB] text-white shadow-2xs'
                    : 'bg-white border border-[#B8A7FF]/30 text-[#665F78] hover:text-[#171522]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-[#665F78] shrink-0">
            {filteredItems.length} {filteredItems.length === 1 ? 'match' : 'matches'}
          </span>
        </div>

        {/* Results List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 max-h-[50vh]">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectMedia(item);
                  onClose();
                }}
                className="group p-3 sm:p-3.5 rounded-2xl bg-white border border-[#B8A7FF]/25 hover:border-[#6D5DFB] hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="w-12 h-12 rounded-xl bg-black overflow-hidden shrink-0 flex items-center justify-center text-white shadow-2xs relative"
                  >
                    {item.secure_url ? (
                      <img
                        src={getOptimizedImageUrl(item.secure_url, { width: 100, height: 100, crop: 'fill' })}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : isDemoMode ? (
                      <div className={`w-full h-full bg-gradient-to-tr ${item.coverGradient}`} />
                    ) : null}
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center pointer-events-none">
                      {item.type === 'video' ? (
                        <Film className="w-4 h-4 text-white drop-shadow" />
                      ) : (
                        <Camera className="w-4 h-4 text-white drop-shadow" />
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#171522] group-hover:text-[#6D5DFB] transition-colors truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-mono text-[#665F78]">{item.time}</span>
                      {item.momentType && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#6D5DFB]/10 text-[#6D5DFB] font-bold capitalize">
                          {item.momentType}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#665F78] truncate mt-0.5">
                      {item.scene ? `${item.scene} · ` : ''}{item.context}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-[#EDE6F7] text-[#3B267E]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-[#6D5DFB] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 px-4 text-[#665F78] space-y-3">
              <Sparkles className="w-8 h-8 text-[#B8A7FF] mx-auto animate-pulse" />
              <div>
                <h4 className="text-base font-bold text-[#171522]">
                  No matching memory found.
                </h4>
                <p className="text-xs text-[#665F78] mt-1">
                  Try searching for a place, activity, object, event, or moment.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto">
                {['team', 'stage', 'presentation', 'prototype', 'celebration', 'laptops', 'afternoon'].map((query) => (
                  <button
                    key={query}
                    type="button"
                    onClick={() => setSearchTerm(query)}
                    className="text-xs px-3 py-1 rounded-full bg-white hover:bg-[#EDE6F7] border border-[#B8A7FF]/35 text-[#3B267E] hover:text-[#6D5DFB] transition-colors cursor-pointer shadow-2xs font-medium"
                  >
                    "{query}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Mirror */}
        <div className="p-3.5 border-t border-[#3B267E]/8 bg-[#F8F4FD] flex items-center justify-between text-xs text-[#665F78]">
          <span className="flex items-center gap-1.5">
            <FolderHeart className="w-3.5 h-3.5 text-[#6D5DFB]" />
            <span>Searching 342 moments in Hackathon 2026</span>
          </span>
          <button
            onClick={() => {
              onNavigate('/memory/demo');
              onClose();
            }}
            className="font-semibold text-[#6D5DFB] hover:underline cursor-pointer"
          >
            Open Memory Demo →
          </button>
        </div>
      </div>
    </div>
  );
};
