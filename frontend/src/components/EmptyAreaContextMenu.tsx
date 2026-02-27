'use client';

import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';

interface EmptyAreaContextMenuProps {
  onCreateFolder?: () => void;
  onCreateFile?: () => void;
}

const EmptyAreaContextMenu = ({
  onCreateFolder,
  onCreateFile,
}: EmptyAreaContextMenuProps) => {
  return (
    <ContextMenuContent>
      <ContextMenuItem onClick={onCreateFolder}>Nova pasta</ContextMenuItem>
      <ContextMenuItem onClick={onCreateFile}>Novo arquivo</ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem>Colar</ContextMenuItem>
      <ContextMenuItem>Atualizar</ContextMenuItem>
    </ContextMenuContent>
  );
};

export default EmptyAreaContextMenu;
