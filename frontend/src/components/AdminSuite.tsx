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
  X,
  User,
  Mail,
  Eye,
  EyeOff,
  ChevronDown,
  HelpCircle,
  AlertCircle,
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

// ─── Zod Schemas ───────────────────────────────────────────────────────────────

const townSchema = z.object({
  name: z.string().min(2, 'Town name must be at least 2 characters'),
  state: z.string().min(2, 'State / Region must be at least 2 characters'),
  description: z.string().min(2),
});

const addUserSchema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm: z.string().min(1, 'Please confirm your password'),
    town: z.string().min(1, 'Please select a town'),
    role: z.enum(['Administrator', 'Operator', 'Viewer']),
    active: z.boolean(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

const editUserSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.email('Enter a valid email address'),
  town: z.string().min(1, 'Please select a town'),
  role: z.enum(['Administrator', 'Operator', 'Viewer']),
  active: z.boolean(),
});

// ─── Types ─────────────────────────────────────────────────────────────────────

type Role = 'Administrator' | 'Operator' | 'Viewer';
type TabId = 'dashboard' | 'users' | 'towns' | 'settings';
type ModalType =
  | 'addTown'
  | 'editTown'
  | 'deleteTown'
  | 'addUser'
  | 'editUser'
  | 'deleteUser';

type TownFormData = z.infer<typeof townSchema>;
type AddUserFormData = z.infer<typeof addUserSchema>;
type EditUserFormData = z.infer<typeof editUserSchema>;

interface Town {
  id: number;
  name: string;
  state: string;
  description: string;
}

interface AppUser {
  id: number;
  name: string;
  email: string;
  town: string;
  role: Role;
  active: boolean;
}

interface ModalState {
  type: ModalType;
  data?: AppUser | Town;
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

const initialTowns: Town[] = [
  {
    id: 1,
    name: 'San Francisco',
    state: 'California',
    description: 'Main tech hub',
  },
  {
    id: 2,
    name: 'New York',
    state: 'New York',
    description: 'Financial district',
  },
  { id: 3, name: 'Austin', state: 'Texas', description: 'Growing ecosystem' },
  {
    id: 4,
    name: 'Seattle',
    state: 'Washington',
    description: 'Cloud infrastructure focus',
  },
  {
    id: 5,
    name: 'Chicago',
    state: 'Illinois',
    description: 'Central operations',
  },
];

const initialUsers: AppUser[] = [
  {
    id: 1,
    name: 'Alex Thompson',
    email: 'alex.t@example.com',
    town: 'San Francisco',
    role: 'Administrator',
    active: true,
  },
  {
    id: 2,
    name: 'Sarah Miller',
    email: 's.miller@example.com',
    town: 'New York',
    role: 'Operator',
    active: true,
  },
  {
    id: 3,
    name: 'James Wilson',
    email: 'james.w@example.com',
    town: 'Austin',
    role: 'Viewer',
    active: false,
  },
  {
    id: 4,
    name: 'Emma Davis',
    email: 'emma.d@example.com',
    town: 'San Francisco',
    role: 'Operator',
    active: true,
  },
  {
    id: 5,
    name: 'Michael Chen',
    email: 'm.chen@example.com',
    town: 'Seattle',
    role: 'Viewer',
    active: true,
  },
];

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

interface InputProps {
  label?: string;
  required?: boolean;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password';
  error?: string;
}

function Input({
  label,
  required,
  icon: Icon,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
}: InputProps) {
  const [show, setShow] = useState<boolean>(false);
  const inputType = type === 'password' ? (show ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-gray-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        )}
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value)
          }
          className={`w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition ${
            error
              ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
              : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'
          } ${Icon ? 'pl-9' : ''} ${type === 'password' ? 'pr-9' : ''}`}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            tabIndex={-1}
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

