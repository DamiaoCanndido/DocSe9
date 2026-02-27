'use client';

import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';

const EmptyAreaContextMenu = () => {
  return (
    <ContextMenuContent>
      <ContextMenuItem>Nova pasta</ContextMenuItem>
      <ContextMenuItem>Novo arquivo</ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem>Colar</ContextMenuItem>
      <ContextMenuItem>Atualizar</ContextMenuItem>
    </ContextMenuContent>
  );
};

export default EmptyAreaContextMenu;
