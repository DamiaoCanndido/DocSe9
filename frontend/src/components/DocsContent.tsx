'use client';

import { ContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu';
import {
  ChevronRight,
  EllipsisVertical,
  File,
  Folder,
  Grid,
  List,
} from 'lucide-react';
import FolderCtxMenu from '@/components/FolderCtxMenu';
import EmptyAreaContextMenu from '@/components/EmptyAreaContextMenu';
import { ViewDocsType } from '@/components/DocsLoad';
import {
  createFolder,
  deleteFile,
  deleteFolder,
  getViewUrl,
  permanentDeleteFile,
  permanentDeleteFolder,
  updateFile,
  updateFolder,
} from '@/lib/data';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { ModalState } from '@/components/AdminModal';
import FolderModal from './FolderModal';
import DeleteNodeModal from './DeleteNodeModal';
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

  // const [sortBy, setSortBy] = useState<'name' | 'modified' | 'size'>('name');
  const { displayMode, setDisplayMode } = useApp();
  const [modal, setModal] = useState<ModalState | null>(null);

  const editNodeData =
    modal?.data && 'favorite' in modal.data
      ? (modal.data as NodeResProps)
      : null;

  const router = useRouter();

  const getFileLink = async (fileId: string, path: string) => {
    const url = await getViewUrl(fileId, path);
    return url;
  };

  const handleNodeClick = async (item: NodeResProps) => {
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

  return (
    <div className="h-full flex flex-col">
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
              onClick={() => setDisplayMode('list')}
              className={`p-1 sm:p-1.5 rounded-md transition-colors ${
                displayMode === 'list'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-[#5F6368] hover:bg-gray-200'
              }`}
            >
              <List className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => setDisplayMode('grid')}
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
                      {data.content.map((item) => (
                        <ContextMenu key={item.id}>
                          <ContextMenuTrigger asChild>
                            <tr
                              className="hover:bg-accent cursor-pointer"
                              onClick={() => handleNodeClick(item)}
                            >
                              <td className="py-2 px-2">
                                <div className="flex items-center gap-2">
                                  {item.nodeType === 'folder' ? (
                                    <>
                                      <Folder className="h-4 w-4 shrink-0" />
                                      <span>{item.name}</span>
                                    </>
                                  ) : (
                                    <>
                                      <File className="h-4 w-4 shrink-0" />
                                      <span>{item.name}</span>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="hidden lg:table-cell py-2 px-2 text-muted-foreground">
                                {new Date(item.createdAt).toLocaleDateString(
                                  'pt-BR'
                                )}
                              </td>
                              <td className="hidden lg:table-cell py-2 px-2 text-muted-foreground">
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
                          />
                        </ContextMenu>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6 h-full overflow-auto">
                {data.content.map((item) => (
                  <ContextMenu key={item.id}>
                    <ContextMenuTrigger asChild>
                      <motion.div
                        whileHover={{ y: -2 }}
                        onClick={() => handleNodeClick(item)}
                        className="group cursor-pointer px-1.5 rounded-lg h-fit"
                      >
                        <div className="aspect-square bg-white border border-[#E0E0E0] rounded-xl sm:rounded-2xl flex flex-col items-center justify-center mb-2 sm:mb-3 group-hover:shadow-md group-hover:border-blue-200 transition-all relative overflow-hidden">
                          <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 sm:p-1.5 bg-white/90 shadow-sm rounded-full text-[#5F6368] hover:text-blue-600">
                              <EllipsisVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                          {item.nodeType === 'folder' ? (
                            <Folder className="w-10 h-10 sm:w-16 sm:h-16 text-gray-200 fill-gray-100" />
                          ) : (
                            <File className="w-10 h-10 sm:w-16 sm:h-16 text-gray-200 fill-gray-100" />
                          )}
                          <div className="absolute inset-x-0 bottom-0 p-1.5 sm:p-3 bg-linear-to-t from-black/5 to-transparent flex items-center justify-center">
                            <span className="text-[8px] sm:text-[10px] font-bold uppercase text-gray-400 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-100">
                              {item.nodeType === 'folder' ? 'Pasta' : 'Arquivo'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 px-1">
                          {item.nodeType === 'folder' ? (
                            <Folder className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                          ) : (
                            <File className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                          )}
                          <span className="text-xs sm:text-sm font-medium text-[#1F1F1F] truncate flex-1">
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
                    />
                  </ContextMenu>
                ))}
              </div>
            )}
          </ContextMenuTrigger>
          <EmptyAreaContextMenu
            onCreateFolder={() => setModal({ type: 'createNode' })}
          />
        </div>
      </ContextMenu>
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
