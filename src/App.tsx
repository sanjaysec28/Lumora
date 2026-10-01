/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Route, MediaDetailItem, MemoryCollectionItem } from './types';
import { LandingPage } from './views/LandingPage';
import { DashboardView } from './views/DashboardView';
import { CreateMemoryView } from './views/CreateMemoryView';
import { MemoryDemoView } from './views/MemoryDemoView';
import { LoginModal } from './views/LoginModal';
import { SearchModal } from './components/SearchModal';
import { ProfileModal } from './components/ProfileModal';
import { MediaDetailModal } from './components/MediaDetailModal';
import { mockMediaDetails, mockMemoryCollection } from './lib/mockData';
import {
  subscribeToAuthChanges,
  loadUserMemoriesFromFirestore,
  isFirebaseConfigured,
} from './lib/firebase';
import { User } from 'firebase/auth';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>('/');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeMediaDetail, setActiveMediaDetail] = useState<MediaDetailItem | null>(null);

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Global memory collections state
  const [memories, setMemories] = useState<MemoryCollectionItem[]>(mockMemoryCollection);
  const [activeMemory, setActiveMemory] = useState<MemoryCollectionItem>(mockMemoryCollection[0]);

  const handleSaveNewMemory = (newMemory: MemoryCollectionItem) => {
    setMemories((prev) => [newMemory, ...prev]);
    setActiveMemory(newMemory);
  };

  // Subscribe to real Firebase authentication and load user's Firestore memories
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setCurrentUser(user);
      const ownerId = user?.uid || 'user_lumora_default';
      if (isFirebaseConfigured()) {
        try {
          const userMemories = await loadUserMemoriesFromFirestore(ownerId);
          if (userMemories && userMemories.length > 0) {
            setMemories(userMemories);
            setActiveMemory(userMemories[0]);
          }
        } catch (err) {
          console.warn('[Lumora] Error loading user memories from Firestore:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync route on mount if URL path matches
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.location) {
        const path = window.location.pathname as Route;
        if (['/', '/dashboard', '/create', '/memory/demo'].includes(path)) {
          setCurrentRoute(path);
        }

        const handlePopState = () => {
          const p = window.location.pathname as Route;
          if (['/', '/dashboard', '/create', '/memory/demo'].includes(p)) {
            setCurrentRoute(p);
          }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
      }
    } catch (err) {
      console.warn('History API not accessible in current iframe:', err);
    }
  }, []);

  // Global keyboard shortcut for search (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (route: Route) => {
    setCurrentRoute(route);
    try {
      if (typeof window !== 'undefined' && window.history) {
        window.history.pushState({}, '', route);
      }
    } catch (err) {
      // Sandboxed iframe safety
    }
    try {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (_) {}
  };

  return (
    <div className="min-h-screen bg-[#EDE6F7] selection:bg-[#B8A7FF]/30 selection:text-[#3B267E]">
      {/* Route Views */}
      {currentRoute === '/' && (
        <LandingPage
          onNavigate={handleNavigate}
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />
      )}

      {currentRoute === '/dashboard' && (
        <DashboardView
          onNavigate={handleNavigate}
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          memories={memories}
          onSelectMemory={(mem) => {
            setActiveMemory(mem);
            handleNavigate('/memory/demo');
          }}
        />
      )}

      {currentRoute === '/create' && (
        <CreateMemoryView
          onNavigate={handleNavigate}
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onSaveNewMemory={handleSaveNewMemory}
          currentUser={currentUser}
        />
      )}

      {currentRoute === '/memory/demo' && (
        <MemoryDemoView
          onNavigate={handleNavigate}
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          memory={activeMemory}
          onSelectMemory={(mem) => setActiveMemory(mem)}
          availableMemories={memories}
          currentUser={currentUser}
        />
      )}

      {/* Global Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectMedia={(mediaItem) => {
          setActiveMediaDetail(mediaItem);
        }}
        onNavigate={handleNavigate}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onSignOut={() => setCurrentUser(null)}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => {
          handleNavigate('/dashboard');
        }}
      />

      <MediaDetailModal
        item={activeMediaDetail}
        onClose={() => setActiveMediaDetail(null)}
        onSelectRelatedMoment={(title) => {
          const found = Object.values(mockMediaDetails).find((m) => m.title === title);
          if (found) setActiveMediaDetail(found);
        }}
        onViewInTimeline={() => {
          handleNavigate('/memory/demo');
        }}
      />
    </div>
  );
}
