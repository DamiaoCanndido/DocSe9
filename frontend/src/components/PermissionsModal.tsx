'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  UserPlus,
  Trash2,
  User,
  Mail,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import AdminModal from '@/components/AdminModal';
import {
  getNodePermissions,
  addOrUpdatePermission,
  revokePermission,
  NodePermission,
  PermissionType,
} from '@/app/api/permissions';
import { getUsers } from '@/app/api/users';
import { toast } from 'sonner';
import { usePathname } from 'next/navigation';

interface PermissionsModalProps {
  node: NodeResProps;
  currentUser: UserResProps;
  onClose: () => void;
}

export default function PermissionsModal({
  node,
  onClose,
}: PermissionsModalProps) {
  const [permissions, setPermissions] = useState<NodePermission[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserResProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedPermission, setSelectedPermission] =
    useState<PermissionType>('READ');
  const path = usePathname();

  useEffect(() => {
    fetchData();
  }, [node.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [permsData, usersData] = await Promise.all([
        getNodePermissions(node.id),
        getUsers({ queries: { role: 'basic' } }), // Only basic users as per requirement
      ]);
      setPermissions(permsData);
      console.log('Available users:', usersData.data.content);
      setAvailableUsers(usersData.data.content || []);
    } catch (error) {
      toast.error('Erro ao carregar dados de permissões');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPermission = async () => {
    if (!selectedUserId) {
      toast.error('Selecione um usuário');
      return;
    }

    setSubmitting(true);
    try {
      await addOrUpdatePermission({
        nodeId: node.id,
        userId: selectedUserId,
        permissionType: selectedPermission,
        path,
      });
      toast.success('Permissão adicionada/atualizada');
      setSelectedUserId('');
      fetchData();
    } catch (error) {
      toast.error('Erro ao salvar permissão');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokePermission = async (userId: string) => {
    try {
      await revokePermission({
        nodeId: node.id,
        userId,
        path,
      });
      toast.success('Permissão revogada');
      fetchData();
    } catch (error) {
      toast.error('Erro ao revogar permissão');
    }
  };

  const getPermissionIcon = (type: PermissionType) => {
    switch (type) {
      case 'DELETE':
        return <ShieldAlert size={16} className="text-red-500" />;
      case 'WRITE':
        return <ShieldCheck size={16} className="text-blue-500" />;
      default:
        return <Shield size={16} className="text-gray-500" />;
    }
  };

  return (
    <AdminModal title={`Permissões: ${node.name}`} onClose={onClose}>
      <div className="flex flex-col gap-6">
        {/* Add Permission Form */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
            <UserPlus size={16} />
            <span>Adicionar nova permissão</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 ml-1">
                Usuário (Básico)
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Selecione um usuário...</option>
                {availableUsers
                  .filter(
                    (u) => !permissions.some((p) => p.userId === u.userId)
                  )
                  .map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.username} ({user.email})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 ml-1">
                Tipo de Permissão
              </label>
              <select
                value={selectedPermission}
                onChange={(e) =>
                  setSelectedPermission(e.target.value as PermissionType)
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="READ">Ler</option>
                <option value="WRITE">Gravar (Ler + Gravar)</option>
                <option value="DELETE">Excluir (Ler + Gravar + Excluir)</option>
              </select>
            </div>

            <button
              onClick={handleAddPermission}
              disabled={submitting || !selectedUserId}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
            >
              {submitting ? 'Salvando...' : 'Conceder Permissão'}
            </button>
          </div>
        </div>

        {/* Permissions List */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-700 px-1 flex items-center gap-2">
            <Shield size={16} />
            Usuários com acesso
          </h3>

          <div className="max-h-60 overflow-y-auto pr-1 flex flex-col gap-2">
            {loading ? (
              <p className="text-center py-4 text-sm text-gray-500">
                Carregando...
              </p>
            ) : permissions.length === 0 ? (
              <p className="text-center py-4 text-sm text-gray-500 italic">
                Nenhuma permissão específica configurada.
              </p>
            ) : (
              permissions.map((perm) => (
                <div
                  key={perm.userId}
                  className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      <User size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 leading-none mb-1">
                        {perm.username}
                      </span>
                      <div className="flex items-center gap-3 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail size={10} />
                          {perm.email}
                        </span>
                        <span className="flex items-center gap-1 font-semibold bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                          {getPermissionIcon(perm.permissionType)}
                          {perm.permissionType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevokePermission(perm.userId)}
                    className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors rounded-lg"
                    title="Revogar acesso"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminModal>
  );
}
