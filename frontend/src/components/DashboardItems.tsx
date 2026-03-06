'use client';

import { File, Folder, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getViewUrl } from '@/app/api/files';

export const SuggestedCard = ({
  file,
  path,
}: {
  file: NodeResProps;
  path: string;
}) => {
  const router = useRouter();

  const handleOpen = async () => {
    if (file.nodeType === 'folder') {
      router.push(`/my-docs/${file.id}`);
    } else {
      const result = await getViewUrl(file.id, path);
      window.open(result.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onClick={handleOpen}
      className="bg-white rounded-xl border border-[#E0E0E0] hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full overflow-hidden"
    >
      <div className="aspect-16/10 bg-[#F1F3F4] flex items-center justify-center border-b border-[#F1F3F4] group-hover:bg-[#E8EAED] transition-colors">
        {file.nodeType === 'folder' ? (
          <Folder className="w-12 h-12 text-blue-500/70 fill-blue-50" />
        ) : (
          <File className="w-12 h-12 text-blue-500/70 fill-blue-50" />
        )}
      </div>
      <div className="p-3 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {file.nodeType === 'folder' ? (
              <Folder className="w-4 h-4 text-blue-600 shrink-0" />
            ) : (
              <File className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span className="text-sm font-medium text-[#1F1F1F] truncate">
              {file.name}
            </span>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="w-4 h-4 text-[#5F6368]" />
          </button>
        </div>
        <p className="text-[11px] text-[#5F6368]">
          {file.nodeType === 'file'
            ? 'Você abriu recentemente'
            : 'Pasta modificada recentemente'}
        </p>
      </div>
    </div>
  );
};

export const RecentFilesTable = ({
  files,
  currentUser,
  path,
}: {
  files: NodeResProps[];
  currentUser: UserResProps;
  path: string;
}) => {
  const router = useRouter();

  const handleOpen = async (file: NodeResProps) => {
    if (file.nodeType === 'folder') {
      router.push(`/my-docs/${file.id}`);
    } else {
      const result = await getViewUrl(file.id, path);
      window.open(result.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#E0E0E0] text-[11px] uppercase tracking-wider text-[#5F6368]">
              <th className="px-6 py-3 font-medium">Nome</th>
              <th className="px-6 py-3 font-medium hidden md:table-cell">
                Motivo
              </th>
              <th className="px-6 py-3 font-medium hidden sm:table-cell">
                Proprietário
              </th>
              <th className="px-6 py-3 font-medium">Última modificação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0E0E0]">
            {files.map((file) => (
              <tr
                key={file.id}
                onClick={() => handleOpen(file)}
                className="hover:bg-[#F1F3F4] transition-colors cursor-pointer group text-sm"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {file.nodeType === 'folder' ? (
                      <Folder className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <File className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                    <span className="text-[#1F1F1F] font-medium truncate max-w-50 sm:max-w-xs group-hover:text-blue-700">
                      {file.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell text-[#5F6368]">
                  {file.nodeType === 'file' ? 'Você abriu' : 'Você modificou'}
                </td>
                <td className="px-6 py-4 hidden sm:table-cell text-[#5F6368]">
                  {file.createdByName === currentUser.username
                    ? 'Eu'
                    : file.createdByName}
                </td>
                <td className="px-6 py-4 text-[#5F6368]">
                  {new Date(
                    file.updatedAt || file.createdAt
                  ).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
