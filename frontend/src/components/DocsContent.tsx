'use client';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  ChevronRight,
  EllipsisVertical,
  File,
  Folder,
  Grid,
  List,
} from 'lucide-react';
import FolderCtxMenu from '@/components/FolderCtxMenu';
import { ViewDocsType } from '@/components/DocsLoad';
import { getViewUrl } from '@/lib/data';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';

export type DisplayMode = 'grid' | 'list';

const DocsContent = (data: ApiResponse & { type: ViewDocsType }) => {
  const path = usePathname();

  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'size'>('name');
  const { displayMode, setDisplayMode } = useApp();

  const router = useRouter();

  const getFileLink = async (fileId: string, path: string) => {
    const url = await getViewUrl(fileId, path);
    return url;
  };

  const getTitle = () => {
    switch (data.type) {
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
        <div className="flex-1">
          {displayMode === 'list' ? (
            <ContextMenuTrigger className="flex flex-col h-full w-full border rounded-lg p-4">
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
                    {data.folders.content.map((item) => (
                      <ContextMenu key={item.folderId}>
                        <ContextMenuTrigger asChild>
                          <tr
                            className="hover:bg-accent cursor-pointer"
                            onClick={() => {
                              if (data.type === 'trash') return;
                              router.push(`/my-docs/${item.folderId}`);
                            }}
                          >
                            <td className="py-2 px-2">
                              <div className="flex items-center gap-2">
                                <Folder className="h-4 w-4 shrink-0" />
                                <span>{item.name}</span>
                              </div>
                            </td>
                            <td className="hidden lg:table-cell py-2 px-2 text-muted-foreground">
                              {new Date(item.createdAt).toLocaleDateString(
                                'pt-BR'
                              )}
                            </td>
                            <td className="hidden lg:table-cell py-2 px-2 text-muted-foreground">
                              —
                            </td>
                          </tr>
                        </ContextMenuTrigger>
                        <FolderCtxMenu />
                      </ContextMenu>
                    ))}

                    {data.files.content.map((item) => (
                      <ContextMenu key={item.fileId}>
                        <ContextMenuTrigger asChild>
                          <tr
                            className="hover:bg-accent cursor-pointer"
                            onClick={async () => {
                              if (data.type === 'trash') return;
                              const result = await getFileLink(
                                item.fileId,
                                path
                              );
                              window.open(
                                result.url,
                                '_blank',
                                'noopener,noreferrer'
                              );
                            }}
                          >
                            <td className="py-2 px-2">
                              <div className="flex items-center gap-2">
                                <File className="h-4 w-4 shrink-0" />
                                <span>{item.name}</span>
                              </div>
                            </td>
                            <td className="hidden lg:table-cell py-2 px-2 text-muted-foreground">
                              {new Date(item.createdAt).toLocaleDateString(
                                'pt-BR'
                              )}
                            </td>
                            <td className="hidden lg:table-cell py-2 px-2 text-muted-foreground">
                              {item.size}
                            </td>
                          </tr>
                        </ContextMenuTrigger>
                        <FolderCtxMenu />
                      </ContextMenu>
                    ))}
                  </tbody>
                </table>
              </div>
            </ContextMenuTrigger>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
              {data.folders.content.map((folder) => (
                <motion.div
                  key={folder.folderId}
                  whileHover={{ y: -2 }}
                  onClick={() => {
                    if (data.type === 'trash') return;
                    router.push(`/my-docs/${folder.folderId}`);
                  }}
                  className="group cursor-pointer px-1.5 rounded-lg"
                >
                  <div className="aspect-square bg-white border border-[#E0E0E0] rounded-xl sm:rounded-2xl flex flex-col items-center justify-center mb-2 sm:mb-3 group-hover:shadow-md group-hover:border-blue-200 transition-all relative overflow-hidden">
                    <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 sm:p-1.5 bg-white/90 shadow-sm rounded-full text-[#5F6368] hover:text-blue-600">
                        <EllipsisVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    <Folder className="w-10 h-10 sm:w-16 sm:h-16 text-gray-200 fill-gray-100" />
                    <div className="absolute inset-x-0 bottom-0 p-1.5 sm:p-3 bg-linear-to-t from-black/5 to-transparent flex items-center justify-center">
                      <span className="text-[8px] sm:text-[10px] font-bold uppercase text-gray-400 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-100">
                        Pasta
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 px-1">
                    <Folder className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-[#1F1F1F] truncate flex-1">
                      {folder.name}
                    </span>
                  </div>
                </motion.div>
              ))}

              {data.files.content.map((file) => (
                <motion.div
                  key={file.fileId}
                  whileHover={{ y: -2 }}
                  onClick={async () => {
                    if (data.type === 'trash') return;
                    const result = await getFileLink(file.fileId, path);
                    window.open(result.url, '_blank', 'noopener,noreferrer');
                  }}
                  className="group cursor-pointer px-1.5 rounded-lg"
                >
                  <div className="aspect-square bg-white border border-[#E0E0E0] rounded-xl sm:rounded-2xl flex flex-col items-center justify-center mb-2 sm:mb-3 group-hover:shadow-md group-hover:border-blue-200 transition-all relative overflow-hidden">
                    <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 sm:p-1.5 bg-white/90 shadow-sm rounded-full text-[#5F6368] hover:text-blue-600">
                        <EllipsisVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    <File className="w-10 h-10 sm:w-16 sm:h-16 text-gray-200 fill-gray-100" />
                    <div className="absolute inset-x-0 bottom-0 p-1.5 sm:p-3 bg-linear-to-t from-black/5 to-transparent flex items-center justify-center">
                      <span className="text-[8px] sm:text-[10px] font-bold uppercase text-gray-400 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-100">
                        Arquivo
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 px-1">
                    <File className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-[#1F1F1F] truncate flex-1">
                      {file.name}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          {/* Menu do Explorer (área vazia) */}
          <ContextMenuContent>
            <ContextMenuItem>Nova pasta</ContextMenuItem>
            <ContextMenuItem>Novo arquivo</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Colar</ContextMenuItem>
            <ContextMenuItem>Atualizar</ContextMenuItem>
          </ContextMenuContent>
        </div>
      </ContextMenu>
    </div>
  );
};

export default DocsContent;
