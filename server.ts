import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));

// Initialize GoogleGenAI server-side with required telemetry header
const geminiApiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;

if (geminiApiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

/**
 * Health & Capabilities Check
 */
app.get('/api/gemini/status', (_req: Request, res: Response) => {
  res.json({
    available: Boolean(ai && geminiApiKey),
    model: 'gemini-3.8-flash',
  });
});

/**
 * Fetch image bytes as base64 string helper
 */
async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    return {
      data: buffer.toString('base64'),
      mimeType,
    };
  } catch (err) {
    console.warn(`Could not fetch image for multimodal analysis from ${url}:`, err);
    return null;
  }
}

/**
 * POST /api/gemini/analyze-media
 * Analyzes a single image or video asset and produces a structured MediaInsight
 */
app.post('/api/gemini/analyze-media', async (req: Request, res: Response) => {
  const { id, filename, type, secure_url, previewDataUrl, size } = req.body;

  // Fallback heuristic generator if Gemini is unavailable or fails
  const generateHeuristicInsight = () => {
    const isVideo = type === 'video' || /\.(mp4|mov|webm)$/i.test(filename || '');
    const cleanName = (filename || 'moment')
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .toLowerCase();

    let scene = 'creative technology event';
    let activity = 'collaborative session';
    let momentType = isVideo ? 'highlight reel' : 'collaborative milestone';
    let objects = ['laptop', 'digital screen', 'workspace elements'];
    let tags = ['lumora', 'hackathon', 'moments'];
    let context = `Moments captured during ${cleanName}.`;
    let description = `A vivid visual document of ${cleanName}.`;

    if (cleanName.includes('present') || cleanName.includes('stage') || cleanName.includes('keynote')) {
      scene = 'main auditorium stage';
      activity = 'team presentation and live demo';
      momentType = 'presentation';
      objects = ['stage lighting', 'projection display', 'presenters', 'audience'];
      tags = ['presentation', 'stage', 'keynote', 'hackathon'];
      context = 'Final product demo and showcase in front of the jury and peers.';
      description = 'Presenting the completed project under stage lights to an engaged room.';
    } else if (cleanName.includes('award') || cleanName.includes('celebrat') || cleanName.includes('selfie') || cleanName.includes('team')) {
      scene = 'ceremonial gathering area';
      activity = 'team celebration and victory moment';
      momentType = 'celebration';
      objects = ['trophy or certificate', 'smiles', 'collaborators'];
      tags = ['celebration', 'team', 'achievement', 'milestone'];
      context = 'Spontaneous celebration following the intense sprint and presentation.';
      description = 'Joyful team gathering celebrating the successful journey and recognition.';
    } else if (cleanName.includes('proto') || cleanName.includes('code') || cleanName.includes('collab') || cleanName.includes('work')) {
      scene = 'collaborative hacker space';
      activity = 'deep problem solving and iterative building';
      momentType = 'deep collaboration';
      objects = ['dual monitor setup', 'laptops', 'notepads', 'coffee cups'];
      tags = ['engineering', 'sprint', 'breakthrough', 'focus'];
      context = 'Intense late-stage prototyping and interface polishing before deadline.';
      description = 'Collaborative technical sprint with code and prototypes taking shape.';
    } else if (isVideo) {
      scene = 'dynamic event setting';
      activity = 'live event progression';
      momentType = 'cinematic recording';
      objects = ['motion video capture', 'ambient event space'];
      tags = ['video reel', 'live action', 'cinematic'];
      context = 'Continuous motion capture preserving ambient pacing and vocal energy.';
      description = 'High-definition video reel capturing dynamic movement and candid interaction.';
    }

    return {
      id: id || `insight-${Date.now()}`,
      scene,
      activity,
      objects,
      tags,
      context,
      momentType,
      description,
      source: 'heuristic' as const,
      analyzedAt: new Date().toISOString(),
    };
  };

  if (!ai || !geminiApiKey) {
    return res.json(generateHeuristicInsight());
  }

  try {
    const isVideo = type === 'video' || /\.(mp4|mov|webm)$/i.test(filename || '');
    let imagePart: { inlineData: { mimeType: string; data: string } } | null = null;

    // If client sent base64 image dataUrl
    if (previewDataUrl && previewDataUrl.startsWith('data:image')) {
      const match = previewDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (match) {
        imagePart = {
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        };
      }
    }

    // Or if there is a remote secure_url (and it is an image, or video keyframe)
    if (!imagePart && secure_url && !isVideo) {
      const fetched = await fetchImageAsBase64(secure_url);
      if (fetched) {
        imagePart = {
          inlineData: {
            mimeType: fetched.mimeType,
            data: fetched.data,
          },
        };
      }
    }

    const systemInstruction = `You are Lumora's AI Media Understanding Engine.
Your task is to analyze photos and video representative context to extract structured semantic intelligence for personal memory preservation.
IMPORTANT PRIVACY & SAFETY RULES:
- Do not infer sensitive personal attributes (race, religion, health, sexual orientation, politics).
- Do not identify real people or mention real names.
- Do not make unsupported claims about individual identities.
- Focus strictly on the scene environment, observable collaborative/creative activities, physical objects, lighting/ambiance, event context, and narrative moment type.
Always respond in strict JSON matching the requested schema.`;

    const promptText = `Analyze this ${isVideo ? 'video asset' : 'photo asset'}:
Filename: "${filename || 'asset'}"
Asset Type: ${type}
${size ? `File Size: ${size}` : ''}
${isVideo ? 'Note: For this video asset, provide a concise representative context description and event tags.' : ''}

Identify:
- scene (short, descriptive place/environment, e.g. "college hackathon auditorium", "collaborative workstation")
- activity (observable group or individual activity, e.g. "team presenting demo on stage", "collaborative engineering sprint")
- objects (array of 3-5 observable non-sensitive physical items, e.g. ["laptop", "projector screen", "whiteboard", "microphones"])
- tags (array of 4-6 lowercase semantic tags, e.g. ["presentation", "stage", "hackathon", "team", "keynote"])
- context (1-2 sentences explaining what is happening and the significance of this moment)
- momentType (one or two words categorizing this moment, e.g. "presentation", "deep focus", "celebration", "arrival", "breakthrough")
- description (concise 1-sentence poetic yet objective summary of the visual moment)`;

    const contents: any = imagePart
      ? { parts: [imagePart, { text: promptText }] }
      : { parts: [{ text: promptText }] };

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scene: { type: Type.STRING },
            activity: { type: Type.STRING },
            objects: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            context: { type: Type.STRING },
            momentType: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ['scene', 'activity', 'objects', 'tags', 'context', 'momentType', 'description'],
        },
      },
    });

    const textOutput = geminiResponse.text?.trim() || '';
    const parsed = JSON.parse(textOutput);

    const insight = {
      id: id || `insight-${Date.now()}`,
      scene: parsed.scene || 'creative environment',
      activity: parsed.activity || 'collaborative activity',
      objects: Array.isArray(parsed.objects) ? parsed.objects : ['workspace elements'],
      tags: Array.isArray(parsed.tags) ? parsed.tags : ['lumora', 'moments'],
      context: parsed.context || `Visual context from ${filename}.`,
      momentType: parsed.momentType || 'milestone',
      description: parsed.description || `A memorable moment captured in ${filename}.`,
      source: 'gemini' as const,
      analyzedAt: new Date().toISOString(),
    };

    return res.json(insight);
  } catch (error) {
    console.error('Gemini analyze-media error, falling back to heuristic:', error);
    return res.json(generateHeuristicInsight());
  }
});

