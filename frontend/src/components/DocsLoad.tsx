import DocsContent from '@/components/DocsContent';
import { getRootFolders, getTrashFolders } from '@/lib/data';

type ViewType = 'my-docs' | 'shared' | 'starred' | 'trash' | 'recent';

export default async function DocsLoad({
  queries,
  type,
}: {
  queries: DocsGetInput;
  type: ViewType;
}) {
  let data: ApiResponse;

  switch (type) {
    case 'my-docs':
      data = await getRootFolders({
        name: queries.name,
        page: queries.page,
        size: queries.size,
        sort: queries.sort,
      });
      break;
    case 'trash':
      data = await getTrashFolders({
        name: queries.name,
        page: queries.page,
        size: queries.size,
        sort: queries.sort,
      });
      break;
  }

  return (
    /* Desktop docs */
    <DocsContent folders={data!.folders} files={data!.files} />
  );
}
