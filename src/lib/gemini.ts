/**
 * Lumora AI Media Understanding Engine Client Service
 * Interacts with server-side Gemini 3.8 Flash pipeline (/api/gemini/*)
 * Strictly zero API key exposure in browser.
 * Incorporates robust resilience, validation, and heuristic fallback.
 */

import { UploadingFileItem, MediaInsight, GraphNodeItem, TimelineMoment, MemoryCollectionItem, MemoryAnswer } from '../types';
import { executeConversationalRecall, analyzeQueryIntent, retrieveRelevantMoments, generateContextualFollowUps } from './memoryRecallEngine';

export { executeConversationalRecall, analyzeQueryIntent, retrieveRelevantMoments, generateContextualFollowUps };

/**
 * Checks server-side Gemini intelligence availability
 */
export async function checkGeminiStatus(): Promise<{ available: boolean; model: string }> {
  try {
    const res = await fetch('/api/gemini/status');
    if (!res.ok) return { available: false, model: 'gemini-3.8-flash' };
    return await res.json();
  } catch (_) {
    return { available: false, model: 'gemini-3.8-flash' };
  }
}

/**
 * Reads a File object as base64 data URL for client-to-server multimodal transmission
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Analyzes an individual media asset with Gemini Vision Understanding Engine
 */
export async function analyzeMediaAsset(
  item: UploadingFileItem,
  onStatusUpdate?: (statusMessage: string) => void
): Promise<MediaInsight> {
  if (onStatusUpdate) {
    onStatusUpdate(`Analyzing "${item.filename}" with Gemini Vision Engine...`);
  }

  try {
    let previewDataUrl: string | undefined = undefined;

    // If we have the local File object and it's an image, pass base64
    if (item.file && item.type === 'photo' && item.file.size < 10 * 1024 * 1024) {
      try {
        previewDataUrl = await readFileAsDataUrl(item.file);
      } catch (_) {}
    }

    const payload = {
      id: item.id,
      filename: item.filename,
      type: item.type,
      secure_url: item.secure_url || item.cloudinaryAsset?.secure_url,
      previewDataUrl,
      size: item.size,
    };

    const res = await fetch('/api/gemini/analyze-media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const insight: MediaInsight = await res.json();
      return validateAndNormalizeInsight(insight, item);
    }
  } catch (err) {
    console.warn('Client call to /api/gemini/analyze-media encountered error, using fallback:', err);
  }

  // Graceful client fallback
  return generateClientFallbackInsight(item);
}

/**
 * Synthesizes a living memory story from a batch of analyzed assets
 */
export async function synthesizeMemoryStory(
  title: string,
  mood: string,
  items: UploadingFileItem[],
  onStatusUpdate?: (status: string) => void
): Promise<{
  title: string;
  subtitle: string;
  narrativeSummary: string;
  graphNodes: GraphNodeItem[];
  timelineMoments: TimelineMoment[];
}> {
  if (onStatusUpdate) {
    onStatusUpdate('Clustering semantic moments and synthesizing living story capsule...');
  }

  const insights = items.map((it) => it.aiInsight).filter(Boolean) as MediaInsight[];

  let serverResult: any = null;
  try {
    const res = await fetch('/api/gemini/synthesize-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        mood,
        insights,
        items: items.map((i) => ({ id: i.id, filename: i.filename, type: i.type })),
      }),
    });

    if (res.ok) {
      serverResult = await res.json();
    }
  } catch (err) {
    console.warn('Failed to call /api/gemini/synthesize-story, using client synthesis fallback:', err);
  }

  const finalTitle = serverResult?.title || title || 'Illuminated Moments';
  const finalSubtitle =
    serverResult?.subtitle ||
    `${items.length} moments woven with ${mood} emotional arc and perceptual depth.`;
  const finalNarrative =
    serverResult?.narrativeSummary ||
    `From early collaborative planning to high-energy breakthrough and presentation, every moment weaves an enduring personal record of innovation and human connection.`;

  // Build high-fidelity timeline moments using AI insights
  const timelineMoments: TimelineMoment[] = items.map((it, idx) => {
    const insight = it.aiInsight || generateClientFallbackInsight(it);
    const timeLabel = it.time || `0${Math.min(idx + 1, 9)}:00 PM`;

    return {
      id: it.id,
      time: timeLabel,
      title: insight.momentType
        ? `${capitalize(insight.momentType)}: ${insight.scene}`
        : it.title,
      description: insight.description || insight.context,
      mediaCount: 1,
      mediaType: it.type,
      tags: insight.tags.length > 0 ? insight.tags : [it.type === 'video' ? 'Video' : 'Photo', 'Illuminated'],
      context: insight.context,
      coverGradient: it.gradient || 'from-[#6D5DFB] to-[#F4A7D8]',
      secure_url: it.secure_url || it.cloudinaryAsset?.secure_url,
      cloudinaryAsset: it.cloudinaryAsset,
      relatedMomentIds: items.filter((other) => other.id !== it.id).map((other) => other.id),
      scene: insight.scene,
      activity: insight.activity,
      objects: insight.objects,
      momentType: insight.momentType,
      aiInsight: insight,
    };
  });

  const graphNodes: GraphNodeItem[] = serverResult?.graphNodes || [
    {
      id: 'collaboration',
      label: 'Collaboration',
      type: 'primary',
      category: 'Core Dynamics',
      x: 50,
      y: 45,
      momentCount: Math.max(1, Math.ceil(items.length * 0.7)),
      description: 'Spontaneous team interactions, brainstorming, and joint problem-solving.',
      color: '#6D5DFB',
      connections: ['presentation', 'moments'],
    },
    {
      id: 'presentation',
      label: 'Presentation',
      type: 'secondary',
      category: 'Demos & Stage',
      x: 75,
      y: 35,
      momentCount: Math.max(1, Math.ceil(items.length * 0.5)),
      description: 'Auditorium demos, jury interaction, and project showcase.',
      color: '#F4A7D8',
      connections: ['collaboration'],
    },
    {
      id: 'places',
      label: 'Setting & Spaces',
      type: 'secondary',
      category: 'Venues',
      x: 25,
      y: 65,
      momentCount: Math.max(1, Math.ceil(items.length * 0.4)),
      description: 'Physical environments spanning workstations and presentation hall.',
      color: '#69E1D4',
      connections: ['collaboration'],
    },
    {
      id: 'moments',
      label: 'Highlights',
      type: 'secondary',
      category: 'Key Milestones',
      x: 52,
      y: 18,
      momentCount: items.length,
      description: 'High-resonance turning points marking breakthroughs.',
      color: '#B8A7FF',
      connections: ['collaboration', 'presentation'],
    },
  ];

  return {
    title: finalTitle,
    subtitle: finalSubtitle,
    narrativeSummary: finalNarrative,
    graphNodes,
    timelineMoments,
  };
}

