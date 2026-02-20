'use server';

import { cookies } from 'next/headers';
import { apiServer } from './axios';
import { redirect } from 'next/navigation';
import { AxiosError } from 'axios';
import { parseStringify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

async function getToken() {
  const token = (await cookies()).get('docse9-auth-token');
  return token?.value;
}

export async function getMe() {
  try {
    const token = await getToken();
    const me = await apiServer.get('/v2/get-me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    return parseStringify(me.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      return redirect('/login');
    }
  }
}

export const signOutUser = async () => {
  try {
    (await cookies()).delete('docse9-auth-token');
  } catch (error) {
    throw new Error('Falha ao deslogar usuário.');
  }
};

export const getRootFolders = async (queries: DocsGetInput) => {
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

export const getSearchResults = async (queries: DocsGetInput) => {
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

export const getChildrenFolders = async (id: string, queries: DocsGetInput) => {
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

export const getTrashFolders = async (queries: DocsGetInput) => {
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

export const getTowns = async () => {
  try {
    const token = await getToken();
    const towns = await apiServer.get('/v2/town', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return parseStringify(towns.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      return redirect('/login');
    }
  }
};