/**
 * POST /api/gemini/synthesize-story
 * Takes analyzed media items and mood to synthesize a living memory capsule:
 * overall narrative, refined title/subtitle, timeline moments, and graph clusters.
 */
app.post('/api/gemini/synthesize-story', async (req: Request, res: Response) => {
  const { title, mood, insights, items } = req.body;

  const fallbackSynthesis = () => {
    const memoryTitle = title || 'Illuminated Story';
    const cleanMood = mood || 'Cinematic';

    return {
      title: memoryTitle,
      subtitle: `An illuminated narrative journey synthesized with ${cleanMood} arc across ${items?.length || 4} captured moments.`,
      narrativeSummary: `From early collaborative planning to high-energy breakthrough and presentation, every moment weaves an enduring personal record of innovation and human connection.`,
      graphNodes: [
        {
          id: 'collaboration',
          label: 'Collaboration',
          type: 'primary',
          category: 'Core Dynamics',
          x: 48,
          y: 42,
          momentCount: Math.max(1, Math.ceil((items?.length || 4) * 0.6)),
          description: 'Spontaneous team interactions, brainstorming, and joint problem-solving.',
          color: '#6D5DFB',
          connections: ['presentation', 'moments'],
        },
        {
          id: 'presentation',
          label: 'Presentation',
          type: 'secondary',
          category: 'Keynotes & Demos',
          x: 74,
          y: 35,
          momentCount: Math.max(1, Math.ceil((items?.length || 4) * 0.4)),
          description: 'Showcasing the completed prototype under auditorium lights.',
          color: '#F4A7D8',
          connections: ['collaboration'],
        },
        {
          id: 'places',
          label: 'Setting & Space',
          type: 'secondary',
          category: 'Venues',
          x: 24,
          y: 65,
          momentCount: Math.max(1, Math.ceil((items?.length || 4) * 0.3)),
          description: 'Spatial and environmental clusters across workstation and stage.',
          color: '#69E1D4',
          connections: ['collaboration'],
        },
        {
          id: 'moments',
          label: 'Highlights',
          type: 'secondary',
          category: 'Turning Points',
          x: 52,
          y: 18,
          momentCount: Math.max(1, items?.length || 4),
          description: 'Pivotal milestone transitions marking breakthroughs.',
          color: '#B8A7FF',
          connections: ['collaboration', 'presentation'],
        },
      ],
    };
  };

  if (!ai || !geminiApiKey) {
    return res.json(fallbackSynthesis());
  }

  try {
    const prompt = `Synthesize a unified, emotionally resonant memory story for Lumora:
Requested Memory Title: "${title || 'Hackathon'}"
Emotional Mood/Arc: "${mood || 'Cinematic'}"

Analyzed Moments Insights:
${JSON.stringify(insights || [], null, 2)}

Please synthesize:
1. title: Polished poetic title for this memory (e.g. "Hackathon 2026: The Midnight Shader Breakthrough")
2. subtitle: 1-2 sentence subtitle capturing the emotional journey
3. narrativeSummary: 3-4 sentence vivid, cohesive story arc describing the sequence from arrival to climax and celebration.
4. graphNodes: 3-5 connected theme clusters based on the real detected moments. Each node must have: id, label, type ('primary'|'secondary'), category, x (15-85 number), y (15-85 number), momentCount (number), description, color (hex color matching Lumora palette, e.g. #6D5DFB, #F4A7D8, #69E1D4, #B8A7FF), connections (array of ids).`;

    const systemInstruction = `You are Lumora's Memory Intelligence Storyteller. You convert isolated moments into a cohesive, cinematic narrative experience. Do not identify real people or make sensitive claims. Respond strictly in JSON.`;

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            narrativeSummary: { type: Type.STRING },
            graphNodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  type: { type: Type.STRING },
                  category: { type: Type.STRING },
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                  momentCount: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                  color: { type: Type.STRING },
                  connections: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['id', 'label', 'type', 'category', 'x', 'y', 'momentCount', 'description', 'color', 'connections'],
              },
            },
          },
          required: ['title', 'subtitle', 'narrativeSummary', 'graphNodes'],
        },
      },
    });

    const parsed = JSON.parse(geminiResponse.text?.trim() || '{}');
    return res.json({
      title: parsed.title || title,
      subtitle: parsed.subtitle || `Synthesized with ${mood} narrative arc.`,
      narrativeSummary: parsed.narrativeSummary || 'An unbroken living memory arc.',
      graphNodes: Array.isArray(parsed.graphNodes) && parsed.graphNodes.length > 0
        ? parsed.graphNodes
        : fallbackSynthesis().graphNodes,
    });
  } catch (error) {
    console.error('Gemini synthesize-story error, falling back:', error);
    return res.json(fallbackSynthesis());
  }
});

