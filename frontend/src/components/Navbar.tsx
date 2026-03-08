'use client';

import React, { useState } from 'react';
import { Settings, Bell, Menu, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useApp } from '@/contexts/AppContext';
import { signOutUser } from '@/app/api/users';
import SearchFoldersAndFiles from '@/components/Search';
import { useRouter } from 'next/navigation';

export const Navbar: React.FC<{ currentUser: UserResProps }> = ({
  currentUser,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();

  const { toggleSidebar } = useApp();

  return (
    <header className="h-16 flex items-center justify-between p-4 lg:px-6 bg-[#F8F9FA] dark:bg-black sticky top-0 z-40 transition-colors">
      {/* Menu & Logo for Mobile */}
      <div className="flex items-center gap-2 lg:hidden mr-4 shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-[#F1F3F4] dark:hover:bg-zinc-900 rounded-full text-[#5F6368] dark:text-zinc-400 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {currentUser.role.name !== 'admin' ? (
        <SearchFoldersAndFiles />
      ) : (
        <div></div>
      )}

      {/* Right Actions */}
      <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4 shrink-0">
        <button
          onClick={() => router.push('/profile')}
          className="p-2 sm:p-2.5 hover:bg-[#F1F3F4] dark:hover:bg-zinc-900 rounded-full text-[#5F6368] dark:text-zinc-400 transition-colors"
        >
          <Settings className="h-6 w-6" />
        </button>
        <button className="p-2 sm:p-2.5 hover:bg-[#F1F3F4] dark:hover:bg-zinc-900 rounded-full text-[#5F6368] dark:text-zinc-400 transition-colors hidden sm:flex">
          <Bell className="h-6 w-6" />
        </button>

        <div className="flex items-center sm:pl-2 sm:border-l sm:border-[#E0E0E0] dark:sm:border-zinc-800 ml-1 sm:ml-2 relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1 p-0.5 sm:p-1 pr-1.5 sm:pr-2 hover:bg-[#F1F3F4] dark:hover:bg-zinc-900 rounded-full transition-colors group"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-[#E0E0E0] dark:border-zinc-800">
              <Image
                src={currentUser?.town?.imageUrl || '/admin-icon.png'}
                alt="Profile"
                width={30}
                height={30}
              />
            </div>
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-[#5F6368] dark:text-zinc-400 group-hover:text-[#1F1F1F] dark:group-hover:text-white hidden sm:block" />
          </button>

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-[#E0E0E0] dark:border-zinc-800 rounded-2xl shadow-xl z-20 overflow-hidden py-1">
                <button
                  onClick={() => {
                    router.push('/profile');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-[#1F1F1F] dark:text-zinc-100 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#5F6368] dark:text-zinc-400" />
                  Configurações
                </button>
                <div className="h-px bg-[#E0E0E0] dark:bg-zinc-800 my-1" />
                <button
                  onClick={() => {
                    signOutUser();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-3 font-semibold transition-colors"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-red-600" />
                  </div>
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
