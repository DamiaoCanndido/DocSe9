import AdminModal from '@/components/AdminModal';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import AdminInput from './AdminInput';
import ModalActions from './ModalActions';

export const nodeEditSchema = z.object({
  name: z.string().min(3, 'O nome da pasta deve ter pelo menos 3 caracteres.'),
});

type NodeEditFormData = z.infer<typeof nodeEditSchema>;

interface FolderModalProps {
  node?: NodeResProps;
  onClose: () => void;
  onSave: (form: NodeEditFormData) => void;
}

export default function FolderModal({
  node,
  onSave,
  onClose,
}: FolderModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NodeEditFormData>({
    resolver: zodResolver(nodeEditSchema),
    defaultValues: {
      name: node?.name || '',
    },
  });

  return (
    <AdminModal
      title={node?.name ? 'Renomear pasta' : 'Criar pasta'}
      onClose={onClose}
    >
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

        <ModalActions
          onCancel={onClose}
          confirmLabel={node?.name ? 'Renomear pasta' : 'Criar pasta'}
        />
      </form>
    </AdminModal>
  );
}
