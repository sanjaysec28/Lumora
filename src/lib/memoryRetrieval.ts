/**
 * Lumora Memory Intelligence & Retrieval Engine
 * High-precision local candidate retrieval, temporal reasoning, anaphora resolution,
 * relevance scoring, chapter synthesis, and highlight ranking.
 */

import {
  TimelineMoment,
  MemoryCollectionItem,
  MemoryAnswer,
  StoryChapter,
  ConversationTurn,
} from '../types';

export interface RetrievalResult {
  candidateMoments: TimelineMoment[];
  confidence: 'high' | 'medium' | 'low';
  mediaIds: string[];
  matchedGraphNodes: string[];
  temporalAnchor?: string;
  temporalDirection?: 'before' | 'after' | 'during' | 'around';
  suggestedFollowUps: string[];
  explanation: string;
}

/**
 * Normalizes string for fuzzy/tokenized matching
 */
function cleanTokens(str: string): string[] {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/**
 * Resolves pronoun / anaphoric reference like "that", "it", "then"
 * using the most recent conversation turns.
 */
export function resolveAnaphora(
  query: string,
  history?: ConversationTurn[]
): { resolvedQuery: string; resolvedSubject?: string } {
  const qLower = query.toLowerCase();
  const hasPronoun =
    /\b(that|it|then|after that|before that|there|at that time)\b/i.test(qLower);

  if (!hasPronoun || !history || history.length === 0) {
    return { resolvedQuery: query };
  }

  // Find the last answered turn
  const lastTurn = history[history.length - 1];
  const lastUserText = (lastTurn.user || '').toLowerCase();
  const lastLumoraText = (lastTurn.lumora || '').toLowerCase();

  let subject = 'presentation';
  if (lastUserText.includes('presentation') || lastLumoraText.includes('presentation')) {
    subject = 'presentation';
  } else if (lastUserText.includes('prototype') || lastUserText.includes('build') || lastLumoraText.includes('prototype')) {
    subject = 'prototype';
  } else if (lastUserText.includes('arrival') || lastLumoraText.includes('arrival') || lastUserText.includes('arrived')) {
    subject = 'arrival';
  } else if (lastUserText.includes('results') || lastUserText.includes('award') || lastLumoraText.includes('award')) {
    subject = 'results ceremony';
  } else if (lastUserText.includes('team') || lastUserText.includes('collab')) {
    subject = 'team collaboration';
  }

  const resolvedQuery = query.replace(/\b(that|it)\b/gi, subject);
  return { resolvedQuery, resolvedSubject: subject };
}

/**
 * Detects temporal intent and target anchor from query
 */
export function extractTemporalIntent(query: string): {
  direction: 'before' | 'after' | 'during' | 'around' | 'none';
  anchor?: string;
  timeWindow?: 'morning' | 'afternoon' | 'evening';
} {
  const q = query.toLowerCase();

  // Time window checks
  if (q.includes('afternoon')) {
    return { direction: 'during', timeWindow: 'afternoon', anchor: 'afternoon' };
  }
  if (q.includes('morning') || q.includes('breakfast') || q.includes('kickoff')) {
    return { direction: 'during', timeWindow: 'morning', anchor: 'morning' };
  }
  if (q.includes('evening') || q.includes('night') || q.includes('dusk')) {
    return { direction: 'during', timeWindow: 'evening', anchor: 'evening' };
  }

  // Before patterns
  if (
    /\b(before|prior to|preceding|earlier than|leading up to)\b/i.test(q)
  ) {
    const anchorMatch = q.match(
      /(?:before|prior to|preceding|leading up to)\s+(?:the|our|my)?\s*([a-zA-Z0-9\s]+?)(?:\?|$|\.|\,)/i
    );
    return {
      direction: 'before',
      anchor: anchorMatch ? anchorMatch[1].trim() : 'presentation',
    };
  }

  // After patterns
  if (
    /\b(after|following|subsequent to|later than|next|afterwards)\b/i.test(q)
  ) {
    const anchorMatch = q.match(
      /(?:after|following|subsequent to)\s+(?:the|our|my)?\s*([a-zA-Z0-9\s]+?)(?:\?|$|\.|\,)/i
    );
    return {
      direction: 'after',
      anchor: anchorMatch ? anchorMatch[1].trim() : 'arrival',
    };
  }

  // Around patterns
  if (/\b(around|near)\b/i.test(q)) {
    const anchorMatch = q.match(
      /(?:around|near)\s+(?:the|our|my)?\s*([a-zA-Z0-9\s]+?)(?:\?|$|\.|\,)/i
    );
    return {
      direction: 'around',
      anchor: anchorMatch ? anchorMatch[1].trim() : undefined,
    };
  }

  return { direction: 'none' };
}

/**
 * Core Deterministic Local Relevance Engine
 * Scores moments against title, scene, activity, objects, tags, momentType, and temporal order.
 */
export function retrieveCandidateMoments(
  rawQuery: string,
  memory: MemoryCollectionItem,
  history?: ConversationTurn[]
): RetrievalResult {
  const { resolvedQuery, resolvedSubject } = resolveAnaphora(rawQuery, history);
  const temporal = extractTemporalIntent(resolvedQuery);

  const moments = memory.timelineMoments || [];
  if (moments.length === 0) {
    return {
      candidateMoments: [],
      confidence: 'low',
      mediaIds: [],
      matchedGraphNodes: [],
      suggestedFollowUps: ['Show all moments', 'Show final presentation', 'Explore timeline'],
      explanation: 'No moments exist in this memory to retrieve.',
    };
  }

  const queryTokens = cleanTokens(resolvedQuery);
  const qLower = resolvedQuery.toLowerCase();

  // Find index of anchor moment if temporal direction exists
  let anchorIndex = -1;
  if (temporal.anchor) {
    const anchorTokens = cleanTokens(temporal.anchor);
    anchorIndex = moments.findIndex((m) => {
      const titleLower = m.title.toLowerCase();
      const typeLower = (m.momentType || '').toLowerCase();
      const sceneLower = (m.scene || '').toLowerCase();
      return (
        anchorTokens.some((tok) => titleLower.includes(tok)) ||
        anchorTokens.some((tok) => typeLower.includes(tok)) ||
        anchorTokens.some((tok) => sceneLower.includes(tok))
      );
    });
  }

  // Score each moment
  const scoredMoments = moments.map((moment, idx) => {
    let score = 0;
    const mTitleLower = moment.title.toLowerCase();
    const mDescLower = (moment.description || '').toLowerCase();
    const mContextLower = (moment.context || '').toLowerCase();
    const mSceneLower = (moment.scene || '').toLowerCase();
    const mActivityLower = (moment.activity || '').toLowerCase();
    const mMomentTypeLower = (moment.momentType || '').toLowerCase();
    const mTagsLower = (moment.tags || []).map((t) => t.toLowerCase());
    const mObjectsLower = (moment.objects || []).map((o) => o.toLowerCase());

    // 1. Exact Tag Matches
    for (const tag of mTagsLower) {
      if (qLower.includes(tag)) {
        score += 12;
      }
    }

    // 2. MomentType Match
    if (mMomentTypeLower && qLower.includes(mMomentTypeLower)) {
      score += 15;
    }

    // 3. Scene and Environment Match
    if (mSceneLower) {
      for (const tok of queryTokens) {
        if (mSceneLower.includes(tok)) score += 9;
      }
    }

    // 4. Observable Activity Match
    if (mActivityLower) {
      for (const tok of queryTokens) {
        if (mActivityLower.includes(tok)) score += 9;
      }
    }

    // 5. Objects Match (laptops, screens, projector, certificates, etc.)
    for (const obj of mObjectsLower) {
      if (qLower.includes(obj)) {
        score += 10;
      }
    }

    // 6. Title and Description Keywords
    for (const tok of queryTokens) {
      if (mTitleLower.includes(tok)) score += 8;
      if (mDescLower.includes(tok)) score += 4;
      if (mContextLower.includes(tok)) score += 4;
    }

    // 7. Temporal Logic
    if (temporal.direction === 'before' && anchorIndex !== -1) {
      if (idx < anchorIndex) {
        // Moments before the anchor get boosted based on closeness
        const distance = anchorIndex - idx;
        score += Math.max(25 - distance * 4, 10);
      } else {
        // Moments at or after anchor are penalized
        score -= 25;
      }
    } else if (temporal.direction === 'after' && anchorIndex !== -1) {
      if (idx > anchorIndex) {
        const distance = idx - anchorIndex;
        score += Math.max(25 - distance * 4, 10);
      } else {
        score -= 25;
      }
    } else if (temporal.direction === 'during') {
      const timeStr = (moment.time || '').toLowerCase();
      if (temporal.timeWindow === 'morning' && timeStr.includes('am')) {
        score += 18;
      } else if (temporal.timeWindow === 'afternoon' && timeStr.includes('pm')) {
        // 12:00 PM to 4:59 PM
        const hour = parseInt(timeStr, 10);
        if (hour === 12 || (hour >= 1 && hour <= 4)) {
          score += 18;
        }
      } else if (temporal.timeWindow === 'evening' && timeStr.includes('pm')) {
        const hour = parseInt(timeStr, 10);
        if (hour >= 5) {
          score += 18;
        }
      }
    }

    return { moment, score };
  });

  // Filter positive matches and sort descending
  const sorted = scoredMoments
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  // If no positive matches, fallback to first 2 moments with low confidence
  let candidateMoments: TimelineMoment[] = [];
  let confidence: 'high' | 'medium' | 'low' = 'low';

  if (sorted.length > 0) {
    const topScore = sorted[0].score;
    if (topScore >= 16) {
      confidence = 'high';
    } else if (topScore >= 7) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }

    // Take top 3-5 candidates
    candidateMoments = sorted.slice(0, 4).map((s) => s.moment);
  } else {
    // Zero keyword matches: do not hallucinate
    confidence = 'low';
    candidateMoments = [];
  }

  // Extract media IDs (prioritize Cloudinary media, then moment id)
  const mediaIds = candidateMoments.map((m) => m.id);

  // Identify matching Graph Nodes
  const matchedGraphNodes: string[] = [];
  if (
    qLower.includes('team') ||
    qLower.includes('people') ||
    qLower.includes('collab') ||
    qLower.includes('friend')
  ) {
    matchedGraphNodes.push('team', 'people', 'collaboration');
  }
  if (
    qLower.includes('present') ||
    qLower.includes('demo') ||
    qLower.includes('stage') ||
    qLower.includes('pitch')
  ) {
    matchedGraphNodes.push('presentation');
  }
  if (
    qLower.includes('build') ||
    qLower.includes('code') ||
    qLower.includes('shader') ||
    qLower.includes('proto') ||
    qLower.includes('laptop')
  ) {
    matchedGraphNodes.push('build');
  }
  if (
    qLower.includes('award') ||
    qLower.includes('result') ||
    qLower.includes('win') ||
    qLower.includes('trophy')
  ) {
    matchedGraphNodes.push('result');
  }
  if (qLower.includes('place') || qLower.includes('auditorium') || qLower.includes('venue')) {
    matchedGraphNodes.push('places');
  }

  // Generate intelligent follow-up suggestions
  const suggestedFollowUps = generateFollowUps(
    resolvedQuery,
    candidateMoments,
    temporal.direction
  );

  const explanation = generateRetrievalExplanation(
    resolvedQuery,
    candidateMoments,
    confidence,
    temporal
  );

  return {
    candidateMoments,
    confidence,
    mediaIds,
    matchedGraphNodes,
    temporalAnchor: temporal.anchor || resolvedSubject,
    temporalDirection: temporal.direction !== 'none' ? temporal.direction : undefined,
    suggestedFollowUps,
    explanation,
  };
}

