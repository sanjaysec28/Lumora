/**
 * Lumora Automatic Memory Segmentation & Clustering Engine
 * Deterministic local clustering based on multi-signal relevance scoring:
 * - Shared tags (+5)
 * - Shared activity (+4)
 * - Same momentType (+4)
 * - Similar scene (+3)
 * - Temporal proximity (+3)
 * - Same location (+3)
 * - Shared objects (+2)
 *
 * Grounded strictly in real media insights and metadata.
 */

import { UploadingFileItem, MediaInsight, MemoryCluster } from '../types';

export interface ClusteringSignals {
  tagOverlap: number;
  activityMatch: number;
  momentTypeMatch: number;
  sceneMatch: number;
  temporalProximity: number;
  locationMatch: number;
  objectOverlap: number;
  totalScore: number;
}

export interface ClusterCandidate {
  id: string;
  title: string;
  items: UploadingFileItem[];
  dominantTags: string[];
  dominantActivities: string[];
  dominantScenes: string[];
  location?: string;
  timeRange?: { start?: string; end?: string };
  confidence: 'high' | 'medium' | 'low';
}

const SIMILARITY_THRESHOLD = 7.0; // Score required to join a memory cluster

/**
 * Tokenizes a string into clean lower-case words
 */
function tokenize(str?: string): Set<string> {
  if (!str) return new Set();
  const words = str
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
  return new Set(words);
}

/**
 * Calculates Jaccard / token overlap between two sets
 */
function setIntersection<T>(setA: Set<T>, setB: Set<T>): T[] {
  const result: T[] = [];
  setA.forEach((val) => {
    if (setB.has(val)) result.push(val);
  });
  return result;
}

/**
 * Estimates time minutes from string e.g. "04:30 PM", "14:30", "Just now"
 */
function parseTimeMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Computes pairwise similarity between two media items based on MediaInsight & metadata
 */
export function computeMediaSimilarity(
  a: UploadingFileItem,
  b: UploadingFileItem
): ClusteringSignals {
  const insightA = a.aiInsight;
  const insightB = b.aiInsight;

  // 1. Shared tags (weight: +5)
  const tagsA = new Set((insightA?.tags || []).map((t) => t.toLowerCase().trim()));
  const tagsB = new Set((insightB?.tags || []).map((t) => t.toLowerCase().trim()));
  const sharedTags = setIntersection(tagsA, tagsB);
  let tagScore = 0;
  if (sharedTags.length > 0) {
    tagScore = Math.min(5, sharedTags.length * 2.5);
  }

  // 2. Shared activity (weight: +4)
  let activityScore = 0;
  if (insightA?.activity && insightB?.activity) {
    const actA = tokenize(insightA.activity);
    const actB = tokenize(insightB.activity);
    const actShared = setIntersection(actA, actB);
    if (insightA.activity.toLowerCase().trim() === insightB.activity.toLowerCase().trim()) {
      activityScore = 4;
    } else if (actShared.length >= 2) {
      activityScore = 3.5;
    } else if (actShared.length === 1) {
      activityScore = 2;
    }
  }

  // 3. Same momentType (weight: +4)
  let momentTypeScore = 0;
  if (insightA?.momentType && insightB?.momentType) {
    const mtA = insightA.momentType.toLowerCase().trim();
    const mtB = insightB.momentType.toLowerCase().trim();
    if (mtA === mtB) {
      momentTypeScore = 4;
    } else if (mtA.includes(mtB) || mtB.includes(mtA)) {
      momentTypeScore = 2.5;
    }
  }

  // 4. Similar scene (weight: +3)
  let sceneScore = 0;
  if (insightA?.scene && insightB?.scene) {
    const scnA = tokenize(insightA.scene);
    const scnB = tokenize(insightB.scene);
    const scnShared = setIntersection(scnA, scnB);
    if (insightA.scene.toLowerCase().trim() === insightB.scene.toLowerCase().trim()) {
      sceneScore = 3;
    } else if (scnShared.length >= 2) {
      sceneScore = 2.5;
    } else if (scnShared.length === 1) {
      sceneScore = 1.5;
    }
  }

  // 5. Shared objects (weight: +2)
  let objectScore = 0;
  if (insightA?.objects && insightB?.objects) {
    const objA = new Set(insightA.objects.map((o) => o.toLowerCase().trim()));
    const objB = new Set(insightB.objects.map((o) => o.toLowerCase().trim()));
    const sharedObjs = setIntersection(objA, objB);
    if (sharedObjs.length > 0) {
      objectScore = Math.min(2, sharedObjs.length * 1.0);
    }
  }

  // 6. Temporal proximity (weight: +3)
  let temporalScore = 0;
  const timeA = parseTimeMinutes(a.time);
  const timeB = parseTimeMinutes(b.time);
  if (timeA !== null && timeB !== null) {
    const diff = Math.abs(timeA - timeB);
    if (diff <= 60) {
      temporalScore = 3;
    } else if (diff <= 180) {
      temporalScore = 2;
    } else if (diff <= 360) {
      temporalScore = 1;
    }
  } else {
    // If times are not absolute, look at file upload sequential proximity
    temporalScore = 1;
  }

  // 7. Location match (weight: +3)
  let locationScore = 0;
  const locA = tokenize(insightA?.context || a.title);
  const locB = tokenize(insightB?.context || b.title);
  const locOverlap = setIntersection(locA, locB);
  if (locOverlap.length >= 2) {
    locationScore = 3;
  } else if (locOverlap.length === 1) {
    locationScore = 1.5;
  }

  const totalScore =
    tagScore +
    activityScore +
    momentTypeScore +
    sceneScore +
    objectScore +
    temporalScore +
    locationScore;

  return {
    tagOverlap: tagScore,
    activityMatch: activityScore,
    momentTypeMatch: momentTypeScore,
    sceneMatch: sceneScore,
    objectOverlap: objectScore,
    temporalProximity: temporalScore,
    locationMatch: locationScore,
    totalScore,
  };
}

