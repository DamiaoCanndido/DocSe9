import DocsContent from '@/components/DocsContent';
import { getChildrenFolders } from '@/app/api/folders';
import { getMe } from '@/app/api/users';

export default async function MySubDocs({
  searchParams,
  params,
}: SearchParamProps) {
  const currentUser: UserResProps = await getMe();
  const id = (await params).id;
  const name = ((await searchParams)?.name as string) || '';
  const page = ((await searchParams)?.page as string) || '';
  const size = ((await searchParams)?.size as string) || '';
  const sort = ((await searchParams)?.sort as string) || '';

  const { data }: ApiResponse<NodeResProps> = await getChildrenFolders(id, {
    name,
    page,
    size,
    sort,
  });

  return (
    <DocsContent
      data={data}
      type="my-docs"
      parentId={id}
      currentUser={currentUser}
    />
  );
}
