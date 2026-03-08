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

export async function login({ form }: { form: LoginReqProps }) {
  try {
    const me = await apiServer.post('/v2/login', {
      email: form.email,
      password: form.password,
    });
    const cookieStore = await cookies();
    cookieStore.set('docse9-auth-token', me.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 30,
      path: '/',
    });

    return parseStringify(me.data);
  } catch (error) {
    throw error;
  }
}

export async function registerUser({
  form,
  path,
}: {
  form: UserReqProps;
  path?: string;
}) {
  try {
    const token = await getToken();
    const me = await apiServer.post(
      '/v2/register',
      {
        username: form.username,
        email: form.email,
        townId: form.townId || null,
        role: form.role,
        password: form.password,
        confirmPassword: form.confirmPassword,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (path) {
      revalidatePath(path);
    }
    return parseStringify(me.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      return redirect('/login');
    }
  }
}

export async function getUsers({
  queries,
  path,
}: {
  queries: UsersQueries;
  path?: string;
}) {
  try {
    const token = await getToken();
    const me = await apiServer.get('/v2/users', {
      headers: { Authorization: `Bearer ${token}` },
      params: { ...queries },
    });

    if (path) {
      revalidatePath(path);
    }

    return parseStringify(me.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      return redirect('/login');
    }
  }
}

export const updateUser = async ({
  userId,
  form,
  path,
}: {
  userId: string;
  form: UserReqProps;
  path: string;
}) => {
  try {
    const token = await getToken();
    await apiServer.patch(
      `/v2/user/${userId}`,
      {
        username: form.username,
        email: form.email,
        townId: form.townId || null,
        role: form.role,
        password: form.password,
        confirmPassword: form.confirmPassword,
      },
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

export const changePassword = async ({
  form,
}: {
  form: ChangePasswordReqProps;
}) => {
  try {
    const token = await getToken();
    await apiServer.post(
      '/v2/change-password',
      {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Senha atual incorreta.');
      }
      throw new Error(error.response?.data?.message || 'Erro ao mudar senha.');
    }
    throw error;
  }
};

export const deleteUser = async ({
  userId,
  path,
}: {
  userId: string;
  path: string;
}) => {
  try {
    const token = await getToken();
    await apiServer.delete(`/v2/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    revalidatePath(path);
  } catch (error) {
    if (error instanceof AxiosError) {
      return redirect('/login');
    }
  }
};

export const signOutUser = async () => {
  try {
    (await cookies()).delete('docse9-auth-token');
  } catch (error) {
    throw new Error('Falha ao deslogar usuário.');
  }
};
