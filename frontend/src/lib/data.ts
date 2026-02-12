'use server';

import { cookies } from 'next/headers';
import { apiServer } from './axios';
import { redirect } from 'next/navigation';
import { AxiosError } from 'axios';
import { parseStringify } from '@/lib/utils';

export async function getMe() {
  try {
    const token = (await cookies()).get('docse9-auth-token');

    const me = await apiServer.get('/get-me', {
      headers: { Authorization: `Bearer ${token?.value}` },
    });

    return parseStringify(me.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      return redirect('/login');
    }
  }
}
