'use client';

import SearchUsers from '@/components/SearchUsers';
import UserAvatar from '@/components/UserAvatar';
import { Building2, Pencil, Trash2 } from 'lucide-react';
import UserBadge from '@/components/UserBadge';

interface UsersPageProps {
  users: UserResProps[];
  me: UserResProps;
  towns: TownResProps[];
  onAdd: () => void;
  onEdit: (user: UserResProps) => void;
  onDelete: (user: UserResProps) => void;
}

export default function AdminUsers({
  users,
  me,
  towns,
  onAdd,
  onEdit,
  onDelete,
}: UsersPageProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <SearchUsers me={me} towns={towns} onAdd={onAdd} />

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Name & Email', 'Town', 'Role', 'Status', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr
                  key={user.userId}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition ${
                    i === users.length - 1 ? 'border-0' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={user.username} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-gray-700">
                      <Building2 size={13} className="text-gray-400" />
                      {user.town !== null ? user.town.name : ''}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {user.role.name}
                  </td>
                  <td className="px-4 py-3">
                    <UserBadge active={true} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(user)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(user)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
