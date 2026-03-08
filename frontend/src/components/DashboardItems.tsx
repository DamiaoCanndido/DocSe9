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
      router.replace(`/my-docs/${file.id}`);
    } else {
      const result = await getViewUrl(file.id, path);
      window.open(result.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onClick={handleOpen}
      className="bg-white dark:bg-zinc-900 rounded-xl border border-[#E0E0E0] dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-md dark:hover:shadow-blue-900/10 transition-all cursor-pointer group flex flex-col h-full overflow-hidden"
    >
      <div className="aspect-16/10 bg-[#F1F3F4] dark:bg-zinc-800 flex items-center justify-center border-b border-[#F1F3F4] dark:border-zinc-800 group-hover:bg-[#E8EAED] dark:group-hover:bg-zinc-700 transition-colors">
        {file.nodeType === 'folder' ? (
          <Folder className="w-12 h-12 text-blue-500/70 fill-blue-50 dark:fill-blue-900/20" />
        ) : (
          <File className="w-12 h-12 text-blue-500/70 fill-blue-50 dark:fill-blue-900/20" />
        )}
      </div>
      <div className="p-3 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {file.nodeType === 'folder' ? (
              <Folder className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            ) : (
              <File className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            )}
            <span className="text-sm font-medium text-[#1F1F1F] dark:text-zinc-100 truncate">
              {file.name}
            </span>
          </div>
          <button className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="w-4 h-4 text-[#5F6368] dark:text-zinc-400" />
          </button>
        </div>
        <p className="text-[11px] text-[#5F6368] dark:text-zinc-500">
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
      router.replace(`/my-docs/${file.id}`);
    } else {
      const result = await getViewUrl(file.id, path);
      window.open(result.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-[#E0E0E0] dark:border-zinc-800 overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#E0E0E0] dark:border-zinc-800 text-[11px] uppercase tracking-wider text-[#5F6368] dark:text-zinc-500">
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
          <tbody className="divide-y divide-[#E0E0E0] dark:divide-zinc-800">
            {files.map((file) => (
              <tr
                key={file.id}
                onClick={() => handleOpen(file)}
                className="hover:bg-[#F1F3F4] dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group text-sm"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {file.nodeType === 'folder' ? (
                      <Folder className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    ) : (
                      <File className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    )}
                    <span className="text-[#1F1F1F] dark:text-zinc-200 font-medium truncate max-w-50 sm:max-w-xs group-hover:text-blue-700 dark:group-hover:text-blue-400">
                      {file.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell text-[#5F6368] dark:text-zinc-500">
                  {file.nodeType === 'file' ? 'Você abriu' : 'Você modificou'}
                </td>
                <td className="px-6 py-4 hidden sm:table-cell text-[#5F6368] dark:text-zinc-500">
                  {file.createdByName === currentUser.username
                    ? 'Eu'
                    : file.createdByName}
                </td>
                <td className="px-6 py-4 text-[#5F6368] dark:text-zinc-500">
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
