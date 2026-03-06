'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type ViewType =
  | 'dashboard'
  | 'my-drive'
  | 'shared'
  | 'starred'
  | 'trash'
  | 'settings'
  | 'search'
  | 'recent'
  | 'admin';

export type DisplayMode = 'grid' | 'list';

interface AppContextType {
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;

  // View (opcional)
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;

  // Display mode
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;

  // Folder context
  currentFolderId: string | null;
  setCurrentFolderId: (id: string | null) => void;

  // Upload modal
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('list');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <AppContext.Provider
      value={{
        // Sidebar
        isSidebarOpen,
        toggleSidebar: () => setIsSidebarOpen((prev) => !prev),
        openSidebar: () => setIsSidebarOpen(true),
        closeSidebar: () => setIsSidebarOpen(false),

        // View
        currentView,
        setCurrentView,

        // Display mode
        displayMode,
        setDisplayMode,

        // Folder context
        currentFolderId,
        setCurrentFolderId,

        // Upload modal
        isUploadModalOpen,
        setIsUploadModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