/**
 * Creates contextual follow-up question suggestions
 */
function generateFollowUps(
  query: string,
  candidates: TimelineMoment[],
  direction: string
): string[] {
  const q = query.toLowerCase();

  if (direction === 'before' || q.includes('before')) {
    return [
      'Show our final presentation.',
      'What happened after the presentation?',
      'Who was involved in the build?',
      'Show moments with the whole team.',
    ];
  }

  if (direction === 'after' || q.includes('after')) {
    return [
      'Show the final result ceremony.',
      'What happened during the afternoon?',
      'Find photos with laptops.',
      'Show the earliest moment.',
    ];
  }

  if (q.includes('present') || q.includes('stage')) {
    return [
      'What happened before the final presentation?',
      'What happened after the presentation?',
      'Show moments related to coding.',
      'Find photos with the award certificate.',
    ];
  }

  if (q.includes('team') || q.includes('collab')) {
    return [
      'Show the final presentation.',
      'What happened during the afternoon?',
      'Find moments related to coding.',
      'Show the celebratory award moment.',
    ];
  }

  if (q.includes('laptop') || q.includes('code') || q.includes('build')) {
    return [
      'Show our final presentation.',
      'Find moments with the team.',
      'What happened before the build?',
      'Show the best moments from the afternoon.',
    ];
  }

  // Generic fallback follow-ups
  return [
    'Show our final presentation.',
    'What happened before the presentation?',
    'Find moments with the whole team.',
    'Show the results and award moment.',
  ];
}

