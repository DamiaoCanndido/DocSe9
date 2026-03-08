'use client';

import React from 'react';
import {
  LayoutDashboard,
  HardDrive,
  Clock,
  Star,
  Trash2,
  Plus,
  Cloud,
  X,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';

export const Sidebar: React.FC<{ currentUser: UserResProps }> = ({
  currentUser,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Painel inicial', icon: LayoutDashboard },
    { id: 'my-docs', label: 'Meus documentos', icon: HardDrive },
    { id: 'recent', label: 'Recentes', icon: Clock },
    { id: 'starred', label: 'Favoritos', icon: Star },
    { id: 'trash', label: 'Lixeira', icon: Trash2 },
    { id: 'admin', label: 'Administração', icon: ShieldCheck },
  ];

  const router = useRouter();
  const pathname = usePathname();

  const { isSidebarOpen, toggleSidebar, setIsUploadModalOpen } = useApp();

  const SidebarContent = () => (
    <div className="flex flex-col h-full p-4">
      {/* App Logo */}
      <div className="flex items-center justify-between mb-8 mt-2 px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Cloud className="text-white w-5 h-5" />
          </div>
          <span className="font-semibold text-xl tracking-tight text-[#444746] dark:text-zinc-200">
            DocSeq
          </span>
        </div>
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full"
        >
          <X className="w-5 h-5 text-[#5F6368] dark:text-zinc-400" />
        </button>
      </div>

      {/* New Button */}
      {currentUser.role.name !== 'admin' && pathname.startsWith('/my-docs') && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setIsUploadModalOpen(true);
            toggleSidebar();
          }}
          className="flex items-center gap-3 px-4 py-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm hover:shadow-md transition-shadow mb-8 text-[#1F1F1F] dark:text-zinc-100 font-medium border border-[#E0E0E0] dark:border-zinc-800"
        >
          <Plus className="w-6 h-6 text-blue-600" />
          <span>Novo</span>
        </motion.button>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems
          .filter((item) => {
            if (item.id === 'admin') {
              return currentUser.role.name !== 'basic';
            }
            return true;
          })
          .filter((item) => {
            if (item.id !== 'dashboard' && item.id !== 'admin') {
              return currentUser.role.name !== 'admin';
            }
            return true;
          })
          .map((item) => {
            const isActive =
              (item.id === 'dashboard' && pathname === '/dashboard') ||
              (item.id === 'my-docs' && pathname.startsWith('/my-docs')) ||
              (item.id === 'recent' && pathname === '/recent') ||
              (item.id === 'starred' && pathname === '/starred') ||
              (item.id === 'trash' && pathname === '/trash') ||
              (item.id === 'admin' && pathname === '/admin-panel');

            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  switch (item.id) {
                    case 'my-docs':
                      router.replace('/my-docs');
                      break;
                    case 'recent':
                      router.replace('/recent');
                      break;
                    case 'starred':
                      router.replace('/starred');
                      break;
                    case 'trash':
                      router.replace('/trash');
                      break;
                    case 'admin':
                      if (currentUser.role.name !== 'basic') {
                        router.replace('/admin-panel');
                      }
                      break;
                    default:
                      router.replace('/dashboard');
                  }
                  toggleSidebar();
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-full transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'text-[#444746] dark:text-zinc-400 hover:bg-[#F1F3F4] dark:hover:bg-zinc-900'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive
                      ? 'text-blue-700 dark:text-blue-400'
                      : 'text-[#444746] dark:text-zinc-400'
                  }`}
                />
                {item.label}
              </button>
            );
          })}
      </nav>

      {/* Storage Indicator */}
      <div className="mt-auto pt-6 border-t border-[#E0E0E0] dark:border-zinc-800">
        <div className="px-4 mb-4">
          <div className="flex justify-between text-xs text-[#444746] dark:text-zinc-400 mb-2 font-medium">
            <span>Storage</span>
            <span>75% used</span>
          </div>
          <div className="h-2 w-full bg-[#E0E0E0] dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              className="h-full bg-blue-600 rounded-full"
            />
          </div>
          <p className="mt-2 text-[11px] text-[#444746] dark:text-zinc-500">
            11.2 GB of 15 GB used
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col h-full bg-[#F8F9FA] dark:bg-zinc-950 border-r border-[#E0E0E0] dark:border-zinc-800 shrink-0 transition-colors">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-60 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-70 bg-[#F8F9FA] dark:bg-zinc-950 z-70 shadow-2xl lg:hidden transition-colors"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Nav for Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-zinc-900 border-t border-[#E0E0E0] dark:border-zinc-800 z-50 flex items-center transition-colors">
        {navItems.slice(0, 4).map((item) => {
          const isActive =
            (item.id === 'dashboard' && pathname === '/dashboard') ||
            (item.id === 'my-docs' && pathname.startsWith('/my-docs')) ||
            (item.id === 'recent' && pathname === '/recent') ||
            (item.id === 'starred' && pathname === '/starred') ||
            (item.id === 'trash' && pathname === '/trash');

          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                switch (item.id) {
                  case 'my-docs':
                    router.replace('/my-docs');
                    break;
                  case 'recent':
                    router.replace('/recent');
                    break;
                  case 'starred':
                    router.replace('/starred');
                    break;
                  case 'trash':
                    router.replace('/trash');
                    break;
                  default:
                    router.replace('/dashboard');
                }
              }}
              className={`flex-1 flex flex-col items-center justify-center gap-1 h-full ${
                isActive ? 'text-blue-600' : 'text-[#5F6368]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium text-center px-1">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
