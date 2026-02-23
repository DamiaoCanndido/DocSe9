import AdminSuite from '@/components/AdminSuite';
import { getMe, getTowns, getUsers } from '@/lib/data';

export default async function AdminPanel({ searchParams }: SearchParamProps) {
  const currentUser: UserResProps = await getMe();

  /*
  
  name is used for both user and town search, 
  so it can be present even if we're on a town-only search. 
  In that case, it should be treated as empty to avoid filtering out all towns.  
  
  */
  const name = ((await searchParams)?.name as string) || '';
  const role = ((await searchParams)?.role as string) || '';
  const town = ((await searchParams)?.town as string) || '';

  const page = ((await searchParams)?.page as string) || '';
  const size = ((await searchParams)?.size as string) || '';
  const sort = ((await searchParams)?.sort as string) || '';

  var towns: ApiResponse<TownResProps> = {
    data: {
      content: [],
      page: 0,
      pageSize: 0,
      totalElements: 0,
      totalPages: 0,
      last: true,
    },
  };

  var users: ApiResponse<UserResProps> = {
    data: {
      content: [],
      page: 0,
      pageSize: 0,
      totalElements: 0,
      totalPages: 0,
      last: true,
    },
  };

  if (currentUser.role.name === 'admin') {
    towns = await getTowns({ queries: { name, page, size, sort } });
    users = await getUsers({
      queries: {
        name,
        role,
        town: town || undefined,
        page,
        size,
        sort,
      },
    });
  } else {
    users = await getUsers({ queries: { name, role, town, page, size, sort } });
  }

  return (
    <AdminSuite
      user={currentUser}
      allTowns={towns.data}
      allUsers={users.data}
    />
  );
}