/**
 * Generates an accurate, honest deterministic explanation if AI is offline
 */
function generateRetrievalExplanation(
  query: string,
  candidates: TimelineMoment[],
  confidence: 'high' | 'medium' | 'low',
  temporal: { direction: string; anchor?: string; timeWindow?: string }
): string {
  if (candidates.length === 0 || confidence === 'low') {
    return `I couldn't find a strong match for "${query}" in this memory. Try asking about the presentation, team collaboration, prototype build, or award ceremony.`;
  }

  const titles = candidates.map((c) => `"${c.title}"`).join(', ');

  if (temporal.direction === 'before') {
    return `Before the ${temporal.anchor || 'presentation'}, your memory shows key moments of preparation and collaboration: ${titles}. I found ${candidates.length} relevant moments leading up to this milestone.`;
  }

  if (temporal.direction === 'after') {
    return `Following the ${temporal.anchor || 'arrival'}, your memory records: ${titles}. Here are the matching moments captured in sequence.`;
  }

  if (temporal.direction === 'during') {
    return `During the ${temporal.timeWindow || 'period'}, Lumora identified ${candidates.length} moments: ${titles}.`;
  }

  return `I found ${candidates.length} high-confidence moments matching your query: ${titles}.`;
}

/**
 * Generates dynamic Story Chapters from moments (Section 18)
 */
