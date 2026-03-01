'use client';

import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { useRouter } from 'next/navigation';
import { ViewDocsType } from '@/components/DocsLoad';
import { usePathname } from 'next/navigation';
import { getViewUrl, restoreFile } from '@/app/api/files';
import { restoreFolder } from '@/app/api/folders';
import { toast } from 'sonner';

const FolderCtxMenu = ({
  docType,
  viewType,
  onEdit,
  onDelete,
  onMove,
}: {
  docType: NodeResProps;
  viewType: ViewDocsType;
  onEdit: (node: NodeResProps) => void;
  onDelete: (node: NodeResProps) => void;
  onMove: (node: NodeResProps) => void;
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

  const handleFileAction = async (action: string) => {
    if (action === 'open') {
      if (docType.nodeType === 'folder' && viewType === 'trash') return;
      if (docType.nodeType === 'folder' && viewType === 'my-docs')
        router.push(`/my-docs/${docType.id}`);
      if (docType.nodeType === 'file' && viewType === 'trash') return;
      if (docType.nodeType === 'file' && viewType === 'my-docs') {
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
  };

  return (
    <>
      <ContextMenuContent>
        <ContextMenuItem
          disabled={viewType === 'trash'}
          onClick={() => handleFileAction('open')}
        >
          Abrir
        </ContextMenuItem>

        <ContextMenuSeparator />
        <ContextMenuItem
          disabled={viewType === 'trash'}
          onClick={() => handleFileAction('rename')}
        >
          Renomear
        </ContextMenuItem>
        <ContextMenuItem
          disabled={viewType !== 'trash'}
          onClick={() => handleFileAction('restore')}
        >
          Restaurar
        </ContextMenuItem>
        <ContextMenuItem
          disabled={viewType === 'trash'}
          onClick={() => handleFileAction('move')}
        >
          Mover
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => handleFileAction('delete')}
          className="text-red-600 focus:text-red-600"
        >
          {viewType === 'trash'
            ? 'Excluir permanentemente'
            : 'Mover para lixeira'}
        </ContextMenuItem>
      </ContextMenuContent>
    </>
  );
};

export default FolderCtxMenu;
