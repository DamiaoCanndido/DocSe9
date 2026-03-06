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
      {onCreateFolder && (
        <ContextMenuItem onClick={onCreateFolder}>Nova pasta</ContextMenuItem>
      )}
      {onCreateFile && (
        <ContextMenuItem onClick={onCreateFile}>Novo arquivo</ContextMenuItem>
      )}
      {(onCreateFolder || onCreateFile) && <ContextMenuSeparator />}
      <ContextMenuItem>Colar</ContextMenuItem>
      <ContextMenuItem>Atualizar</ContextMenuItem>
    </ContextMenuContent>
  );
};

export default EmptyAreaContextMenu;
