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
import { useEffect } from 'react';
import { translateRole } from '@/lib/utils';

const addUserSchema = z
  .object({
    username: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
    email: z.email('Insira um endereço de e-mail válido.'),
    active: z.boolean(),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
    confirm: z.string().min(1, 'Por favor confirme sua senha.'),
    townId: z.uuid({ message: 'Id da cidade inválido' }).optional(),
    role: z.enum(['basic', 'manager', 'admin']),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'As senhas não coincidem.',
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
    setValue,
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
      role: 'basic',
      townId:
        towns.length === 0
          ? undefined
          : me.role.name === 'admin'
          ? towns[0].townId
          : me.town?.townId,
    },
  });

  const addRole = watch('role');
  const addTownId = watch('townId');

  useEffect(() => {
    if (addRole === 'admin') {
      setValue('townId', undefined);
    } else if (!addTownId) {
      setValue(
        'townId',
        towns.length === 0
          ? undefined
          : me.role.name === 'admin'
          ? towns[0].townId
          : me.town?.townId
      );
    }
  }, [addRole]);

  return (
    <AdminModal title="Adicionar Usuário" onClose={onClose}>
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
              placeholder="Joao.da.silva"
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
              placeholder="administracao@municipio.uf.gov.br"
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
          {addRole !== 'admin' && towns.length > 0 && (
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
                required
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
                required
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
        <ModalActions onCancel={onClose} confirmLabel="Salvar Usuário" />
      </form>
    </AdminModal>
  );
}
