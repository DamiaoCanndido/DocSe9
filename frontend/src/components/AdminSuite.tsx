'use client';

import { deleteTown, newTown, updateTown } from '@/app/api/towns';
import { deleteUser, registerUser, updateUser } from '@/app/api/users';
import AddTownModal, { TownFormData } from '@/components/AddTownModal';
import AddUserModal, { AddUserFormData } from '@/components/AddUserModal';
import AdminLogs from '@/components/AdminLogs';
import { ModalState } from '@/components/AdminModal';
import AdminSettings from '@/components/AdminSettings';
import AdminTowns from '@/components/AdminTowns';
import AdminUsers from '@/components/AdminUsers';
import DeleteTownModal from '@/components/DeleteTownModal';
import DeleteUserModal from '@/components/DeleteUserModal';
import EditTownModal from '@/components/EditTownModal';
import EditUserModal, { EditUserFormData } from '@/components/EditUserModal';
import {
  Building2,
  CheckCircle2,
  HelpCircle,
  LayoutDashboard,
  MapPin,
  ScrollText,
  Settings,
  Users
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────────────────────────────────

type TabId = 'dashboard' | 'users' | 'towns' | 'settings' | 'logs';

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

// ─── Initial Data ─────────────────────────────────────────────────────────────

const BAR_COLORS: string[] = [
  '#3B82F6',
  '#8B5CF6',
  '#F97316',
  '#22C55E',
  '#6B7280',
];

// ─── Pages ─────────────────────────────────────────────────────────────────────

interface DashboardPageProps {
  users: UserResProps[];
  towns: TownResProps[];
  me: UserResProps;
}

function DashboardPage({ users, towns, me }: DashboardPageProps) {
  const isManager = me.role.name === 'manager';
  const userTown = me.town?.name || 'Seu Município';

  // Filtrar usuários se for gerente (apenas os do seu município)
  const filteredUsers = isManager
    ? users.filter((u) => u.town?.townId === me.town?.townId)
    : users;

  const activeUsers: number =
    filteredUsers.length > 0 ? Math.ceil(filteredUsers.length * 0.4) : 0;

  // Estatísticas para o gráfico de barras
  const barChartData = isManager
    ? [
        {
          name: 'Admin',
          count: filteredUsers.filter((u) => u.role.name === 'admin').length,
        },
        {
          name: 'Manager',
          count: filteredUsers.filter((u) => u.role.name === 'manager').length,
        },
        {
          name: 'Basic',
          count: filteredUsers.filter((u) => u.role.name === 'basic').length,
        },
      ].filter((d) => d.count > 0)
    : towns.slice(0, 5).map((t, i) => ({
        name: t.name,
        count: t.totalUsers ?? 0,
        color: BAR_COLORS[i] ?? '#6B7280',
      }));

  interface StatCard {
    label: string;
    value: number | string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: 'blue' | 'purple' | 'green' | 'orange';
  }

  const statCards: StatCard[] = [
    {
      label: isManager ? 'Usuários no Município' : 'Total de Usuários',
      value: filteredUsers.length,
      icon: Users,
      color: 'blue',
    },
    ...(isManager
      ? []
      : [
          {
            label: 'Total Municípios',
            value: towns.length,
            icon: Building2,
            color: 'purple',
          } as StatCard,
        ]),
    {
      label: 'Usuários Ativos',
      value: activeUsers,
      icon: CheckCircle2,
      color: 'green',
    },
  ];

  const colorMap: Record<StatCard['color'], string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-500',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-500',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-500',
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Contextual */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {isManager ? `Visão Geral: ${userTown}` : 'Visão Geral Global'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            {isManager
              ? 'Estatísticas e métricas exclusivas do seu município.'
              : 'Métricas consolidadas de todos os municípios e usuários.'}
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isManager
              ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
              : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
          }`}
        >
          {isManager ? 'Acesso Gerente' : 'Acesso Total'}
        </div>
      </div>

      {/* Stats Cards */}
      <div
        className={`grid grid-cols-2 ${
          isManager ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
        } gap-4`}
      >
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center gap-4 hover:border-gray-200 dark:hover:border-zinc-700 transition-colors"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}
            >
              <Icon size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mb-0.5">
                {label}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {isManager
                ? 'Distribuição por Cargos'
                : 'Usuários por Município (Top 5)'}
            </h3>
            {isManager ? (
              <Users size={16} className="text-gray-400 dark:text-zinc-500" />
            ) : (
              <MapPin size={16} className="text-gray-400 dark:text-zinc-500" />
            )}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={barChartData}
              layout="vertical"
              margin={{ left: 16, right: 30 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip
                cursor={{ fill: '#f9fafb', opacity: 0.1 }}
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Bar
                dataKey="count"
                radius={[0, 6, 6, 0]}
                barSize={35}
                fill="#3B82F6"
                shape={(props: any) => {
                  const { x, y, width, height, index } = props;
                  const color = isManager
                    ? BAR_COLORS[index % BAR_COLORS.length]
                    : (barChartData[index] as any).color;
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
    { id: 'logs', label: 'Logs', icon: ScrollText },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const tabs = baseTabs.filter((tab) => {
    if (user.role.name === 'manager') {
      return tab.id !== 'towns' && tab.id !== 'logs';
    }
    return true;
  });

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
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-black font-sans overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 shrink-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Painel administrativo
            </h1>
            <p className="text-xs text-gray-500 dark:text-zinc-400 hidden sm:block">
              Gerenciar usuários, municípios e organizações de sistemas.
            </p>
          </div>
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
                    ? 'bg-white dark:bg-black text-blue-600 dark:text-blue-400 border-gray-200 dark:border-zinc-800 border-b-white dark:border-b-black -mb-px z-10'
                    : 'text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 border-transparent'
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
            <DashboardPage
              users={allUsers.content}
              towns={allTowns.content}
              me={user}
            />
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
          {tab === 'logs' && <AdminLogs />}
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
