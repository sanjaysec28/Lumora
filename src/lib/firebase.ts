/**
 * Lumora Firebase Integration Service
 * Provides modular Firebase App, Firebase Auth, and Firestore persistence.
 * Ensures single initialization and zero exposed secrets in logs or bundles.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  getDocFromServer,
} from 'firebase/firestore';
import { MemoryCollectionItem, UploadingFileItem, TimelineMoment, ConversationTurn, MemoryCluster, MemoryStoryCapsule } from '../types';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const STORAGE_KEY_FIREBASE = 'lumora_firebase_config';

/**
 * Retrieves the Firebase configuration from environment variables or localStorage.
 */
export function getFirebaseConfig(): FirebaseConfig {
  const envConfig: FirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  };

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FIREBASE);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          apiKey: parsed.apiKey || envConfig.apiKey,
          authDomain: parsed.authDomain || envConfig.authDomain,
          projectId: parsed.projectId || envConfig.projectId,
          storageBucket: parsed.storageBucket || envConfig.storageBucket,
          messagingSenderId: parsed.messagingSenderId || envConfig.messagingSenderId,
          appId: parsed.appId || envConfig.appId,
        };
      }
    } catch (_) {}
  }

  return envConfig;
}

/**
 * Saves Firebase configuration to localStorage.
 */
export function setFirebaseConfig(config: Partial<FirebaseConfig>): void {
  if (typeof window !== 'undefined') {
    try {
      const current = getFirebaseConfig();
      const updated = { ...current, ...config };
      localStorage.setItem(STORAGE_KEY_FIREBASE, JSON.stringify(updated));
    } catch (_) {}
  }
}

/**
 * Checks whether all required Firebase credentials have been configured.
 */
export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
  return Boolean(
    config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.appId
  );
}

// Singleton instances
let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

/**
 * Initializes Firebase App, Auth, and Firestore exactly once.
 */
export function getFirebaseServices(): {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
} {
  if (appInstance && authInstance && dbInstance) {
    return { app: appInstance, auth: authInstance, db: dbInstance };
  }

  const config = getFirebaseConfig();
  if (!config.apiKey || !config.projectId) {
    return { app: null, auth: null, db: null };
  }

  try {
    if (!getApps().length) {
      appInstance = initializeApp(config);
    } else {
      appInstance = getApp();
    }

    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);

    return { app: appInstance, auth: authInstance, db: dbInstance };
  } catch (err) {
    console.warn('Firebase initialization warning:', err instanceof Error ? err.message : 'Unknown error');
    return { app: null, auth: null, db: null };
  }
}

/**
 * Tests connection to Firestore with a lightweight check.
 */
export async function testFirestoreConnection(): Promise<boolean> {
  const { db } = getFirebaseServices();
  if (!db) return false;

  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore connection: client is offline or config invalid');
      return false;
    }
    // Any permission error or doc-not-found means we reached the server successfully
    return true;
  }
}

// -------------------------------------------------------------
// Authentication & User Profile Helpers
// -------------------------------------------------------------

/**
 * Syncs user profile document in Firestore: users/{uid}
 */