/**
 * Grounded Conversational Recall against memory context using Gemini Intelligence
 */
export async function askMemoryStory(
  query: string,
  memory: MemoryCollectionItem
): Promise<MemoryAnswer & { response: string }> {
  const result = await executeConversationalRecall(query, memory);
  return {
    ...result,
    response: result.answer,
  };
}

/**
 * Validates and normalizes server response to satisfy MediaInsight interface
 */
function validateAndNormalizeInsight(insight: any, item: UploadingFileItem): MediaInsight {
  return {
    id: insight.id || item.id,
    scene: typeof insight.scene === 'string' && insight.scene.trim() ? insight.scene : 'creative space',
    activity: typeof insight.activity === 'string' && insight.activity.trim() ? insight.activity : 'active collaboration',
    objects: Array.isArray(insight.objects) && insight.objects.length > 0 ? insight.objects : ['digital workspace'],
    tags: Array.isArray(insight.tags) && insight.tags.length > 0 ? insight.tags.map((t: string) => t.toLowerCase()) : ['lumora', 'moments'],
    context: typeof insight.context === 'string' && insight.context.trim() ? insight.context : `Moments captured in ${item.filename}.`,
    momentType: typeof insight.momentType === 'string' && insight.momentType.trim() ? insight.momentType : 'milestone',
    description: typeof insight.description === 'string' && insight.description.trim() ? insight.description : `A memorable moment documented in ${item.filename}.`,
    source: insight.source || 'gemini',
    analyzedAt: insight.analyzedAt || new Date().toISOString(),
  };
}

/**
 * Generates an intelligent client fallback insight when network/server is unavailable
 */
export function generateClientFallbackInsight(item: UploadingFileItem): MediaInsight {
  const filename = item.filename || '';
  const cleanName = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').toLowerCase();
  const isVideo = item.type === 'video' || /\.(mp4|mov|webm)$/i.test(filename);

  let scene = 'creative technology event';
  let activity = 'team collaborative sprint';
  let momentType = isVideo ? 'highlight reel' : 'collaborative breakthrough';
  let objects = ['laptop', 'digital screen', 'workspace elements'];
  let tags = ['lumora', 'hackathon', 'moments'];
  let context = `Moments documented during ${cleanName}.`;
  let description = `A vivid visual document of ${cleanName}.`;

  if (cleanName.includes('present') || cleanName.includes('stage') || cleanName.includes('keynote')) {
    scene = 'main auditorium stage';
    activity = 'team presentation and live demo';
    momentType = 'presentation';
    objects = ['stage lighting', 'projection display', 'presenters', 'audience'];
    tags = ['presentation', 'stage', 'keynote', 'hackathon'];
    context = 'Final product demo and showcase in front of the jury and peers.';
    description = 'Presenting the completed project under stage lights to an engaged audience.';
  } else if (cleanName.includes('award') || cleanName.includes('celebrat') || cleanName.includes('selfie') || cleanName.includes('team')) {
    scene = 'ceremonial gathering area';
    activity = 'team celebration and victory moment';
    momentType = 'celebration';
    objects = ['trophy or certificate', 'collaborators', 'smiles'];
    tags = ['celebration', 'team', 'achievement', 'milestone'];
    context = 'Spontaneous celebration following the intense sprint and presentation.';
    description = 'Joyful team gathering celebrating the successful journey and recognition.';
  } else if (cleanName.includes('proto') || cleanName.includes('code') || cleanName.includes('collab') || cleanName.includes('work')) {
    scene = 'collaborative hacker space';
    activity = 'deep problem solving and iterative building';
    momentType = 'deep collaboration';
    objects = ['dual monitor setup', 'laptops', 'notepads', 'wireframe sketches'];
    tags = ['engineering', 'sprint', 'breakthrough', 'focus'];
    context = 'Intense late-stage prototyping and interface polishing before deadline.';
    description = 'Collaborative technical sprint with code and prototypes taking shape.';
  } else if (isVideo) {
    scene = 'dynamic event setting';
    activity = 'continuous live action capture';
    momentType = 'cinematic recording';
    objects = ['motion video capture', 'ambient event space'];
    tags = ['video reel', 'live action', 'cinematic'];
    context = 'Continuous motion capture preserving ambient pacing and vocal energy.';
    description = 'High-definition video reel capturing dynamic movement and candid interaction.';
  }

  return {
    id: item.id,
    scene,
    activity,
    objects,
    tags,
    context,
    momentType,
    description,
    source: 'heuristic',
    analyzedAt: new Date().toISOString(),
  };
}

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
