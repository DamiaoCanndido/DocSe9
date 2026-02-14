'use client';

import React, { useState } from 'react';
import {
  Search,
  HelpCircle,
  Settings,
  LayoutGrid,
  Bell,
  Menu,
  ChevronDown,
  Filter,
} from 'lucide-react';
import Image from 'next/image';
import { useApp } from '@/contexts/AppContext';

export const Navbar: React.FC = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const { toggleSidebar } = useApp();

  return (
    <header className="h-16 flex items-center justify-between p-4 lg:px-6 bg-[#F8F9FA] sticky top-0 z-40">
      {/* Menu & Logo for Mobile */}
      <div className="flex items-center gap-2 lg:hidden mr-4 shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-[#F1F3F4] rounded-full text-[#5F6368] transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-3xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center cursor-pointer">
            <Search className="h-5 w-5 text-[#5F6368] group-focus-within:text-blue-600 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full bg-[#EDF2FC] border-none rounded-full py-2.5 sm:py-3 pl-10 sm:pl-12 pr-10 sm:pr-12 text-[#1F1F1F] placeholder-[#5F6368] focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none text-sm sm:text-base"
            placeholder="Search in Drive"
            value={''}
            onChange={(e) => {}}
          />
          <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center">
            <button className="p-1.5 sm:p-2 hover:bg-[#F1F3F4] rounded-full text-[#5F6368] transition-colors">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4 shrink-0">
        <button
          onClick={() => {}}
          className="p-2 sm:p-2.5 hover:bg-[#F1F3F4] rounded-full text-[#5F6368] transition-colors"
        >
          <Settings className="h-6 w-6" />
        </button>
        <button className="p-2 sm:p-2.5 hover:bg-[#F1F3F4] rounded-full text-[#5F6368] transition-colors hidden sm:flex">
          <Bell className="h-6 w-6" />
        </button>

        <div className="flex items-center sm:pl-2 sm:border-l sm:border-[#E0E0E0] ml-1 sm:ml-2 relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1 p-0.5 sm:p-1 pr-1.5 sm:pr-2 hover:bg-[#F1F3F4] rounded-full transition-colors group"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-[#E0E0E0]">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Bras%C3%A3o_Passagem_%28PB%29.jpg/960px-Bras%C3%A3o_Passagem_%28PB%29.jpg"
                alt="Profile"
                width={30}
                height={30}
              />
            </div>
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-[#5F6368] group-hover:text-[#1F1F1F] hidden sm:block" />
          </button>

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-[#E0E0E0] rounded-2xl shadow-xl z-20 overflow-hidden py-1">
                <button
                  onClick={() => {
                    /* onSettings(); */ setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-[#1F1F1F] hover:bg-gray-50 flex items-center gap-3"
                >
                  <Settings className="w-4 h-4 text-[#5F6368]" />
                  Settings
                </button>
                <div className="h-px bg-[#E0E0E0] my-1" />
                <button
                  onClick={() => {
                    /* onLogout(); */ setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 font-semibold"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-red-600" />
                  </div>
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
