'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, Save } from 'lucide-react';
import AdminInput from '@/components/AdminInput';
import { toast } from 'sonner';
import { changePassword } from '@/app/api/users';
import { useState } from 'react';

const securitySchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória.'),
    newPassword: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

type SecurityFormData = z.infer<typeof securitySchema>;

export default function SecurityForm() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SecurityFormData>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SecurityFormData) => {
    setIsLoading(true);
    try {
      await changePassword({
        form: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        },
      });
      toast.success('Senha atualizada com sucesso!');
      reset();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 max-w-md">
        <Controller
          name="currentPassword"
          control={control}
          render={({ field }) => (
            <AdminInput
              label="Senha Atual"
              icon={ShieldCheck}
              type="password"
              value={field.value}
              onChange={field.onChange}
              error={errors.currentPassword?.message}
              placeholder="••••••••"
            />
          )}
        />

        <div className="border-t border-gray-100 dark:border-zinc-800 my-2" />

        <Controller
          name="newPassword"
          control={control}
          render={({ field }) => (
            <AdminInput
              label="Nova Senha"
              icon={ShieldCheck}
              type="password"
              value={field.value}
              onChange={field.onChange}
              error={errors.newPassword?.message}
              placeholder="••••••••"
            />
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <AdminInput
              label="Confirmar Nova Senha"
              icon={ShieldCheck}
              type="password"
              value={field.value}
              onChange={field.onChange}
              error={errors.confirmPassword?.message}
              placeholder="••••••••"
            />
          )}
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-medium transition-all shadow-sm shadow-blue-200 dark:shadow-none"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Atualizar Senha
        </button>
      </div>
    </form>
  );
}
