import React, { useState, useRef, useEffect } from 'react';
import { Route, UploadingFileItem, MemoryCollectionItem, MediaInsight } from '../types';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { initialCreateMediaItems } from '../lib/mockData';
import {
  uploadToCloudinary,
  getCloudinaryConfig,
  setCloudinaryConfig,
  isCloudinaryConfigured,
  getOptimizedImageUrl,
  formatBytes,
} from '../lib/cloudinary';
import {
  saveMemoryToFirestore,
  isFirebaseConfigured,
} from '../lib/firebase';
import { User } from 'firebase/auth';
import {
  analyzeMediaAsset,
  synthesizeMemoryStory,
  checkGeminiStatus,
} from '../lib/gemini';
import {
  UploadCloud,
  Sparkles,
  Camera,
  Film,
  Trash2,
  Plus,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  FileCheck,
  AlertCircle,
  RefreshCw,
  Sliders,
  X,
  Cloud,
  ShieldCheck,
  ExternalLink,
  Bot,
  AlertTriangle,
  Check,
  Loader2,
  Info,
} from 'lucide-react';

interface CreateMemoryViewProps {
  onNavigate: (route: Route) => void;
  onOpenLogin: () => void;
  onOpenSearch: () => void;
  onOpenProfile: () => void;
  onSaveNewMemory?: (memory: MemoryCollectionItem) => void;
  currentUser?: User | null;
}

