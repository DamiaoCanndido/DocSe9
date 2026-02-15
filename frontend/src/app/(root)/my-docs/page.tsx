'use client';

import DocsContent from '@/components/DocsContent';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { apiClient, apiServer } from '@/lib/axios';
import { getRootFolders } from '@/lib/data';
import { Folder, File } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MyDocs() {
  const searchParams = useSearchParams();
  const name = searchParams?.get('name') || '';
  const page = searchParams?.get('page') || '';
  const size = searchParams?.get('size') || '';
  const sort = searchParams?.get('sort') || '';

  const [response, setResponse] = useState<ApiResponse>({
    folders: {
      content: [],
      page: 0,
      pageSize: 0,
      totalElements: 0,
      totalPages: 0,
      last: true,
    },
    files: {
      content: [],
      page: 0,
      pageSize: 0,
      totalElements: 0,
      totalPages: 0,
      last: true,
    },
  });

  useEffect(() => {
    apiClient
      .get('api/folders/root', {
        params: { name, page, size, sort },
      })
      .then((res) => setResponse(res.data));
  }, [name, page, size, sort]);

  return (
    /* Desktop docs */
    <DocsContent
      folders={response?.folders || []}
      files={response?.files || []}
    />
  );
}
