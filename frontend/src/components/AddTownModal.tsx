'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import AdminModal from '@/components/AdminModal';
import ModalActions from '@/components/ModalActions';
import { TownFormData, townSchema } from '@/components/AdminSuite';
import AdminInput from '@/components/AdminInput';

interface AddTownModalProps {
  onClose: () => void;
  onSave: (form: TownFormData) => void;
}

export default function AddTownModal({ onClose, onSave }: AddTownModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TownFormData>({
    resolver: zodResolver(townSchema),
    defaultValues: { name: '', uf: '', imageUrl: '' },
  });

  return (
    <AdminModal title="Adicionar município" onClose={onClose}>
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
              placeholder="São Francisco"
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
              placeholder="PB"
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
              label="Url de imagem"
              placeholder="https://www.logos.com/municipio.jpg"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.imageUrl?.message}
            />
          )}
        />
        <ModalActions onCancel={onClose} confirmLabel="Salvar" />
      </form>
    </AdminModal>
  );
}
