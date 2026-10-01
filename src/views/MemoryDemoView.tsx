import React, { useState, useMemo, useEffect } from 'react';
import {
  Route,
  MediaDetailItem,
  GraphNodeItem,
  MemoryCollectionItem,
  TimelineMoment,
  ConversationTurn,
} from '../types';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { MediaDetailModal } from '../components/MediaDetailModal';
import { mockTimelineMoments, mockMediaDetails, mockGraphNodes } from '../lib/mockData';
import { askMemoryStory } from '../lib/gemini';
import { LivingTimelineView } from '../components/memory/LivingTimelineView';
import { MemoryConstellationView } from '../components/memory/MemoryConstellationView';
import { MemoryRecallStudioView } from '../components/memory/MemoryRecallStudioView';
import { Clock, Network, MessageSquareText, Sparkles, Layers, Plus } from 'lucide-react';
import {
  saveConversationToFirestore,
  loadConversationsFromFirestore,
  isFirebaseConfigured,
} from '../lib/firebase';
import { User } from 'firebase/auth';

interface MemoryDemoViewProps {
  onNavigate: (route: Route) => void;
  onOpenLogin: () => void;
  onOpenSearch: () => void;
  onOpenProfile: () => void;
  memory?: MemoryCollectionItem | null;
  onSelectMemory?: (memory: MemoryCollectionItem) => void;
  availableMemories?: MemoryCollectionItem[];
  currentUser?: User | null;
  isDemoMode?: boolean;
  onOpenDemoMode?: () => void;
  onExitDemoMode?: () => void;
}

