import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Folder } from 'lucide-react';
import FolderCtxMenu from '@/components/FolderCtxMenu';

const DocsContent = (data: ApiResponse) => {
  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className="hidden lg:flex min-h-100 w-full border rounded-lg p-4">
          <div className="space-y-1">
            {/* Folders */}
            {data.folders.content.map((item) => (
              <ContextMenu key={item.folderId}>
                <ContextMenuTrigger>
                  <div className="flex items-center gap-2 p-2 hover:bg-accent rounded">
                    <Folder className="h-4 w-4" />

                    <span>{item.name}</span>
                  </div>
                </ContextMenuTrigger>

                <FolderCtxMenu />
              </ContextMenu>
            ))}

            {/* Files */}
            {data.files.content.map((item) => (
              <ContextMenu key={item.fileId}>
                <ContextMenuTrigger>
                  <div className="flex items-center gap-2 p-2 hover:bg-accent rounded">
                    <Folder className="h-4 w-4" />

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
