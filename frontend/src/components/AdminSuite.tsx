'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  Download,
  MapPin,
  TrendingUp,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import AdminSettings from '@/components/AdminSettings';
import { usePathname } from 'next/navigation';
import { deleteTown, newTown, updateTown } from '@/app/api/towns';
import { deleteUser, registerUser, updateUser } from '@/app/api/users';
import { toast } from 'sonner';
import AdminTowns from '@/components/AdminTowns';
import AddTownModal, { TownFormData } from '@/components/AddTownModal';
import EditTownModal from '@/components/EditTownModal';
import DeleteTownModal from '@/components/DeleteTownModal';
import AdminUsers from '@/components/AdminUsers';
import AddUserModal, { AddUserFormData } from '@/components/AddUserModal';
import EditUserModal, { EditUserFormData } from '@/components/EditUserModal';
import DeleteUserModal from '@/components/DeleteUserModal';
import { ModalState } from '@/components/AdminModal';

// ─── Types ─────────────────────────────────────────────────────────────────────

type TabId = 'dashboard' | 'users' | 'towns' | 'settings';

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface ChartBarEntry {
  town: string;
  users: number;
  color: string;
}

interface WeekEntry {
  day: string;
  users: number;
}

// ─── Initial Data ─────────────────────────────────────────────────────────────

const userCounts: Record<string, number> = {
  'San Francisco': 119,
  'New York': 85,
  Austin: 45,
  Seattle: 62,
  Chicago: 38,
};

const BAR_COLORS: string[] = [
  '#3B82F6',
  '#8B5CF6',
  '#F97316',
  '#22C55E',
  '#6B7280',
];

const weekData: WeekEntry[] = [
  { day: 'Mon', users: 42 },
  { day: 'Tue', users: 28 },
  { day: 'Wed', users: 63 },
  { day: 'Thu', users: 48 },
  { day: 'Fri', users: 89 },
  { day: 'Sat', users: 22 },
  { day: 'Sun', users: 15 },
];

// ─── Pages ─────────────────────────────────────────────────────────────────────

interface DashboardPageProps {
  users: UserResProps[];
  towns: TownResProps[];
}

