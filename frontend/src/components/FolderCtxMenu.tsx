'use client';

import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { useRouter } from 'next/navigation';
import { ViewDocsType } from '@/components/DocsLoad';
import { usePathname } from 'next/navigation';
import { getViewUrl } from '@/lib/data';
import { useState } from 'react';
import { ModalState } from '@/components/AdminModal';

const FolderCtxMenu = ({
  docType,
  viewType,
}: {
  docType: NodeResProps;
  viewType: ViewDocsType;
}) => {
  const [modal, setModal] = useState<ModalState | null>(null);

  const router = useRouter();
  const path = usePathname();

  const editNodeData =
    modal?.data && 'favorite' in modal.data
      ? (modal.data as NodeResProps)
      : null;

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
  };

  return (
    <ContextMenuContent>
      <ContextMenuItem onClick={() => handleFileAction('open')}>
        Abrir
      </ContextMenuItem>

      <ContextMenuSeparator />
      <ContextMenuItem onClick={() => handleFileAction('rename')}>
        Renomear
      </ContextMenuItem>
      <ContextMenuItem onClick={() => handleFileAction('move')}>
        Mover
      </ContextMenuItem>
      <ContextMenuItem onClick={() => handleFileAction('delete')}>
        Excluir
      </ContextMenuItem>
    </ContextMenuContent>
  );
};

export default FolderCtxMenu;
