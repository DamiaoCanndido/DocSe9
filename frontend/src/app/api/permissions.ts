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

export type PermissionType = 'READ' | 'WRITE' | 'DELETE';

export interface NodePermission {
  userId: string;
  username: string;
  email: string;
  permissionType: PermissionType;
}

export const getNodePermissions = async (nodeId: string) => {
  try {
    const token = await getToken();
    const endpoint = `/v2/permissions?nodeId=${nodeId}`;
    const response = await apiServer.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return parseStringify(response.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) return redirect('/login');
    }
    throw error;
  }
};

export const addOrUpdatePermission = async ({
  nodeId,
  userId,
  permissionType,
  path,
}: {
  nodeId: string;
  userId: string;
  permissionType: PermissionType;
  path: string;
}) => {
  try {
    const token = await getToken();
    const endpoint = `/v2/permissions`;
    await apiServer.post(
      endpoint,
      { userId, nodeId, permissionType },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    revalidatePath(path);
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) return redirect('/login');
    }
    throw error;
  }
};

export const revokePermission = async ({
  nodeId,
  userId,
  path,
}: {
  nodeId: string;
  userId: string;
  path: string;
}) => {
  try {
    const token = await getToken();
    const endpoint = `/v2/permissions/${userId}/user/${nodeId}`;
    await apiServer.delete(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    revalidatePath(path);
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) return redirect('/login');
    }
    throw error;
  }
};
