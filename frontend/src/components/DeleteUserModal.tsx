'use client';

import { Trash2 } from 'lucide-react';
import AdminModal from '@/components/AdminModal';
import UserBadge from '@/components/UserBadge';
import { translateRole } from '@/lib/utils';

interface DeleteUserModalProps {
  user: UserResProps;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteUserModal({
  user,
  onClose,
  onConfirm,
}: DeleteUserModalProps) {
  return (
    <AdminModal title="Excluir Usuário" onClose={onClose}>
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <Trash2 size={26} className="text-red-500" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900 dark:text-zinc-100">
            Excluir "{user.username}"?
          </p>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Esta ação não pode ser desfeita.
          </p>
        </div>
        <div className="w-full bg-gray-50 dark:bg-zinc-950/50 rounded-xl border border-gray-100 dark:border-zinc-800 divide-y divide-gray-100 dark:divide-zinc-800 transition-colors">
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-500 dark:text-zinc-500">Email</span>
            <span className="font-medium text-gray-800 dark:text-zinc-200">{user.email}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-500 dark:text-zinc-500">Município</span>
            <span className="font-medium text-gray-800 dark:text-zinc-200">
              {user.town !== null && user.town.name}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-500 dark:text-zinc-500">Função</span>
            <span className="font-medium text-gray-800 dark:text-zinc-200">
              {translateRole(user.role.name)}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-500 dark:text-zinc-500">Status</span>
            <UserBadge active={true} />
          </div>
        </div>
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
          Excluir Usuário
        </button>
      </div>
    </AdminModal>
  );
}
