'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, Shield, Palette, ArrowLeft } from 'lucide-react';

const settingsNavItems = [
  { label: 'Perfil', href: '/profile', icon: User },
  { label: 'Segurança', href: '/security', icon: Shield },
  { label: 'Aparência', href: '/theme', icon: Palette },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col lg:flex-row font-sans transition-colors duration-300">
      {/* Sidebar de Configurações */}
      <aside className="w-full lg:w-72 bg-white dark:bg-zinc-900 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-zinc-800 shrink-0">
        <div className="p-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Voltar
          </button>
          
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6 px-2">Configurações</h1>
          
          <nav className="space-y-1">
            {settingsNavItems.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Área de Conteúdo */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
