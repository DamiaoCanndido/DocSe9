import DocsLoad from '@/components/DocsLoad';

const MyStarred = async ({ searchParams }: SearchParamProps) => {
  const name = ((await searchParams)?.name as string) || '';
  const page = ((await searchParams)?.page as string) || '';
  const size = ((await searchParams)?.size as string) || '';
  const sort = ((await searchParams)?.sort as string) || '';
  return <DocsLoad queries={{ name, page, size, sort }} type="starred" />;
};

export default MyStarred;
