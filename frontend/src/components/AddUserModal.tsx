'use client';

import AdminInput from '@/components/AdminInput';
import AdminModal from '@/components/AdminModal';
import ModalActions from '@/components/ModalActions';
import UserSelect from '@/components/UserSelect';
import UserToggle from '@/components/UserToggle';
import { Mail, User } from 'lucide-react';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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

export type AddUserFormData = z.infer<typeof addUserSchema>;

interface AddUserModalProps {
  towns: TownResProps[];
  me: UserResProps;
  onClose: () => void;
  onSave: (form: AddUserFormData) => void;
}

export default function AddUserModal({
  towns,
  me,
  onClose,
  onSave,
}: AddUserModalProps) {
  const {
    control,
    watch,
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
      townId: towns[0].townId,
      role: 'basic',
    },
  });

  const addRole = watch('role');

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
            name="role"
            control={control}
            render={({ field }) => (
              <UserSelect
                label="Role"
                required
                value={field.value}
                onChange={field.onChange}
                options={['basic', 'manager', 'admin']
                  .filter((r) => {
                    if (me.role.name === 'admin') return true;
                    return r !== 'admin';
                  })
                  .map((r) => ({ label: r, value: r }))}
                error={errors.role?.message}
              />
            )}
          />
          {addRole !== 'admin' && (
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
                      ? towns.map((t) => ({ label: t.name, value: t.townId }))
                      : [
                          {
                            label: me.town?.name || '',
                            value: me.town?.townId || '',
                          },
                        ]
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
              <UserToggle checked={field.value} onChange={field.onChange} />
            </div>
          )}
        />
        <ModalActions onCancel={onClose} confirmLabel="Save User" />
      </form>
    </AdminModal>
  );
}
