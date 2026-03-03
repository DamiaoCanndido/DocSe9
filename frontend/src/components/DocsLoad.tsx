import DocsContent from '@/components/DocsContent';
import {
  getFavoriteNodes,
  getRootFolders,
  getTrashFolders,
} from '@/app/api/folders';

export type ViewDocsType =
  | 'my-docs'
  | 'shared'
  | 'starred'
  | 'trash'
  | 'recent';

export default async function DocsLoad({
  queries,
  type,
}: {
  queries: DocsQueries;
  type: ViewDocsType;
}) {
  let data: ApiResponse<NodeResProps> = {
    data: {
      content: [],
      page: 0,
      pageSize: 0,
      totalElements: 0,
      totalPages: 0,
      last: true,
    },
  };

  const setQueries = {
    name: queries.name,
    page: queries.page,
    size: queries.size,
    sort: queries.sort,
  };

  switch (type) {
    case 'my-docs':
      data = await getRootFolders(setQueries);
      break;
    case 'trash':
      data = await getTrashFolders(setQueries);
      break;
    case 'starred':
      data = await getFavoriteNodes(setQueries);
      break;
  }

  return (
    /* Desktop docs */
    <DocsContent
      data={data.data}
      type={type}
      parentId={queries.id as string | undefined}
    />
  );
}