function DashboardPage({ users, towns }: DashboardPageProps) {
  const activeUsers: number = 3;

  const townStats: ChartBarEntry[] = towns.map((t, i) => ({
    town: t.name,
    users: userCounts[t.name] ?? 0,
    color: BAR_COLORS[i] ?? '#6B7280',
  }));

  interface StatCard {
    label: string;
    value: number | string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: 'blue' | 'purple' | 'green' | 'orange';
  }

  const statCards: StatCard[] = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'blue' },
    {
      label: 'Total Towns',
      value: towns.length,
      icon: Building2,
      color: 'purple',
    },
    {
      label: 'Active Users',
      value: activeUsers,
      icon: CheckCircle2,
      color: 'green',
    },
    { label: 'New This Week', value: '+12', icon: TrendingUp, color: 'orange' },
  ];

  const colorMap: Record<StatCard['color'], string> = {
    blue: 'bg-blue-50 text-blue-500',
    purple: 'bg-purple-50 text-purple-500',
    green: 'bg-green-50 text-green-500',
    orange: 'bg-orange-50 text-orange-500',
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}
            >
              <Icon size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              Users by Town (Top 5)
            </h3>
            <MapPin size={16} className="text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={townStats}
              layout="vertical"
              margin={{ left: 16, right: 8 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="town"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip cursor={{ fill: '#f3f4f6' }} />
              <Bar
                dataKey="users"
                radius={[0, 6, 6, 0]}
                shape={(props: {
                  x?: number;
                  y?: number;
                  width?: number;
                  height?: number;
                  index?: number;
                }) => {
                  const {
                    x = 0,
                    y = 0,
                    width = 0,
                    height = 0,
                    index = 0,
                  } = props;
                  const color = BAR_COLORS[index] ?? '#6B7280';
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={color}
                      rx={6}
                      ry={6}
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              New Users (Last 7 Days)
            </h3>
            <TrendingUp size={16} className="text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#3B82F6"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#3B82F6' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────

export default function AdminSuite({
  user,
  allTowns,
  allUsers,
}: {
  user: UserResProps;
  allTowns: ApiResponse<TownResProps>['data'];
  allUsers: ApiResponse<UserResProps>['data'];
}) {
  const [tab, setTab] = useState<TabId>('dashboard');

  const path = usePathname();

  const [modal, setModal] = useState<ModalState | null>(null);

  const baseTabs: TabItem[] = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'towns', label: 'Municípios', icon: Building2 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const tabs = baseTabs.filter((tab) =>
    user.role.name === 'manager' ? tab.id !== 'towns' : true
  );

  const handleAddTown = async (form: TownFormData): Promise<void> => {
    try {
      await newTown({ form, path });
    } catch (error) {
      toast.error('Erro', {
        description: 'Erro ao criar município.',
        duration: 2000,
      });
    }
  };

  const handleEditTown = async (
    townId: string,
    form: TownFormData
  ): Promise<void> => {
    try {
      await updateTown({ townId, form, path });
    } catch (error) {
      toast.error('Erro', {
        description: 'Erro ao editar município.',
        duration: 2000,
      });
    }
  };

  const handleDeleteTown = async (townId: string): Promise<void> => {
    try {
      await deleteTown({ townId, path });
    } catch (error) {
      toast.error('Erro', {
        description: 'Erro ao deletar município.',
        duration: 2000,
      });
    }
  };

  const handleAddUser = async (form: AddUserFormData): Promise<void> => {
    try {
      await registerUser({
        form: {
          username: form.username,
          email: form.email,
          townId: form.townId || null,
          role: form.role,
          password: form.password,
          confirmPassword: form.confirm,
        },
        path,
      });
    } catch (error) {
      toast.error('Erro', {
        description: 'Erro ao criar usuário.',
        duration: 2000,
      });
    }
  };

  const handleEditUser = async (
    id: string,
    form: EditUserFormData
  ): Promise<void> => {
    try {
      await updateUser({
        userId: id,
        form: {
          username: form.username,
          email: form.email,
          townId: form.townId || null,
          role: form.role,
          password: form.password!,
          confirmPassword: form.confirm!,
        },
        path,
      });
    } catch (error) {
      toast.error('Erro', {
        description: 'Erro ao editar usuário.',
        duration: 2000,
      });
    }
  };

  const handleDeleteUser = async (id: string): Promise<void> => {
    try {
      await deleteUser({ userId: id, path });
    } catch (error) {
      toast.error('Erro', {
        description: 'Erro ao deletar usuário.',
        duration: 2000,
      });
    }
  };

  const editTownData =
    modal?.data && 'uf' in modal.data ? (modal.data as TownResProps) : null;
  const editUserData =
    modal?.data && 'email' in modal.data ? (modal.data as UserResProps) : null;
  const deleteTownData =
    modal?.type === 'deleteTown' && modal.data && 'uf' in modal.data
      ? (modal.data as TownResProps)
      : null;
  const deleteUserData =
    modal?.type === 'deleteUser' && modal.data && 'email' in modal.data
      ? (modal.data as UserResProps)
      : null;

  return (
    <div className="h-screen flex flex-col bg-gray-50 font-sans overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shrink-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Painel administrativo
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              Gerenciar usuários, municípios e organizações de sistemas.
            </p>
          </div>
          <button className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            <Download size={15} />
            <span className="hidden sm:inline">Baixar logs</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto">
          <div className="flex gap-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-medium rounded-t-xl border transition whitespace-nowrap ${
                  tab === id
                    ? 'bg-white text-blue-600 border-gray-200 border-b-white -mb-px z-10'
                    : 'text-gray-500 hover:text-gray-700 border-transparent'
                }`}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {tab === 'dashboard' && (
            <DashboardPage users={allUsers.content} towns={allTowns.content} />
          )}
          {tab === 'users' && (
            <AdminUsers
              users={allUsers.content}
              me={user}
              towns={allTowns.content}
              onAdd={() => setModal({ type: 'addUser' })}
              onEdit={(user) => setModal({ type: 'editUser', data: user })}
              onDelete={(user) => setModal({ type: 'deleteUser', data: user })}
            />
          )}
          {tab === 'towns' && (
            <AdminTowns
              towns={allTowns.content}
              onAdd={() => setModal({ type: 'addTown' })}
              onEdit={(town) => setModal({ type: 'editTown', data: town })}
              onDelete={(town) => setModal({ type: 'deleteTown', data: town })}
            />
          )}
          {tab === 'settings' && <AdminSettings />}
        </div>
      </main>

      {/* Help Button */}
      <button className="fixed bottom-6 right-6 w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition z-30">
        <HelpCircle size={18} />
      </button>

      {/* Modals */}
      {modal?.type === 'addTown' && (
        <AddTownModal onClose={() => setModal(null)} onSave={handleAddTown} />
      )}
      {modal?.type === 'editTown' && editTownData && (
        <EditTownModal
          town={editTownData}
          onClose={() => setModal(null)}
          onSave={(f) => handleEditTown(editTownData.townId, f)}
        />
      )}
      {modal?.type === 'addUser' && (
        <AddUserModal
          towns={allTowns.content}
          me={user}
          onClose={() => setModal(null)}
          onSave={handleAddUser}
        />
      )}
      {modal?.type === 'editUser' && editUserData && (
        <EditUserModal
          user={editUserData}
          me={user}
          towns={allTowns.content}
          onClose={() => setModal(null)}
          onSave={(f: EditUserFormData) =>
            handleEditUser(editUserData.userId, f)
          }
        />
      )}
      {modal?.type === 'deleteTown' && deleteTownData && (
        <DeleteTownModal
          town={deleteTownData}
          onClose={() => setModal(null)}
          onConfirm={() => handleDeleteTown(deleteTownData.townId)}
        />
      )}
      {modal?.type === 'deleteUser' && deleteUserData && (
        <DeleteUserModal
          user={deleteUserData}
          onClose={() => setModal(null)}
          onConfirm={() => handleDeleteUser(deleteUserData.userId)}
        />
      )}
    </div>
  );
}