export async function syncUserProfileToFirestore(user: User): Promise<void> {
  const { db } = getFirebaseServices();
  if (!db || !user?.uid) return;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(
      userDocRef,
      {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Lumora Creator',
        photoURL: user.photoURL || '',
        lastLoginAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not sync user profile to Firestore:', err instanceof Error ? err.message : err);
  }
}

export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
  const { auth } = getFirebaseServices();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      syncUserProfileToFirestore(user).catch(() => {});
    }
    callback(user);
  });
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const { auth } = getFirebaseServices();
  if (!auth) throw new Error('Firebase configuration is incomplete.');

  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await syncUserProfileToFirestore(cred.user);
    }
    return cred.user;
  } catch (err: any) {
    if (err.code === 'auth/configuration-not-found') {
      throw new Error('Email/Password provider is not yet enabled in the Firebase Console.');
    }
    // If user does not exist, attempt registration
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      try {
        const newCred = await createUserWithEmailAndPassword(auth, email, pass);
        if (newCred.user) {
          await syncUserProfileToFirestore(newCred.user);
        }
        return newCred.user;
      } catch (createErr: any) {
        if (createErr.code === 'auth/configuration-not-found') {
          throw new Error('Email/Password provider is not yet enabled in the Firebase Console.');
        }
        if (createErr.code === 'auth/weak-password') {
          throw new Error('Password should be at least 6 characters.');
        }
        if (createErr.code === 'auth/email-already-in-use') {
          throw new Error('An account already exists with this email address.');
        }
        throw new Error(createErr.message || 'Authentication failed. Please verify credentials.');
      }
    }
    if (err.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please verify credentials.');
    }
    if (err.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    }
    throw new Error(err.message || 'Failed to sign in. Please verify credentials.');
  }
}

export async function loginAnonymously(): Promise<User> {
  const { auth } = getFirebaseServices();
  if (!auth) throw new Error('Firebase configuration is incomplete.');
  try {
    const cred = await signInAnonymously(auth);
    if (cred.user) {
      await syncUserProfileToFirestore(cred.user);
    }
    return cred.user;
  } catch (err: any) {
    if (err.code === 'auth/configuration-not-found') {
      throw new Error('Anonymous sign-in is not yet enabled in the Firebase Console.');
    }
    throw new Error(err.message || 'Anonymous sign-in is temporarily unavailable.');
  }
}

export async function logoutUser(): Promise<void> {
  const { auth } = getFirebaseServices();
  if (!auth) return;
  await signOut(auth);
}

// -------------------------------------------------------------
// Firestore Persistence Helpers
// -------------------------------------------------------------

/**
 * Persists a complete memory capsule into Firestore:
 * - Parent: memories/{memoryId} (includes ownerId)
 * - Subcollection: memories/{memoryId}/media/{mediaId}
 * - Subcollection: memories/{memoryId}/moments/{momentId}
 */
