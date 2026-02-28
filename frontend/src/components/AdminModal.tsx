'use client';

import { X } from 'lucide-react';

export type ModalType =
  | 'addTown'
  | 'editTown'
  | 'deleteTown'
  | 'addUser'
  | 'editUser'
  | 'deleteUser'
  | 'editNode'
  | 'restoreNode'
  | 'createNode'
  | 'deleteNode';

export interface ModalState {
  type: ModalType;
  data?: UserResProps | TownResProps | NodeResProps;
}

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function AdminModal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">{children}</div>
      </div>
    </div>
  );
}
