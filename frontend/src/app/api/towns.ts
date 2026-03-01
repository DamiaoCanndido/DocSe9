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

export const getTowns = async ({
  queries,
  path,
}: {
  queries: DocsQueries;
  path?: string;
}) => {
  try {
    const token = await getToken();
    const towns = await apiServer.get('/v2/town', {
      headers: { Authorization: `Bearer ${token}` },
      params: { ...queries },
    });
    if (path) {
      revalidatePath(path);
    }
    return parseStringify(towns.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      return redirect('/login');
    }
  }
};

export const newTown = async ({
  form,
  path,
}: {
  form: TownReqProps;
  path: string;
}) => {
  try {
    const token = await getToken();
    await apiServer.post(
      '/v2/town',
      { name: form.name, uf: form.uf, imageUrl: form.imageUrl },
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

export const updateTown = async ({
  townId,
  form,
  path,
}: {
  townId: string;
  form: TownReqProps;
  path: string;
}) => {
  try {
    const token = await getToken();
    await apiServer.patch(
      `/v2/town/${townId}`,
      { name: form.name, uf: form.uf, imageUrl: form.imageUrl },
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

export const deleteTown = async ({
  townId,
  path,
}: {
  townId: string;
  path: string;
}) => {
  try {
    const token = await getToken();
    await apiServer.delete(`/v2/town/${townId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    revalidatePath(path);
  } catch (error) {
    if (error instanceof AxiosError) {
      return redirect('/login');
    }
  }
};
