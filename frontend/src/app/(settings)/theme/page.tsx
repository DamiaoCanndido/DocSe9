'use client';

import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const themes = [
    {
      id: 'light',
      label: 'Claro',
      icon: Sun,
      description: 'Ideal para ambientes bem iluminados.',
    },
    {
      id: 'dark',
      label: 'Escuro',
      icon: Moon,
      description: 'Reduz o cansaço visual em ambientes escuros.',
    },
    {
      id: 'system',
      label: 'Sistema',
      icon: Monitor,
      description: 'Sincroniza com as configurações do seu dispositivo.',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Aparência</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Personalize como o DocSeq aparece no seu dispositivo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {themes.map(({ id, label, icon: Icon, description }) => (
          <button
            key={id}
            onClick={() => setTheme(id)}
            className={`flex flex-col items-start p-5 rounded-2xl border transition-all text-left group ${
              theme === id
                ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 ring-2 ring-blue-500/20'
                : 'bg-white border-gray-100 dark:bg-zinc-900 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-800'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                theme === id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400 group-hover:bg-blue-100 group-hover:text-blue-600'
              }`}
            >
              <Icon size={20} />
            </div>
            <h3
              className={`font-semibold mb-1 ${
                theme === id ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'
              }`}
            >
              {label}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {description}
            </p>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6 overflow-hidden relative">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
            <Sun className="text-amber-500" size={24} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 dark:text-white">Pré-visualização do Tema</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Você está visualizando a interface no modo{' '}
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {theme === 'system' ? 'Automático' : theme === 'dark' ? 'Escuro' : 'Claro'}
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