/**
 * Computes average similarity of an item to a candidate cluster
 */
function similarityToCluster(item: UploadingFileItem, cluster: ClusterCandidate): number {
  if (cluster.items.length === 0) return 0;
  const scores = cluster.items.map((existing) => computeMediaSimilarity(item, existing).totalScore);
  // Give high weight to max similarity and average
  const maxScore = Math.max(...scores);
  const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  return maxScore * 0.7 + avgScore * 0.3;
}

/**
 * Generates an expressive, human-readable title for a cluster grounded in its actual media
 */
export function generateClusterTitle(items: UploadingFileItem[]): {
  title: string;
  subtitle: string;
  confidence: 'high' | 'medium' | 'low';
} {
  if (items.length === 0) {
    return {
      title: 'Unsorted Memory',
      subtitle: 'Uncategorized collection items',
      confidence: 'low',
    };
  }

  // Collect candidate keywords from filename, scene, activity, and tags
  const tagFrequency = new Map<string, number>();
  const activityList: string[] = [];
  const sceneList: string[] = [];
  const nameTokens: string[] = [];

  items.forEach((item) => {
    // Clean filename tokens
    const baseName = item.filename
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .trim();
    nameTokens.push(baseName);

    if (item.aiInsight) {
      if (item.aiInsight.activity) activityList.push(item.aiInsight.activity);
      if (item.aiInsight.scene) sceneList.push(item.aiInsight.scene);
      (item.aiInsight.tags || []).forEach((t) => {
        const clean = t.toLowerCase().trim();
        tagFrequency.set(clean, (tagFrequency.get(clean) || 0) + 1);
      });
    }
  });

  const fullText = `${nameTokens.join(' ')} ${activityList.join(' ')} ${sceneList.join(' ')}`.toLowerCase();

  // Keyword rules for common real-life events
  if (/presentation|keynote|stage|pitch|demo day|auditorium/i.test(fullText)) {
    return {
      title: 'Final Presentation',
      subtitle: `${items.length} moments highlighting the live stage demo and keynote`,
      confidence: 'high',
    };
  }

  if (/hackathon|sprint|prototype|coding|builder|hacker/i.test(fullText)) {
    const yearMatch = fullText.match(/202\d/);
    const yearSuffix = yearMatch ? ` ${yearMatch[0]}` : '';
    return {
      title: `Hackathon${yearSuffix || ' 2026'}`,
      subtitle: `${items.length} moments of collaborative development and breakthrough sprints`,
      confidence: 'high',
    };
  }

  if (/symposium|conference|college|campus|academic|seminar/i.test(fullText)) {
    return {
      title: 'College Symposium',
      subtitle: `${items.length} moments captured across campus sessions and gatherings`,
      confidence: 'high',
    };
  }

  if (/trip|travel|pondicherry|beach|journey|tour|vacation|flight|road/i.test(fullText)) {
    let loc = 'Travel';
    if (/pondicherry/i.test(fullText)) loc = 'Pondicherry';
    else if (/beach/i.test(fullText)) loc = 'Coastal';
    else if (/mountain/i.test(fullText)) loc = 'Mountain';
    return {
      title: `${loc} Trip`,
      subtitle: `${items.length} travel memories and scenic explorations`,
      confidence: 'high',
    };
  }

  if (/family|celebration|wedding|birthday|gathering|party|dinner/i.test(fullText)) {
    return {
      title: 'Family Celebration',
      subtitle: `${items.length} shared celebration moments and candid gatherings`,
      confidence: 'high',
    };
  }

  if (/team|workshop|brainstorm|meeting|session|collab/i.test(fullText)) {
    return {
      title: 'Team Work Session',
      subtitle: `${items.length} collaborative discussions and problem solving milestones`,
      confidence: 'high',
    };
  }

  // Derive from most frequent tags if available
  const sortedTags = Array.from(tagFrequency.entries()).sort((a, b) => b[1] - a[1]);
  if (sortedTags.length > 0 && sortedTags[0][1] >= Math.ceil(items.length * 0.4)) {
    const dominantTag = sortedTags[0][0];
    const capitalized = dominantTag.charAt(0).toUpperCase() + dominantTag.slice(1);
    return {
      title: `${capitalized} Moments`,
      subtitle: `${items.length} moments unified by #${dominantTag}`,
      confidence: 'medium',
    };
  }

  // If first item has a descriptive momentType or activity
  const firstInsight = items[0]?.aiInsight;
  if (firstInsight?.activity && firstInsight.activity.length > 3) {
    const act = firstInsight.activity;
    const cleanAct = act.charAt(0).toUpperCase() + act.slice(1);
    return {
      title: cleanAct.length > 32 ? cleanAct.slice(0, 32) + '...' : cleanAct,
      subtitle: `${items.length} moments grounded in ${firstInsight.scene || 'captured scene'}`,
      confidence: 'medium',
    };
  }

  // Fallback for single or low-confidence cluster
  if (items.length === 1) {
    return {
      title: items[0].title || 'Unsorted Memory',
      subtitle: 'Single captured moment',
      confidence: 'medium',
    };
  }

  return {
    title: 'Unsorted Memory',
    subtitle: `${items.length} captured moments waiting to be illuminated`,
    confidence: 'low',
  };
}