export const MemoryDemoView: React.FC<MemoryDemoViewProps> = ({
  onNavigate,
  onOpenLogin,
  onOpenSearch,
  onOpenProfile,
  memory,
  onSelectMemory,
  availableMemories,
  currentUser,
  isDemoMode = false,
  onOpenDemoMode,
  onExitDemoMode,
}) => {
  const [activeMode, setActiveMode] = useState<'timeline' | 'graph' | 'ask'>('timeline');

  const isExplicitDemo = isDemoMode || Boolean(memory?.isDemo);

  // Selected media for MediaDetailModal
  const [selectedMediaDetail, setSelectedMediaDetail] = useState<MediaDetailItem | null>(null);

  // Dynamic moments from active memory or fallback for demo
  const timelineMoments: TimelineMoment[] = useMemo(() => {
    if (memory?.timelineMoments && memory.timelineMoments.length > 0) {
      return isExplicitDemo
        ? memory.timelineMoments
        : memory.timelineMoments.filter((m) => Boolean(m.secure_url));
    }
    if (memory?.mediaItems && memory.mediaItems.length > 0) {
      const validItems = isExplicitDemo
        ? memory.mediaItems
        : memory.mediaItems.filter((item) => Boolean(item.secure_url || item.cloudinaryAsset?.secure_url));

      return validItems.map((item, idx) => ({
        id: item.id,
        time: item.time || `0${idx + 1}:00 PM`,
        title: item.title,
        description:
          item.aiInsight?.description ||
          `Ingested through Cloudinary media pipeline. High perceptual fidelity preserved with semantic tags.`,
        mediaCount: 1,
        mediaType: item.type,
        tags: item.aiInsight?.tags || [item.type === 'video' ? 'Video' : 'Photo', 'Cloudinary', 'Illuminated'],
        context: item.aiInsight?.context || `${item.filename} · ${item.size}`,
        coverGradient: item.gradient || 'from-[#6D5DFB] to-[#F4A7D8]',
        secure_url: item.secure_url || item.cloudinaryAsset?.secure_url,
        cloudinaryAsset: item.cloudinaryAsset,
        relatedMomentIds: [],
        scene: item.aiInsight?.scene,
        activity: item.aiInsight?.activity,
        objects: item.aiInsight?.objects,
        momentType: item.aiInsight?.momentType,
        aiInsight: item.aiInsight,
      }));
    }
    return isExplicitDemo ? mockTimelineMoments : [];
  }, [memory, isExplicitDemo]);

  // Dynamic Graph nodes: if custom memory provided, use its clusters or AI graph nodes
  const effectiveGraphNodes: GraphNodeItem[] = useMemo(() => {
    // Priority: Real MemoryClusters as meaningful graph nodes
    if (memory?.clusters && memory.clusters.length > 0) {
      const colors = ['#6D5DFB', '#69E1D4', '#F4A7D8', '#B8A7FF', '#8DDCFF'];
      const total = memory.clusters.length;
      return memory.clusters.map((cluster, idx) => {
        const angle = (idx / Math.max(1, total)) * 2 * Math.PI - Math.PI / 2;
        const x = Math.round(50 + 26 * Math.cos(angle));
        const y = Math.round(50 + 22 * Math.sin(angle));

        // Connect sequentially or via shared tags/activities
        const connections: string[] = [];
        if (idx < total - 1) {
          connections.push(memory.clusters![idx + 1].id);
        }
        memory.clusters!.forEach((other, oIdx) => {
          if (oIdx !== idx && !connections.includes(other.id)) {
            const hasSharedTag = cluster.dominantTags?.some((t) => other.dominantTags?.includes(t));
            const hasSharedActivity = cluster.dominantActivities?.some((a) => other.dominantActivities?.includes(a));
            if (hasSharedTag || hasSharedActivity) {
              connections.push(other.id);
            }
          }
        });

        return {
          id: cluster.id,
          label: cluster.title,
          type: (idx === 0 ? 'primary' : 'secondary') as 'primary' | 'secondary',
          category: cluster.dominantActivities?.[0] || 'Story Chapter',
          x,
          y,
          momentCount: cluster.mediaIds?.length || 1,
          description: cluster.narrativeSummary || cluster.subtitle || `${cluster.mediaIds?.length || 1} moments in this cluster`,
          color: colors[idx % colors.length],
          connections,
        };
      });
    }

    if (memory?.graphNodes && memory.graphNodes.length > 0) {
      return memory.graphNodes;
    }
    if (isExplicitDemo) {
      return mockGraphNodes;
    }
    if (timelineMoments.length > 0) {
      return [
        {
          id: 'collaboration',
          label: 'Grounded Moments',
          type: 'primary',
          category: 'Real Captures',
          x: 50,
          y: 45,
          momentCount: timelineMoments.length,
          description: `All ${timelineMoments.length} verified moments ingested via Cloudinary pipeline.`,
          color: '#6D5DFB',
          connections: [],
        },
      ];
    }
    return [];
  }, [memory, isExplicitDemo, timelineMoments]);

  // Selected node in Memory Constellation
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    effectiveGraphNodes[0]?.id || 'collaboration'
  );

  useEffect(() => {
    if (effectiveGraphNodes[0]) {
      setSelectedNodeId(effectiveGraphNodes[0].id);
    }
  }, [effectiveGraphNodes]);

  const activeGraphNode = useMemo(() => {
    return (
      effectiveGraphNodes.find((n) => n.id === selectedNodeId) ||
      effectiveGraphNodes[0] || {
        id: 'overview',
        label: 'Memory Overview',
        type: 'primary',
        category: 'Story Capsule',
        x: 50,
        y: 45,
        momentCount: timelineMoments.length,
        description: 'Story moments grounded in visual evidence.',
        color: '#6D5DFB',
        connections: [],
      }
    );
  }, [effectiveGraphNodes, selectedNodeId, timelineMoments.length]);

  // Ask Your Memory conversational state
  const [askQuery, setAskQuery] = useState<string>(isExplicitDemo ? 'Show our final presentation.' : '');
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [recallPhase, setRecallPhase] = useState<'idle' | 'understanding' | 'searching' | 'synthesizing'>('idle');
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>(() => {
    if (isExplicitDemo) {
      return [
        {
          id: 'turn-1',
          user: 'Show our final presentation.',
          lumora:
            'Your team presented on the main auditorium stage around 05:45 PM. The visual analysis detected stage lighting, dual projection displays, and an engaged audience during the live demonstration.',
          confidence: 'high',
          momentIds: ['moment-presentation', 'moment-breakthrough'],
          mediaIds: ['moment-presentation', 'moment-breakthrough'],
          followUps: [
            'What happened before the presentation?',
            'Show moments with the whole team.',
            'Find photos with laptops.',
            'Show moments related to coding.',
          ],
          relevantGraphNodes: ['presentation', 'collaboration'],
          timestamp: '05:46 PM',
        },
      ];
    }
    return [];
  });
  // Load persistent conversation history from Firestore if memory exists
  useEffect(() => {
    if (memory?.id && isFirebaseConfigured()) {
      loadConversationsFromFirestore(memory.id)
        .then((turns) => {
          if (turns && turns.length > 0) {
            setConversationHistory(turns);
          } else if (!isExplicitDemo) {
            setConversationHistory([]);
          }
        })
        .catch((err) => {
          console.warn('[Lumora] Error loading conversation history:', err);
        });
    } else if (!isExplicitDemo) {
      setConversationHistory([]);
    }
  }, [memory?.id, isExplicitDemo]);

  const currentTitle = memory?.title || (isExplicitDemo ? 'Hackathon 2026' : 'Living Memory');
  const currentSubtitle =
    memory?.subtitle ||
    (isExplicitDemo
      ? 'From the first idea to the final presentation. An unbroken narrative arc of high-intensity collaboration, 3D shader breakthroughs, and celebration.'
      : 'Personal media story illuminated through Cloudinary CDN and Gemini multimodal intelligence.');
  const currentLocation = memory?.location || 'Personal Archive';
  const currentMonthYear = memory?.monthYear || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const currentAssetCount = memory?.assetCount || timelineMoments.length;
  const currentVideoCount = memory?.videoCount || timelineMoments.filter((m) => m.mediaType === 'video').length;

  // Resolves media item: strictly real Cloudinary assets in Live Mode
  const resolveMediaItem = (id: string): MediaDetailItem | null => {
    if (isExplicitDemo && mockMediaDetails[id]) return mockMediaDetails[id];

    const foundMoment = timelineMoments.find((m) => m.id === id);
    if (foundMoment && (isExplicitDemo || foundMoment.secure_url)) {
      return {
        id: foundMoment.id,
        filename: `${foundMoment.title.toLowerCase().replace(/\s+/g, '_')}.${foundMoment.mediaType === 'video' ? 'mp4' : 'jpg'}`,
        type: foundMoment.mediaType,
        size: foundMoment.cloudinaryAsset ? `${(foundMoment.cloudinaryAsset.bytes / (1024 * 1024)).toFixed(1)} MB` : '4.2 MB',
        title: foundMoment.title,
        time: foundMoment.time,
        context: foundMoment.context || foundMoment.description,
        tags: foundMoment.tags,
        relatedMoments: foundMoment.relatedMomentIds || [],
        coverGradient: foundMoment.coverGradient,
        secure_url: foundMoment.secure_url,
        cloudinaryAsset: foundMoment.cloudinaryAsset,
        scene: foundMoment.scene,
        activity: foundMoment.activity,
        objects: foundMoment.objects,
        momentType: foundMoment.momentType,
        aiInsight: foundMoment.aiInsight,
      };
    }

    if (memory?.mediaItems) {
      const foundItem = memory.mediaItems.find((i) => i.id === id);
      if (foundItem && (isExplicitDemo || foundItem.secure_url || foundItem.cloudinaryAsset?.secure_url)) {
        return {
          id: foundItem.id,
          filename: foundItem.filename,
          type: foundItem.type,
          size: foundItem.size,
          title: foundItem.title,
          time: foundItem.time,
          context: foundItem.aiInsight?.context || foundItem.title,
          tags: foundItem.aiInsight?.tags || ['Illuminated'],
          relatedMoments: [],
          coverGradient: foundItem.gradient || 'from-[#6D5DFB] to-[#F4A7D8]',
          secure_url: foundItem.secure_url || foundItem.cloudinaryAsset?.secure_url,
          cloudinaryAsset: foundItem.cloudinaryAsset,
          scene: foundItem.aiInsight?.scene,
          activity: foundItem.aiInsight?.activity,
          objects: foundItem.aiInsight?.objects,
          momentType: foundItem.aiInsight?.momentType,
          aiInsight: foundItem.aiInsight,
        };
      }
    }

    if (isExplicitDemo) {
      return mockMediaDetails[id] || null;
    }

    return null;
  };

  const handleSelectMoment = (moment: TimelineMoment) => {
    if (isExplicitDemo && mockMediaDetails[moment.id]) {
      const existing = mockMediaDetails[moment.id];
      setSelectedMediaDetail({
        ...existing,
        aiInsight: moment.aiInsight || existing.aiInsight,
        scene: moment.scene || existing.scene,
        activity: moment.activity || existing.activity,
        objects: moment.objects || existing.objects,
        momentType: moment.momentType || existing.momentType,
      });
      return;
    }

    setSelectedMediaDetail({
      id: moment.id,
      filename: moment.title.replace(/\s+/g, '_') + (moment.mediaType === 'video' ? '.mp4' : '.jpg'),
      type: moment.mediaType,
      size: moment.cloudinaryAsset ? `${(moment.cloudinaryAsset.bytes / (1024 * 1024)).toFixed(1)} MB` : '4.8 MB',
      title: moment.title,
      time: moment.time,
      context: moment.context || moment.description,
      tags: moment.tags,
      relatedMoments: [],
      coverGradient: moment.coverGradient,
      secure_url: moment.secure_url,
      cloudinaryAsset: moment.cloudinaryAsset,
      scene: moment.scene,
      activity: moment.activity,
      objects: moment.objects,
      momentType: moment.momentType,
      aiInsight: moment.aiInsight,
    });
  };

  // Curated related media for active graph node: strictly real items in Live Mode
  const relatedMediaForActiveNode: MediaDetailItem[] = useMemo(() => {
    if (isExplicitDemo && !memory?.clusters?.length) {
      return Object.values(mockMediaDetails).slice(0, 4);
    }
    const realItems = memory?.mediaItems || [];
    const validItems = realItems.filter((i) => Boolean(i.secure_url || i.cloudinaryAsset?.secure_url));

    // If active graph node corresponds to a cluster, show that cluster's real media
    const matchingCluster = memory?.clusters?.find((c) => c.id === selectedNodeId);
    const targetItems = matchingCluster
      ? validItems.filter((i) => matchingCluster.mediaIds?.includes(i.id))
      : validItems;

    const itemsToMap = targetItems.length > 0 ? targetItems : validItems;

    return itemsToMap
      .slice(0, 4)
      .map((item) => ({
        id: item.id,
        filename: item.filename,
        type: item.type,
        size: item.size || '4.0 MB',
        title: item.title,
        time: item.time || '04:00 PM',
        context: item.aiInsight?.context || item.title,
        tags: item.aiInsight?.tags || ['Cloudinary'],
        relatedMoments: [],
        coverGradient: item.gradient || 'from-[#6D5DFB] to-[#F4A7D8]',
        secure_url: item.secure_url || item.cloudinaryAsset?.secure_url,
        cloudinaryAsset: item.cloudinaryAsset,
        scene: item.aiInsight?.scene,
        activity: item.aiInsight?.activity,
        objects: item.aiInsight?.objects,
        momentType: item.aiInsight?.momentType,
        aiInsight: item.aiInsight,
      }));
  }, [isExplicitDemo, memory, selectedNodeId]);

  // Execute conversational recall with Gemini
  const executeQuery = async (queryText: string) => {
    const clean = queryText.trim();
    if (!clean || isAsking) return;

    setIsAsking(true);
    setRecallPhase('understanding');

    try {
      const activeMem: MemoryCollectionItem = memory || {
        id: isExplicitDemo ? 'hackathon-2026' : `mem-${Date.now()}`,
        title: currentTitle,
        subtitle: currentSubtitle,
        date: new Date().toLocaleDateString(),
        monthYear: currentMonthYear,
        location: currentLocation,
        assetCount: currentAssetCount,
        videoCount: currentVideoCount,
        category: 'Projects',
        coverGradient: 'from-[#3B267E] to-[#6D5DFB]',
        tags: ['Illuminated', 'Cloudinary'],
        timelineMoments,
        graphNodes: effectiveGraphNodes,
        mediaItems: [],
      };

      setRecallPhase('understanding');
      await new Promise((r) => setTimeout(r, 280));

      setRecallPhase('searching');
      const recallPromise = askMemoryStory(clean, activeMem);
      await new Promise((r) => setTimeout(r, 380));

      setRecallPhase('synthesizing');
      const result = await recallPromise;

      const answerText = result.answer || result.response;
      const mediaList = result.mediaIds?.length ? result.mediaIds : result.momentIds || [];

      const newTurn: ConversationTurn = {
        id: `turn-${Date.now()}`,
        user: clean,
        lumora: answerText,
        confidence: result.confidence || (mediaList.length > 0 ? 'high' : 'low'),
        momentIds: result.momentIds || mediaList,
        mediaIds: mediaList,
        followUps: result.followUps || [
          `Show moments from ${currentTitle}`,
          'Find photos with team members',
          'What was the final outcome?',
        ],
        relevantGraphNodes: result.relevantGraphNodes,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setConversationHistory((prev) => [...prev, newTurn]);

      // Persist conversation turn to Firestore
      if (isFirebaseConfigured() && activeMem.id && !isExplicitDemo) {
        const ownerId = currentUser?.uid || 'user_lumora_default';
        saveConversationToFirestore(activeMem.id, newTurn, ownerId).catch((fsErr) => {
          console.warn('[Lumora] Error saving conversation turn to Firestore:', fsErr);
        });
      }

      setAskQuery('');
    } catch (err) {
      console.error('Ask error:', err);
    } finally {
      setIsAsking(false);
      setRecallPhase('idle');
    }
  };

  const handleAskSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await executeQuery(askQuery);
  };

  const handleSelectSuggestedQuestion = async (q: string) => {
    setAskQuery(q);
    await executeQuery(q);
  };

  // Empty state if in Live Mode and no moments exist
  const isLiveEmpty = !isExplicitDemo && (!memory || timelineMoments.length === 0);

  return (
    <div className="relative min-h-screen bg-[#FFF9FC] overflow-x-hidden py-3 sm:py-6 lg:py-8 px-2 sm:px-4 lg:px-8 selection:bg-[#6D5DFB]/15 selection:text-[#3B267E]">
      {/* 
        PREMIUM GLOSSY AMBIENT BACKGROUND
        Warm white base #FFF9FC with large soft-focus liquid light reflections:
        Lavender #B8A7FF, Purple #6D5DFB, Soft Pink #F4A7D8, Cyan #69E1D4
      */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-[10%] right-[5%] w-[680px] h-[680px] rounded-full bg-gradient-to-br from-[#B8A7FF]/20 via-[#6D5DFB]/10 to-transparent blur-[140px] animate-ambient-1" />
        <div className="absolute top-[32%] -left-[10%] w-[720px] h-[720px] rounded-full bg-gradient-to-tr from-[#69E1D4]/16 via-[#8DDCFF]/12 to-transparent blur-[150px] animate-ambient-3" />
        <div className="absolute bottom-[10%] right-[10%] w-[640px] h-[640px] rounded-full bg-gradient-to-tl from-[#F4A7D8]/18 via-[#B8A7FF]/12 to-transparent blur-[130px] animate-ambient-2" />
      </div>

      {/* Main Luxury Floating Surface */}
      <main className="relative z-10 max-w-[1480px] mx-auto bg-white/85 sm:bg-[#FFF9FC]/90 backdrop-blur-2xl rounded-[28px] sm:rounded-[40px] md:rounded-[48px] shadow-[0_32px_100px_rgba(59,38,126,0.08),0_8px_32px_rgba(109,93,251,0.04),inset_0_1px_2px_rgba(255,255,255,0.95)] border border-white/90 overflow-hidden">
        {/* Navigation */}
        <Navigation
          currentRoute="/memory/demo"
          onNavigate={onNavigate}
          onOpenLogin={onOpenLogin}
          onOpenSearch={onOpenSearch}
          onOpenProfile={onOpenProfile}
          isDemoMode={isExplicitDemo}
          onToggleDemoMode={isExplicitDemo ? onExitDemoMode : onOpenDemoMode}
        />

        <div className="px-6 sm:px-10 lg:px-16 pt-6 pb-16 sm:pb-24">
          {/* Top Capsule Switcher Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-[#3B267E]/8">
            <div className="flex items-center gap-2.5 text-xs text-[#665F78]">
              <span className={`w-2 h-2 rounded-full ${isExplicitDemo ? 'bg-amber-500' : 'bg-[#69E1D4]'} shadow-[0_0_8px_currentColor]`} />
              <span className="font-semibold text-[#171522]">{isExplicitDemo ? 'Demo Story:' : 'Active Memory:'}</span>
              <span className="text-[#6D5DFB] font-medium">{currentTitle}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3B267E]/5 text-[#3B267E] font-mono">
                {isExplicitDemo ? 'Demo Mode' : 'Live Vault'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {availableMemories && availableMemories.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#665F78] hidden sm:inline">
                    Switch:
                  </span>
                  <select
                    value={memory?.id || 'hackathon-2026'}
                    onChange={(e) => {
                      const target = availableMemories.find((m) => m.id === e.target.value);
                      if (target && onSelectMemory) {
                        onSelectMemory(target);
                      }
                    }}
                    className="text-xs bg-white text-[#171522] border border-[#B8A7FF]/40 rounded-full px-3.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#6D5DFB] cursor-pointer shadow-xs font-medium"
                  >
                    {availableMemories.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title} ({m.monthYear})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isExplicitDemo ? (
                onExitDemoMode && (
                  <button
                    onClick={onExitDemoMode}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#6D5DFB] hover:bg-[#3B267E] text-white transition-colors cursor-pointer"
                  >
                    <span>Return to Live Vault</span>
                  </button>
                )
              ) : (
                onOpenDemoMode && (
                  <button
                    onClick={onOpenDemoMode}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#6D5DFB]/10 hover:bg-[#6D5DFB]/20 text-[#6D5DFB] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>View Curated Demo</span>
                  </button>
                )
              )}
            </div>
          </div>

          {isLiveEmpty ? (
            <div className="py-24 px-6 sm:px-12 text-center max-w-2xl mx-auto rounded-[32px] bg-white/70 backdrop-blur-md border border-[#B8A7FF]/30 shadow-[0_16px_50px_rgba(59,38,126,0.06)] my-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-[#6D5DFB]/15 via-[#8576FF]/20 to-[#F4A7D8]/20 flex items-center justify-center text-[#6D5DFB]">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#171522]">
                Your memory is waiting to be illuminated.
              </h2>
              <p className="mt-3 text-base text-[#665F78] max-w-md mx-auto font-normal">
                Upload your photos and videos to construct your first living, intelligent memory capsule with Cloudinary and Gemini.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => onNavigate('/create')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#6D5DFB] to-[#3B267E] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Memory</span>
                </button>
                {onOpenDemoMode && (
                  <button
                    onClick={onOpenDemoMode}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-[#6D5DFB] bg-[#6D5DFB]/10 hover:bg-[#6D5DFB]/20 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Explore Curated Demo</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* ================================================== */}
              {/* PREMIUM GLOBAL MEMORY LENS SELECTOR CONTROL */}
              {/* LIVING TIMELINE | MEMORY GRAPH | ASK YOUR MEMORY */}
              {/* ================================================== */}
              <div id="memory-modes-container" className="scroll-mt-8 mb-12 sm:mb-16">
                <div className="flex justify-center">
                  <nav
                    aria-label="Memory Experience Lenses"
                    className="inline-flex p-1.5 rounded-full bg-white/90 border border-[#B8A7FF]/35 shadow-[0_8px_28px_rgba(59,38,126,0.06)] backdrop-blur-md gap-1"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveMode('timeline')}
                      className={`inline-flex items-center gap-2.5 px-6 sm:px-8 py-3 text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-full transition-all duration-300 cursor-pointer ${
                        activeMode === 'timeline'
                          ? 'bg-gradient-to-r from-[#6D5DFB] to-[#3B267E] text-white shadow-[0_6px_20px_rgba(109,93,251,0.32)] scale-[1.02]'
                          : 'text-[#665F78] hover:text-[#171522] hover:bg-white/60'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>Living Timeline</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveMode('graph')}
                      className={`inline-flex items-center gap-2.5 px-6 sm:px-8 py-3 text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-full transition-all duration-300 cursor-pointer ${
                        activeMode === 'graph'
                          ? 'bg-gradient-to-r from-[#6D5DFB] to-[#3B267E] text-white shadow-[0_6px_20px_rgba(109,93,251,0.32)] scale-[1.02]'
                          : 'text-[#665F78] hover:text-[#171522] hover:bg-white/60'
                      }`}
                    >
                      <Network className="w-4 h-4" />
                      <span>Memory Graph</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveMode('ask')}
                      className={`inline-flex items-center gap-2.5 px-6 sm:px-8 py-3 text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-full transition-all duration-300 cursor-pointer ${
                        activeMode === 'ask'
                          ? 'bg-gradient-to-r from-[#6D5DFB] to-[#3B267E] text-white shadow-[0_6px_20px_rgba(109,93,251,0.32)] scale-[1.02]'
                          : 'text-[#665F78] hover:text-[#171522] hover:bg-white/60'
                      }`}
                    >
                      <MessageSquareText className="w-4 h-4" />
                      <span>Ask Your Memory</span>
                    </button>
                  </nav>
                </div>
              </div>

              {/* ================================================== */}
              {/* LENS 1: LIVING TIMELINE */}
              {/* ================================================== */}
              {activeMode === 'timeline' && (
                <div className="animate-in fade-in duration-300">
                  <LivingTimelineView
                    moments={timelineMoments}
                    memory={memory || undefined}
                    onSelectMoment={handleSelectMoment}
                  />
                </div>
              )}

              {/* ================================================== */}
              {/* LENS 2: MEMORY CONSTELLATION (GRAPH) */}
              {/* ================================================== */}
              {activeMode === 'graph' && (
                <div className="animate-in fade-in duration-300">
                  <MemoryConstellationView
                    nodes={effectiveGraphNodes}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={(id) => setSelectedNodeId(id)}
                    centerTitle={currentTitle}
                    totalMoments={currentAssetCount}
                    activeGraphNode={activeGraphNode}
                    relatedMedia={relatedMediaForActiveNode}
                    onSelectMedia={(item) => setSelectedMediaDetail(item)}
                    onAskAboutNode={(q) => {
                      setAskQuery(q);
                      setActiveMode('ask');
                      const el = document.getElementById('memory-modes-container');
                      el?.scrollIntoView({ behavior: 'smooth' });
                      executeQuery(q);
                    }}
                  />
                </div>
              )}

              {/* ================================================== */}
              {/* LENS 3: ASK YOUR MEMORY (RECALL STUDIO) */}
              {/* ================================================== */}
              {activeMode === 'ask' && (
                <div className="animate-in fade-in duration-300">
                  <MemoryRecallStudioView
                    askQuery={askQuery}
                    setAskQuery={setAskQuery}
                    isAsking={isAsking}
                    recallPhase={recallPhase}
                    conversationHistory={conversationHistory}
                    onSubmitAsk={handleAskSubmit}
                    onSelectSuggestion={handleSelectSuggestedQuestion}
                    resolveMediaItem={resolveMediaItem}
                    onSelectMedia={(item) => setSelectedMediaDetail(item)}
                    onExploreGraphNode={(nodeId) => {
                      setSelectedNodeId(nodeId);
                      setActiveMode('graph');
                      const el = document.getElementById('memory-modes-container');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    currentTitle={currentTitle}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Global Media Detail Modal */}
        <MediaDetailModal
          item={selectedMediaDetail}
          onClose={() => setSelectedMediaDetail(null)}
          onSelectRelatedMoment={(title) => {
            const inMoments = timelineMoments.find((m) => m.title === title);
            if (inMoments) {
              handleSelectMoment(inMoments);
              return;
            }
            if (isExplicitDemo) {
              const found = Object.values(mockMediaDetails).find((m) => m.title === title);
              if (found) setSelectedMediaDetail(found);
            }
          }}
          onViewInTimeline={() => {
            setActiveMode('timeline');
            const el = document.getElementById('memory-modes-container');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Footer */}
        <Footer onNavigate={onNavigate} />
      </main>
    </div>
  );
};
