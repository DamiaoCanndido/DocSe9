'use client';

import { Trash2, Folder, File } from 'lucide-react';
import AdminModal from '@/components/AdminModal';
import { formatDateTime } from '@/lib/utils';

interface DeleteNodeModalProps {
  node: NodeResProps;
  isTrash?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteNodeModal({
  node,
  isTrash = false,
  onClose,
  onConfirm,
}: DeleteNodeModalProps) {
  const isFolder = node.nodeType === 'folder';

  return (
    <AdminModal
      title={
        isTrash
          ? isFolder
            ? 'Excluir pasta permanentemente'
            : 'Excluir arquivo permanentemente'
          : isFolder
          ? 'Mover pasta para lixeira'
          : 'Mover arquivo para lixeira'
      }
      onClose={onClose}
    >
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <Trash2 size={26} className="text-red-500" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900 dark:text-zinc-100">
            {isTrash
              ? `Excluir "${node.name}" permanentemente?`
              : `Mover "${node.name}" para a lixeira?`}
          </p>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            {isTrash
              ? 'Esta ação não pode ser desfeita.'
              : 'Você poderá restaurar este item da lixeira mais tarde.'}
          </p>
        </div>
        <div className="w-full bg-gray-50 dark:bg-zinc-950/50 rounded-xl border border-gray-100 dark:border-zinc-800 divide-y divide-gray-100 dark:divide-zinc-800 text-left transition-colors">
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-500 dark:text-zinc-500">Tipo</span>
            <div className="flex items-center gap-2 font-medium text-gray-800 dark:text-zinc-200">
              {isFolder ? (
                <>
                  <Folder size={14} className="text-gray-400 dark:text-zinc-500" />
                  <span>Pasta</span>
                </>
              ) : (
                <>
                  <File size={14} className="text-gray-400 dark:text-zinc-500" />
                  <span>Arquivo</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-500 dark:text-zinc-500">Data de criação</span>
            <span className="font-medium text-gray-800 dark:text-zinc-200">
              {formatDateTime(node.createdAt)}
            </span>
          </div>
          {!isFolder && (
            <div className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="text-gray-500 dark:text-zinc-500">Tamanho</span>
              <span className="font-medium text-gray-800 dark:text-zinc-200">{node.size}</span>
            </div>
          )}
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
          {isTrash ? 'Excluir permanentemente' : 'Mover para lixeira'}
        </button>
      </div>
    </AdminModal>
  );
}
