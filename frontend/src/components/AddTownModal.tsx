'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import AdminModal from '@/components/AdminModal';
import ModalActions from '@/components/ModalActions';
import AdminInput from '@/components/AdminInput';

export const townSchema = z.object({
  name: z
    .string()
    .min(3, 'O nome do municipio deve ter pelo menos 3 caracteres.'),
  uf: z
    .string()
    .min(2, 'A UF do municipio deve ter pelo menos 2 caracteres.')
    .max(2, 'A UF do município não deve ultrapassar 2 caracteres.'),
  imageUrl: z.url('Passe uma url de imagem'),
});

export type TownFormData = z.infer<typeof townSchema>;

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
              required
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
              required
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
