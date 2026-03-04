'use client';

import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { ViewDocsType } from '@/components/DocsLoad';
import { usePathname } from 'next/navigation';
import { getViewUrl, restoreFile, favoriteFile } from '@/app/api/files';
import { restoreFolder, favoriteFolder } from '@/app/api/folders';
import { toast } from 'sonner';

const FolderCtxMenu = ({
  docType,
  viewType,
  onEdit,
  onDelete,
  onMove,
  isDropdown = false,
}: {
  docType: NodeResProps;
  viewType: ViewDocsType;
  onEdit: (node: NodeResProps) => void;
  onDelete: (node: NodeResProps) => void;
  onMove: (node: NodeResProps) => void;
  isDropdown?: boolean;
}) => {
  const router = useRouter();
  const path = usePathname();

  const handleRestoreNode = async (
    id: string,
    nodeType: 'folder' | 'file'
  ): Promise<void> => {
    try {
      if (nodeType === 'folder') {
        await restoreFolder({
          folderId: id,
          path,
        });
      } else {
        await restoreFile({
          fileId: id,
          path,
        });
      }
      toast.success('Sucesso', {
        description: `${
          nodeType === 'folder' ? 'Pasta' : 'Arquivo'
        } restaurado com sucesso.`,
        duration: 2000,
      });
    } catch (_error) {
      toast.error('Erro', {
        description: `Erro ao restaurar ${
          nodeType === 'folder' ? 'pasta' : 'arquivo'
        }.`,
        duration: 2000,
      });
    }
  };

  const handleFavoriteNode = async (
    id: string,
    nodeType: 'folder' | 'file'
  ): Promise<void> => {
    try {
      if (nodeType === 'folder') {
        await favoriteFolder({
          folderId: id,
          path,
        });
      } else {
        await favoriteFile({
          fileId: id,
          path,
        });
      }
      toast.success('Sucesso', {
        description: `${nodeType === 'folder' ? 'Pasta' : 'Arquivo'} ${
          docType.favorite ? 'removido dos' : 'adicionado aos'
        } favoritos.`,
        duration: 2000,
      });
    } catch (_error) {
      toast.error('Erro', {
        description: `Erro ao favoritar ${
          nodeType === 'folder' ? 'pasta' : 'arquivo'
        }.`,
        duration: 2000,
      });
    }
  };

  const handleFileAction = async (action: string) => {
    if (action === 'open') {
      if (docType.nodeType === 'folder' && viewType === 'trash') return;
      if (docType.nodeType === 'folder') router.push(`/my-docs/${docType.id}`);
      if (docType.nodeType === 'file' && viewType === 'trash') return;
      if (docType.nodeType === 'file') {
        const result = await getViewUrl(docType.id, path);
        window.open(result.url, '_blank', 'noopener,noreferrer');
      }
    }
    if (action === 'rename' && viewType === 'trash') return;
    if (action === 'rename') {
      onEdit(docType);
    }
    if (action === 'restore' && viewType !== 'trash') return;
    if (action === 'restore') {
      handleRestoreNode(docType.id, docType.nodeType);
    }
    if (action === 'delete') {
      onDelete(docType);
    }
    if (action === 'move') {
      onMove(docType);
    }
    if (action === 'favorite') {
      handleFavoriteNode(docType.id, docType.nodeType);
    }
  };

  const Content = isDropdown ? DropdownMenuContent : ContextMenuContent;
  const Item = isDropdown ? DropdownMenuItem : ContextMenuItem;
  const Separator = isDropdown ? DropdownMenuSeparator : ContextMenuSeparator;

  return (
    <Content>
      <Item
        disabled={viewType === 'trash'}
        onClick={(e) => {
          e.stopPropagation();
          handleFileAction('open');
        }}
      >
        Abrir
      </Item>

      <Separator />
      <Item
        disabled={viewType === 'trash'}
        onClick={(e) => {
          e.stopPropagation();
          handleFileAction('favorite');
        }}
      >
        {docType.favorite ? 'Desfavoritar' : 'Favoritar'}
      </Item>
      <Item
        disabled={viewType === 'trash'}
        onClick={(e) => {
          e.stopPropagation();
          handleFileAction('rename');
        }}
      >
        Renomear
      </Item>
      <Item
        disabled={viewType !== 'trash'}
        onClick={(e) => {
          e.stopPropagation();
          handleFileAction('restore');
        }}
      >
        Restaurar
      </Item>
      <Item
        disabled={viewType === 'trash'}
        onClick={(e) => {
          e.stopPropagation();
          handleFileAction('move');
        }}
      >
        Mover
      </Item>
      <Item
        onClick={(e) => {
          e.stopPropagation();
          handleFileAction('delete');
        }}
        className="text-red-600 focus:text-red-600"
      >
        {viewType === 'trash'
          ? 'Excluir permanentemente'
          : 'Mover para lixeira'}
      </Item>
    </Content>
  );
};

export default FolderCtxMenu;
