'use client';

import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { useRouter } from 'next/navigation';

interface EmptyAreaContextMenuProps {
  onCreateFolder?: () => void;
  onCreateFile?: () => void;
}

const EmptyAreaContextMenu = ({
  onCreateFolder,
  onCreateFile,
}: EmptyAreaContextMenuProps) => {
  const router = useRouter();

  return (
    <ContextMenuContent>
      {onCreateFolder && (
        <ContextMenuItem onClick={onCreateFolder}>Nova pasta</ContextMenuItem>
      )}
      {onCreateFile && (
        <ContextMenuItem onClick={onCreateFile}>Novo arquivo</ContextMenuItem>
      )}
      {(onCreateFolder || onCreateFile) && <ContextMenuSeparator />}
      <ContextMenuItem onClick={() => router.refresh()}>
        Atualizar
      </ContextMenuItem>
    </ContextMenuContent>
  );
};

export default EmptyAreaContextMenu;
