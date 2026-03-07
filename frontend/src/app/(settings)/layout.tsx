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
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row font-sans">
      {/* Sidebar de Configurações */}
      <aside className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 shrink-0">
        <div className="p-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Voltar
          </button>
          
          <h1 className="text-xl font-bold text-gray-900 mb-6 px-2">Configurações</h1>
          
          <nav className="space-y-1">
            {settingsNavItems.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
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
