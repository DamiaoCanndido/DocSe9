import DocsContent from '@/components/DocsContent';
import { getChildrenFolders } from '@/lib/data';
import { ApiResponse, SearchParamProps } from '@/types';

export default async function MySubDocs({
  searchParams,
  params,
}: SearchParamProps) {
  const id = (await params).id;
  const name = ((await searchParams)?.name as string) || '';
  const page = ((await searchParams)?.page as string) || '';
  const size = ((await searchParams)?.size as string) || '';
  const sort = ((await searchParams)?.sort as string) || '';

  const { content }: ApiResponse = await getChildrenFolders(id, {
    name,
    page,
    size,
    sort,
  });

  return <DocsContent content={content} type="my-docs" />;
}
