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
  const count = 0;

  return (
    <AdminModal title="Excluir município" onClose={onClose}>
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <Trash2 size={26} className="text-red-500" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900">
            Excluir "{town.name}"?
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Essa ação não pode ser desfeita.
          </p>
        </div>
        <div className="w-full bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100">
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-500">Estado (UF)</span>
            <span className="font-medium text-gray-800">{town.uf}</span>
          </div>

          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-500">Usuários associados</span>
            <span className="font-medium text-gray-800">{count}</span>
          </div>
        </div>
        {count > 0 && (
          <div className="flex items-start gap-2 bg-red-50 rounded-xl p-3 text-xs text-red-700 text-left w-full">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>
              A exclusão desta cidade afetará {count} usuários associados. O
              campo "município" deles precisará ser atualizado manualmente.
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 -mx-6 -mb-2 px-6 pb-0">
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition py-2"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition"
        >
          Excluir
        </button>
      </div>
    </AdminModal>
  );
}
