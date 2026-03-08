'use client';

import AdminModal from '@/components/AdminModal';
import { AlertCircle, Trash2 } from 'lucide-react';

interface DeleteTownModalProps {
  town: TownResProps;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteTownModal({
  town,
  onClose,
  onConfirm,
}: DeleteTownModalProps) {
  return (
    <AdminModal title="Excluir município" onClose={onClose}>
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <Trash2 size={26} className="text-red-500" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900 dark:text-zinc-100">
            Excluir "{town.name}"?
          </p>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Essa ação não pode ser desfeita.
          </p>
        </div>
        <div className="w-full bg-gray-50 dark:bg-zinc-950/50 rounded-xl border border-gray-100 dark:border-zinc-800 divide-y divide-gray-100 dark:divide-zinc-800 transition-colors">
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-500 dark:text-zinc-500">Estado (UF)</span>
            <span className="font-medium text-gray-800 dark:text-zinc-200">{town.uf}</span>
          </div>

          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-500 dark:text-zinc-500">Usuários associados</span>
            <span className="font-medium text-gray-800 dark:text-zinc-200">{town.totalUsers}</span>
          </div>
        </div>
        {town.totalUsers > 0 && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-xs text-red-700 dark:text-red-400 text-left w-full border border-transparent dark:border-red-900/50">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>
              A exclusão desta cidade excluirá {town.totalUsers} usuários
              associados definitivamente. Tem certeza que quer continuar?
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800 -mx-6 -mb-2 px-6 pb-0">
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-medium text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 transition py-2"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition shadow-lg shadow-red-100 dark:shadow-none"
        >
          Excluir
        </button>
      </div>
    </AdminModal>
  );
}
