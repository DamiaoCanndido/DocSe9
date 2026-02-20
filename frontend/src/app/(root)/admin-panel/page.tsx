import AdminSuite from '@/components/AdminSuite';
import { getMe, getTowns } from '@/lib/data';

export default async function AdminPanel() {
  const currentUser: UserResProps = await getMe();

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

  if (currentUser.role.name === 'admin') {
    towns = await getTowns();
  }

  return <AdminSuite user={currentUser} allTowns={towns.data} />;
}
