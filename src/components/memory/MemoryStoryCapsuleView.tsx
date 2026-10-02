import React, { useState, useMemo } from 'react';
import {
  MemoryCollectionItem,
  MemoryCluster,
  MemoryStoryCapsule,
  StoryChapter,
  StoryMoment,
  MediaDetailItem,
  TimelineMoment,
} from '../../types';
import { getOptimizedImageUrl } from '../../lib/cloudinary';
import {
  Sparkles,
  Clock,
  Layers,
  CheckCircle2,
  ArrowDown,
  Camera,
  Film,
  Maximize2,
  ExternalLink,
  ChevronRight,
  Filter,
  Eye,
  Tag,
  MapPin,
  Calendar,
} from 'lucide-react';

interface MemoryStoryCapsuleViewProps {
  memory?: MemoryCollectionItem | null;
  isDemoMode?: boolean;
  onSelectMedia: (item: MediaDetailItem) => void;
  timelineMoments?: TimelineMoment[];
  availableMedia?: MediaDetailItem[];
}

export const MemoryStoryCapsuleView: React.FC<MemoryStoryCapsuleViewProps> = ({
  memory,
  isDemoMode = false,
  onSelectMedia,
  timelineMoments = [],
  availableMedia = [],
}) => {
  // Extract all capsules or build a grounded primary capsule
  const capsules: MemoryStoryCapsule[] = useMemo(() => {
    if (memory?.storyCapsules && memory.storyCapsules.length > 0) {
      return memory.storyCapsules;
    }

    if (memory?.clusters && memory.clusters.length > 0) {
      const derivedFromClusters: MemoryStoryCapsule[] = [];
      memory.clusters.forEach((cluster) => {
        if (cluster.storyCapsule) {
          derivedFromClusters.push(cluster.storyCapsule);
        } else {
          // Construct grounded capsule from cluster data
          derivedFromClusters.push({
            id: `capsule-${cluster.id}`,
            ownerId: cluster.ownerId,
            clusterId: cluster.id,
            title: cluster.title,
            subtitle: cluster.subtitle || `${cluster.mediaIds.length} moments grounded in ${cluster.dominantActivities[0] || 'collaboration'}.`,
            summary: cluster.narrativeSummary || `An unbroken sequence capturing ${cluster.mediaIds.length} moments, unified by shared activities and visual resonance.`,
            mediaIds: cluster.mediaIds,
            momentIds: cluster.momentIds,
            chapters: (cluster.mediaIds.length > 1) ? [
              {
                id: `ch-${cluster.id}-1`,
                title: 'Initial Emergence',
                description: `First documented moments in this story segment.`,
                mediaIds: cluster.mediaIds.slice(0, Math.ceil(cluster.mediaIds.length / 2)),
                momentIds: cluster.momentIds.slice(0, Math.ceil(cluster.momentIds.length / 2)),
                order: 1,
              },
              {
                id: `ch-${cluster.id}-2`,
                title: 'Culmination',
                description: `High-resonance resolution and documented progress.`,
                mediaIds: cluster.mediaIds.slice(Math.ceil(cluster.mediaIds.length / 2)),
                momentIds: cluster.momentIds.slice(Math.ceil(cluster.momentIds.length / 2)),
                order: 2,
              }
            ] : [
              {
                id: `ch-${cluster.id}-1`,
                title: cluster.title,
                description: `Focused moments captured during ${cluster.title}.`,
                mediaIds: cluster.mediaIds,
                momentIds: cluster.momentIds,
                order: 1,
              }
            ],
            keyMoments: cluster.mediaIds.map((mId, idx) => ({
              id: `km-${cluster.id}-${idx + 1}`,
              title: idx === 0 ? 'Kickoff & Arrival' : idx === cluster.mediaIds.length - 1 ? 'Presentation & Milestone' : `Moment ${idx + 1}`,
              description: `Verified visual milestone from ${cluster.title}.`,
              mediaIds: [mId],
              importance: idx === 0 || idx === cluster.mediaIds.length - 1 ? 'high' : 'medium',
            })),
            dominantActivities: cluster.dominantActivities,
            dominantTags: cluster.dominantTags,
            timeRange: cluster.timeRange,
            location: cluster.location,
            confidence: cluster.confidence,
            createdAt: cluster.createdAt || new Date().toISOString(),
            updatedAt: cluster.updatedAt || new Date().toISOString(),
          });
        }
      });
      if (derivedFromClusters.length > 0) return derivedFromClusters;
    }

    // Default grounded capsule for Demo Mode or single memory
    const defaultTitle = memory?.title || (isDemoMode ? 'Hackathon 2026' : 'Living Memory');
    const defaultSubtitle = memory?.subtitle || (isDemoMode ? 'From ideas to the final presentation.' : 'Personal media story illuminated through Cloudinary CDN.');
    const defaultSummary = memory?.aiSummary || (isDemoMode
      ? 'The team worked through project development, collaboration and preparation before presenting the final project on the main auditorium stage.'
      : 'A cohesive living memory capsule woven from authentic photos and videos.');

    // Fallback chapters based on available timeline moments
    const allIds = timelineMoments.map((m) => m.id);
    const demoChapters: StoryChapter[] = isDemoMode
      ? [
          {
            id: 'ch-1',
            title: 'Project Kickoff',
            description: 'Team arrival, registration badge pickups, and early setup as the day begins.',
            mediaIds: ['moment-arrival'],
            momentIds: ['moment-arrival'],
            order: 1,
          },
          {
            id: 'ch-2',
            title: 'Building Together',
            description: 'Deep technical prototyping, dual-monitor workstation splits, and 3D shader compilation.',
            mediaIds: ['moment-prototype'],
            momentIds: ['moment-prototype'],
            order: 2,
          },
          {
            id: 'ch-3',
            title: 'Final Preparation',
            description: 'Cross-functional review over lunch bites, fluid motion synchronization, and slide polish.',
            mediaIds: ['moment-collab'],
            momentIds: ['moment-collab'],
            order: 3,
          },
          {
            id: 'ch-4',
            title: 'Presentation',
            description: 'Live demonstration on the auditorium projection wall followed by celebratory award recognition.',
            mediaIds: ['moment-presentation', 'moment-results'],
            momentIds: ['moment-presentation', 'moment-results'],
            order: 4,
          },
        ]
      : allIds.length > 0
      ? [
          {
            id: 'ch-live-1',
            title: 'Opening Sequence',
            description: 'Initial documented moments.',
            mediaIds: allIds.slice(0, Math.ceil(allIds.length / 2)),
            momentIds: allIds.slice(0, Math.ceil(allIds.length / 2)),
            order: 1,
          },
          {
            id: 'ch-live-2',
            title: 'Progression & Climax',
            description: 'Subsequent breakthroughs and shared milestones.',
            mediaIds: allIds.slice(Math.ceil(allIds.length / 2)),
            momentIds: allIds.slice(Math.ceil(allIds.length / 2)),
            order: 2,
          },
        ]
      : [];

    const demoKeyMoments: StoryMoment[] = isDemoMode
      ? [
          {
            id: 'km-1',
            title: 'Project Kickoff',
            description: 'Morning arrival and badge distribution at the entrance foyer.',
            mediaIds: ['moment-arrival'],
            timestamp: '09:12 AM',
            importance: 'high',
          },
          {
            id: 'km-2',
            title: 'Team Work',
            description: 'Collaborative sprint and shader compilation at workstation 14.',
            mediaIds: ['moment-prototype', 'moment-collab'],
            timestamp: '11:40 AM',
            importance: 'high',
          },
          {
            id: 'km-3',
            title: 'Final Preparation',
            description: 'Rapid design review and gesture synchronization before the stage pitch.',
            mediaIds: ['moment-collab'],
            timestamp: '01:30 PM',
            importance: 'medium',
          },
          {
            id: 'km-4',
            title: 'Presentation',
            description: 'Auditorium live demonstration to jury panel under bright spotlights.',
            mediaIds: ['moment-presentation', 'moment-results'],
            timestamp: '04:15 PM',
            importance: 'high',
          },
        ]
      : timelineMoments.slice(0, 4).map((m, idx) => ({
          id: `km-${m.id}`,
          title: m.title,
          description: m.description,
          mediaIds: [m.id],
          timestamp: m.time,
          importance: idx === 0 || idx === timelineMoments.length - 1 ? 'high' : 'medium',
        }));

    return [
      {
        id: 'primary-capsule',
        ownerId: 'lumora',
        clusterId: memory?.clusters?.[0]?.id || 'cluster-main',
        title: defaultTitle,
        subtitle: defaultSubtitle,
        summary: defaultSummary,
        mediaIds: allIds,
        momentIds: allIds,
        chapters: demoChapters,
        keyMoments: demoKeyMoments,
        dominantActivities: memory?.tags || ['collaboration', 'presentation'],
        dominantTags: memory?.tags || ['innovation', 'moments'],
        timeRange: { start: '09:00 AM', end: '06:30 PM' },
        location: memory?.location || 'Chennai',
        confidence: 'high',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }, [memory, isDemoMode, timelineMoments]);

  const [activeCapsuleIndex, setActiveCapsuleIndex] = useState<number>(0);
  const activeCapsule = capsules[activeCapsuleIndex] || capsules[0];

  // Interactivity: active filters
  const [selectedMomentId, setSelectedMomentId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'filtered'>('all');

  // Grounded media items available for evidence display
  // STRICT RULE: In Live Mode, only show items with valid secure_url from Cloudinary!
  const evidenceMediaList = useMemo(() => {
    // Collect from availableMedia and timelineMoments
    const map = new Map<string, MediaDetailItem>();

    // Add from availableMedia
    availableMedia.forEach((item) => {
      if (isDemoMode || item.secure_url) {
        map.set(item.id, item);
      }
    });

    // Add from timelineMoments
    timelineMoments.forEach((m) => {
      if ((isDemoMode || m.secure_url) && !map.has(m.id)) {
        map.set(m.id, {
          id: m.id,
          filename: `${m.title.toLowerCase().replace(/\s+/g, '_')}.${m.mediaType === 'video' ? 'mp4' : 'jpg'}`,
          type: m.mediaType,
          size: m.cloudinaryAsset ? `${(m.cloudinaryAsset.bytes / (1024 * 1024)).toFixed(1)} MB` : '4.2 MB',
          title: m.title,
          time: m.time,
          context: m.context || m.description,
          tags: m.tags,
          relatedMoments: m.relatedMomentIds || [],
          coverGradient: m.coverGradient,
          secure_url: m.secure_url,
          cloudinaryAsset: m.cloudinaryAsset,
          scene: m.scene,
          activity: m.activity,
          objects: m.objects,
          momentType: m.momentType,
          aiInsight: m.aiInsight,
        });
      }
    });

    // Add from memory.mediaItems if present
    if (memory?.mediaItems) {
      memory.mediaItems.forEach((mi) => {
        const url = mi.secure_url || mi.cloudinaryAsset?.secure_url;
        if ((isDemoMode || url) && !map.has(mi.id)) {
          map.set(mi.id, {
            id: mi.id,
            filename: mi.filename,
            type: mi.type,
            size: mi.size,
            title: mi.title,
            time: mi.time,
            context: mi.aiInsight?.context || mi.title,
            tags: mi.aiInsight?.tags || ['Illuminated'],
            relatedMoments: [],
            coverGradient: mi.gradient || 'from-[#6D5DFB] to-[#F4A7D8]',
            secure_url: url,
            cloudinaryAsset: mi.cloudinaryAsset,
            scene: mi.aiInsight?.scene,
            activity: mi.aiInsight?.activity,
            objects: mi.aiInsight?.objects,
            momentType: mi.aiInsight?.momentType,
            aiInsight: mi.aiInsight,
          });
        }
      });
    }

    return Array.from(map.values());
  }, [availableMedia, timelineMoments, memory?.mediaItems, isDemoMode]);

  // Determine which mediaIds are actively highlighted/filtered
  const activeHighlightedMediaIds = useMemo(() => {
    if (selectedMomentId && activeCapsule?.keyMoments) {
      const found = activeCapsule.keyMoments.find((km) => km.id === selectedMomentId);
      if (found) return new Set(found.mediaIds);
    }
    if (selectedChapterId && activeCapsule?.chapters) {
      const found = activeCapsule.chapters.find((ch) => ch.id === selectedChapterId);
      if (found) return new Set(found.mediaIds);
    }
    return null;
  }, [selectedMomentId, selectedChapterId, activeCapsule]);

  // Active filter label
  const activeFilterName = useMemo(() => {
    if (selectedMomentId && activeCapsule?.keyMoments) {
      const found = activeCapsule.keyMoments.find((km) => km.id === selectedMomentId);
      if (found) return `Key Moment: ${found.title}`;
    }
    if (selectedChapterId && activeCapsule?.chapters) {
      const found = activeCapsule.chapters.find((ch) => ch.id === selectedChapterId);
      if (found) return `Chapter: ${found.title}`;
    }
    return null;
  }, [selectedMomentId, selectedChapterId, activeCapsule]);

  // Filtered evidence items
  const displayedEvidence = useMemo(() => {
    if (filterMode === 'filtered' && activeHighlightedMediaIds) {
      return evidenceMediaList.filter((item) => activeHighlightedMediaIds.has(item.id));
    }
    return evidenceMediaList;
  }, [filterMode, activeHighlightedMediaIds, evidenceMediaList]);

  // Scroll to evidence section helper
  const scrollToEvidence = () => {
    const el = document.getElementById('memory-evidence-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectKeyMoment = (moment: StoryMoment) => {
    if (selectedMomentId === moment.id) {
      // Toggle off
      setSelectedMomentId(null);
    } else {
      setSelectedMomentId(moment.id);
      setSelectedChapterId(null);
      scrollToEvidence();
    }
  };

  const handleSelectChapter = (chapter: StoryChapter) => {
    if (selectedChapterId === chapter.id) {
      // Toggle off
      setSelectedChapterId(null);
    } else {
      setSelectedChapterId(chapter.id);
      setSelectedMomentId(null);
      scrollToEvidence();
    }
  };

  const clearSelection = () => {
    setSelectedMomentId(null);
    setSelectedChapterId(null);
    setFilterMode('all');
  };

  return (
    <div className="space-y-12 sm:space-y-16 lg:space-y-20 animate-in fade-in duration-300">
      {/* ================================================== */}
      {/* 1. CLUSTER / CAPSULE TAB SELECTOR (IF MULTIPLE) */}
      {/* ================================================== */}
      {capsules.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-white/70 backdrop-blur-md rounded-2xl border border-[#B8A7FF]/30">
          <div className="flex items-center gap-2 px-3 py-1">
            <Layers className="w-4 h-4 text-[#6D5DFB]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#665F78]">
              Memory Story Capsules ({capsules.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {capsules.map((cap, idx) => (
              <button
                key={cap.id}
                type="button"
                onClick={() => {
                  setActiveCapsuleIndex(idx);
                  clearSelection();
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeCapsuleIndex === idx
                    ? 'bg-gradient-to-r from-[#6D5DFB] to-[#3B267E] text-white shadow-sm font-semibold'
                    : 'bg-[#3B267E]/5 hover:bg-[#3B267E]/10 text-[#3B267E]'
                }`}
              >
                {cap.title}
                <span className="ml-1.5 opacity-60 text-[10px]">({cap.mediaIds.length})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 2. LUMORA STORY HEADER & SUMMARY */}
      {/* ================================================== */}
      <section className="relative rounded-[32px] sm:rounded-[44px] overflow-hidden bg-gradient-to-br from-[#20133E] via-[#2E1A5B] to-[#140E26] text-white p-8 sm:p-12 lg:p-16 shadow-[0_28px_90px_rgba(35,18,68,0.35)] border border-white/15">
        {/* Soft Ambient Glow Orbs */}
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-bl from-[#B8A7FF]/25 via-[#F4A7D8]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[450px] h-[450px] bg-gradient-to-tr from-[#69E1D4]/20 via-[#6D5DFB]/25 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6 sm:space-y-8">
          {/* Eyebrow Kicker: EXACT REQUIREMENT: LUMORA STORY */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-mono tracking-widest text-[#B8A7FF]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#69E1D4] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#69E1D4]" />
              <span>LUMORA STORY</span>
            </span>
            <span aria-hidden="true" className="text-white/30">·</span>
            <span className="text-white/80 font-sans font-medium">
              {activeCapsule.location || memory?.location || 'Personal Archive'}
            </span>
            {activeCapsule.timeRange?.start && (
              <>
                <span aria-hidden="true" className="text-white/30">·</span>
                <span className="text-white/70 font-sans">
                  {activeCapsule.timeRange.start} – {activeCapsule.timeRange.end || 'Late'}
                </span>
              </>
            )}
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-[#69E1D4]/15 text-[#69E1D4] border border-[#69E1D4]/30 font-sans font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              <span>{activeCapsule.confidence.toUpperCase()} CONFIDENCE</span>
            </span>
          </div>

          {/* Story Title & Subtitle */}
          <div className="space-y-3">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              {activeCapsule.title}
            </h1>
            {activeCapsule.subtitle && (
              <p className="text-xl sm:text-2xl text-[#E9E4F5] italic font-serif leading-relaxed">
                "{activeCapsule.subtitle}"
              </p>
            )}
          </div>

          {/* Story Summary Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/8 backdrop-blur-xl border border-white/15 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#69E1D4] mb-3">
              <span className="w-2 h-2 rounded-full bg-[#69E1D4] shadow-[0_0_8px_#69E1D4]" />
              <span>Grounded Narrative Summary</span>
            </div>
            <p className="text-base sm:text-lg text-white/90 leading-relaxed font-normal">
              {activeCapsule.summary}
            </p>

            {/* Dominant Activities & Tags */}
            <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-white/50 font-mono uppercase mr-1">Semantic Signals:</span>
              {(activeCapsule.dominantActivities || []).map((act, i) => (
                <span
                  key={`act-${i}`}
                  className="px-2.5 py-1 rounded-full bg-white/10 text-white/90 font-medium"
                >
                  {act}
                </span>
              ))}
              {(activeCapsule.dominantTags || []).map((tag, i) => (
                <span
                  key={`tag-${i}`}
                  className="px-2.5 py-1 rounded-full bg-[#6D5DFB]/30 text-[#E9E4F5] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 3. KEY MOMENTS */}
      {/* ================================================== */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#6D5DFB]">
              <Sparkles className="w-3.5 h-3.5 text-[#6D5DFB]" />
              <span>Verified Evidence Milestones</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#171522] tracking-tight mt-1">
              KEY MOMENTS
            </h2>
          </div>
          <span className="text-xs font-mono text-[#665F78]">
            Click any moment to inspect supporting Cloudinary evidence
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {(activeCapsule.keyMoments || []).map((moment, idx) => {
            const isSelected = selectedMomentId === moment.id;
            const evidenceCount = moment.mediaIds.length;

            return (
              <div
                key={moment.id}
                onClick={() => handleSelectKeyMoment(moment)}
                className={`group relative p-6 rounded-3xl transition-all duration-300 cursor-pointer border ${
                  isSelected
                    ? 'bg-white shadow-[0_16px_40px_rgba(109,93,251,0.18)] border-[#6D5DFB] ring-2 ring-[#6D5DFB]/40 scale-[1.02]'
                    : 'bg-white/80 hover:bg-white border-[#B8A7FF]/35 hover:border-[#6D5DFB]/60 shadow-[0_8px_24px_rgba(59,38,126,0.05)] hover:shadow-[0_12px_32px_rgba(59,38,126,0.1)]'
                }`}
              >
                {/* Visual bullet indicator */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full transition-transform duration-300 ${
                        isSelected
                          ? 'bg-[#6D5DFB] shadow-[0_0_10px_#6D5DFB] scale-125'
                          : 'bg-[#B8A7FF] group-hover:bg-[#6D5DFB]'
                      }`}
                    />
                    <span className="text-xs font-mono text-[#665F78]">
                      {moment.timestamp || `Stage 0${idx + 1}`}
                    </span>
                  </div>
                  {moment.importance === 'high' && (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#6D5DFB]/10 text-[#6D5DFB] font-semibold">
                      Key
                    </span>
                  )}
                </div>

                <h3 className="font-display text-lg font-bold text-[#171522] group-hover:text-[#6D5DFB] transition-colors">
                  ● {moment.title}
                </h3>

                <p className="mt-2 text-xs sm:text-sm text-[#665F78] leading-relaxed line-clamp-3">
                  {moment.description}
                </p>

                {/* Evidence link badge */}
                <div className="mt-4 pt-3 border-t border-[#3B267E]/8 flex items-center justify-between text-xs">
                  <span className="font-medium text-[#3B267E] flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-[#6D5DFB]" />
                    <span>{evidenceCount} {evidenceCount === 1 ? 'asset' : 'assets'}</span>
                  </span>
                  <span className="text-[#6D5DFB] font-semibold text-[11px] group-hover:underline flex items-center gap-0.5">
                    {isSelected ? 'Viewing Evidence' : 'Reveal Evidence'}
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================== */}
      {/* 4. STORY TIMELINE */}
      {/* ================================================== */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#69E1D4]">
              <Clock className="w-3.5 h-3.5 text-[#69E1D4]" />
              <span>Progressive Narrative Flow</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#171522] tracking-tight mt-1">
              STORY TIMELINE
            </h2>
          </div>
          <span className="text-xs font-mono text-[#665F78]">
            Click any chapter to filter the verified media below
          </span>
        </div>

        {/* Stepped Progressive Flow Container */}
        <div className="relative rounded-[32px] p-6 sm:p-10 bg-white/70 backdrop-blur-md border border-[#B8A7FF]/35 shadow-[0_12px_36px_rgba(59,38,126,0.06)] overflow-hidden">
          <div className="space-y-8">
            {(activeCapsule.chapters || []).map((chapter, idx, arr) => {
              const isSelected = selectedChapterId === chapter.id;
              const isLast = idx === arr.length - 1;

              return (
                <div key={chapter.id} className="relative">
                  <div
                    onClick={() => handleSelectChapter(chapter)}
                    className={`group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl transition-all duration-300 cursor-pointer border ${
                      isSelected
                        ? 'bg-gradient-to-r from-white to-[#F6F3FF] border-[#6D5DFB] shadow-md ring-2 ring-[#6D5DFB]/30'
                        : 'bg-white/80 hover:bg-white border-[#B8A7FF]/25 hover:border-[#6D5DFB]/40 hover:shadow-sm'
                    }`}
                  >
                    {/* Chapter Number & Title */}
                    <div className="flex items-start sm:items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-bold text-sm shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-gradient-to-tr from-[#6D5DFB] to-[#3B267E] text-white shadow-sm'
                            : 'bg-[#6D5DFB]/10 text-[#6D5DFB] group-hover:bg-[#6D5DFB]/20'
                        }`}
                      >
                        0{chapter.order || idx + 1}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-lg sm:text-xl font-bold text-[#171522] group-hover:text-[#6D5DFB] transition-colors">
                            {chapter.title}
                          </h3>
                          {isSelected && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6D5DFB] text-white font-mono uppercase">
                              Active Filter
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-[#665F78] max-w-2xl leading-relaxed">
                          {chapter.description}
                        </p>
                      </div>
                    </div>

                    {/* Chapter metadata button */}
                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      <span className="text-xs font-mono text-[#665F78] px-3 py-1 rounded-full bg-[#3B267E]/5">
                        {chapter.mediaIds.length} {chapter.mediaIds.length === 1 ? 'media' : 'media'}
                      </span>
                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-[#6D5DFB] text-white'
                            : 'bg-[#6D5DFB]/10 text-[#6D5DFB] hover:bg-[#6D5DFB]/20'
                        }`}
                      >
                        <span>{isSelected ? 'Selected' : 'Filter Evidence'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Down Arrow between chapters */}
                  {!isLast && (
                    <div className="flex justify-center my-3 text-[#6D5DFB]/60">
                      <div className="flex flex-col items-center">
                        <div className="w-0.5 h-3 bg-gradient-to-b from-[#6D5DFB]/40 to-[#6D5DFB]" />
                        <ArrowDown className="w-4 h-4 text-[#6D5DFB] -my-1" />
                        <div className="w-0.5 h-3 bg-gradient-to-b from-[#6D5DFB] to-[#6D5DFB]/40" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 5. MEMORY EVIDENCE */}
      {/* ================================================== */}
      <section id="memory-evidence-section" className="space-y-6 scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-white/80 backdrop-blur-md border border-[#B8A7FF]/35">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#6D5DFB]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#69E1D4]" />
              <span>Authentic Cloudinary Storage</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#171522] tracking-tight mt-1 flex items-center gap-2">
              <span>MEMORY EVIDENCE</span>
              <span className="text-sm font-mono font-normal text-[#665F78]">
                ({displayedEvidence.length} {displayedEvidence.length === 1 ? 'item' : 'items'})
              </span>
            </h2>
          </div>

          {/* Active selection badge & filter controls */}
          <div className="flex flex-wrap items-center gap-2">
            {activeFilterName && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6D5DFB]/10 border border-[#6D5DFB]/30 text-xs text-[#6D5DFB]">
                <Filter className="w-3.5 h-3.5" />
                <span className="font-medium">{activeFilterName}</span>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="hover:text-red-500 font-bold ml-1 cursor-pointer"
                  title="Clear filter"
                >
                  ×
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setFilterMode((prev) => (prev === 'all' ? 'filtered' : 'all'))}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterMode === 'filtered'
                  ? 'bg-[#3B267E] text-white'
                  : 'bg-white border border-[#B8A7FF]/40 text-[#665F78] hover:text-[#171522]'
              }`}
            >
              <span>{filterMode === 'filtered' ? 'Filtered View' : 'Show All'}</span>
            </button>
          </div>
        </div>

        {/* Evidence Media Cards Grid */}
        {displayedEvidence.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white/60 border border-[#B8A7FF]/30">
            <p className="text-sm text-[#665F78]">
              No media assets match the active filter.
            </p>
            <button
              type="button"
              onClick={clearSelection}
              className="mt-3 text-xs font-semibold text-[#6D5DFB] hover:underline cursor-pointer"
            >
              Clear filter and view all evidence
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedEvidence.map((item) => {
              const isHighlighted = activeHighlightedMediaIds
                ? activeHighlightedMediaIds.has(item.id)
                : false;
              const hasFilterActive = Boolean(activeHighlightedMediaIds);
              const isVideo = item.type === 'video';
              const imageUrl = item.secure_url || item.cloudinaryAsset?.secure_url;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectMedia(item)}
                  className={`group relative rounded-3xl overflow-hidden bg-white border transition-all duration-300 cursor-pointer flex flex-col ${
                    isHighlighted
                      ? 'border-[#6D5DFB] ring-4 ring-[#6D5DFB]/30 shadow-[0_16px_40px_rgba(109,93,251,0.25)] scale-[1.02]'
                      : hasFilterActive
                      ? 'border-white/80 opacity-60 hover:opacity-100'
                      : 'border-[#B8A7FF]/30 hover:border-[#6D5DFB]/60 shadow-[0_8px_24px_rgba(59,38,126,0.06)] hover:shadow-[0_16px_36px_rgba(59,38,126,0.12)]'
                  }`}
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-[#2E1A5B] to-[#140E26]">
                    {imageUrl ? (
                      <img
                        src={getOptimizedImageUrl(imageUrl, { width: 640, crop: 'fill' })}
                        alt={item.title || item.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${item.coverGradient} flex items-center justify-center`}>
                        <Sparkles className="w-8 h-8 text-white/50" />
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

                    {/* Top Type & Time Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20">
                        {isVideo ? <Film className="w-3 h-3 text-[#69E1D4]" /> : <Camera className="w-3 h-3 text-[#F4A7D8]" />}
                        <span>{isVideo ? 'Video' : 'Photo'}</span>
                      </span>

                      {item.time && (
                        <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white/90">
                          {item.time}
                        </span>
                      )}
                    </div>

                    {/* Highlight Badge */}
                    {isHighlighted && (
                      <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-[#6D5DFB] text-white text-[10px] font-mono font-semibold uppercase tracking-wider shadow-sm">
                        Direct Evidence
                      </div>
                    )}

                    {/* Hover Inspect Icon */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="p-2 rounded-full bg-white/90 text-[#3B267E] shadow-sm flex items-center justify-center">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm text-[#171522] group-hover:text-[#6D5DFB] transition-colors line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-xs text-[#665F78] line-clamp-2 leading-relaxed">
                        {item.context || item.aiInsight?.description || item.filename}
                      </p>
                    </div>

                    {/* Tags / Metadata */}
                    <div className="pt-2 border-t border-[#3B267E]/8 flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono text-[#665F78]">
                      <span className="truncate max-w-[140px]">
                        {item.aiInsight?.activity || item.tags?.[0] || 'Moments'}
                      </span>
                      <span>{item.size}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
