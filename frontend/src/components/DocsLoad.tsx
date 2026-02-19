import DocsContent from '@/components/DocsContent';
import { getRootFolders, getTrashFolders } from '@/lib/data';
import { ApiResponse, DocsGetInput } from '@/types';

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
  queries: DocsGetInput;
  type: ViewDocsType;
}) {
  let data: ApiResponse = {
    content: {
      nodes: [],
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
  }

  return (
    /* Desktop docs */
    <DocsContent content={data.content} type={type} />
  );
}