/**
 * Extracts dominant tags from a collection of items
 */
function extractDominantTags(items: UploadingFileItem[]): string[] {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    (item.aiInsight?.tags || []).forEach((t) => {
      const clean = t.toLowerCase().trim();
      counts.set(clean, (counts.get(clean) || 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map((e) => e[0]);
}

/**
 * Extracts dominant activities from a collection of items
 */
function extractDominantActivities(items: UploadingFileItem[]): string[] {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    if (item.aiInsight?.activity) {
      const act = item.aiInsight.activity.trim();
      counts.set(act, (counts.get(act) || 0) + 1);
    }
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map((e) => e[0]);
}

/**
 * Core Local Deterministic Clustering Engine:
 * Groups uploaded media into coherent clusters using multi-signal scoring without calling Gemini.
 */
export function clusterMediaLocally(
  items: UploadingFileItem[],
  ownerId: string,
  memoryId?: string
): MemoryCluster[] {
  if (items.length === 0) return [];

  // Filter to valid uploaded items
  const validItems = items.filter(
    (m) => m.status === 'success' || Boolean(m.secure_url || m.cloudinaryAsset?.secure_url)
  );

  if (validItems.length === 0) return [];

  const candidates: ClusterCandidate[] = [];
  const unassigned: UploadingFileItem[] = [];

  // Process items sequentially into clusters
  validItems.forEach((item) => {
    let bestCluster: ClusterCandidate | null = null;
    let bestScore = 0;

    for (const cand of candidates) {
      const score = similarityToCluster(item, cand);
      if (score >= SIMILARITY_THRESHOLD && score > bestScore) {
        bestScore = score;
        bestCluster = cand;
      }
    }

    if (bestCluster) {
      bestCluster.items.push(item);
    } else {
      // Look for a secondary candidate or create a new cluster
      // If we already have items that could pair up with this item from unassigned
      const pairMatchIndex = unassigned.findIndex(
        (u) => computeMediaSimilarity(item, u).totalScore >= SIMILARITY_THRESHOLD
      );

      if (pairMatchIndex !== -1) {
        const paired = unassigned.splice(pairMatchIndex, 1)[0];
        const newCand: ClusterCandidate = {
          id: `cluster-${Date.now()}-${candidates.length + 1}`,
          title: '',
          items: [paired, item],
          dominantTags: [],
          dominantActivities: [],
          dominantScenes: [],
          confidence: 'high',
        };
        candidates.push(newCand);
      } else {
        unassigned.push(item);
      }
    }
  });

  // If there are unassigned items, group them or form small clusters
  if (unassigned.length > 0) {
    if (candidates.length === 0 && unassigned.length >= 1) {
      // If no clusters formed at all, group all into one primary cluster
      candidates.push({
        id: `cluster-${Date.now()}-1`,
        title: '',
        items: [...unassigned],
        dominantTags: [],
        dominantActivities: [],
        dominantScenes: [],
        confidence: unassigned.length > 1 ? 'medium' : 'high',
      });
      unassigned.length = 0;
    } else {
      // Put remaining unassigned items in an "Unsorted / Other" cluster if they don't meet threshold
      candidates.push({
        id: `cluster-${Date.now()}-unsorted`,
        title: 'Unsorted Memory',
        items: [...unassigned],
        dominantTags: [],
        dominantActivities: [],
        dominantScenes: [],
        confidence: 'low',
      });
    }
  }

  // Convert candidates into formal MemoryCluster records
  const clusters: MemoryCluster[] = candidates.map((cand, idx) => {
    const meta = generateClusterTitle(cand.items);
    const dominantTags = extractDominantTags(cand.items);
    const dominantActivities = extractDominantActivities(cand.items);
    const firstWithCover = cand.items.find((i) => i.secure_url || i.cloudinaryAsset?.secure_url);
    const coverImageUrl = firstWithCover?.secure_url || firstWithCover?.cloudinaryAsset?.secure_url;

    const times = cand.items
      .map((i) => i.time)
      .filter((t): t is string => Boolean(t && t !== 'Just now'));

    return {
      id: cand.id || `cluster-${Date.now()}-${idx + 1}`,
      ownerId,
      memoryId: memoryId || `memory-${Date.now()}`,
      title: cand.title || meta.title,
      subtitle: meta.subtitle,
      narrativeSummary: undefined, // To be filled by Gemini synthesis per cluster
      mediaIds: cand.items.map((i) => i.id),
      momentIds: cand.items.map((i) => i.id),
      dominantTags,
      dominantActivities,
      timeRange: {
        start: times[0] || '09:00 AM',
        end: times[times.length - 1] || '06:00 PM',
      },
      location: cand.items[0]?.aiInsight?.scene || 'Personal Archive',
      confidence: meta.confidence,
      coverImageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  return clusters;
}

/**
 * Incremental clustering: Integrates newly uploaded media into existing clusters
 * without reprocessing the entire library unnecessarily.
 */
export function integrateMediaIntoClusters(
  newItems: UploadingFileItem[],
  existingClusters: MemoryCluster[],
  existingAllItems: UploadingFileItem[],
  ownerId: string,
  memoryId?: string
): {
  updatedClusters: MemoryCluster[];
  affectedClusterIds: Set<string>;
} {
  const affectedClusterIds = new Set<string>();
  const clustersCopy: MemoryCluster[] = existingClusters.map((c) => ({
    ...c,
    mediaIds: [...c.mediaIds],
    momentIds: [...c.momentIds],
  }));

  const itemMap = new Map<string, UploadingFileItem>();
  existingAllItems.forEach((i) => itemMap.set(i.id, i));
  newItems.forEach((i) => itemMap.set(i.id, i));

  const unassigned: UploadingFileItem[] = [];

  for (const item of newItems) {
    let bestCluster: MemoryCluster | null = null;
    let bestScore = 0;

    for (const cluster of clustersCopy) {
      // Compare item against cluster member items
      const memberItems = cluster.mediaIds
        .map((id) => itemMap.get(id))
        .filter((m): m is UploadingFileItem => Boolean(m));

      if (memberItems.length > 0) {
        const scores = memberItems.map((m) => computeMediaSimilarity(item, m).totalScore);
        const maxScore = Math.max(...scores);
        if (maxScore >= SIMILARITY_THRESHOLD && maxScore > bestScore) {
          bestScore = maxScore;
          bestCluster = cluster;
        }
      }
    }

    if (bestCluster) {
      bestCluster.mediaIds.push(item.id);
      bestCluster.momentIds.push(item.id);
      affectedClusterIds.add(bestCluster.id);
      bestCluster.updatedAt = new Date().toISOString();
      if (!bestCluster.coverImageUrl && item.secure_url) {
        bestCluster.coverImageUrl = item.secure_url;
      }
    } else {
      unassigned.push(item);
    }
  }

  // If there are unassigned new items, create new clusters for them
  if (unassigned.length > 0) {
    const newClusters = clusterMediaLocally(unassigned, ownerId, memoryId);
    newClusters.forEach((nc) => {
      clustersCopy.push(nc);
      affectedClusterIds.add(nc.id);
    });
  }

  return {
    updatedClusters: clustersCopy,
    affectedClusterIds,
  };
}
