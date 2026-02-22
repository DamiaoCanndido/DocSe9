'use client';

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  Download,
  Search,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  TrendingUp,
  User,
  Mail,
  ChevronDown,
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
import { deleteTown, newTown, updateTown } from '@/lib/data';
import { toast } from 'sonner';
import AdminTowns from '@/components/AdminTowns';
import AddTownModal from '@/components/AddTownModal';
import AdminModal from '@/components/AdminModal';
import AdminInput from '@/components/AdminInput';
import ModalActions from '@/components/ModalActions';
import EditTownModal from '@/components/EditTownModal';
import DeleteTownModal from '@/components/DeleteTownModal';

// ─── Zod Schemas ───────────────────────────────────────────────────────────────

export const townSchema = z.object({
  name: z
    .string()
    .min(3, 'O nome do municipio deve ter pelo menos 2 caracteres.'),
  uf: z
    .string()
    .min(2, 'A UF do municipio deve ter pelo menos 2 caracteres.')
    .max(2, 'A UF do município não deve ultrapassar 2 caracteres.'),
  imageUrl: z.url('Passe uma url de imagem'),
});

const addUserSchema = z
  .object({
    username: z.string().min(3, 'Full name must be at least 3 characters'),
    email: z.email('Enter a valid email address'),
    active: z.boolean(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm: z.string().min(1, 'Please confirm your password'),
    townId: z.uuid({ message: 'Id da cidade inválido' }).optional(),
    role: z.enum(['basic', 'manager', 'admin']),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

const editUserSchema = z
  .object({
    username: z.string().min(3, 'Full name must be at least 3 characters'),
    email: z.email('Enter a valid email address'),
    active: z.boolean(),
    password: z.string().optional().or(z.literal('')),
    confirm: z.string().optional().or(z.literal('')),
    townId: z.uuid({ message: 'Id da cidade inválido' }).optional(),
    role: z.enum(['basic', 'manager', 'admin']),
  })
  .superRefine((data, ctx) => {
    const { password, confirm } = data;
    const hasPassword = password && password.length > 0;
    const hasConfirm = confirm && confirm.length > 0;

    if (hasPassword || hasConfirm) {
      if (!hasPassword) {
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: 'Password is required',
        });
      } else if (password.length < 6) {
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: 'Password must be at least 6 characters',
        });
      }

      if (!hasConfirm) {
        ctx.addIssue({
          code: 'custom',
          path: ['confirm'],
          message: 'Please confirm your password',
        });
      }

      if (hasPassword && hasConfirm && password !== confirm) {
        ctx.addIssue({
          code: 'custom',
          path: ['confirm'],
          message: 'Passwords do not match',
        });
      }
    }
  });

// ─── Types ─────────────────────────────────────────────────────────────────────

type TabId = 'dashboard' | 'users' | 'towns' | 'settings';
type ModalType =
  | 'addTown'
  | 'editTown'
  | 'deleteTown'
  | 'addUser'
  | 'editUser'
  | 'deleteUser';

type AddUserFormData = z.infer<typeof addUserSchema>;
type EditUserFormData = z.infer<typeof editUserSchema>;
export type TownFormData = z.infer<typeof townSchema>;

interface ModalState {
  type: ModalType;
  data?: UserResProps | TownResProps;
}

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

// ─── Reusable Components ───────────────────────────────────────────────────────

interface BadgeProps {
  active: boolean;
}