/**
 * POST /api/gemini/synthesize-cluster-story
 * Generates one grounded, structured Story Capsule for a specific memory cluster.
 * Strictly 1 call per meaningful cluster (never per image).
 */
app.post('/api/gemini/synthesize-cluster-story', async (req: Request, res: Response) => {
  const { cluster, insights, items, mood } = req.body;

  const clusterTitle = cluster?.title || 'Memory Cluster';
  const clusterMood = mood || 'Cinematic';
  const insightsList = Array.isArray(insights) ? insights : [];
  const itemsList = Array.isArray(items) ? items : [];

  const fallbackClusterStory = () => {
    const act = cluster?.dominantActivities?.[0] || 'collaboration and celebration';
    const tagSummary = (cluster?.dominantTags || []).slice(0, 3).join(', ');
    const allItemIds = itemsList.map((i: any) => i.id);

    // Deterministic chapter segmentation based on items count
    const numChapters = Math.min(Math.max(1, Math.ceil(itemsList.length / 3)), 4);
    const chunkSize = Math.max(1, Math.ceil(itemsList.length / numChapters));
    const chapters: any[] = [];

    const defaultChapterNames = [
      'Project Kickoff',
      'Building Together',
      'Final Preparation',
      'Culmination & Presentation',
    ];

    for (let c = 0; c < numChapters; c++) {
      const slice = itemsList.slice(c * chunkSize, (c + 1) * chunkSize);
      const sliceIds = slice.map((i: any) => i.id);
      if (sliceIds.length > 0) {
        const representativeInsight = insightsList[c * chunkSize] || insightsList[0];
        const chapterTitle =
          representativeInsight?.momentType
            ? representativeInsight.momentType.charAt(0).toUpperCase() + representativeInsight.momentType.slice(1)
            : defaultChapterNames[c] || `Chapter 0${c + 1}`;

        chapters.push({
          id: `chapter-${cluster?.id || 'c'}-${c + 1}`,
          title: chapterTitle,
          description: representativeInsight?.description || `Story progression with ${sliceIds.length} captured moments.`,
          mediaIds: sliceIds,
          momentIds: sliceIds,
          order: c + 1,
        });
      }
    }

    // Key moments with real mediaIds
    const keyMoments: any[] = itemsList.slice(0, 4).map((item: any, idx: number) => {
      const ins = insightsList.find((i: any) => i.id === item.id) || insightsList[idx];
      return {
        id: `moment-${cluster?.id || 'c'}-${idx + 1}`,
        title: ins?.activity || item.title || `Moment ${idx + 1}`,
        description: ins?.description || ins?.context || 'Documented event milestone.',
        mediaIds: [item.id],
        importance: idx === 0 || idx === itemsList.length - 1 ? 'high' : 'medium',
        timestamp: item.time || undefined,
      };
    });

    return {
      title: clusterTitle,
      subtitle: `${itemsList.length} moments grounded in ${act}.`,
      summary: `A cohesive narrative of ${itemsList.length} moments highlighting ${act}, unified by ${tagSummary || 'shared experiences'}.`,
      narrativeSummary: `A cohesive narrative of ${itemsList.length} moments highlighting ${act}, unified by ${tagSummary || 'shared experiences'}.`,
      chapters: chapters.length > 0 ? chapters : [
        {
          id: `chapter-${cluster?.id || 'c'}-1`,
          title: clusterTitle,
          description: `Grounded moments captured during ${clusterTitle}.`,
          mediaIds: allItemIds,
          momentIds: allItemIds,
          order: 1,
        },
      ],
      keyMoments: keyMoments.length > 0 ? keyMoments : [
        {
          id: `moment-${cluster?.id || 'c'}-1`,
          title: clusterTitle,
          description: 'Documented visual milestone.',
          mediaIds: allItemIds.slice(0, 1),
          importance: 'high',
        },
      ],
      dominantActivities: cluster?.dominantActivities || ['collaborative session'],
      dominantTags: cluster?.dominantTags || ['moments', 'memory'],
    };
  };

  if (!ai || !geminiApiKey || insightsList.length === 0) {
    return res.json(fallbackClusterStory());
  }

  try {
    const validMediaIds = itemsList.map((i: any) => i.id);

    const prompt = `Synthesize a grounded Memory Story Capsule for this specific event cluster in Lumora:
Cluster Candidate Title: "${clusterTitle}"
Story Mood: "${clusterMood}"
Total Media Items: ${itemsList.length}

Media Assets in this Cluster:
${JSON.stringify(
  itemsList.map((item: any) => {
    const ins = insightsList.find((i: any) => i.id === item.id) || {};
    return {
      id: item.id,
      filename: item.filename,
      time: item.time,
      type: item.type,
      scene: ins.scene,
      activity: ins.activity,
      objects: ins.objects,
      momentType: ins.momentType,
      context: ins.context,
      description: ins.description,
      tags: ins.tags,
    };
  }),
  null,
  2
)}

Valid Media IDs available to assign: ${JSON.stringify(validMediaIds)}

RULES:
1. Ground the title, summary, chapters, and key moments STRICTLY in the observable scenes, activities, and objects above.
2. Produce 2–5 logical chapters based on activity/scene/momentType progression. Every chapter must list valid mediaIds from the above items.
3. Produce 2–5 key moments. Every key moment MUST link back to valid mediaIds from above.
4. Do not invent names, external events, or facts not supported by the insights.
5. Produce a human-readable title (e.g. "Final Presentation", "Hackathon 2026", "College Symposium", "Pondicherry Trip", "Team Work Session"). Never use "Cluster 1" or generic placeholders.
6. Return JSON matching the schema.`;

    const systemInstruction = `You are Lumora's Memory Intelligence Storyteller. You convert segmented photo/video clusters into structured Memory Story Capsules with chapters and key moments grounded strictly in real visual evidence.`;

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            summary: { type: Type.STRING },
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  mediaIds: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  order: { type: Type.NUMBER },
                },
                required: ['title', 'description', 'mediaIds', 'order'],
              },
            },
            keyMoments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  mediaIds: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  importance: { type: Type.STRING },
                  timestamp: { type: Type.STRING },
                },
                required: ['title', 'description', 'mediaIds', 'importance'],
              },
            },
            dominantActivities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            relevantTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['title', 'subtitle', 'summary', 'chapters', 'keyMoments', 'dominantActivities', 'relevantTags'],
        },
      },
    });

    const parsed = JSON.parse(geminiResponse.text?.trim() || '{}');
    const fallback = fallbackClusterStory();

    // Sanitize and validate chapters
    const sanitizedChapters = Array.isArray(parsed.chapters) && parsed.chapters.length > 0
      ? parsed.chapters.map((ch: any, idx: number) => {
          // Filter to real mediaIds
          const validIds = Array.isArray(ch.mediaIds)
            ? ch.mediaIds.filter((id: string) => validMediaIds.includes(id))
            : [];
          return {
            id: `chapter-${cluster?.id || 'c'}-${idx + 1}`,
            title: ch.title || `Chapter 0${idx + 1}`,
            description: ch.description || 'Grounded narrative chapter.',
            mediaIds: validIds.length > 0 ? validIds : [validMediaIds[idx % validMediaIds.length]],
            momentIds: validIds.length > 0 ? validIds : [validMediaIds[idx % validMediaIds.length]],
            order: typeof ch.order === 'number' ? ch.order : idx + 1,
          };
        })
      : fallback.chapters;

    // Sanitize and validate key moments
    const sanitizedKeyMoments = Array.isArray(parsed.keyMoments) && parsed.keyMoments.length > 0
      ? parsed.keyMoments.map((km: any, idx: number) => {
          const validIds = Array.isArray(km.mediaIds)
            ? km.mediaIds.filter((id: string) => validMediaIds.includes(id))
            : [];
          return {
            id: `moment-${cluster?.id || 'c'}-${idx + 1}`,
            title: km.title || `Key Moment ${idx + 1}`,
            description: km.description || 'Verified visual moment.',
            mediaIds: validIds.length > 0 ? validIds : [validMediaIds[idx % validMediaIds.length]],
            importance: km.importance === 'high' ? 'high' : 'medium',
            timestamp: km.timestamp || undefined,
          };
        })
      : fallback.keyMoments;

    return res.json({
      title: parsed.title || clusterTitle,
      subtitle: parsed.subtitle || `${itemsList.length} moments woven with ${clusterMood} arc.`,
      summary: parsed.summary || parsed.narrativeSummary || fallback.summary,
      narrativeSummary: parsed.summary || parsed.narrativeSummary || fallback.summary,
      chapters: sanitizedChapters,
      keyMoments: sanitizedKeyMoments,
      dominantActivities: Array.isArray(parsed.dominantActivities) && parsed.dominantActivities.length > 0
        ? parsed.dominantActivities
        : cluster?.dominantActivities || fallback.dominantActivities,
      dominantTags: Array.isArray(parsed.relevantTags) && parsed.relevantTags.length > 0
        ? parsed.relevantTags
        : cluster?.dominantTags || fallback.dominantTags,
    });
  } catch (err) {
    console.error('Gemini synthesize-cluster-story error, falling back:', err);
    return res.json(fallbackClusterStory());
  }
});

