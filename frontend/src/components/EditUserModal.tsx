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
import { translateRole } from '@/lib/utils';

const editUserSchema = z
  .object({
    username: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
    email: z.email('Insira um endereço de e-mail válido.'),
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
          message: 'A senha é obrigatória',
        });
      } else if (password.length < 6) {
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: 'A senha deve ter pelo menos 6 caracteres',
        });
      }

      if (!hasConfirm) {
        ctx.addIssue({
          code: 'custom',
          path: ['confirm'],
          message: 'Por favor confirme sua senha',
        });
      }

      if (hasPassword && hasConfirm && password !== confirm) {
        ctx.addIssue({
          code: 'custom',
          path: ['confirm'],
          message: 'As senhas não coincidem',
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
      password: undefined,
      confirm: undefined,
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
              label="Nome"
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
                label="Função"
                required
                value={field.value}
                onChange={field.onChange}
                options={['basic', 'manager', 'admin']
                  .filter((r) => {
                    if (me.role.name === 'admin') return true;
                    return r !== 'admin';
                  })
                  .map((r) => ({ label: translateRole(r), value: r }))}
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
                  label="Município"
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
                label="Senha"
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
                label="Confirmar Senha"
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
                <p className="text-sm font-medium text-gray-800">Ativo</p>
                <p className="text-xs text-gray-500">
                  Alternar disponibilidade do usuário
                </p>
              </div>
              <UserToggle checked={field.value} onChange={field.onChange} />
            </div>
          )}
        />
        <ModalActions onCancel={onClose} confirmLabel="Atualizar Usuário" />
      </form>
    </AdminModal>
  );
}