export function generateStoryChapters(moments: TimelineMoment[]): StoryChapter[] {
  if (!moments || moments.length === 0) {
    return [];
  }

  // If moments have existing sequence, organize into sequential chapters
  const gradients = [
    'from-[#6D5DFB] via-[#8576FF] to-[#8DDCFF]',
    'from-[#3B267E] via-[#6D5DFB] to-[#69E1D4]',
    'from-[#B8A7FF] via-[#F4A7D8] to-[#6D5DFB]',
    'from-[#3B267E] via-[#6D5DFB] to-[#F4A7D8]',
    'from-[#69E1D4] via-[#6D5DFB] to-[#3B267E]',
    'from-[#F4A7D8] via-[#B8A7FF] to-[#8DDCFF]',
  ];

  return moments.map((moment, idx) => {
    const chapterNum = `0${idx + 1}`;
    return {
      id: `chapter-${moment.id}`,
      chapterNumber: chapterNum,
      title: moment.title,
      timeRange: moment.time || 'Day Session',
      momentCount: moment.mediaCount || 1,
      description: moment.description,
      momentIds: [moment.id],
      coverGradient: gradients[idx % gradients.length],
      secure_url: moment.secure_url,
    };
  });
}

/**
 * Lightweight highlight detection: ranks Key Moments (Section 19)
 */
export function detectKeyMoments(moments: TimelineMoment[]): TimelineMoment[] {
  if (!moments || moments.length === 0) return [];

  // Rank by significance: mediaCount, momentType importance, tag richness
  return [...moments].sort((a, b) => {
    const aTypeBonus = ['presentation', 'celebration', 'breakthrough'].includes(
      (a.momentType || '').toLowerCase()
    )
      ? 20
      : 5;
    const bTypeBonus = ['presentation', 'celebration', 'breakthrough'].includes(
      (b.momentType || '').toLowerCase()
    )
      ? 20
      : 5;

    const aScore = (a.mediaCount || 1) * 2 + (a.tags?.length || 0) * 3 + aTypeBonus;
    const bScore = (b.mediaCount || 1) * 2 + (b.tags?.length || 0) * 3 + bTypeBonus;

    return bScore - aScore;
  });
}
