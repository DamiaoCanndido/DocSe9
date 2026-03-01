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

export const getRootFolders = async (queries: DocsQueries) => {
  try {
    const token = await getToken();
    const docs = await apiServer.get('/v2/folders/root', {
      headers: { Authorization: `Bearer ${token}` },
      params: { ...queries },
    });
    return parseStringify(docs.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      return redirect('/login');
    }
  }
};

export const getSearchResults = async (queries: DocsQueries) => {
  try {
    const token = await getToken();
    const docs = await apiServer.get('/v2/folders/search', {
      headers: { Authorization: `Bearer ${token}` },
      params: { ...queries },
    });
    return parseStringify(docs.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      return redirect('/login');
    }
  }
};

export const getChildrenFolders = async (id: string, queries: DocsQueries) => {
  try {
    const token = await getToken();
    const docs = await apiServer.get(`/v2/folders/${id}/children`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { ...queries },
    });
    return parseStringify(docs.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      return redirect('/login');
    }
  }
};

export const getTrashFolders = async (queries: DocsQueries) => {
  try {
    const token = await getToken();
    const docs = await apiServer.get('/v2/folders/trash', {
      headers: { Authorization: `Bearer ${token}` },
      params: { ...queries },
    });
    return parseStringify(docs.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      return redirect('/login');
    }
  }
};

export const createFolder = async ({
  form,
  path,
}: {
  form: FolderReqProps;
  path: string;
}) => {
  try {
    const token = await getToken();
    await apiServer.post(
      '/v2/folders',
      { name: form.name, parentId: form.parentId || null },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    revalidatePath(path);
  } catch (_error) {
    if (_error instanceof AxiosError) {
      return redirect('/login');
    }
  }
};

export const updateFolder = async ({
  folderId,
  form,
  path,
}: {
  folderId: string;
  form: FolderReqProps;
  path: string;
}) => {
  try {
    const token = await getToken();
    await apiServer.patch(
      `/v2/folders/${folderId}`,
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

export const restoreFolder = async ({
  folderId,
  path,
}: {
  folderId: string;
  path: string;
}) => {
  try {
    const token = await getToken();
    await apiServer.patch(
      `/v2/folders/${folderId}/restore`,
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

export const deleteFolder = async ({
  folderId,
  path,
}: {
  folderId: string;
  path: string;
}) => {
  try {
    const token = await getToken();
    await apiServer.delete(`/v2/folders/${folderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    revalidatePath(path);
  } catch (error) {
    if (error instanceof AxiosError) {
      return redirect('/login');
    }
  }
};

export const permanentDeleteFolder = async ({
  folderId,
  path,
}: {
  folderId: string;
  path: string;
}) => {
  try {
    const token = await getToken();
    await apiServer.delete(`/v2/folders/${folderId}/permanent`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    revalidatePath(path);
  } catch (error) {
    if (error instanceof AxiosError) {
      return redirect('/login');
    }
  }
};

export const moveFolder = async ({
  folderId,
  targetFolderId,
  path,
}: {
  folderId: string;
  targetFolderId: string;
  path: string;
}) => {
  try {
    const token = await getToken();
    await apiServer.patch(
      `/v2/folders/${folderId}/move/${targetFolderId}`,
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
