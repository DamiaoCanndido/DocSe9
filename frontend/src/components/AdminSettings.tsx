import { Settings } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center py-20 px-6 text-center gap-3 transition-colors">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
        <Settings size={26} className="text-gray-400 dark:text-zinc-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        Configurações de administrador
      </h3>
      <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-xs">
        Configure as variáveis ​​globais do sistema, as regras de agrupamento de
        cidades e a retenção do log de auditoria.
      </p>
    </div>
  );
}
