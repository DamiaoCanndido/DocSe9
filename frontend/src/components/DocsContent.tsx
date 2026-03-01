'use client';

import { ContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu';
import {
  ChevronRight,
  EllipsisVertical,
  File,
  Folder,
  Grid,
  List,
  RotateCcw,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import FolderCtxMenu from '@/components/FolderCtxMenu';
import EmptyAreaContextMenu from '@/components/EmptyAreaContextMenu';
import { ViewDocsType } from '@/components/DocsLoad';
import {
  createFolder,
  deleteFolder,
  moveFolder,
  permanentDeleteFolder,
  restoreFolder,
  updateFolder,
} from '@/app/api/folders';
import {
  deleteFile,
  getViewUrl,
  moveFile,
  permanentDeleteFile,
  restoreFile,
  updateFile,
} from '@/app/api/files';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { ModalState } from '@/components/AdminModal';
import FolderModal from './FolderModal';
import DeleteNodeModal from './DeleteNodeModal';
import MoveModal from './MoveModal';
import { toast } from 'sonner';

export type DisplayMode = 'grid' | 'list';

const DocsContent = ({
  data,
  type,
  parentId,
}: {
  data: ApiResponse<NodeResProps>['data'];
  type: ViewDocsType;
  parentId?: string;
}) => {
  const path = usePathname();

  const { displayMode, setDisplayMode } = useApp();
  const [modal, setModal] = useState<ModalState | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const clickTimeoutRef = useState<{ timer: NodeJS.Timeout | null }>({
    timer: null,
  })[0];

  const editNodeData =
    modal?.data && !Array.isArray(modal.data) && 'favorite' in modal.data
      ? (modal.data as NodeResProps)
      : null;

  const moveNodesData =
    modal?.data && Array.isArray(modal.data)
      ? (modal.data as NodeResProps[])
      : editNodeData
      ? [editNodeData]
      : [];

  const router = useRouter();

  const getFileLink = async (fileId: string, path: string) => {
    const url = await getViewUrl(fileId, path);
    return url;
  };

  const handleOpenNode = async (item: NodeResProps, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    clearSelection(); // Limpa a seleção imediatamente ao abrir para esconder a toolbar
    if (type === 'trash' && item.nodeType == 'folder') return;
    if (type === 'my-docs' && item.nodeType == 'folder') {
      router.push(`/my-docs/${item.id}`);
    }
    if (type === 'trash' && item.nodeType == 'file') return;
    if (type === 'my-docs' && item.nodeType == 'file') {
      const result = await getFileLink(item.id, path);
      window.open(result.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSelectNode = (item: NodeResProps, e: React.MouseEvent) => {
    e.stopPropagation();

    if (e.detail === 2) {
      if (clickTimeoutRef.timer) {
        clearTimeout(clickTimeoutRef.timer);
        clickTimeoutRef.timer = null;
      }
      return;
    }

    clickTimeoutRef.timer = setTimeout(() => {
      const isCtrlPressed = e.ctrlKey || e.metaKey;
      const isShiftPressed = e.shiftKey;

      if (isShiftPressed && lastSelectedId) {
        const currentIndex = data.content.findIndex(
          (node) => node.id === item.id
        );
        const lastIndex = data.content.findIndex(
          (node) => node.id === lastSelectedId
        );

        const start = Math.min(currentIndex, lastIndex);
        const end = Math.max(currentIndex, lastIndex);

        const rangeIds = data.content
          .slice(start, end + 1)
          .map((node) => node.id);
        setSelectedIds(Array.from(new Set([...selectedIds, ...rangeIds])));
      } else if (isCtrlPressed) {
        setSelectedIds((prev) =>
          prev.includes(item.id)
            ? prev.filter((id) => id !== item.id)
            : [...prev, item.id]
        );
        setLastSelectedId(item.id);
      } else {
        setSelectedIds([item.id]);
        setLastSelectedId(item.id);
      }
      clickTimeoutRef.timer = null;
    }, 200);
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setLastSelectedId(null);
  };

  const getTitle = () => {
    switch (type) {
      case 'my-docs':
        return 'Meus documentos';
      case 'shared':
        return 'Compartilhados comigo';
      case 'starred':
        return 'Favoritos';
      case 'trash':
        return 'Lixeira';
      case 'recent':
        return 'Recentes';
      default:
        return 'Meus documentos';
    }
  };

  const handleEditNode = async (
    id: string,
    form: { name: string },
    nodeType: 'folder' | 'file'
  ): Promise<void> => {
    try {
      if (nodeType === 'folder') {
        await updateFolder({
          folderId: id,
          form: { name: form.name, parentId: null },
          path,
        });
      } else {
        await updateFile({
          fileId: id,
          form: { name: form.name },
          path,
        });
      }
      toast.success('Sucesso', {
        description: `${
          nodeType === 'folder' ? 'Pasta' : 'Arquivo'
        } renomeado com sucesso.`,
        duration: 2000,
      });
    } catch (_error) {
      toast.error('Erro', {
        description: `Erro ao editar ${
          nodeType === 'folder' ? 'pasta' : 'arquivo'
        }.`,
        duration: 2000,
      });
    }
  };

  const handleDeleteNode = async (node: NodeResProps): Promise<void> => {
    try {
      if (type === 'trash') {
        if (node.nodeType === 'folder') {
          await permanentDeleteFolder({ folderId: node.id, path });
        } else {
          await permanentDeleteFile({ fileId: node.id, path });
        }
      } else {
        if (node.nodeType === 'folder') {
          await deleteFolder({ folderId: node.id, path });
        } else {
          await deleteFile({ fileId: node.id, path });
        }
      }

      toast.success('Sucesso', {
        description:
          type === 'trash'
            ? `${
                node.nodeType === 'folder' ? 'Pasta' : 'Arquivo'
              } excluído permanentemente.`
            : `${
                node.nodeType === 'folder' ? 'Pasta' : 'Arquivo'
              } movido para a lixeira.`,
        duration: 2000,
      });
    } catch (_error) {
      toast.error('Erro', {
        description: `Erro ao excluir ${
          node.nodeType === 'folder' ? 'pasta' : 'arquivo'
        }.`,
        duration: 2000,
      });
    }
  };

  const handleMoveNodes = async (
    nodes: NodeResProps[],
    targetFolderId: string | null
  ): Promise<void> => {
    try {
      if (targetFolderId === null) {
        toast.error('Erro', {
          description: 'Ainda não é possível mover para a raiz.',
          duration: 2000,
        });
        return;
      }

      const promises = nodes.map((node) => {
        if (node.nodeType === 'folder') {
          return moveFolder({ folderId: node.id, targetFolderId, path });
        } else {
          return moveFile({ fileId: node.id, targetFolderId, path });
        }
      });

      await Promise.all(promises);
      toast.success('Sucesso', {
        description: `${nodes.length} itens movidos com sucesso.`,
        duration: 2000,
      });
      clearSelection();
    } catch (_error) {
      toast.error('Erro', {
        description: 'Erro ao mover alguns itens.',
        duration: 2000,
      });
    }
  };

  const handleCreateFolder = async (form: FolderReqProps): Promise<void> => {
    try {
      await createFolder({
        form: {
          ...form,
          parentId: parentId || null,
        },
        path,
      });
      toast.success('Sucesso', {
        description: 'Pasta criada com sucesso.',
        duration: 2000,
      });
    } catch (_error) {
      toast.error('Erro', {
        description: 'Erro ao criar pasta.',
        duration: 2000,
      });
    }
  };

  const handleBulkRestore = async () => {
    try {
      const nodesToRestore = data.content.filter((node) =>
        selectedIds.includes(node.id)
      );

      const promises = nodesToRestore.map((node) => {
        if (node.nodeType === 'folder') {
          return restoreFolder({ folderId: node.id, path });
        } else {
          return restoreFile({ fileId: node.id, path });
        }
      });

      await Promise.all(promises);
      toast.success('Sucesso', {
        description: `${selectedIds.length} itens restaurados com sucesso.`,
        duration: 2000,
      });
      clearSelection();
    } catch (_error) {
      toast.error('Erro', {
        description: 'Erro ao restaurar itens.',
        duration: 2000,
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      const nodesToDelete = data.content.filter((node) =>
        selectedIds.includes(node.id)
      );

      const promises = nodesToDelete.map((node) => {
        if (type === 'trash') {
          if (node.nodeType === 'folder') {
            return permanentDeleteFolder({ folderId: node.id, path });
          } else {
            return permanentDeleteFile({ fileId: node.id, path });
          }
        } else {
          if (node.nodeType === 'folder') {
            return deleteFolder({ folderId: node.id, path });
          } else {
            return deleteFile({ fileId: node.id, path });
          }
        }
      });

      await Promise.all(promises);
      toast.success('Sucesso', {
        description:
          type === 'trash'
            ? `${selectedIds.length} itens excluídos permanentemente.`
            : `${selectedIds.length} itens movidos para a lixeira.`,
        duration: 2000,
      });
      clearSelection();
    } catch (_error) {
      toast.error('Erro', {
        description: `Erro ao ${type === 'trash' ? 'excluir' : 'mover'} itens.`,
        duration: 2000,
      });
    }
  };

  return (
    <div className="h-full flex flex-col relative" onClick={clearSelection}>
      <div className="flex flex-col gap-2 sm:gap-4 mb-6 mx-4">
        <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-[#5F6368] mb-1 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
          <span>Documentos</span>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
          {/*<span className="text-[#1F1F1F] font-medium">{type === 'search' ? 'Search' : getTitle()}</span>*/}
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-normal text-[#1F1F1F] truncate mr-4">
            {getTitle()}
          </h1>

          <div className="flex items-center gap-1 bg-[#F1F3F4] p-1 rounded-lg border border-[#E0E0E0] shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDisplayMode('list');
              }}
              className={`p-1 sm:p-1.5 rounded-md transition-colors ${
                displayMode === 'list'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-[#5F6368] hover:bg-gray-200'
              }`}
            >
              <List className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDisplayMode('grid');
              }}
              className={`p-1 sm:p-1.5 rounded-md transition-colors ${
                displayMode === 'grid'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-[#5F6368] hover:bg-gray-200'
              }`}
            >
              <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
      <ContextMenu>
        <div className="flex-1 min-h-0">
          <ContextMenuTrigger className="h-full w-full">
            {displayMode === 'list' ? (
              <div className="flex flex-col h-full w-full border rounded-lg p-4 overflow-auto">
                <div className="w-full">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground text-left">
                        <th className="pb-2 font-medium">Nome</th>
                        <th className="hidden lg:table-cell pb-2 font-medium">
                          Criado
                        </th>
                        <th className="hidden lg:table-cell pb-2 font-medium">
                          Tamanho
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.content.map((item) => {
                        const isSelected = selectedIds.includes(item.id);
                        return (
                          <ContextMenu key={item.id}>
                            <ContextMenuTrigger asChild>
                              <tr
                                className={`hover:bg-accent cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-blue-50 hover:bg-blue-100'
                                    : ''
                                }`}
                                onClick={(e) => handleSelectNode(item, e)}
                                onDoubleClick={(e) => handleOpenNode(item, e)}
                              >
                                <td className="py-2 px-2">
                                  <div className="flex items-center gap-2">
                                    {item.nodeType === 'folder' ? (
                                      <>
                                        <Folder
                                          className={`h-4 w-4 shrink-0 ${
                                            isSelected
                                              ? 'text-blue-600'
                                              : 'text-gray-400'
                                          }`}
                                        />
                                        <span
                                          className={
                                            isSelected
                                              ? 'text-blue-700 font-medium'
                                              : ''
                                          }
                                        >
                                          {item.name}
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <File
                                          className={`h-4 w-4 shrink-0 ${
                                            isSelected
                                              ? 'text-blue-600'
                                              : 'text-gray-400'
                                          }`}
                                        />
                                        <span
                                          className={
                                            isSelected
                                              ? 'text-blue-700 font-medium'
                                              : ''
                                          }
                                        >
                                          {item.name}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </td>
                                <td
                                  className={`hidden lg:table-cell py-2 px-2 ${
                                    isSelected
                                      ? 'text-blue-600/70'
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  {new Date(item.createdAt).toLocaleDateString(
                                    'pt-BR'
                                  )}
                                </td>
                                <td
                                  className={`hidden lg:table-cell py-2 px-2 ${
                                    isSelected
                                      ? 'text-blue-600/70'
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  {item.nodeType === 'folder' ? '-' : item.size}
                                </td>
                              </tr>
                            </ContextMenuTrigger>
                            <FolderCtxMenu
                              docType={item}
                              viewType={type}
                              onEdit={(node) =>
                                setModal({ type: 'editNode', data: node })
                              }
                              onDelete={(node) =>
                                setModal({ type: 'deleteNode', data: node })
                              }
                              onMove={(node) =>
                                setModal({ type: 'moveNode', data: node })
                              }
                            />
                          </ContextMenu>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6 h-full overflow-auto">
                {data.content.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <ContextMenu key={item.id}>
                      <ContextMenuTrigger asChild>
                        <motion.div
                          whileHover={{ y: -2 }}
                          onClick={(e) => handleSelectNode(item, e)}
                          onDoubleClick={(e) => handleOpenNode(item, e)}
                          className={`group cursor-pointer px-1.5 py-2 rounded-xl transition-all h-fit ${
                            isSelected ? 'bg-blue-50 ring-2 ring-blue-100' : ''
                          }`}
                        >
                          <div
                            className={`aspect-square border rounded-xl sm:rounded-2xl flex flex-col items-center justify-center mb-2 sm:mb-3 transition-all relative overflow-hidden ${
                              isSelected
                                ? 'bg-white border-blue-300 shadow-sm'
                                : 'bg-white border-[#E0E0E0] group-hover:shadow-md group-hover:border-blue-200'
                            }`}
                          >
                            <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                className="p-1 sm:p-1.5 bg-white/90 shadow-sm rounded-full text-[#5F6368] hover:text-blue-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Context menu usually handles this, but we can add logic here if needed
                                }}
                              >
                                <EllipsisVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                            {item.nodeType === 'folder' ? (
                              <Folder
                                className={`w-10 h-10 sm:w-16 sm:h-16 transition-colors ${
                                  isSelected
                                    ? 'text-blue-400 fill-blue-50'
                                    : 'text-gray-200 fill-gray-100'
                                }`}
                              />
                            ) : (
                              <File
                                className={`w-10 h-10 sm:w-16 sm:h-16 transition-colors ${
                                  isSelected
                                    ? 'text-blue-400 fill-blue-50'
                                    : 'text-gray-200 fill-gray-100'
                                }`}
                              />
                            )}
                            <div className="absolute inset-x-0 bottom-0 p-1.5 sm:p-3 bg-linear-to-t from-black/5 to-transparent flex items-center justify-center">
                              <span
                                className={`text-[8px] sm:text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shadow-sm border transition-colors ${
                                  isSelected
                                    ? 'text-blue-600 bg-white border-blue-100'
                                    : 'text-gray-400 bg-white border-gray-100'
                                }`}
                              >
                                {item.nodeType === 'folder'
                                  ? 'Pasta'
                                  : 'Arquivo'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 px-1">
                            {item.nodeType === 'folder' ? (
                              <Folder
                                className={`w-3 h-3 sm:w-4 sm:h-4 shrink-0 ${
                                  isSelected ? 'text-blue-600' : 'text-gray-400'
                                }`}
                              />
                            ) : (
                              <File
                                className={`w-3 h-3 sm:w-4 sm:h-4 shrink-0 ${
                                  isSelected ? 'text-blue-600' : 'text-gray-400'
                                }`}
                              />
                            )}
                            <span
                              className={`text-xs sm:text-sm font-medium truncate flex-1 transition-colors ${
                                isSelected ? 'text-blue-700' : 'text-[#1F1F1F]'
                              }`}
                            >
                              {item.name}
                            </span>
                          </div>
                        </motion.div>
                      </ContextMenuTrigger>
                      <FolderCtxMenu
                        docType={item}
                        viewType={type}
                        onEdit={(node) =>
                          setModal({ type: 'editNode', data: node })
                        }
                        onDelete={(node) =>
                          setModal({ type: 'deleteNode', data: node })
                        }
                        onMove={(node) =>
                          setModal({ type: 'moveNode', data: node })
                        }
                      />
                    </ContextMenu>
                  );
                })}
              </div>
            )}
          </ContextMenuTrigger>
          <EmptyAreaContextMenu
            onCreateFolder={() => setModal({ type: 'createNode' })}
          />
        </div>
      </ContextMenu>

      {/* Selection Toolbar */}
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white border border-[#E0E0E0] rounded-2xl shadow-2xl px-6 py-3 flex items-center gap-6 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 pr-6 border-r border-gray-100">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
              {selectedIds.length}
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {selectedIds.length === 1
                ? 'Item selecionado'
                : 'Itens selecionados'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {type !== 'trash' ? (
              <>
                <button
                  onClick={() => {
                    const nodesToMove = data.content.filter((node) =>
                      selectedIds.includes(node.id)
                    );
                    setModal({ type: 'moveNode', data: nodesToMove });
                  }}
                  className="p-2 hover:bg-gray-50 rounded-xl text-[#5F6368] hover:text-blue-600 transition-all flex flex-col items-center gap-1"
                  title="Mover"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 group-hover:bg-blue-50 transition-colors">
                    <Grid className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Mover
                  </span>
                </button>

                <button
                  onClick={() => {
                    /* Logic for Bulk Favorite */
                  }}
                  className="p-2 hover:bg-gray-50 rounded-xl text-[#5F6368] hover:text-blue-600 transition-all flex flex-col items-center gap-1"
                  title="Favoritar"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50">
                    <Star className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Favoritos
                  </span>
                </button>
              </>
            ) : (
              <button
                onClick={handleBulkRestore}
                className="p-2 hover:bg-blue-50 rounded-xl text-[#5F6368] hover:text-blue-600 transition-all flex flex-col items-center gap-1"
                title="Restaurar"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-50/0 hover:bg-blue-50">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Restaurar
                </span>
              </button>
            )}

            <button
              onClick={handleBulkDelete}
              className={`p-2 rounded-xl transition-all flex flex-col items-center gap-1 ${
                type === 'trash'
                  ? 'hover:bg-red-50 text-red-600'
                  : 'hover:bg-red-50 text-[#5F6368] hover:text-red-600'
              }`}
              title={
                type === 'trash'
                  ? 'Excluir permanentemente'
                  : 'Mover para lixeira'
              }
            >
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                  type === 'trash' ? 'bg-red-50' : 'bg-red-50/0 hover:bg-red-50'
                }`}
              >
                <Trash2 className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  type === 'trash' ? 'text-red-600' : 'text-red-600/70'
                }`}
              >
                {type === 'trash' ? 'Excluir' : 'Excluir'}
              </span>
            </button>

            <div className="w-px h-8 bg-gray-100 mx-2" />

            <button
              onClick={clearSelection}
              className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-600 transition-all flex flex-col items-center gap-1"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-lg">
                <X className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Cancelar
              </span>
            </button>
          </div>
        </motion.div>
      )}

      {modal?.type === 'editNode' && editNodeData && (
        <FolderModal
          onSave={(form) => {
            handleEditNode(
              editNodeData.id,
              { name: form.name },
              editNodeData.nodeType
            );
            setModal(null);
          }}
          node={editNodeData}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === 'deleteNode' && editNodeData && (
        <DeleteNodeModal
          node={editNodeData}
          isTrash={type === 'trash'}
          onConfirm={() => handleDeleteNode(editNodeData)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'moveNode' && moveNodesData.length > 0 && (
        <MoveModal
          nodes={moveNodesData}
          onMove={(targetFolderId) => {
            handleMoveNodes(moveNodesData, targetFolderId);
            setModal(null);
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'createNode' && (
        <FolderModal
          onSave={(form) => {
            handleCreateFolder({ name: form.name, parentId: null });
            setModal(null);
          }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default DocsContent;
