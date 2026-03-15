'use client';

import { getLogs } from '@/app/api/logs';
import FormattedDateTime from '@/components/FormattedDateTime';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock, ScrollText } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

export default function AdminLogs() {
  const [logs, setLogs] = useState<LogResProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pagination, setPagination] = useState<{
    totalPages: number;
    totalElements: number;
    last: boolean;
  }>({
    totalPages: 0,
    totalElements: 0,
    last: true,
  });

  const fetchLogs = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const response = await getLogs({ page, size: 10 });
      const pageData = response.data;
      setLogs(pageData.content);
      setPagination({
        totalPages: pageData.totalPages,
        totalElements: pageData.totalElements,
        last: pageData.last,
      });
    } catch (error) {
      toast.error('Erro', {
        description: 'Não foi possível carregar os logs de auditoria.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage, fetchLogs]);

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (!pagination.last) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-zinc-400">Carregando logs...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScrollText size={18} className="text-blue-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Logs de Auditoria</h3>
          </div>
          <span className="text-xs text-gray-500 dark:text-zinc-500">
            {pagination.totalElements} registros encontrados
          </span>
        </div>

        <div className="overflow-x-auto relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-10">
              <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            </div>
          )}
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-zinc-800">
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider px-4 py-3">
                  Data/Hora
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider px-4 py-3">
                  Usuário
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider px-4 py-3">
                  Município
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider px-4 py-3">
                  Ação
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider px-4 py-3">
                  Recurso
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider px-4 py-3">
                  Detalhes
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider px-4 py-3">
                  IP
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr
                  key={log.logId}
                  className={`border-b border-gray-50 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition ${
                    i === logs.length - 1 ? 'border-0' : ''
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-zinc-400">
                      <Clock size={12} />
                      <FormattedDateTime date={log.timestamp} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-bold text-blue-600">
                        {log.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-zinc-100">
                        {log.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600 dark:text-zinc-400">
                      {log.townName || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-900 dark:text-zinc-200">
                        {log.resourceType || '-'}
                      </span>
                      {log.resourceId && (
                        <span className="text-[10px] text-gray-500 dark:text-zinc-500 font-mono truncate max-w-[100px]">
                          {log.resourceId}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-600 dark:text-zinc-400 max-w-xs truncate">
                      {log.details || '-'}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-zinc-500 font-mono">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500 dark:text-zinc-500">
                    Nenhum log registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-900/50">
          <div className="text-xs text-gray-500 dark:text-zinc-500">
            Página <span className="font-medium text-gray-900 dark:text-zinc-300">{currentPage + 1}</span> de{' '}
            <span className="font-medium text-gray-900 dark:text-zinc-300">{pagination.totalPages || 1}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 0 || loading}
              className="h-8 px-2 dark:border-zinc-800 dark:hover:bg-zinc-800"
            >
              <ChevronLeft size={16} />
              <span className="sr-only">Anterior</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={pagination.last || loading}
              className="h-8 px-2 dark:border-zinc-800 dark:hover:bg-zinc-800"
            >
              <ChevronRight size={16} />
              <span className="sr-only">Próxima</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
