import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';

const FolderCtxMenu = () => {
  const handleFileAction = (action: string) => {
    console.log(`${action}`);
  };
  return (
    <ContextMenuContent>
      <ContextMenuItem onClick={() => handleFileAction('abrir')}>
        Abrir
      </ContextMenuItem>

      <ContextMenuItem>Abrir em nova janela</ContextMenuItem>

      <ContextMenuSeparator />
      <ContextMenuItem onClick={() => handleFileAction('renomear')}>
        Renomear
      </ContextMenuItem>
      <ContextMenuItem onClick={() => handleFileAction('excluir')}>
        Excluir
      </ContextMenuItem>
    </ContextMenuContent>
  );
};

export default FolderCtxMenu;