export async function saveMemoryToFirestore(
  memory: MemoryCollectionItem,
  ownerId: string
): Promise<void> {
  const { db } = getFirebaseServices();
  if (!db) {
    throw new Error('Firebase configuration is incomplete.');
  }

  // 1. Parent Memory Document
  const memoryDocRef = doc(db, 'memories', memory.id);
  const memoryPayload = {
    id: memory.id,
    ownerId,
    title: memory.title,
    subtitle: memory.subtitle || '',
    date: memory.date || new Date().toLocaleDateString(),
    monthYear: memory.monthYear || 'September 2026',
    location: memory.location || 'Chennai',
    assetCount: memory.assetCount || memory.mediaItems?.length || 0,
    videoCount: memory.videoCount || 0,
    category: memory.category || 'Projects',
    coverGradient: memory.coverGradient || 'from-[#3B267E] to-[#6D5DFB]',
    coverImageUrl: memory.coverImageUrl || '',
    tags: memory.tags || ['Illuminated'],
    aiSummary: memory.aiSummary || '',
    mood: memory.mood || 'Cinematic',
    graphNodes: memory.graphNodes || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(memoryDocRef, memoryPayload);

  // 2. Subcollection: media
  if (memory.mediaItems && memory.mediaItems.length > 0) {
    for (const item of memory.mediaItems) {
      const mediaDocRef = doc(db, 'memories', memory.id, 'media', item.id);
      await setDoc(mediaDocRef, {
        id: item.id,
        memoryId: memory.id,
        ownerId,
        filename: item.filename,
        type: item.type,
        size: item.size || '4.0 MB',
        title: item.title,
        time: item.time || '04:00 PM',
        secure_url: item.secure_url || item.cloudinaryAsset?.secure_url || '',
        cloudinaryAsset: item.cloudinaryAsset || null,
        aiInsight: item.aiInsight || null,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // 3. Subcollection: moments
  if (memory.timelineMoments && memory.timelineMoments.length > 0) {
    for (const moment of memory.timelineMoments) {
      const momentDocRef = doc(db, 'memories', memory.id, 'moments', moment.id);
      await setDoc(momentDocRef, {
        id: moment.id,
        memoryId: memory.id,
        ownerId,
        time: moment.time,
        title: moment.title,
        description: moment.description,
        mediaType: moment.mediaType,
        tags: moment.tags,
        context: moment.context || '',
        coverGradient: moment.coverGradient || '',
        secure_url: moment.secure_url || '',
        cloudinaryAsset: moment.cloudinaryAsset || null,
        scene: moment.scene || null,
        activity: moment.activity || null,
        objects: moment.objects || [],
        momentType: moment.momentType || null,
        aiInsight: moment.aiInsight || null,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // 4. Subcollection: clusters & Top-level clusters collection
  if (memory.clusters && memory.clusters.length > 0) {
    for (const cluster of memory.clusters) {
      const clusterData: any = {
        id: cluster.id,
        memoryId: memory.id,
        ownerId,
        title: cluster.title,
        subtitle: cluster.subtitle || '',
        narrativeSummary: cluster.narrativeSummary || cluster.storyCapsule?.summary || '',
        mediaIds: cluster.mediaIds || [],
        momentIds: cluster.momentIds || [],
        dominantTags: cluster.dominantTags || [],
        dominantActivities: cluster.dominantActivities || [],
        timeRange: cluster.timeRange || null,
        location: cluster.location || '',
        confidence: cluster.confidence || 'medium',
        coverImageUrl: cluster.coverImageUrl || '',
        storyCapsule: cluster.storyCapsule || null,
        createdAt: cluster.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // In memory subcollection
      const memoryClusterDocRef = doc(db, 'memories', memory.id, 'clusters', cluster.id);
      await setDoc(memoryClusterDocRef, clusterData);

      // In top-level clusters collection
      const topLevelClusterDocRef = doc(db, 'clusters', cluster.id);
      await setDoc(topLevelClusterDocRef, clusterData);

      // Persist Story Capsule subcollection: memories/{memoryId}/clusters/{clusterId}/story/main
      if (cluster.storyCapsule) {
        const capsuleData = {
          ...cluster.storyCapsule,
          ownerId,
          clusterId: cluster.id,
          memoryId: memory.id,
          updatedAt: new Date().toISOString(),
        };

        const clusterStoryRef = doc(db, 'memories', memory.id, 'clusters', cluster.id, 'story', 'main');
        await setDoc(clusterStoryRef, capsuleData);

        const topClusterStoryRef = doc(db, 'clusters', cluster.id, 'story', 'main');
        await setDoc(topClusterStoryRef, capsuleData);

        const topCapsuleRef = doc(db, 'storyCapsules', cluster.storyCapsule.id);
        await setDoc(topCapsuleRef, capsuleData);
      }
    }
  }
}

/**
 * Saves a single Story Capsule directly to Firestore
 */
export async function saveStoryCapsuleToFirestore(
  capsule: MemoryStoryCapsule,
  memoryId?: string
): Promise<void> {
  const { db } = getFirebaseServices();
  if (!db) return;

  const capsuleData = {
    ...capsule,
    memoryId: memoryId || '',
    updatedAt: new Date().toISOString(),
  };

  const topCapsuleRef = doc(db, 'storyCapsules', capsule.id);
  await setDoc(topCapsuleRef, capsuleData);

  if (capsule.clusterId) {
    const topClusterStoryRef = doc(db, 'clusters', capsule.clusterId, 'story', 'main');
    await setDoc(topClusterStoryRef, capsuleData);

    if (memoryId) {
      const memoryClusterStoryRef = doc(db, 'memories', memoryId, 'clusters', capsule.clusterId, 'story', 'main');
      await setDoc(memoryClusterStoryRef, capsuleData);
    }
  }
}

/**
 * Loads a Story Capsule for a cluster from Firestore
 */
export async function loadStoryCapsuleFromFirestore(
  clusterId: string,
  memoryId?: string
): Promise<MemoryStoryCapsule | null> {
  const { db } = getFirebaseServices();
  if (!db) return null;

  try {
    if (memoryId) {
      const memSnap = await getDoc(doc(db, 'memories', memoryId, 'clusters', clusterId, 'story', 'main'));
      if (memSnap.exists()) return memSnap.data() as MemoryStoryCapsule;
    }
    const clusterSnap = await getDoc(doc(db, 'clusters', clusterId, 'story', 'main'));
    if (clusterSnap.exists()) return clusterSnap.data() as MemoryStoryCapsule;
  } catch (err) {
    console.warn('Could not load Story Capsule from Firestore:', err);
  }
  return null;
}

/**
 * Saves a single cluster directly to Firestore
 */
export async function saveClusterToFirestore(cluster: MemoryCluster, ownerId: string): Promise<void> {
  const { db } = getFirebaseServices();
  if (!db) return;

  const clusterData: any = {
    id: cluster.id,
    memoryId: cluster.memoryId || '',
    ownerId,
    title: cluster.title,
    subtitle: cluster.subtitle || '',
    narrativeSummary: cluster.narrativeSummary || cluster.storyCapsule?.summary || '',
    mediaIds: cluster.mediaIds || [],
    momentIds: cluster.momentIds || [],
    dominantTags: cluster.dominantTags || [],
    dominantActivities: cluster.dominantActivities || [],
    timeRange: cluster.timeRange || null,
    location: cluster.location || '',
    confidence: cluster.confidence || 'medium',
    coverImageUrl: cluster.coverImageUrl || '',
    storyCapsule: cluster.storyCapsule || null,
    createdAt: cluster.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const topRef = doc(db, 'clusters', cluster.id);
  await setDoc(topRef, clusterData);

  if (cluster.memoryId) {
    const memRef = doc(db, 'memories', cluster.memoryId, 'clusters', cluster.id);
    await setDoc(memRef, clusterData);
  }

  if (cluster.storyCapsule) {
    await saveStoryCapsuleToFirestore(cluster.storyCapsule, cluster.memoryId);
  }
}

/**
 * Loads all clusters belonging to the user from Firestore
 */
export async function loadUserClustersFromFirestore(ownerId: string): Promise<MemoryCluster[]> {
  const { db } = getFirebaseServices();
  if (!db) return [];

  try {
    const q = query(collection(db, 'clusters'), where('ownerId', '==', ownerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as MemoryCluster);
  } catch (err) {
    console.warn('Could not load clusters from Firestore:', err);
    return [];
  }
}

/**
 * Loads all private memories owned by the authenticated user from Firestore.
 */
export async function loadUserMemoriesFromFirestore(ownerId: string): Promise<MemoryCollectionItem[]> {
  const { db } = getFirebaseServices();
  if (!db) return [];

  try {
    const q = query(collection(db, 'memories'), where('ownerId', '==', ownerId));
    const querySnapshot = await getDocs(q);

    const memories: MemoryCollectionItem[] = [];

    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      const memoryId = docSnapshot.id;

      // Load subcollection: media
      const mediaSnap = await getDocs(collection(db, 'memories', memoryId, 'media'));
      const mediaItems: UploadingFileItem[] = mediaSnap.docs.map((d) => {
        const mData = d.data();
        return {
          id: mData.id,
          filename: mData.filename,
          type: mData.type,
          size: mData.size,
          title: mData.title,
          time: mData.time,
          gradient: 'from-[#3B267E] to-[#6D5DFB]',
          progress: 100,
          status: 'success',
          secure_url: mData.secure_url,
          cloudinaryAsset: mData.cloudinaryAsset,
          aiInsight: mData.aiInsight,
        };
      });

      // Load subcollection: moments
      const momentsSnap = await getDocs(collection(db, 'memories', memoryId, 'moments'));
      const timelineMoments: TimelineMoment[] = momentsSnap.docs.map((d) => {
        const tData = d.data();
        return {
          id: tData.id,
          time: tData.time,
          title: tData.title,
          description: tData.description,
          mediaCount: 1,
          mediaType: tData.mediaType,
          tags: tData.tags || [],
          context: tData.context,
          coverGradient: tData.coverGradient || 'from-[#6D5DFB] to-[#F4A7D8]',
          secure_url: tData.secure_url,
          cloudinaryAsset: tData.cloudinaryAsset,
          relatedMomentIds: [],
          scene: tData.scene,
          activity: tData.activity,
          objects: tData.objects,
          momentType: tData.momentType,
          aiInsight: tData.aiInsight,
        };
      });

      // Load subcollection: clusters
      let clusters: MemoryCluster[] = [];
      try {
        const clustersSnap = await getDocs(collection(db, 'memories', memoryId, 'clusters'));
        clusters = clustersSnap.docs.map((d) => {
          const cData = d.data();
          return {
            id: cData.id,
            ownerId: cData.ownerId,
            memoryId: cData.memoryId,
            title: cData.title,
            subtitle: cData.subtitle,
            narrativeSummary: cData.narrativeSummary || cData.storyCapsule?.summary,
            mediaIds: cData.mediaIds || [],
            momentIds: cData.momentIds || [],
            dominantTags: cData.dominantTags || [],
            dominantActivities: cData.dominantActivities || [],
            timeRange: cData.timeRange,
            location: cData.location,
            confidence: cData.confidence || 'medium',
            coverImageUrl: cData.coverImageUrl,
            storyCapsule: cData.storyCapsule || undefined,
            createdAt: cData.createdAt,
            updatedAt: cData.updatedAt,
          };
        });
      } catch (_) {}

      const storyCapsules = clusters
        .map((c) => c.storyCapsule)
        .filter((sc): sc is MemoryStoryCapsule => Boolean(sc));

      memories.push({
        id: memoryId,
        title: data.title,
        subtitle: data.subtitle,
        date: data.date,
        monthYear: data.monthYear,
        location: data.location,
        assetCount: data.assetCount || mediaItems.length,
        videoCount: data.videoCount || mediaItems.filter((i) => i.type === 'video').length,
        category: data.category || 'Projects',
        coverGradient: data.coverGradient || 'from-[#3B267E] to-[#6D5DFB]',
        coverImageUrl: data.coverImageUrl || mediaItems[0]?.secure_url,
        tags: data.tags || ['Illuminated'],
        mediaItems,
        timelineMoments,
        clusters,
        storyCapsules,
        graphNodes: data.graphNodes || [],
        aiSummary: data.aiSummary,
        mood: data.mood,
      });
    }

    return memories;
  } catch (err) {
    console.warn('Could not load memories from Firestore:', err);
    return [];
  }
}

/**
 * Persists an Ask Your Memory conversation turn into Firestore:
 * memories/{memoryId}/conversations/{turnId}
 */
export async function saveConversationToFirestore(
  memoryId: string,
  turn: ConversationTurn,
  ownerId: string
): Promise<void> {
  const { db } = getFirebaseServices();
  if (!db) return;

  try {
    const convDocRef = doc(db, 'memories', memoryId, 'conversations', turn.id);
    await setDoc(convDocRef, {
      ...turn,
      memoryId,
      ownerId,
      savedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Failed to save conversation turn to Firestore:', err);
  }
}

/**
 * Loads conversation history for a memory from Firestore:
 * memories/{memoryId}/conversations
 */
export async function loadConversationsFromFirestore(memoryId: string): Promise<ConversationTurn[]> {
  const { db } = getFirebaseServices();
  if (!db) return [];

  try {
    const convSnap = await getDocs(collection(db, 'memories', memoryId, 'conversations'));
    return convSnap.docs.map((d) => d.data() as ConversationTurn);
  } catch (err) {
    console.warn('Failed to load conversations from Firestore:', err);
    return [];
  }
}