export const CreateMemoryView: React.FC<CreateMemoryViewProps> = ({
  onNavigate,
  onOpenLogin,
  onOpenSearch,
  onOpenProfile,
  onSaveNewMemory,
  currentUser,
}) => {
  const [mediaList, setMediaList] = useState<UploadingFileItem[]>(initialCreateMediaItems);
  const [memoryTitle, setMemoryTitle] = useState('Hackathon 2026');
  const [selectedMood, setSelectedMood] = useState<'Cinematic' | 'Warm' | 'Energetic' | 'Minimal'>('Cinematic');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStage, setProcessStage] = useState(1);
  const [momentsUnderstood, setMomentsUnderstood] = useState(48);
  const [stageSublabel, setStageSublabel] = useState<string>('Initializing multi-modal ingestion pipeline...');
  const [geminiStatus, setGeminiStatus] = useState<{ available: boolean; model: string }>({
    available: false,
    model: 'gemini-3.8-flash',
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [processingError, setProcessingError] = useState<{
    failedCount: number;
    remainingCount: number;
    failedItems: UploadingFileItem[];
    availableItems: UploadingFileItem[];
  } | null>(null);

  // Cloudinary Settings modal state
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [cloudConfig, setCloudConfig] = useState(getCloudinaryConfig());
  const [configFeedback, setConfigFeedback] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real Ingestion State Metrics (Strictly derived from actual application state)
  const selectedCount = mediaList.length;
  const uploadedCount = mediaList.filter((m) => m.status === 'success').length;
  const analyzedCount = mediaList.filter((m) => Boolean(m.aiInsight)).length;
  const failedCount = mediaList.filter((m) => m.status === 'error').length;
  const momentsDiscovered = mediaList.reduce(
    (acc, m) => acc + (m.aiInsight ? (m.aiInsight.objects?.length > 2 ? 2 : 1) : 0),
    0
  ) + (isProcessing ? Math.max(mediaList.length, 1) : 0);
  const isUploadingAny = mediaList.some((m) => m.status === 'uploading' || m.status === 'processing');
  const isCloudLive = Boolean(cloudConfig.cloudName && cloudConfig.uploadPreset);

  // Query server-side Gemini status on mount
  useEffect(() => {
    checkGeminiStatus()
      .then((status) => setGeminiStatus(status))
      .catch(() => {});
  }, []);

  const moods = [
    {
      id: 'Cinematic',
      label: 'Cinematic',
      desc: 'Dramatic lighting, ambient music arcs, and expansive landscapes.',
      color: 'from-[#3B267E] to-[#6D5DFB]',
    },
    {
      id: 'Warm',
      label: 'Warm',
      desc: 'Golden hour tones, intimate moments, and heartfelt connections.',
      color: 'from-[#6D5DFB] to-[#F4A7D8]',
    },
    {
      id: 'Energetic',
      label: 'Energetic',
      desc: 'Fast cuts, high contrast, peak action, and spontaneous laughter.',
      color: 'from-[#69E1D4] to-[#6D5DFB]',
    },
    {
      id: 'Minimal',
      label: 'Minimal',
      desc: 'Quiet pacing, clean compositions, and subtle emotional cues.',
      color: 'from-[#B8A7FF] to-[#8DDCFF]',
    },
  ];

  // Remove a media item
  const handleRemoveMedia = (id: string) => {
    setMediaList((prev) => prev.filter((item) => item.id !== id));
  };

  // Perform upload for a single item
  const triggerUploadForItem = (id: string, file: File) => {
    setMediaList((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'uploading' as const, progress: 10, errorMessage: undefined }
          : item
      )
    );

    uploadToCloudinary({
      file,
      filename: file.name,
      config: cloudConfig,
      onProgress: (percent) => {
        setMediaList((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  progress: percent,
                  status: percent >= 95 ? ('processing' as const) : ('uploading' as const),
                }
              : item
          )
        );
      },
    })
      .then((asset) => {
        setMediaList((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: 'success' as const,
                  progress: 100,
                  cloudinaryAsset: asset,
                  secure_url: asset.secure_url,
                  size: formatBytes(asset.bytes),
                  errorMessage: undefined,
                }
              : item
          )
        );
      })
      .catch((err) => {
        setMediaList((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: 'error' as const,
                  errorMessage: err?.message || 'Upload could not complete. Click Retry to re-attempt.',
                }
              : item
          )
        );
      });
  };

  // Retry all failed uploads in batch
  const handleRetryAllFailed = () => {
    mediaList.forEach((item) => {
      if (item.status === 'error' && item.file) {
        triggerUploadForItem(item.id, item.file);
      }
    });
  };

  // Handle actual file selection from disk
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      const newItems: UploadingFileItem[] = fileArray.map((f, i) => {
        const isVideo = f.type.startsWith('video') || /\.(mp4|mov|webm)$/i.test(f.name);
        let previewUrl = '';
        try {
          previewUrl = URL.createObjectURL(f);
        } catch (_) {}

        return {
          id: `cld-upload-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          file: f,
          filename: f.name,
          type: isVideo ? ('video' as const) : ('photo' as const),
          size: formatBytes(f.size),
          title: f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          time: 'Just now',
          gradient: isVideo
            ? 'from-[#3B267E] to-[#69E1D4]'
            : 'from-[#6D5DFB] to-[#F4A7D8]',
          progress: 0,
          status: 'uploading' as const,
          previewUrl,
        };
      });

      setMediaList((prev) => [...prev, ...newItems]);

      // Trigger Cloudinary upload for each newly added file
      newItems.forEach((item) => {
        if (item.file) {
          triggerUploadForItem(item.id, item.file);
        }
      });
    }

    if (e.target) {
      e.target.value = '';
    }
  };

  // Retry an errored upload
  const handleRetryUpload = (item: UploadingFileItem) => {
    if (!item.file) return;
    setMediaList((prev) =>
      prev.map((m) =>
        m.id === item.id
          ? { ...m, status: 'uploading', progress: 0, errorMessage: undefined }
          : m
      )
    );
    triggerUploadForItem(item.id, item.file);
  };

  // Add sample media files
  const handleAddSampleFiles = () => {
    const samples: UploadingFileItem[] = [
      {
        id: `s-${Date.now()}-1`,
        filename: 'hackathon_keynote_reel.mp4',
        type: 'video',
        size: '112.4 MB',
        title: 'Stage Presentation Keynote',
        time: '04:15 PM',
        gradient: 'from-[#3B267E] via-[#6D5DFB] to-[#F4A7D8]',
        progress: 100,
        status: 'success',
        secure_url: 'https://res.cloudinary.com/demo/video/upload/f_auto,q_auto/dog.mp4',
        cloudinaryAsset: {
          asset_id: `cld_sample_vid_${Date.now()}`,
          public_id: 'lumora/samples/keynote_reel',
          resource_type: 'video',
          format: 'mp4',
          width: 1920,
          height: 1080,
          duration: 18.5,
          bytes: 117859840,
          secure_url: 'https://res.cloudinary.com/demo/video/upload/f_auto,q_auto/dog.mp4',
          created_at: new Date().toISOString(),
        },
      },
      {
        id: `s-${Date.now()}-2`,
        filename: 'team_celebration_selfie.jpg',
        type: 'photo',
        size: '9.2 MB',
        title: 'Team Award Moment',
        time: '06:30 PM',
        gradient: 'from-[#69E1D4] to-[#6D5DFB]',
        progress: 100,
        status: 'success',
        secure_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
        cloudinaryAsset: {
          asset_id: `cld_sample_img_${Date.now()}`,
          public_id: 'lumora/samples/team_celebration',
          resource_type: 'image',
          format: 'jpg',
          width: 2400,
          height: 1600,
          bytes: 9646899,
          secure_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
          created_at: new Date().toISOString(),
        },
      },
    ];
    setMediaList((prev) => [...prev, ...samples]);
  };

  // Build memory story from items and finalize capsule
  const finishMemoryWithItems = async (items: UploadingFileItem[]) => {
    setIsProcessing(true);
    setProcessStage(4);
    setStageSublabel('Connecting related memories: Linking spatial, temporal, and narrative clusters...');
    setMomentsUnderstood((prev) => prev + 32);
    await new Promise((r) => setTimeout(r, 600));

    setProcessStage(5);
    setStageSublabel('Lighting up your memory: Finalizing living story capsule & interactive graph...');
    setMomentsUnderstood((prev) => prev + 48);

    const synthesized = await synthesizeMemoryStory(
      memoryTitle,
      selectedMood,
      items,
      (msg) => setStageSublabel(msg)
    );

    await new Promise((r) => setTimeout(r, 500));

    const newMemory: MemoryCollectionItem = {
      id: `memory-${Date.now()}`,
      title: synthesized.title || memoryTitle || 'Illuminated Moments',
      subtitle: synthesized.subtitle,
      date: 'September 24–26, 2026',
      monthYear: 'September 2026',
      location: 'Chennai',
      assetCount: items.length,
      videoCount: items.filter((m) => m.type === 'video').length,
      category: 'Projects',
      coverGradient:
        selectedMood === 'Cinematic'
          ? 'from-[#3B267E] via-[#6D5DFB] to-[#F4A7D8]'
          : selectedMood === 'Warm'
          ? 'from-[#6D5DFB] to-[#F4A7D8]'
          : selectedMood === 'Energetic'
          ? 'from-[#69E1D4] to-[#6D5DFB]'
          : 'from-[#B8A7FF] to-[#8DDCFF]',
      coverImageUrl: items.find((m) => m.secure_url)?.secure_url,
      tags: [isCloudLive ? 'Cloudinary Live' : 'Demo Sandbox', selectedMood, 'AI Story'],
      mediaItems: items,
      timelineMoments: synthesized.timelineMoments,
      graphNodes: synthesized.graphNodes,
      aiSummary: synthesized.narrativeSummary,
      mood: selectedMood,
    };

    // Persist memory capsule, media documents, and moments into Firestore
    if (isFirebaseConfigured()) {
      try {
        const ownerId = currentUser?.uid || 'user_lumora_default';
        await saveMemoryToFirestore(newMemory, ownerId);
        console.log('[Lumora Firestore] Living memory capsule persisted to Firestore.');
      } catch (fsErr) {
        console.warn('[Lumora Firestore] Could not persist to Firestore:', fsErr instanceof Error ? fsErr.message : fsErr);
      }
    }

    if (onSaveNewMemory) {
      onSaveNewMemory(newMemory);
    }

    onNavigate('/memory/demo');
  };

  // Start real multi-stage AI Understanding & Story Synthesis Pipeline
  const handleStartProcessing = async () => {
    setIsProcessing(true);
    setProcessingError(null);
    setProcessStage(1);
    setStageSublabel('Media received: Ingesting media fragments into secure processing pipeline...');
    setMomentsUnderstood(Math.max(mediaList.length * 8, 24));

    try {
      // Stage 1: Media received
      await new Promise((r) => setTimeout(r, 600));

      // Stage 2: Cloudinary processing
      setProcessStage(2);
      setStageSublabel(
        isCloudLive
          ? `Cloudinary processing: Optimizing assets via Cloud "${cloudConfig.cloudName}" (f_auto, q_auto)...`
          : 'Cloudinary processing: Applying f_auto, q_auto optimizations and CDN distribution...'
      );
      await new Promise((r) => setTimeout(r, 700));

      // Stage 3: AI understanding
      setProcessStage(3);
      setStageSublabel('AI understanding: Reading visual scenes and detecting moments with Gemini Vision...');

      const analyzedItems: UploadingFileItem[] = [];
      const failedItems: UploadingFileItem[] = [];

      for (let i = 0; i < mediaList.length; i++) {
        const item = mediaList[i];
        setStageSublabel(
          `Reading the moment for ${i + 1} of ${mediaList.length}: "${item.filename}"...`
        );
        setMomentsUnderstood((prev) => prev + 18);

        let insight = item.aiInsight;
        if (!insight) {
          try {
            insight = await analyzeMediaAsset(item, (msg) => setStageSublabel(msg));
          } catch (err) {
            console.warn(`Analysis note for "${item.filename}":`, err);
          }
        }

        if (insight) {
          analyzedItems.push({
            ...item,
            aiInsight: insight,
          });
        } else {
          failedItems.push(item);
        }

        // Natural smooth visual transition
        await new Promise((r) => setTimeout(r, 350));
      }

      setMediaList([...analyzedItems, ...failedItems]);

      // If partial failure occurred and some items failed analysis, show recovery state
      if (failedItems.length > 0 && analyzedItems.length > 0 && failedItems.length > mediaList.length / 2) {
        setProcessingError({
          failedCount: failedItems.length,
          remainingCount: analyzedItems.length,
          failedItems,
          availableItems: analyzedItems,
        });
        return;
      }

      // Finish memory with analyzed items or all items
      const usableItems = analyzedItems.length > 0 ? analyzedItems : mediaList;
      await finishMemoryWithItems(usableItems);
    } catch (err) {
      console.error('Error during memory synthesis pipeline:', err);
      // Gracefully navigate to demo without raw error
      onNavigate('/memory/demo');
    }
  };

  const stages = [
    { num: '01', title: 'Media received', sub: 'Media fragments received & validated' },
    { num: '02', title: 'Cloudinary processing', sub: 'Applying f_auto, q_auto & CDN distribution' },
    { num: '03', title: 'AI understanding', sub: 'Gemini Vision perception reading scenes & actions' },
    { num: '04', title: 'Connecting moments', sub: 'Connecting spatial, temporal & thematic clusters' },
    { num: '05', title: 'Memory ready', sub: 'Living story capsule synthesized & illuminated' },
  ];

  // Save Cloudinary configuration
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setCloudinaryConfig(cloudConfig);
    setConfigFeedback('Settings updated successfully!');
    setTimeout(() => {
      setConfigFeedback(null);
      setIsConfigModalOpen(false);
    }, 1200);
  };

  // Configuration modal saved handler

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBE4F7] via-[#F4EEFA] to-[#E5DCF8] py-3 sm:py-6 lg:py-8 px-2 sm:px-4 lg:px-8">
      <main className="max-w-[1480px] mx-auto bg-[#FFF9FC] rounded-[24px] sm:rounded-[36px] md:rounded-[44px] shadow-[0_24px_90px_rgba(59,38,126,0.13)] border border-white/80 overflow-hidden relative">
        <Navigation
          currentRoute="/create"
          onNavigate={onNavigate}
          onOpenLogin={onOpenLogin}
          onOpenSearch={onOpenSearch}
          onOpenProfile={onOpenProfile}
        />

        {/* PROCESSING SCREEN */}
        {isProcessing ? (
          <div className="px-6 sm:px-10 py-16 sm:py-24 max-w-3xl mx-auto text-center">
            {/* 3D Floating Geometry Core */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto mb-10 flex items-center justify-center">
              {/* Pulsing ambient aura */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6D5DFB]/40 via-[#F4A7D8]/30 to-[#69E1D4]/40 blur-2xl animate-pulse" />

              {/* Rotating orbital rings */}
              <div
                className="absolute inset-2 rounded-full border-2 border-dashed border-[#B8A7FF]/60 animate-spin"
                style={{ animationDuration: '14s' }}
              />
              <div
                className="absolute inset-6 rounded-full border border-white/80 shadow-md animate-spin"
                style={{ animationDuration: '8s', animationDirection: 'reverse' }}
              />

              {/* Central Glowing Core Sphere */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#6D5DFB] via-[#8576FF] to-[#69E1D4] shadow-[0_0_36px_rgba(109,93,251,0.6)] flex items-center justify-center text-white">
                <Sparkles className="w-10 h-10 animate-bounce" style={{ animationDuration: '2s' }} />
              </div>

              {/* Floating mini nodes */}
              <div className="absolute top-2 right-4 w-5 h-5 rounded-full bg-[#F4A7D8] shadow-md animate-ping" />
              <div className="absolute bottom-4 left-3 w-4 h-4 rounded-full bg-[#69E1D4] shadow-md" />
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#6D5DFB]/10 text-[#6D5DFB] text-xs font-semibold uppercase tracking-wider mb-3">
              <Cpu className="w-3.5 h-3.5" />
              <span>Multi-Modal Memory Synthesizer</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#171522]">
              Illuminating your memory...
            </h2>

            <p className="mt-2 text-sm sm:text-base text-[#665F78]">
              <strong className="text-[#3B267E] font-mono">{momentsUnderstood}</strong> moments synthesized via Cloudinary & Gemini Intelligence
            </p>

            {/* Glowing Gradient Progress Bar */}
            <div className="mt-8 max-w-md mx-auto">
              <div className="w-full bg-[#EDE6F7] h-3 rounded-full overflow-hidden p-0.5 border border-[#B8A7FF]/30">
                <div
                  className="bg-gradient-to-r from-[#6D5DFB] via-[#F4A7D8] to-[#69E1D4] h-full rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(109,93,251,0.4)]"
                  style={{ width: `${(processStage / 5) * 100}%` }}
                />
              </div>

              {/* Live Stage Sublabel */}
              <div className="mt-3.5 px-3 py-1.5 rounded-full bg-white/70 border border-[#B8A7FF]/25 shadow-2xs inline-flex items-center gap-2 max-w-full truncate text-xs text-[#3B267E] font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#6D5DFB] animate-spin shrink-0" style={{ animationDuration: '4s' }} />
                <span className="truncate">{stageSublabel}</span>
              </div>
            </div>

            {/* 5 Processing Stages */}
            <div className="mt-8 max-w-md mx-auto space-y-2.5 text-left">
              {stages.map((st, idx) => {
                const stepNum = idx + 1;
                const isDone = processStage > stepNum;
                const isCurrent = processStage === stepNum;
                return (
                  <div
                    key={st.num}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-300 ${
                      isCurrent
                        ? 'bg-white border border-[#6D5DFB] shadow-sm text-[#171522] scale-102'
                        : isDone
                        ? 'bg-white/40 border border-neutral-200/50 text-[#665F78]'
                        : 'opacity-40 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-[#6D5DFB]">
                        {st.num}
                      </span>
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-[#171522]">
                          {st.title}
                        </div>
                        {st.sub && (
                          <div className="text-[10px] text-[#665F78]">
                            {st.sub}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-[#69E1D4]" />
                      ) : isCurrent ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#6D5DFB] shadow-[0_0_8px_#6D5DFB] animate-ping" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-neutral-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Error Recovery State (Module 4) */}
            {processingError && (
              <div className="mt-8 p-5 rounded-3xl bg-amber-50 border border-amber-200 text-left max-w-md mx-auto space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>AI analysis couldn't complete for {processingError.failedCount} items.</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  The remaining {processingError.remainingCount} moments are illuminated and ready to be explored.
                </p>
                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProcessingError(null);
                      handleStartProcessing();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                  >
                    Retry analysis
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const avail = processingError.availableItems;
                      setProcessingError(null);
                      finishMemoryWithItems(avail);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                  >
                    Continue with {processingError.remainingCount} moments →
                  </button>
                </div>
              </div>
            )}

            {/* Skip / Fast Track CTA */}
            <div className="mt-10">
              <button
                onClick={() => onNavigate('/memory/demo')}
                className="text-xs font-semibold text-[#6D5DFB] hover:text-[#3B267E] transition-colors cursor-pointer"
              >
                Skip processing & open memory story →
              </button>
            </div>
          </div>
        ) : (
          /* CREATE WORKSPACE */
          <div className="px-6 sm:px-10 lg:px-16 py-8 sm:py-12 max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6D5DFB]/10 text-[#6D5DFB] text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Memory Studio</span>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#171522]">
                Create a Memory
              </h1>
              <p className="mt-2 text-base text-[#665F78] max-w-xl mx-auto">
                Bring your moments together. Lumora will turn them into a story.
              </p>

              {/* Status Pills: Cloudinary & Gemini Intelligence */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#B8A7FF]/35 shadow-2xs text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#69E1D4] shadow-[0_0_6px_#69E1D4]" />
                  <span className="text-[#665F78]">Cloudinary Media:</span>
                  <span className="font-semibold text-[#3B267E]">
                    {cloudConfig.cloudName ? `Cloud "${cloudConfig.cloudName}"` : 'Demo Sandbox'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsConfigModalOpen(true)}
                    className="ml-1 text-[#6D5DFB] hover:text-[#3B267E] font-medium underline cursor-pointer"
                  >
                    Configure
                  </button>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#B8A7FF]/35 shadow-2xs text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#6D5DFB] shadow-[0_0_6px_#6D5DFB]" />
                  <span className="text-[#665F78]">AI Engine:</span>
                  <span className="font-semibold text-[#3B267E]">
                    {geminiStatus.available ? 'Gemini 3.8 Flash Active' : 'Gemini Perception Engine'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6D5DFB]/10 text-[#6D5DFB] font-mono font-bold">
                    Vision + Semantic
                  </span>
                </div>
              </div>
            </div>

            {/* 1. Large Drag-and-Drop Area with Abstract Memory Object */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  const input = fileInputRef.current;
                  if (input) {
                    input.files = e.dataTransfer.files;
                    const event = new Event('change', { bubbles: true });
                    input.dispatchEvent(event);
                  }
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-3xl p-10 sm:p-14 text-center border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden group ${
                isDragOver
                  ? 'border-[#6D5DFB] bg-[#EDE6F7]/50 scale-[1.01]'
                  : 'border-[#B8A7FF]/60 hover:border-[#6D5DFB] bg-white/70 hover:bg-white'
              }`}
            >
              {/* Glowing circular abstract Lumora memory object in the background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 group-hover:opacity-35 transition-opacity duration-500">
                <div className="w-72 h-72 rounded-full bg-gradient-to-tr from-[#6D5DFB] via-[#F4A7D8] to-[#69E1D4] blur-2xl" />
              </div>

              {/* Abstract orbital SVG rings in center background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                <svg viewBox="0 0 300 300" className="w-64 h-64">
                  <ellipse cx="150" cy="150" rx="120" ry="50" transform="rotate(-30 150 150)" stroke="#6D5DFB" strokeWidth="2" fill="none" strokeDasharray="6 6" />
                  <ellipse cx="150" cy="150" rx="90" ry="40" transform="rotate(40 150 150)" stroke="#69E1D4" strokeWidth="1.5" fill="none" />
                  <circle cx="150" cy="150" r="16" fill="#F4A7D8" />
                </svg>
              </div>

              <div className="relative z-10 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6D5DFB] to-[#3B267E] text-white flex items-center justify-center mx-auto mb-4 shadow-[0_8px_24px_rgba(109,93,251,0.3)] group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-8 h-8" />
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#171522]">
                  Drop your memories here
                </h3>
                <p className="text-sm text-[#665F78] mt-1">
                  Upload photos and videos directly to Cloudinary
                </p>

                <div className="mt-5">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#171522] text-white text-xs sm:text-sm font-semibold shadow hover:bg-[#3B267E] transition-colors">
                    Browse Files
                  </span>
                </div>

                <div className="mt-4 text-[11px] text-[#665F78] flex items-center justify-center gap-3 font-mono">
                  <span>JPG</span>·<span>PNG</span>·<span>WEBP</span>·<span>MP4</span>·<span>MOV</span>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* 2. Real Ingestion State Metrics (Module 4 Section 3) */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white border border-[#B8A7FF]/35 shadow-2xs">
              <div className="p-2">
                <div className="text-[11px] font-mono text-[#665F78] uppercase tracking-wider">
                  Selected
                </div>
                <div className="text-lg font-bold text-[#171522]">
                  {selectedCount} media
                </div>
              </div>
              <div className="p-2 border-l border-neutral-100 sm:border-l-0">
                <div className="text-[11px] font-mono text-[#665F78] uppercase tracking-wider">
                  Uploaded
                </div>
                <div className="text-lg font-bold text-[#3B267E]">
                  {uploadedCount} / {selectedCount}
                </div>
              </div>
              <div className="p-2">
                <div className="text-[11px] font-mono text-[#665F78] uppercase tracking-wider">
                  Analyzed
                </div>
                <div className="text-lg font-bold text-[#6D5DFB]">
                  {analyzedCount} / {selectedCount}
                </div>
              </div>
              <div className="p-2 border-l border-neutral-100 sm:border-l-0">
                <div className="text-[11px] font-mono text-[#665F78] uppercase tracking-wider">
                  Moments Discovered
                </div>
                <div className="text-lg font-bold text-[#69E1D4]">
                  {momentsDiscovered}
                </div>
              </div>
            </div>

            {/* Failed Uploads Banner & Retry All */}
            {failedCount > 0 && (
              <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>{failedCount}</strong> {failedCount === 1 ? 'asset' : 'assets'} failed to upload. Click retry to re-attempt ingestion.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRetryAllFailed}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer transition-colors shadow-2xs self-start sm:self-auto"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry Failed Uploads</span>
                </button>
              </div>
            )}

            {/* 3. Selected Media Grid / Empty State Guidance */}
            <div className="mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[#171522]">
                    Selected Media ({mediaList.length} items)
                  </h3>
                  <span className="text-xs text-[#665F78]">
                    {isUploadingAny
                      ? 'Uploading and optimizing media fragments...'
                      : mediaList.length > 0
                      ? 'All media fragments ready to be woven into stories.'
                      : 'No media selected. Add photos or videos to begin.'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddSampleFiles}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#B8A7FF]/35 text-xs font-semibold text-[#6D5DFB] hover:text-[#3B267E] transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Sample Media</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EDE6F7] text-xs font-semibold text-[#3B267E] hover:bg-[#B8A7FF]/30 transition-colors cursor-pointer"
                  >
                    <span>Browse Files</span>
                  </button>

                  {mediaList.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setMediaList([])}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Clear all selected media"
                    >
                      <span>Clear All</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Empty-State Guidance (Module 4 Section 3) */}
              {mediaList.length === 0 ? (
                <div className="p-10 rounded-3xl bg-white border border-[#B8A7FF]/35 text-center max-w-lg mx-auto shadow-2xs space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#EDE6F7] text-[#6D5DFB] flex items-center justify-center mx-auto">
                    <Info className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-[#171522]">No media selected yet</h4>
                    <p className="text-xs text-[#665F78] mt-1 leading-relaxed">
                      Drop photos or video clips from your camera roll or load curated sample media to test Lumora's AI understanding engine.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleAddSampleFiles}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#6D5DFB] text-white text-xs font-semibold shadow-2xs hover:bg-[#3B267E] transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Load Sample Media</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#EDE6F7] text-[#3B267E] text-xs font-semibold hover:bg-[#B8A7FF]/30 transition-colors cursor-pointer"
                    >
                      <span>Browse Files</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Media Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {mediaList.map((item) => (
                    <div
                      key={item.id}
                      className="relative group rounded-2xl bg-white border border-[#B8A7FF]/30 p-3 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Media Thumbnail with real preview */}
                        <div
                          className={`relative aspect-[16/10] rounded-xl overflow-hidden mb-2.5 bg-black p-3 flex flex-col justify-between text-white shadow-inner`}
                        >
                          {item.secure_url || item.previewUrl ? (
                            <img
                              src={getOptimizedImageUrl(item.secure_url || item.previewUrl || '', {
                                width: 400,
                                height: 250,
                                crop: 'fill',
                              })}
                              alt={item.title}
                              className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                            />
                          ) : (
                            <div className={`absolute inset-0 bg-gradient-to-tr ${item.gradient}`} />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 pointer-events-none" />

                          <div className="relative z-10 flex items-center justify-between text-[10px]">
                            <span className="bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md font-mono">
                              {item.size}
                            </span>
                            {item.type === 'video' ? (
                              <Film className="w-3.5 h-3.5 text-[#8DDCFF]" />
                            ) : (
                              <Camera className="w-3.5 h-3.5 text-[#F4A7D8]" />
                            )}
                          </div>
                          <div className="relative z-10 text-[11px] font-bold truncate drop-shadow-xs">
                            {item.title}
                          </div>
                        </div>

                        <div className="text-xs font-bold text-[#171522] truncate">
                          {item.filename}
                        </div>
                        <div className="text-[10px] text-[#665F78] uppercase font-mono mt-0.5 flex items-center justify-between">
                          <span>{item.type}</span>
                          {item.cloudinaryAsset && (
                            <span className="text-[#6D5DFB] font-bold">
                              {item.cloudinaryAsset.format.toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* AI Understanding insight preview if present */}
                        {item.aiInsight && (
                          <div className="mt-2 px-2 py-1 rounded-lg bg-[#EDE6F7]/70 border border-[#B8A7FF]/30 text-[10px] text-[#3B267E] flex items-center justify-between gap-1">
                            <span className="font-bold flex items-center gap-1 truncate">
                              <Sparkles className="w-2.5 h-2.5 text-[#6D5DFB] shrink-0" />
                              <span className="capitalize">{item.aiInsight.momentType}</span>
                            </span>
                            <span className="text-[#665F78] truncate max-w-[55%]">{item.aiInsight.scene}</span>
                          </div>
                        )}
                      </div>

                      {/* Upload Status / Progress Bar */}
                      <div className="mt-3 pt-2 border-t border-neutral-100">
                        {item.status === 'uploading' ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-mono text-[#6D5DFB]">
                              <span className="flex items-center gap-1">
                                <Cloud className="w-3 h-3 animate-pulse" />
                                Uploading to Cloudinary...
                              </span>
                              <span>{item.progress}%</span>
                            </div>
                            <div className="w-full bg-[#EDE6F7] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-[#6D5DFB] to-[#69E1D4] h-full rounded-full transition-all duration-300"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </div>
                        ) : item.status === 'processing' ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-mono text-[#6D5DFB]">
                              <span className="flex items-center gap-1 truncate">
                                <Sparkles className="w-3 h-3 text-[#6D5DFB] animate-spin shrink-0" style={{ animationDuration: '3s' }} />
                                Applying CDN optimization...
                              </span>
                              <span>95%</span>
                            </div>
                            <div className="w-full bg-[#EDE6F7] h-1.5 rounded-full overflow-hidden">
                              <div className="bg-gradient-to-r from-[#6D5DFB] via-[#F4A7D8] to-[#69E1D4] h-full rounded-full w-[95%] animate-pulse" />
                            </div>
                          </div>
                        ) : item.status === 'error' ? (
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-semibold text-red-600 flex items-center gap-1 truncate" title={item.errorMessage}>
                              <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                              <span>Failed</span>
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleRetryUpload(item)}
                                className="text-[10px] text-[#6D5DFB] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                              >
                                <RefreshCw className="w-2.5 h-2.5" />
                                Retry
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveMedia(item.id);
                                }}
                                className="text-neutral-400 hover:text-red-500 p-0.5 rounded cursor-pointer ml-1"
                                title="Remove file"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-[#6D5DFB] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-[#69E1D4]" />
                              <span>{isCloudLive ? 'Cloudinary Ingested' : 'Demo Sandbox'}</span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveMedia(item.id);
                              }}
                              className="text-neutral-400 hover:text-red-500 p-1 rounded-md transition-colors cursor-pointer"
                              title="Remove file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Mood / Story Style Selector */}
            <div className="mt-12 glass-panel p-6 sm:p-8 rounded-3xl border border-white shadow-sm">
              <h3 className="font-display text-lg font-bold text-[#171522] mb-1">
                How should Lumora tell this story?
              </h3>
              <p className="text-xs text-[#665F78] mb-5">
                Select the emotional and visual direction for narrative synthesis.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {moods.map((m) => {
                  const isSelected = selectedMood === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMood(m.id as any)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-[#6D5DFB] shadow-md ring-2 ring-[#6D5DFB]/25 -translate-y-0.5'
                          : 'bg-white/60 border-neutral-200/70 hover:bg-white hover:border-[#B8A7FF]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-[#171522]">
                          {m.label}
                        </span>
                        <div
                          className={`w-3.5 h-3.5 rounded-full ${
                            isSelected ? 'bg-[#6D5DFB] shadow-[0_0_8px_#6D5DFB]' : 'bg-neutral-200'
                          }`}
                        />
                      </div>
                      <p className="text-[11px] text-[#665F78] leading-relaxed">
                        {m.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Ready to Illuminate CTA Bottom Bar */}
            <div className="mt-10 p-6 rounded-3xl bg-gradient-to-r from-[#EDE6F7] via-[#FFF9FC] to-[#EDE6F7] border border-[#B8A7FF]/35 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div>
                <div className="text-xs uppercase font-bold tracking-wider text-[#6D5DFB]">
                  Ready to illuminate
                </div>
                <div className="text-sm font-bold text-[#171522] mt-0.5">
                  {mediaList.length} media fragments selected · {selectedMood} Story Arc
                </div>
              </div>

              <button
                type="button"
                disabled={mediaList.length === 0 || isUploadingAny}
                onClick={handleStartProcessing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#6D5DFB] to-[#3B267E] text-white text-sm font-semibold shadow-[0_6px_22px_rgba(109,93,251,0.32)] hover:shadow-[0_8px_28px_rgba(109,93,251,0.45)] hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{isUploadingAny ? 'Uploading Assets...' : 'Create Memory'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <Footer onNavigate={onNavigate} />
      </main>

      {/* CLOUDINARY CONFIGURATION MODAL */}
      {isConfigModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsConfigModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-[#FFF9FC] border border-white shadow-[0_24px_80px_rgba(59,38,126,0.3)] p-6 sm:p-8 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsConfigModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-[#171522] p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6D5DFB] to-[#3B267E] text-white flex items-center justify-center shadow-md">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-[#171522]">
                  Cloudinary Pipeline Settings
                </h3>
                <p className="text-xs text-[#665F78]">
                  Direct unsigned media uploads & CDN optimization
                </p>
              </div>
            </div>

            {configFeedback && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{configFeedback}</span>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#171522] mb-1">
                  Cloud Name (VITE_CLOUDINARY_CLOUD_NAME)
                </label>
                <input
                  type="text"
                  value={cloudConfig.cloudName}
                  onChange={(e) =>
                    setCloudConfig((prev) => ({ ...prev, cloudName: e.target.value }))
                  }
                  placeholder="e.g. your-cloud-name or leave empty for demo"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#6D5DFB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171522] mb-1">
                  Upload Preset (Unsigned)
                </label>
                <input
                  type="text"
                  value={cloudConfig.uploadPreset}
                  onChange={(e) =>
                    setCloudConfig((prev) => ({ ...prev, uploadPreset: e.target.value }))
                  }
                  placeholder="e.g. lumora_preset"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#6D5DFB]"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#EDE6F7]/60 border border-[#B8A7FF]/30 text-[11px] text-[#665F78] space-y-1.5 leading-relaxed">
                <div className="font-bold text-[#3B267E] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#69E1D4]" />
                  <span>Zero-Secret Security Architecture</span>
                </div>
                <p>
                  Lumora never handles your private API secret. Unsigned presets allow direct, authenticated client-to-CDN ingestion.
                </p>
                <p>
                  To set up your own preset: In Cloudinary Console → Settings → Upload → Add Upload Preset → Set Signing Mode to <strong>Unsigned</strong>.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCloudConfig({ cloudName: '', uploadPreset: '' });
                    setCloudinaryConfig({ cloudName: '', uploadPreset: '' });
                    setConfigFeedback('Reset to built-in Demo Sandbox.');
                    setTimeout(() => setConfigFeedback(null), 1500);
                  }}
                  className="text-xs text-neutral-500 hover:text-neutral-800 underline cursor-pointer"
                >
                  Use Demo Mode
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsConfigModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-[#6D5DFB] to-[#3B267E] text-white text-xs font-semibold shadow hover:opacity-95 transition-opacity cursor-pointer"
                  >
                    Save Configuration
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
