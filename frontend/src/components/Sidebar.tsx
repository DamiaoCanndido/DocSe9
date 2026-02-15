'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  HardDrive,
  Users,
  Clock,
  Star,
  Trash2,
  Plus,
  Cloud,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ViewType, useApp } from '@/contexts/AppContext';

const onUpload = () => {};

export const Sidebar: React.FC<{ currentUser: UserResProps }> = ({
  currentUser,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Painel inicial', icon: LayoutDashboard },
    { id: 'my-docs', label: 'Meus documentos', icon: HardDrive },
    { id: 'shared', label: 'Shared', icon: Users },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'trash', label: 'Trash', icon: Trash2 },
    { id: 'admin', label: 'Administração', icon: ShieldCheck },
  ];

  const router = useRouter();

  const { isSidebarOpen, toggleSidebar } = useApp();

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const SidebarContent = () => (
    <div className="flex flex-col h-full p-4">
      {/* App Logo */}
      <div className="flex items-center justify-between mb-8 mt-2 px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Cloud className="text-white w-5 h-5" />
          </div>
          <span className="font-semibold text-xl tracking-tight text-[#444746]">
            DocSeq
          </span>
        </div>
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5 text-[#5F6368]" />
        </button>
      </div>

      {/* New Button */}
      {currentUser.role.name !== 'admin' && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            onUpload();
            toggleSidebar();
          }}
          className="flex items-center gap-3 px-4 py-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow mb-8 text-[#1F1F1F] font-medium border border-[#E0E0E0]"
        >
          <Plus className="w-6 h-6 text-blue-600" />
          <span>New</span>
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
            const isActive = currentView === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as ViewType);
                  switch (item.id) {
                    case 'my-docs':
                    case 'shared':
                    case 'recent':
                    case 'starred':
                    case 'trash':
                      router.push('/my-docs');
                      break;
                    case 'admin':
                      if (currentUser.role.name !== 'basic') {
                        router.push('/admin-panel');
                      }
                      break;
                    default:
                      router.push('/dashboard');
                  }
                  toggleSidebar();
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-full transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-[#444746] hover:bg-[#F1F3F4]'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-blue-700' : 'text-[#444746]'
                  }`}
                />
                {item.label}
              </button>
            );
          })}
      </nav>

      {/* Storage Indicator */}
      <div className="mt-auto pt-6 border-t border-[#E0E0E0]">
        <div className="px-4 mb-4">
          <div className="flex justify-between text-xs text-[#444746] mb-2 font-medium">
            <span>Storage</span>
            <span>75% used</span>
          </div>
          <div className="h-2 w-full bg-[#E0E0E0] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              className="h-full bg-blue-600 rounded-full"
            />
          </div>
          <p className="mt-2 text-[11px] text-[#444746]">
            11.2 GB of 15 GB used
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col h-full bg-[#F8F9FA] border-r border-[#E0E0E0] shrink-0">
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
              className="fixed top-0 left-0 bottom-0 w-70 bg-[#F8F9FA] z-70 shadow-2xl lg:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Nav for Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E0E0E0] z-50 px-4 flex items-center justify-around">
        {navItems.slice(0, 4).map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as ViewType)}
              className={`flex flex-col items-center gap-1 min-w-64px ${
                isActive ? 'text-blue-600' : 'text-#5F6368'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setCurrentView('settings')}
          className={`flex flex-col items-center gap-1 min-w-64px ${
            currentView === 'settings' ? 'text-blue-600' : 'text-#5F6368'
          }`}
        >
          <Plus className="w-5 h-5 rotate-45" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>
    </>
  );
};
