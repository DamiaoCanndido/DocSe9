'use client';

import { useState, useEffect, useCallback } from 'react';
import { Folder, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import AdminModal from './AdminModal';
import { getRootFolders, getChildrenFolders } from '@/app/api/folders';
import { Button } from './ui/button';

interface MoveModalProps {
  nodes: NodeResProps[];
  onMove: (targetFolderId: string | null) => void;
  onClose: () => void;
}

export default function MoveModal({ nodes, onMove, onClose }: MoveModalProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<NodeResProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState<{ id: string; name: string }[]>([]);

  const nodeIds = nodes.map((n) => n.id);

  const fetchFolders = useCallback(
    async (folderId: string | null) => {
      setLoading(true);
      try {
        let response;
        if (folderId === null) {
          response = await getRootFolders({ page: '0', size: '100' });
        } else {
          response = await getChildrenFolders(folderId, {
            page: '0',
            size: '100',
          });
        }

        if (response && response.data) {
          // Filter out the nodes being moved (if they are folders) and non-folders
          const filteredFolders = response.data.content.filter(
            (item: NodeResProps) =>
              item.nodeType === 'folder' && !nodeIds.includes(item.id)
          );
          setFolders(filteredFolders);
        }
      } catch (error) {
        console.error('Error fetching folders:', error);
      } finally {
        setLoading(false);
      }
    },
    [nodeIds.join(',')]
  );

  useEffect(() => {
    fetchFolders(currentFolderId);
  }, [currentFolderId, fetchFolders]);

  const handleFolderClick = (folder: NodeResProps) => {
    setPath((prev) => [...prev, { id: folder.id, name: folder.name }]);
    setCurrentFolderId(folder.id);
  };

  const handleGoBack = () => {
    const newPath = [...path];
    newPath.pop();
    setPath(newPath);
    const parentId = newPath.length > 0 ? newPath[newPath.length - 1].id : null;
    setCurrentFolderId(parentId);
  };

  const handleMove = () => {
    onMove(currentFolderId);
  };

  const title =
    nodes.length === 1
      ? `Mover "${nodes[0].name}"`
      : `Mover ${nodes.length} itens`;

  const isCurrentParent = nodes.every((n) => n.parentId === currentFolderId);

  return (
    <AdminModal title={title} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-500 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
          <button
            onClick={() => {
              setPath([]);
              setCurrentFolderId(null);
            }}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1 shrink-0"
          >
            Raiz
          </button>
          {path.map((p, index) => (
            <div key={p.id} className="flex items-center gap-1 shrink-0">
              <ChevronRight size={14} className="text-gray-400 dark:text-zinc-600" />
              <button
                onClick={() => {
                  const newPath = path.slice(0, index + 1);
                  setPath(newPath);
                  setCurrentFolderId(p.id);
                }}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                {p.name}
              </button>
            </div>
          ))}
        </div>

        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden min-h-75 flex flex-col bg-gray-50/50 dark:bg-zinc-950/50">
          <div className="p-2 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between transition-colors">
            <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase px-2 tracking-wider">
              {currentFolderId === null ? 'Arquivos' : 'Subpastas'}
            </span>
            {currentFolderId !== null && (
              <button
                onClick={handleGoBack}
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold uppercase tracking-wider px-2"
              >
                <ArrowLeft size={12} /> Voltar
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-100">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 py-12">
                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-500 animate-spin" />
                <span className="text-sm text-gray-500 dark:text-zinc-400 font-medium">
                  Carregando pastas...
                </span>
              </div>
            ) : folders.length > 0 ? (
              <div className="grid grid-cols-1 divide-y divide-gray-100 dark:divide-zinc-800/50">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => handleFolderClick(folder)}
                    className="flex items-center gap-3 p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 flex items-center justify-center text-gray-400 dark:text-zinc-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors shadow-sm">
                      <Folder size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700 dark:text-zinc-200 truncate group-hover:text-blue-700 dark:group-hover:text-blue-400">
                        {folder.name}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium uppercase tracking-tighter">
                        Pasta de documentos
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-gray-300 dark:text-zinc-700 group-hover:text-blue-400 dark:group-hover:text-blue-500 transition-colors"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 py-12 px-6 text-center">
                <div className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-800 flex items-center justify-center mb-2">
                  <Folder size={24} className="text-gray-300 dark:text-zinc-700" />
                </div>
                <p className="text-sm font-bold text-gray-500 dark:text-zinc-400">
                  Nenhuma subpasta encontrada
                </p>
                <p className="text-xs text-gray-400 dark:text-zinc-500">
                  Esta pasta não possui pastas internas para onde você possa
                  mover seu item.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-500 dark:text-zinc-400 font-bold uppercase text-[11px] tracking-wider hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleMove}
            disabled={isCurrentParent}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-bold uppercase text-[11px] tracking-wider h-11 shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-50 disabled:shadow-none"
          >
            {isCurrentParent ? 'Já está aqui' : 'Mover para cá'}
          </Button>
        </div>
      </div>
    </AdminModal>
  );
}
