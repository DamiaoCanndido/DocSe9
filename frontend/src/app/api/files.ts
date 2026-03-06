'use server';

import { cookies } from 'next/headers';
import { apiServer } from '@/lib/axios';
import { redirect } from 'next/navigation';
import { AxiosError } from 'axios';
import { parseStringify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

async function getToken() {
  const token = (await cookies()).get('docse9-auth-token');
  return token?.value;
}

export const getViewUrl = async (fileId: string, path: string) => {
  try {
    const token = await getToken();
    const docs = await apiServer.get(`/v2/files/${fileId}/view-url`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    revalidatePath(path);
    return parseStringify(docs.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      return redirect('/login');
    }
  }
};

export const deleteFile = async ({
  fileId,
  path,
}: {
  fileId: string;
  path: string;
}) => {
  try {
    const token = await getToken();
    await apiServer.delete(`/v2/files/${fileId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    revalidatePath(path);
  } catch (error) {
    if (error instanceof AxiosError) {
      return redirect('/login');
    }
  }
};

export const permanentDeleteFile = async ({
  fileId,
  path,
}: {
  fileId: string;
  path: string;
}) => {
  try {
    const token = await getToken();
    await apiServer.delete(`/v2/files/${fileId}/permanent`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    revalidatePath(path);
  } catch (error) {
    if (error instanceof AxiosError) {
      return redirect('/login');
    }
  }
};

export const updateFile = async ({
  fileId,
  form,
  path,
}: {
  fileId: string;
  form: { name: string };
  path: string;
}) => {
  try {
    const token = await getToken();
    await apiServer.patch(
      `/v2/files/${fileId}/rename`,
      { name: form.name },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    revalidatePath(path);
  } catch (error) {
    if (error instanceof AxiosError) {
      return redirect('/login');
    }
  }
};

export const restoreFile = async ({
  fileId,
  path,
}: {
  fileId: string;
  path: string;
}) => {
  try {
    const token = await getToken();
    await apiServer.post(
      `/v2/files/${fileId}/restore`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    revalidatePath(path);
  } catch (error) {
    if (error instanceof AxiosError) {
      return redirect('/login');
    }
  }
};

export const moveFile = async ({
  fileId,
  targetFolderId,
  path,
}: {
  fileId: string;
  targetFolderId: string;
  path: string;
}) => {
  try {
    const token = await getToken();
    await apiServer.patch(
      `/v2/files/${fileId}/move/${targetFolderId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    revalidatePath(path);
  } catch (error) {
    if (error instanceof AxiosError) {
      return redirect('/login');
    }
  }
};

export const favoriteFile = async ({
  fileId,
  path,
}: {
  fileId: string;
  path: string;
}) => {
  try {
    const token = await getToken();
    await apiServer.patch(
      `/v2/files/${fileId}/favorite`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    revalidatePath(path);
  } catch (error) {
    if (error instanceof AxiosError) {
      return redirect('/login');
    }
  }
};

export const getRecentFiles = async (queries: DocsQueries) => {
  try {
    const token = await getToken();
    const docs = await apiServer.get('/v2/files/recents', {
      headers: { Authorization: `Bearer ${token}` },
      params: { ...queries },
    });
    
    const content = Array.isArray(docs.data) ? docs.data : [];

    // As the backend returns a simple list, we wrap it in the expected PaginatedResponse structure.
    const paginatedData = {
      data: {
        content: content,
        page: 0,
        pageSize: content.length,
        totalElements: content.length,
        totalPages: 1,
        last: true,
      }
    };
    
    return parseStringify(paginatedData);
  } catch (error) {
    console.error('Error fetching recent files:', error);
    return {
      data: {
        content: [],
        page: 0,
        pageSize: 0,
        totalElements: 0,
        totalPages: 0,
        last: true,
      }
    };
  }
};
