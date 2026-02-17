'use client';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { File, Folder } from 'lucide-react';
import FolderCtxMenu from '@/components/FolderCtxMenu';
import Link from 'next/link';
import { ViewDocsType } from '@/components/DocsLoad';
import { getViewUrl } from '@/lib/data';
import { usePathname } from 'next/navigation';

const DocsContent = (data: ApiResponse & { type: ViewDocsType }) => {
  const path = usePathname();

  const getFileLink = async (fileId: string, path: string) => {
    const url = await getViewUrl(fileId, path);
    return url;
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className="hidden lg:flex h-full w-full border rounded-lg p-4">
          <div className="space-y-1">
            {/* Folders */}
            {data.folders.content.map((item) => (
              <ContextMenu key={item.folderId}>
                <Link
                  href={
                    data.type !== 'trash' ? `/my-docs/${item.folderId}` : ``
                  }
                >
                  <ContextMenuTrigger>
                    <div className="flex items-center gap-2 p-2 hover:bg-accent rounded">
                      <Folder className="h-4 w-4" />

                      <span>{item.name}</span>
                    </div>
                  </ContextMenuTrigger>
                </Link>

                <FolderCtxMenu />
              </ContextMenu>
            ))}

            {/* Files */}
            {data.files.content.map((item) => (
              <ContextMenu key={item.fileId}>
                <ContextMenuTrigger
                  className="cursor-pointer"
                  onClick={async () => {
                    if (data.type === 'trash') return;
                    const result = await getFileLink(item.fileId, path);
                    window.open(result.url, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <div className="flex items-center gap-2 p-2 hover:bg-accent rounded">
                    <File className="h-4 w-4" />

                    <span>{item.name}</span>
                  </div>
                </ContextMenuTrigger>

                <FolderCtxMenu />
              </ContextMenu>
            ))}
          </div>
        </ContextMenuTrigger>

        {/* Menu do Explorer (área vazia) */}
        <ContextMenuContent>
          <ContextMenuItem>Nova pasta</ContextMenuItem>
          <ContextMenuItem>Novo arquivo</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Colar</ContextMenuItem>
          <ContextMenuItem>Atualizar</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Mobile docs */}
      <div className="flex lg:hidden min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        Meus Documentos
      </div>
    </>
  );
};

export default DocsContent;
