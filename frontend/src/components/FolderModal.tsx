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

interface EditFolderModalProps {
  node: NodeResProps;
  onClose: () => void;
  onSave: (form: NodeEditFormData) => void;
}

export default function FolderModal({
  node,
  onSave,
  onClose,
}: EditFolderModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NodeEditFormData>({
    resolver: zodResolver(nodeEditSchema),
    defaultValues: {
      name: node.name,
    },
  });

  return (
    <AdminModal title={`Editar: ${node.name}`} onClose={onClose}>
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

        <ModalActions onCancel={onClose} confirmLabel="Editar pasta" />
      </form>
    </AdminModal>
  );
}
