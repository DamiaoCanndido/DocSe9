'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Save } from 'lucide-react';
import AdminInput from '@/components/AdminInput';
import { toast } from 'sonner';
import { updateUser } from '@/app/api/users';
import { useState } from 'react';

const profileSchema = z.object({
  username: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  email: z.email('Insira um endereço de e-mail válido.'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: UserResProps;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user.username,
      email: user.email,
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await updateUser({
        userId: user.userId,
        form: {
          username: data.username,
          email: data.email,
          role: user.role.name as 'basic' | 'manager' | 'admin',
          townId: user.town?.townId || null,
          password: undefined,
          confirmPassword: undefined,
        },
        path: '/profile',
      });
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <AdminInput
              label="Nome de Usuário"
              icon={User}
              value={field.value}
              onChange={field.onChange}
              error={errors.username?.message}
              placeholder="Seu nome"
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <AdminInput
              label="E-mail"
              icon={Mail}
              type="email"
              value={field.value}
              onChange={field.onChange}
              error={errors.email?.message}
              placeholder="seu@email.com"
            />
          )}
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading || !isDirty}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-medium transition-all shadow-sm shadow-blue-200 dark:shadow-none"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Salvar Alterações
        </button>
      </div>
    </form>
  );
}