function Badge({ active }: BadgeProps) {
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full tracking-wide ${
        active ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50'
      }`}
    >
      {active ? 'ACTIVE' : 'INACTIVE'}
    </span>
  );
}

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md';
}

function Avatar({ name, size = 'md' }: AvatarProps) {
  const sz = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base';
  return (
    <div
      className={`${sz} rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center shrink-0`}
    >
      {name[0]}
    </div>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-blue-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 mt-0.5 rounded-full bg-white shadow transform transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

interface SelectProps {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  error?: string;
}

function Select({
  label,
  required,
  value,
  onChange,
  options,
  error,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-gray-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onChange(e.target.value)
          }
          className={`w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition appearance-none pr-8 ${
            error
              ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
              : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'
          }`}
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

// ─── Modals ────────────────────────────────────────────────────────────────────

interface AddUserModalProps {
  towns: TownResProps[];
  onClose: () => void;
  onSave: (form: AddUserFormData) => void;
}

function AddUserModal({ towns, onClose, onSave }: AddUserModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      username: '',
      email: '',
      active: true,
      password: '',
      confirm: '',
      townId: undefined,
      role: 'basic',
    },
  });

  return (
    <AdminModal title="Add New User" onClose={onClose}>
      <form
        onSubmit={handleSubmit((data) => {
          onSave(data);
          onClose();
        })}
        className="flex flex-col gap-4"
      >
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <AdminInput
              label="Full Name"
              required
              icon={User}
              placeholder="John Doe"
              value={field.value}
              onChange={field.onChange}
              error={errors.username?.message}
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <AdminInput
              label="Email"
              required
              icon={Mail}
              type="email"
              placeholder="john@example.com"
              value={field.value}
              onChange={field.onChange}
              error={errors.email?.message}
            />
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="townId"
            control={control}
            render={({ field }) => (
              <Select
                label="Town"
                required
                value={field.value || ''}
                onChange={field.onChange}
                options={towns.map((t) => t.name)}
                error={errors.townId?.message}
              />
            )}
          />
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select
                label="Role"
                required
                value={field.value}
                onChange={field.onChange}
                options={['basic', 'manager', 'admin']}
                error={errors.role?.message}
              />
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <AdminInput
                required
                label="Password"
                type="password"
                placeholder="••••••••"
                value={field.value || ''}
                onChange={field.onChange}
                error={errors.password?.message}
              />
            )}
          />
          <Controller
            name="confirm"
            control={control}
            render={({ field }) => (
              <AdminInput
                required
                label="Confirm"
                type="password"
                placeholder="••••••••"
                value={field.value || ''}
                onChange={field.onChange}
                error={errors.confirm?.message}
              />
            )}
          />
        </div>
        <Controller
          name="active"
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Active Status
                </p>
                <p className="text-xs text-gray-500">
                  Toggle user availability
                </p>
              </div>
              <Toggle checked={field.value} onChange={field.onChange} />
            </div>
          )}
        />
        <ModalActions onCancel={onClose} confirmLabel="Save User" />
      </form>
    </AdminModal>
  );
}

interface EditUserModalProps {
  user: UserResProps;
  towns: TownResProps[];
  onClose: () => void;
  onSave: (form: EditUserFormData) => void;
}

function EditUserModal({ user, towns, onClose, onSave }: EditUserModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: user.username,
      email: user.email,
      active: true,
      townId: user.town?.townId,
      role: user.role.name as 'basic' | 'manager' | 'admin',
      password: '',
      confirm: '',
    },
  });

  return (
    <AdminModal title="Edit User" onClose={onClose}>
      <form
        onSubmit={handleSubmit((data) => {
          onSave(data);
          onClose();
        })}
        className="flex flex-col gap-4"
      >
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <AdminInput
              label="Full Name"
              required
              icon={User}
              value={field.value}
              onChange={field.onChange}
              error={errors.username?.message}
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <AdminInput
              label="Email"
              required
              icon={Mail}
              type="email"
              value={field.value}
              onChange={field.onChange}
              error={errors.email?.message}
            />
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="townId"
            control={control}
            render={({ field }) => (
              <Select
                label="Town"
                required
                value={field.value || ''}
                onChange={field.onChange}
                options={towns.map((t) => t.name)}
                error={errors.townId?.message}
              />
            )}
          />
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select
                label="Role"
                required
                value={field.value}
                onChange={field.onChange}
                options={['basic', 'manager', 'admin']}
                error={errors.role?.message}
              />
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <AdminInput
                label="Password"
                required
                type="password"
                placeholder="••••••••"
                value={field.value || ''}
                onChange={field.onChange}
                error={errors.password?.message}
              />
            )}
          />
          <Controller
            name="confirm"
            control={control}
            render={({ field }) => (
              <AdminInput
                label="Confirm"
                required
                type="password"
                placeholder="••••••••"
                value={field.value || ''}
                onChange={field.onChange}
                error={errors.confirm?.message}
              />
            )}
          />
        </div>

        <Controller
          name="active"
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Active Status
                </p>
                <p className="text-xs text-gray-500">
                  Toggle user availability
                </p>
              </div>
              <Toggle checked={field.value} onChange={field.onChange} />
            </div>
          )}
        />
        <ModalActions onCancel={onClose} confirmLabel="Update User" />
      </form>
    </AdminModal>
  );
}

interface DeleteUserModalProps {
  user: UserResProps;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteUserModal({ user, onClose, onConfirm }: DeleteUserModalProps) {
  return (
    <AdminModal title="Delete User" onClose={onClose}>
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <Trash2 size={26} className="text-red-500" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900">
            Delete "{user.username}"?
          </p>
          <p className="text-sm text-gray-500 mt-1">
            This action cannot be undone.
          </p>
        </div>
        <div className="w-full bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100">
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-800">{user.email}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-500">Town</span>
            <span className="font-medium text-gray-800">
              {user.town !== null && user.town.name}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-500">Role</span>
            <span className="font-medium text-gray-800">{user.role.name}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-500">Status</span>
            <Badge active={true} />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 -mx-6 -mb-2 px-6 pb-0">
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition py-2"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition"
        >
          Delete User
        </button>
      </div>
    </AdminModal>
  );
}

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

interface UsersPageProps {
  users: UserResProps[];
  towns: TownResProps[];
  onAdd: () => void;
  onEdit: (user: UserResProps) => void;
  onDelete: (user: UserResProps) => void;
}

function UsersPage({ users, towns, onAdd, onEdit, onDelete }: UsersPageProps) {
  const [search, setSearch] = useState<string>('');
  const [townFilter, setTownFilter] = useState<string>('Todos');
  const [roleFilter, setRoleFilter] = useState<string>('Todas');

  const filtered: UserResProps[] = useMemo(
    () =>
      users.filter((u) => {
        const matchSearch =
          u.username.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase());
        const matchTown = townFilter === 'Todos' || u.town?.name === townFilter;
        const matchRole = roleFilter === 'Todas' || u.role.name === roleFilter;
        return matchSearch && matchTown && matchRole;
      }),
    [users, search, townFilter, roleFilter]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            placeholder="Search by name or email"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <select
              value={townFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setTownFilter(e.target.value)
              }
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white appearance-none pr-7 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option>Todos</option>
              {towns.map((t) => (
                <option key={t.townId}>{t.name}</option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setRoleFilter(e.target.value)
              }
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white appearance-none pr-7 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option>Todas</option>
              <option>basic</option>
              <option>manager</option>
              <option>admin</option>
            </select>
            <ChevronDown
              size={13}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
          <button
            onClick={onAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition whitespace-nowrap"
          >
            <Plus size={15} /> Add New User
          </button>
        </div>
      </div>

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
              {filtered.map((user, i) => (
                <tr
                  key={user.userId}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition ${
                    i === filtered.length - 1 ? 'border-0' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.username} size="sm" />
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
                    <Badge active={true} />
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

  const handleAddUser = (form: AddUserFormData): void => {};

  const handleEditUser = (id: string, form: EditUserFormData): void => {};

  const handleDeleteUser = (id: string): void => {};

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
            <span className="hidden sm:inline">Export Audit</span>
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
            <UsersPage
              users={allUsers.content}
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
          onClose={() => setModal(null)}
          onSave={handleAddUser}
        />
      )}
      {modal?.type === 'editUser' && editUserData && (
        <EditUserModal
          user={editUserData}
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
