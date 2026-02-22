'use client';

import { TownFormData, townSchema } from '@/components/AdminSuite';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import AdminModal from '@/components/AdminModal';
import AdminInput from '@/components/AdminInput';
import { AlertCircle } from 'lucide-react';
import ModalActions from '@/components/ModalActions';

interface EditTownModalProps {
  town: TownResProps;
  onClose: () => void;
  onSave: (form: TownFormData) => void;
}

export default function EditTownModal({
  town,
  onClose,
  onSave,
}: EditTownModalProps) {
  const count = 0;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TownFormData>({
    resolver: zodResolver(townSchema),
    defaultValues: {
      name: town.name,
      uf: town.uf,
      imageUrl: town.imageUrl,
    },
  });

  return (
    <AdminModal title="Editar município" onClose={onClose}>
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
            <AdminInput
              label="Nome"
              required
              value={field.value}
              onChange={field.onChange}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          name="uf"
          control={control}
          render={({ field }) => (
            <AdminInput
              label="Estado (UF)"
              value={field.value}
              onChange={field.onChange}
              error={errors.uf?.message}
            />
          )}
        />
        <Controller
          name="imageUrl"
          control={control}
          render={({ field }) => (
            <AdminInput
              label="Url do logo"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.imageUrl?.message}
            />
          )}
        />
        {count > 0 && (
          <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>
              Alterar o nome do município atualizará o registro para todos os{' '}
              {count} usuários associados imediatamente.
            </span>
          </div>
        )}
        <ModalActions onCancel={onClose} confirmLabel="Editar município" />
      </form>
    </AdminModal>
  );
}
