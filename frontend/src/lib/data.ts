'use server';

import { cookies } from 'next/headers';
import { apiServer } from './axios';
import { redirect } from 'next/navigation';
import { AxiosError } from 'axios';
import { parseStringify } from '@/lib/utils';

async function getToken() {
  const token = (await cookies()).get('docse9-auth-token');
  return token?.value;
}

export async function getMe() {
  try {
    const token = await getToken();
    const me = await apiServer.get('/get-me', {
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