interface TextareaProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function Textarea({
  label,
  placeholder,
  value,
  onChange,
  error,
}: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          onChange(e.target.value)
        }
        rows={4}
        className={`w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition resize-none ${
          error
            ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
            : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
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

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">{children}</div>
      </div>
    </div>
  );
}

interface ModalActionsProps {
  onCancel: () => void;
  confirmLabel: string;
}

function ModalActions({ onCancel, confirmLabel }: ModalActionsProps) {
  return (
    <div className="flex items-center justify-between pt-2 border-t border-gray-100 -mx-6 -mb-2 px-6 pb-0">
      <button
        type="button"
        onClick={onCancel}
        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition py-2"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition"
      >
        {confirmLabel}
      </button>
    </div>
  );
}

// ─── Modals ────────────────────────────────────────────────────────────────────

interface AddTownModalProps {
  onClose: () => void;
  onSave: (form: TownFormData) => void;
}

function AddTownModal({ onClose, onSave }: AddTownModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TownFormData>({
    resolver: zodResolver(townSchema),
    defaultValues: { name: '', state: '', description: '' },
  });

  return (
    <Modal title="Add New Town" onClose={onClose}>
      <form
        onSubmit={handleSubmit((data) => {
          onSave(data);
          onClose();
        })}
        className="flex flex-col gap-4"
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              label="Town Name"
              required
              placeholder="e.g. San Francisco"
              value={field.value}
              onChange={field.onChange}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          name="state"
          control={control}
          render={({ field }) => (
            <Input
              label="State / Region"
              placeholder="e.g. California"
              value={field.value}
              onChange={field.onChange}
              error={errors.state?.message}
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea
              label="Description"
              placeholder="Brief description of the organization unit..."
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.description?.message}
            />
          )}
        />
        <ModalActions onCancel={onClose} confirmLabel="Save Town" />
      </form>
    </Modal>
  );
}

interface EditTownModalProps {
  town: Town;
  onClose: () => void;
  onSave: (form: TownFormData) => void;
}

function EditTownModal({ town, onClose, onSave }: EditTownModalProps) {
  const count: number = userCounts[town.name] ?? 0;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TownFormData>({
    resolver: zodResolver(townSchema),
    defaultValues: {
      name: town.name,
      state: town.state,
      description: town.description,
    },
  });

  return (
    <Modal title="Edit Town" onClose={onClose}>
      <form
        onSubmit={handleSubmit((data) => {
          onSave(data);
          onClose();
        })}
        className="flex flex-col gap-4"
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              label="Town Name"
              required
              value={field.value}
              onChange={field.onChange}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          name="state"
          control={control}
          render={({ field }) => (
            <Input
              label="State / Region"
              value={field.value}
              onChange={field.onChange}
              error={errors.state?.message}
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea
              label="Description"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.description?.message}
            />
          )}
        />
        {count > 0 && (
          <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>
              Changing the town name will update the record for all {count}{' '}
              associated users immediately.
            </span>
          </div>
        )}
        <ModalActions onCancel={onClose} confirmLabel="Update Town" />
      </form>
    </Modal>
  );
}

interface AddUserModalProps {
  towns: Town[];
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
      name: '',
      email: '',
      password: '',
      confirm: '',
      town: towns[0]?.name ?? '',
      role: 'Viewer',
      active: true,
    },
  });

  return (
    <Modal title="Add New User" onClose={onClose}>
      <form
        onSubmit={handleSubmit((data) => {
          onSave(data);
          onClose();
        })}
        className="flex flex-col gap-4"
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              label="Full Name"
              required
              icon={User}
              placeholder="John Doe"
              value={field.value}
              onChange={field.onChange}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
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
            name="password"
            control={control}
            render={({ field }) => (
              <Input
                label="Password"
                required
                type="password"
                placeholder="••••••••"
                value={field.value}
                onChange={field.onChange}
                error={errors.password?.message}
              />
            )}
          />
          <Controller
            name="confirm"
            control={control}
            render={({ field }) => (
              <Input
                label="Confirm"
                required
                type="password"
                placeholder="••••••••"
                value={field.value}
                onChange={field.onChange}
                error={errors.confirm?.message}
              />
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="town"
            control={control}
            render={({ field }) => (
              <Select
                label="Town"
                required
                value={field.value}
                onChange={field.onChange}
                options={towns.map((t) => t.name)}
                error={errors.town?.message}
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
                options={['Administrator', 'Operator', 'Viewer']}
                error={errors.role?.message}
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
    </Modal>
  );
}

interface EditUserModalProps {
  user: AppUser;
  towns: Town[];
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
      name: user.name,
      email: user.email,
      town: user.town,
      role: user.role,
      active: user.active,
    },
  });

  return (
    <Modal title="Edit User" onClose={onClose}>
      <form
        onSubmit={handleSubmit((data) => {
          onSave(data);
          onClose();
        })}
        className="flex flex-col gap-4"
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              label="Full Name"
              required
              icon={User}
              value={field.value}
              onChange={field.onChange}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
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
            name="town"
            control={control}
            render={({ field }) => (
              <Select
                label="Town"
                required
                value={field.value}
                onChange={field.onChange}
                options={towns.map((t) => t.name)}
                error={errors.town?.message}
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
                options={['Administrator', 'Operator', 'Viewer']}
                error={errors.role?.message}
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
    </Modal>
  );
}

interface DeleteTownModalProps {
  town: Town;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteTownModal({ town, onClose, onConfirm }: DeleteTownModalProps) {
  const count: number = userCounts[town.name] ?? 0;

  return (
    <Modal title="Delete Town" onClose={onClose}>
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <Trash2 size={26} className="text-red-500" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900">
            Delete "{town.name}"?
          </p>
          <p className="text-sm text-gray-500 mt-1">
            This action cannot be undone.
          </p>
        </div>
        <div className="w-full bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100">
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-500">State / Region</span>
            <span className="font-medium text-gray-800">{town.state}</span>
          </div>
          {town.description && (
            <div className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="text-gray-500">Description</span>
              <span className="font-medium text-gray-800 italic">
                "{town.description}"
              </span>
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-500">Associated Users</span>
            <span className="font-medium text-gray-800">{count}</span>
          </div>
        </div>
        {count > 0 && (
          <div className="flex items-start gap-2 bg-red-50 rounded-xl p-3 text-xs text-red-700 text-left w-full">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>
              Deleting this town will affect {count} associated users. Their
              town field will need to be updated manually.
            </span>
          </div>
        )}
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
          Delete Town
        </button>
      </div>
    </Modal>
  );
}

interface DeleteUserModalProps {
  user: AppUser;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteUserModal({ user, onClose, onConfirm }: DeleteUserModalProps) {
  return (
    <Modal title="Delete User" onClose={onClose}>
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <Trash2 size={26} className="text-red-500" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900">
            Delete "{user.name}"?
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
            <span className="font-medium text-gray-800">{user.town}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-500">Role</span>
            <span className="font-medium text-gray-800">{user.role}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-500">Status</span>
            <Badge active={user.active} />
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
    </Modal>
  );
}

// ─── Pages ─────────────────────────────────────────────────────────────────────

interface DashboardPageProps {
  users: AppUser[];
  towns: Town[];
}

function DashboardPage({ users, towns }: DashboardPageProps) {
  const activeUsers: number = users.filter((u) => u.active).length;

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
  users: AppUser[];
  towns: Town[];
  onAdd: () => void;
  onEdit: (user: AppUser) => void;
  onDelete: (user: AppUser) => void;
}

function UsersPage({ users, towns, onAdd, onEdit, onDelete }: UsersPageProps) {
  const [search, setSearch] = useState<string>('');
  const [townFilter, setTownFilter] = useState<string>('All Towns');
  const [roleFilter, setRoleFilter] = useState<string>('All Roles');

  const filtered: AppUser[] = useMemo(
    () =>
      users.filter((u) => {
        const matchSearch =
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase());
        const matchTown = townFilter === 'All Towns' || u.town === townFilter;
        const matchRole = roleFilter === 'All Roles' || u.role === roleFilter;
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
              <option>All Towns</option>
              {towns.map((t) => (
                <option key={t.id}>{t.name}</option>
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
              <option>All Roles</option>
              <option>Administrator</option>
              <option>Operator</option>
              <option>Viewer</option>
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
                  key={user.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition ${
                    i === filtered.length - 1 ? 'border-0' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-gray-700">
                      <Building2 size={13} className="text-gray-400" />
                      {user.town}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {user.role}
                  </td>
                  <td className="px-4 py-3">
                    <Badge active={user.active} />
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

interface TownsPageProps {
  towns: Town[];
  onAdd: () => void;
  onEdit: (town: Town) => void;
  onDelete: (town: Town) => void;
}

function TownsPage({ towns, onAdd, onEdit, onDelete }: TownsPageProps) {
  const [search, setSearch] = useState<string>('');

  const filtered: Town[] = towns.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            placeholder="Search by town name or state"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <button
          onClick={onAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition whitespace-nowrap self-start"
        >
          <Plus size={15} /> Add New Town
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((town) => (
          <div
            key={town.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:border-blue-200 transition"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
              <Building2 size={20} className="text-blue-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{town.name}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <MapPin size={11} />
                {town.state}
              </div>
              {town.description && (
                <p className="text-xs text-gray-500 italic mt-1.5">
                  "{town.description}"
                </p>
              )}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Users size={13} className="text-gray-400" />
                <span className="font-medium">
                  {userCounts[town.name] ?? 0} Users
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-600">
                  ACTIVE REGION
                </span>
                <button
                  onClick={() => onEdit(town)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => onDelete(town)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 px-6 text-center gap-3">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Settings size={26} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">Admin Settings</h3>
      <p className="text-sm text-gray-500 max-w-xs">
        Configure global system variables, town grouping rules, and audit log
        retention.
      </p>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────

export default function AdminSuite() {
  const [tab, setTab] = useState<TabId>('dashboard');
  const [users, setUsers] = useState<AppUser[]>(initialUsers);
  const [towns, setTowns] = useState<Town[]>(initialTowns);
  const [modal, setModal] = useState<ModalState | null>(null);

  const tabs: TabItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'towns', label: 'Organizations (Towns)', icon: Building2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleAddTown = (form: TownFormData): void => {
    setTowns((ts) => [...ts, { id: Date.now(), ...form }]);
  };

  const handleEditTown = (id: number, form: TownFormData): void => {
    setTowns((ts) => ts.map((t) => (t.id === id ? { ...t, ...form } : t)));
  };

  const handleDeleteTown = (id: number): void => {
    setTowns((ts) => ts.filter((t) => t.id !== id));
  };

  const handleAddUser = (form: AddUserFormData): void => {
    setUsers((us) => [
      ...us,
      {
        id: Date.now(),
        name: form.name,
        email: form.email,
        town: form.town,
        role: form.role,
        active: form.active,
      },
    ]);
  };

  const handleEditUser = (id: number, form: EditUserFormData): void => {
    setUsers((us) =>
      us.map((u) =>
        u.id === id
          ? {
              ...u,
              name: form.name,
              email: form.email,
              town: form.town,
              role: form.role,
              active: form.active,
            }
          : u
      )
    );
  };

  const handleDeleteUser = (id: number): void => {
    setUsers((us) => us.filter((u) => u.id !== id));
  };

  const editTownData =
    modal?.data && 'state' in modal.data ? (modal.data as Town) : null;
  const editUserData =
    modal?.data && 'email' in modal.data ? (modal.data as AppUser) : null;
  const deleteTownData =
    modal?.type === 'deleteTown' && modal.data && 'state' in modal.data
      ? (modal.data as Town)
      : null;
  const deleteUserData =
    modal?.type === 'deleteUser' && modal.data && 'email' in modal.data
      ? (modal.data as AppUser)
      : null;

  return (
    <div className="h-screen flex flex-col bg-gray-50 font-sans overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shrink-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Admin Suite
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              Manage users, towns, and system organizations
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
          {tab === 'dashboard' && <DashboardPage users={users} towns={towns} />}
          {tab === 'users' && (
            <UsersPage
              users={users}
              towns={towns}
              onAdd={() => setModal({ type: 'addUser' })}
              onEdit={(user) => setModal({ type: 'editUser', data: user })}
              onDelete={(user) => setModal({ type: 'deleteUser', data: user })}
            />
          )}
          {tab === 'towns' && (
            <TownsPage
              towns={towns}
              onAdd={() => setModal({ type: 'addTown' })}
              onEdit={(town) => setModal({ type: 'editTown', data: town })}
              onDelete={(town) => setModal({ type: 'deleteTown', data: town })}
            />
          )}
          {tab === 'settings' && <SettingsPage />}
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
          onSave={(f) => handleEditTown(editTownData.id, f)}
        />
      )}
      {modal?.type === 'addUser' && (
        <AddUserModal
          towns={towns}
          onClose={() => setModal(null)}
          onSave={handleAddUser}
        />
      )}
      {modal?.type === 'editUser' && editUserData && (
        <EditUserModal
          user={editUserData}
          towns={towns}
          onClose={() => setModal(null)}
          onSave={(f: EditUserFormData) => handleEditUser(editUserData.id, f)}
        />
      )}
      {modal?.type === 'deleteTown' && deleteTownData && (
        <DeleteTownModal
          town={deleteTownData}
          onClose={() => setModal(null)}
          onConfirm={() => handleDeleteTown(deleteTownData.id)}
        />
      )}
      {modal?.type === 'deleteUser' && deleteUserData && (
        <DeleteUserModal
          user={deleteUserData}
          onClose={() => setModal(null)}
          onConfirm={() => handleDeleteUser(deleteUserData.id)}
        />
      )}
    </div>
  );
}
