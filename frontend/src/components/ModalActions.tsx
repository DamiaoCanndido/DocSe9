'use client';

interface ModalActionsProps {
  onCancel: () => void;
  confirmLabel: string;
}

export default function ModalActions({
  onCancel,
  confirmLabel,
}: ModalActionsProps) {
  return (
    <div className="flex items-center justify-between pt-2 border-t border-gray-100 -mx-6 -mb-2 px-6 pb-0">
      <button
        type="button"
        onClick={onCancel}
        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition py-2"
      >
        Cancelar
      </button>
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition"
      >
        {confirmLabel}
      </button>
    </div>
  );
}
