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

export async function getLogs({
  page,
  size,
  path,
}: {
  page?: number;
  size?: number;
  path?: string;
}) {
  try {
    const token = await getToken();
    const response = await apiServer.get('/v2/logs', {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, size },
    });

    if (path) {
      revalidatePath(path);
    }

    return parseStringify(response.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        return redirect('/login');
      }
    }
    throw error;
  }
}
