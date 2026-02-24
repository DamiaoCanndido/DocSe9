'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail } from 'lucide-react';
import AdminModal from '@/components/AdminModal';
import AdminInput from '@/components/AdminInput';
import UserSelect from '@/components/UserSelect';
import UserToggle from '@/components/UserToggle';
import ModalActions from '@/components/ModalActions';

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

interface EditUserModalProps {
  user: UserResProps;
  me: UserResProps;
  towns: TownResProps[];
  onClose: () => void;
  onSave: (form: EditUserFormData) => void;
}

export type EditUserFormData = z.infer<typeof editUserSchema>;

export default function EditUserModal({
  user,
  me,
  towns,
  onClose,
  onSave,
}: EditUserModalProps) {
  const {
    control,
    handleSubmit,
    watch,
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

  const editRole = watch('role');

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
            name="role"
            control={control}
            render={({ field }) => (
              <UserSelect
                label="Role"
                required
                value={field.value}
                onChange={field.onChange}
                options={['basic', 'manager', 'admin'].filter((r) => {
                  if (me.role.name === 'admin') return true;
                  return r !== 'admin';
                })}
                error={errors.role?.message}
              />
            )}
          />
          {editRole !== 'admin' && (
            <Controller
              name="townId"
              control={control}
              render={({ field }) => (
                <UserSelect
                  label="Town"
                  required
                  value={field.value || ''}
                  onChange={field.onChange}
                  options={
                    me.role.name === 'admin'
                      ? towns.map((t) => t.name)
                      : [me.town?.name || '']
                  }
                  error={errors.townId?.message}
                />
              )}
            />
          )}
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
              <UserToggle checked={field.value} onChange={field.onChange} />
            </div>
          )}
        />
        <ModalActions onCancel={onClose} confirmLabel="Update User" />
      </form>
    </AdminModal>
  );
}