/**
 * POST /api/gemini/ask-memory
 * Answers questions about the memory with grounded visual & temporal awareness
 * Produces structured MemoryAnswer: answer, confidence, momentIds, mediaIds, followUps, relevantGraphNodes
 */
app.post('/api/gemini/ask-memory', async (req: Request, res: Response) => {
  const { query, memoryTitle, candidateMoments, candidateMediaIds, temporalAnchor, temporalDirection, relevantGraphNodes, moments, items } = req.body;

  const momentsList = Array.isArray(candidateMoments)
    ? candidateMoments
    : Array.isArray(moments)
    ? moments
    : [];
  const qLower = (query || '').toLowerCase();

  const fallbackAnswer = () => {
    let matchedIds: string[] = [];
    if (Array.isArray(candidateMediaIds) && candidateMediaIds.length > 0) {
      matchedIds = candidateMediaIds;
    } else if (Array.isArray(items) && items.length > 0) {
      matchedIds = items.map((i: any) => i.id || i);
    } else {
      matchedIds = momentsList.map((m: any) => m.id);
    }

    let confidence: 'high' | 'medium' | 'low' = 'low';
    let text = `I couldn't find a strong match for "${query}" in this memory.`;

    if (matchedIds.length > 0) {
      confidence = 'high';
      const titles = momentsList.map((m: any) => `"${m.title}"`).join(', ');
      if (temporalDirection === 'before') {
        text = `Before the ${temporalAnchor || 'presentation'}, your memory records key moments: ${titles}. I found ${matchedIds.length} connected moments leading up to this milestone.`;
      } else if (temporalDirection === 'after') {
        text = `Following the ${temporalAnchor || 'arrival'}, your memory records: ${titles}.`;
      } else {
        text = `Lumora found ${matchedIds.length} connected moments in "${memoryTitle || 'this memory'}": ${titles}.`;
      }
    }

    return {
      answer: text,
      confidence,
      momentIds: momentsList.map((m: any) => m.id),
      mediaIds: matchedIds,
      followUps: [
        'Show our final presentation.',
        'What happened before the presentation?',
        'What happened after that?',
        'Find moments with the whole team.',
      ],
      relevantGraphNodes: relevantGraphNodes || ['presentation', 'team'],
      temporalAnchor,
    };
  };

  if (!ai || !geminiApiKey || momentsList.length === 0) {
    return res.json(fallbackAnswer());
  }

  try {
    const systemInstruction = `You are Lumora's Memory Intelligence & Conversational Recall Engine.
You have access to the user's analyzed memory candidate moments, including scenes, activities, objects, tags, and timestamps.
RULES:
1. Directly and concisely answer the user's question.
2. Mention the relevant candidate moments by name.
3. Reference observable visual/temporal evidence.
4. Avoid inventing information or claiming facts not present in the candidate moments.
5. If the evidence is weak or absent, honestly state that.
6. Provide 2-4 concise, helpful follow-up questions relevant to the moments discussed.
7. Return strictly valid JSON matching the schema.`;

    const prompt = `User Question: "${query}"
Memory Title: "${memoryTitle || 'Hackathon'}"
${temporalAnchor ? `Temporal Focus Anchor: "${temporalAnchor}" (Direction: ${temporalDirection || 'general'})` : ''}

Candidate Moments in Memory (retrieved via local relevance matching):
${JSON.stringify(
  momentsList.map((m: any) => ({
    id: m.id,
    time: m.time,
    title: m.title,
    scene: m.scene || m.context,
    tags: m.tags,
    activity: m.activity,
    objects: m.objects,
    description: m.description,
  })),
  null,
  2
)}

Provide response in JSON matching the exact schema.`;

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            confidence: { type: Type.STRING }, // 'high' | 'medium' | 'low'
            momentIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            mediaIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            followUps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            relevantGraphNodes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['answer', 'confidence', 'momentIds', 'mediaIds', 'followUps'],
        },
      },
    });

    const parsed = JSON.parse(geminiResponse.text?.trim() || '{}');
    const validMomentIds = Array.isArray(parsed.momentIds) && parsed.momentIds.length > 0
      ? parsed.momentIds
      : momentsList.map((m: any) => m.id);

    const validMediaIds = Array.isArray(parsed.mediaIds) && parsed.mediaIds.length > 0
      ? parsed.mediaIds
      : validMomentIds;

    const followUps = Array.isArray(parsed.followUps) && parsed.followUps.length > 0
      ? parsed.followUps
      : fallbackAnswer().followUps;

    const confidenceVal = ['high', 'medium', 'low'].includes(parsed.confidence)
      ? (parsed.confidence as 'high' | 'medium' | 'low')
      : 'high';

    return res.json({
      answer: parsed.answer || fallbackAnswer().answer,
      confidence: confidenceVal,
      momentIds: validMomentIds,
      mediaIds: validMediaIds,
      followUps,
      relevantGraphNodes: parsed.relevantGraphNodes || relevantGraphNodes || ['presentation', 'team'],
      temporalAnchor,
    });
  } catch (error) {
    console.error('Gemini ask-memory error, falling back:', error);
    return res.json(fallbackAnswer());
  }
});

// Mount Vite or static build depending on environment
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Lumora Engine] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Lumora Engine] Failed to start server:', err);
  process.exit(1);
});
