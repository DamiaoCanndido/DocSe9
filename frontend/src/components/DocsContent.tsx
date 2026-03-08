'use client';

import { ContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  favoriteFolder,
  getChildrenFolders,
  getFavoriteNodes,
  getRootFolders,
  getTrashFolders,
  moveFolder,
  permanentDeleteFolder,
  restoreFolder,
  updateFolder,
} from '@/app/api/folders';
import {
  deleteFile,
  favoriteFile,
  getViewUrl,
  moveFile,
  permanentDeleteFile,
  restoreFile,
  updateFile,
} from '@/app/api/files';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ModalState } from '@/components/AdminModal';
import FolderModal from './FolderModal';
import DeleteNodeModal from './DeleteNodeModal';
import MoveModal from './MoveModal';
import PermissionsModal from './PermissionsModal';
import { toast } from 'sonner';
import { formatBytes } from '@/lib/utils';

export type DisplayMode = 'grid' | 'list';

const DocsContent = ({
  data: initialData,
  type,
  parentId,
  currentUser,
}: {
  data: ApiResponse<NodeResProps>['data'];
  type: ViewDocsType;
  parentId?: string;
  currentUser: UserResProps;
}) => {
  const path = usePathname();

  const {
    displayMode,
    setDisplayMode,
    setCurrentFolderId,
    setIsUploadModalOpen,
  } = useApp();
  const [modal, setModal] = useState<ModalState | null>(null);

  // --- Infinite Scroll Logic ---
  const [nodes, setNodes] = useState<NodeResProps[]>(initialData.content);
  const [page, setPage] = useState(initialData.page);
  const [hasMore, setHasMore] = useState(!initialData.last);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Re-sync with initialData whenever it changes (e.g. on navigation)
  useEffect(() => {
    setNodes(initialData.content);
    setPage(initialData.page);
    setHasMore(!initialData.last);
  }, [initialData]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      let response: ApiResponse<NodeResProps> | undefined;
      const queries: DocsQueries = {
        page: nextPage.toString(),
        size: initialData.pageSize.toString(),
      };

      switch (type) {
        case 'my-docs':
          if (parentId) {
            response = await getChildrenFolders(parentId, queries);
          } else {
            response = await getRootFolders(queries);
          }
          break;
        case 'trash':
          response = await getTrashFolders(queries);
          break;
        case 'starred':
          response = await getFavoriteNodes(queries);
          break;
      }

      if (response?.data) {
        setNodes((prev) => [...prev, ...response!.data.content]);
        setPage(response.data.page);
        setHasMore(!response.data.last);
      }
    } catch (error) {
      console.error('Error loading more nodes:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, hasMore, isLoadingMore, type, parentId, initialData.pageSize]);

  const lastNodeRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoadingMore, hasMore, loadMore]
  );
  // --- End Infinite Scroll Logic ---

  useEffect(() => {
    setCurrentFolderId(parentId || null);
    return () => setCurrentFolderId(null);
  }, [parentId, setCurrentFolderId]);

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
    if (
      (type === 'my-docs' || type === 'starred' || type === 'recent') &&
      item.nodeType == 'folder'
    ) {
      router.push(`/my-docs/${item.id}`);
    }
    if (type === 'trash' && item.nodeType == 'file') return;
    if (
      (type === 'my-docs' || type === 'starred' || type === 'recent') &&
      item.nodeType == 'file'
    ) {
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
        const currentIndex = nodes.findIndex((node) => node.id === item.id);
        const lastIndex = nodes.findIndex((node) => node.id === lastSelectedId);

        const start = Math.min(currentIndex, lastIndex);
        const end = Math.max(currentIndex, lastIndex);

        const rangeIds = nodes.slice(start, end + 1).map((node) => node.id);
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
      const nodesToRestore = nodes.filter((node) =>
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
      const nodesToDelete = nodes.filter((node) =>
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

  const handleBulkFavorite = async () => {
    try {
      const nodesToFavorite = nodes.filter((node) =>
        selectedIds.includes(node.id)
      );

      const promises = nodesToFavorite.map((node) => {
        if (node.nodeType === 'folder') {
          return favoriteFolder({ folderId: node.id, path });
        } else {
          return favoriteFile({ fileId: node.id, path });
        }
      });

      await Promise.all(promises);
      toast.success('Sucesso', {
        description: `${selectedIds.length} itens atualizados nos favoritos.`,
        duration: 2000,
      });
      clearSelection();
    } catch (_error) {
      toast.error('Erro', {
        description: 'Erro ao favoritar itens.',
        duration: 2000,
      });
    }
  };

  return (
    <div className="h-full flex flex-col relative transition-colors" onClick={clearSelection}>
      <div className="flex flex-col gap-2 sm:gap-4 mb-6 mx-4">
        <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-[#5F6368] dark:text-zinc-500 mb-1 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
          <span>Documentos</span>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
          {/*<span className="text-[#1F1F1F] dark:text-zinc-100 font-medium">{type === 'search' ? 'Search' : getTitle()}</span>*/}
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-normal text-[#1F1F1F] dark:text-zinc-100 truncate mr-4">
            {getTitle()}
          </h1>

          <div className="flex items-center gap-1 bg-[#F1F3F4] dark:bg-zinc-900 p-1 rounded-lg border border-[#E0E0E0] dark:border-zinc-800 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDisplayMode('list');
              }}
              className={`p-1 sm:p-1.5 rounded-md transition-colors ${
                displayMode === 'list'
                  ? 'bg-white dark:bg-zinc-800 shadow-sm text-blue-600 dark:text-blue-400'
                  : 'text-[#5F6368] dark:text-zinc-500 hover:bg-gray-200 dark:hover:bg-zinc-700'
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
                  ? 'bg-white dark:bg-zinc-800 shadow-sm text-blue-600 dark:text-blue-400'
                  : 'text-[#5F6368] dark:text-zinc-500 hover:bg-gray-200 dark:hover:bg-zinc-700'
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
              <div className="flex flex-col h-full w-full border dark:border-zinc-800 rounded-lg p-4 overflow-auto pb-24 sm:pb-32 transition-colors">
                <div className="w-full">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b dark:border-zinc-800 text-muted-foreground dark:text-zinc-500 text-left">
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
                      {nodes.map((item) => {
                        const isSelected = selectedIds.includes(item.id);
                        return (
                          <ContextMenu key={item.id}>
                            <ContextMenuTrigger asChild>
                              <tr
                                className={`hover:bg-accent dark:hover:bg-zinc-800/50 cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
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
                                              ? 'text-blue-600 dark:text-blue-400'
                                              : 'text-gray-400 dark:text-zinc-500'
                                          }`}
                                        />
                                        <span
                                          className={
                                            isSelected
                                              ? 'text-blue-700 dark:text-blue-300 font-medium'
                                              : 'text-[#1F1F1F] dark:text-zinc-200'
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
                                              ? 'text-blue-600 dark:text-blue-400'
                                              : 'text-gray-400 dark:text-zinc-500'
                                          }`}
                                        />
                                        <span
                                          className={
                                            isSelected
                                              ? 'text-blue-700 dark:text-blue-300 font-medium'
                                              : 'text-[#1F1F1F] dark:text-zinc-200'
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
                                      ? 'text-blue-600/70 dark:text-blue-400/70'
                                      : 'text-muted-foreground dark:text-zinc-500'
                                  }`}
                                >
                                  {new Date(item.createdAt).toLocaleDateString(
                                    'pt-BR'
                                  )}
                                </td>
                                <td
                                  className={`hidden lg:table-cell py-2 px-2 ${
                                    isSelected
                                      ? 'text-blue-600/70 dark:text-blue-400/70'
                                      : 'text-muted-foreground dark:text-zinc-500'
                                  }`}
                                >
                                  {item.nodeType === 'folder'
                                    ? '-'
                                    : formatBytes(item.size!)}
                                </td>
                                <td className="py-2 px-2 text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full text-[#5F6368] dark:text-zinc-400 transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <EllipsisVertical className="w-4 h-4" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <FolderCtxMenu
                                      isDropdown
                                      docType={item}
                                      viewType={type}
                                      currentUser={currentUser}
                                      onEdit={(node) =>
                                        setModal({
                                          type: 'editNode',
                                          data: node,
                                        })
                                      }
                                      onDelete={(node) =>
                                        setModal({
                                          type: 'deleteNode',
                                          data: node,
                                        })
                                      }
                                      onMove={(node) =>
                                        setModal({
                                          type: 'moveNode',
                                          data: node,
                                        })
                                      }
                                      onPermissions={(node) =>
                                        setModal({
                                          type: 'permissions',
                                          data: node,
                                        })
                                      }
                                    />
                                  </DropdownMenu>
                                </td>
                              </tr>
                            </ContextMenuTrigger>
                            <FolderCtxMenu
                              docType={item}
                              viewType={type}
                              currentUser={currentUser}
                              onEdit={(node) =>
                                setModal({ type: 'editNode', data: node })
                              }
                              onDelete={(node) =>
                                setModal({ type: 'deleteNode', data: node })
                              }
                              onMove={(node) =>
                                setModal({ type: 'moveNode', data: node })
                              }
                              onPermissions={(node) =>
                                setModal({ type: 'permissions', data: node })
                              }
                            />
                          </ContextMenu>
                        );
                      })}
                    </tbody>
                  </table>
                  <div ref={lastNodeRef} className="h-4 w-full" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6 h-full overflow-auto pb-24 sm:pb-32">
                {nodes.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <ContextMenu key={item.id}>
                      <ContextMenuTrigger asChild>
                        <motion.div
                          whileHover={{ y: -2 }}
                          onClick={(e) => handleSelectNode(item, e)}
                          onDoubleClick={(e) => handleOpenNode(item, e)}
                          className={`group cursor-pointer px-1.5 py-2 rounded-xl transition-all h-fit ${
                            isSelected ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-100 dark:ring-blue-900/30' : ''
                          }`}
                        >
                          <div
                            className={`aspect-square border rounded-xl sm:rounded-2xl flex flex-col items-center justify-center mb-2 sm:mb-3 transition-all relative overflow-hidden ${
                              isSelected
                                ? 'bg-white dark:bg-zinc-900 border-blue-300 dark:border-blue-800 shadow-sm'
                                : 'bg-white dark:bg-zinc-900 border-[#E0E0E0] dark:border-zinc-800 group-hover:shadow-md dark:group-hover:shadow-blue-900/10 group-hover:border-blue-200 dark:group-hover:border-zinc-700'
                            }`}
                          >
                            <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex gap-1 z-10">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className="p-1 sm:p-1.5 bg-white/90 dark:bg-zinc-800/90 shadow-sm rounded-full text-[#5F6368] dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                  >
                                    <EllipsisVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <FolderCtxMenu
                                  isDropdown
                                  docType={item}
                                  viewType={type}
                                  currentUser={currentUser}
                                  onEdit={(node) =>
                                    setModal({ type: 'editNode', data: node })
                                  }
                                  onDelete={(node) =>
                                    setModal({ type: 'deleteNode', data: node })
                                  }
                                  onMove={(node) =>
                                    setModal({ type: 'moveNode', data: node })
                                  }
                                  onPermissions={(node) =>
                                    setModal({
                                      type: 'permissions',
                                      data: node,
                                    })
                                  }
                                />
                              </DropdownMenu>
                            </div>
                            {item.nodeType === 'folder' ? (
                              <Folder
                                className={`w-10 h-10 sm:w-16 sm:h-16 transition-colors ${
                                  isSelected
                                    ? 'text-blue-400 dark:text-blue-500 fill-blue-50 dark:fill-blue-900/20'
                                    : 'text-gray-200 dark:text-zinc-800 fill-gray-100 dark:fill-zinc-900'
                                }`}
                              />
                            ) : (
                              <File
                                className={`w-10 h-10 sm:w-16 sm:h-16 transition-colors ${
                                  isSelected
                                    ? 'text-blue-400 dark:text-blue-500 fill-blue-50 dark:fill-blue-900/20'
                                    : 'text-gray-200 dark:text-zinc-800 fill-gray-100 dark:fill-zinc-900'
                                }`}
                              />
                            )}
                            <div className="absolute inset-x-0 bottom-0 p-1.5 sm:p-3 bg-linear-to-t from-black/5 dark:from-black/20 to-transparent flex items-center justify-center">
                              <span
                                className={`text-[8px] sm:text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shadow-sm border transition-colors ${
                                  isSelected
                                    ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-800 border-blue-100 dark:border-blue-900'
                                    : 'text-gray-400 dark:text-zinc-500 bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800'
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
                                  isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-zinc-500'
                                }`}
                              />
                            ) : (
                              <File
                                className={`w-3 h-3 sm:w-4 sm:h-4 shrink-0 ${
                                  isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-zinc-500'
                                }`}
                              />
                            )}
                            <span
                              className={`text-xs sm:text-sm font-medium truncate flex-1 transition-colors ${
                                isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-[#1F1F1F] dark:text-zinc-200'
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
                        currentUser={currentUser}
                        onEdit={(node) =>
                          setModal({ type: 'editNode', data: node })
                        }
                        onDelete={(node) =>
                          setModal({ type: 'deleteNode', data: node })
                        }
                        onMove={(node) =>
                          setModal({ type: 'moveNode', data: node })
                        }
                        onPermissions={(node) =>
                          setModal({ type: 'permissions', data: node })
                        }
                      />
                    </ContextMenu>
                  );
                })}
                <div ref={lastNodeRef} className="h-4 w-full col-span-full" />
              </div>
            )}
          </ContextMenuTrigger>
          <EmptyAreaContextMenu
            onCreateFolder={
              type === 'my-docs'
                ? () => setModal({ type: 'createNode' })
                : undefined
            }
            onCreateFile={
              type === 'my-docs' ? () => setIsUploadModalOpen(true) : undefined
            }
          />
        </div>
      </ContextMenu>

      {/* Selection Toolbar */}
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 border border-[#E0E0E0] dark:border-zinc-800 rounded-xl sm:rounded-2xl shadow-2xl px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-3 sm:gap-6 z-50 max-w-[95vw] sm:max-w-none transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 sm:gap-3 pr-3 sm:pr-6 border-r border-gray-100 dark:border-zinc-800">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">
              {selectedIds.length}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-zinc-300 hidden sm:block">
              {selectedIds.length === 1 ? 'Selecionado' : 'Selecionados'}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {type !== 'trash' ? (
              <>
                <button
                  onClick={() => {
                    const nodesToMove = nodes.filter((node) =>
                      selectedIds.includes(node.id)
                    );
                    setModal({ type: 'moveNode', data: nodesToMove });
                  }}
                  className="p-1 sm:p-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl text-[#5F6368] dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex flex-col items-center gap-0.5 sm:gap-1 group"
                  title="Mover"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-zinc-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                    <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider hidden sm:block">
                    Mover
                  </span>
                </button>

                <button
                  onClick={handleBulkFavorite}
                  className="p-1 sm:p-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl text-[#5F6368] dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex flex-col items-center gap-0.5 sm:gap-1 group"
                  title="Favoritar"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-zinc-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider hidden sm:block">
                    Favoritos
                  </span>
                </button>
              </>
            ) : (
              <button
                onClick={handleBulkRestore}
                className="p-1 sm:p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl text-[#5F6368] dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex flex-col items-center gap-0.5 sm:gap-1 group"
                title="Restaurar"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-blue-50/0 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider hidden sm:block">
                  Restaurar
                </span>
              </button>
            )}

            <button
              onClick={handleBulkDelete}
              className={`p-1 sm:p-2 rounded-xl transition-all flex flex-col items-center gap-0.5 sm:gap-1 group ${
                type === 'trash'
                  ? 'hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600'
                  : 'hover:bg-red-50 dark:hover:bg-red-950/20 text-[#5F6368] dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-500'
              }`}
              title={
                type === 'trash'
                  ? 'Excluir permanentemente'
                  : 'Mover para lixeira'
              }
            >
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg ${
                  type === 'trash' ? 'bg-red-50 dark:bg-red-950/20' : 'bg-red-50/0 group-hover:bg-red-50 dark:group-hover:bg-red-950/20'
                } transition-colors`}
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span
                className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-wider hidden sm:block ${
                  type === 'trash' ? 'text-red-600' : 'text-red-600/70 dark:text-zinc-500 group-hover:text-red-500'
                }`}
              >
                {type === 'trash' ? 'Excluir' : 'Excluir'}
              </span>
            </button>

            <div className="w-px h-6 sm:h-8 bg-gray-100 dark:border-zinc-800 mx-1 sm:mx-2" />

            <button
              onClick={clearSelection}
              className="p-1 sm:p-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-all flex flex-col items-center gap-0.5 sm:gap-1 group"
              title="Cancelar"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-colors">
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider hidden sm:block">
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
      {modal?.type === 'permissions' && editNodeData && (
        <PermissionsModal
          node={editNodeData}
          currentUser={currentUser}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default DocsContent;
