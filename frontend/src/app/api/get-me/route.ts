import { apiServer } from '@/lib/axios';
import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('docse9-auth-token')?.value;

    const response = await apiServer.get('/get-me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { userId, username, email, role, town, createdAt }: UserResProps =
      response.data;

    return NextResponse.json({
      success: true,
      userId,
      username,
      email,
      role,
      town,
      createdAt,
    });
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      const message = axiosError.response.data?.message;

      if (status === 401) {
        return NextResponse.json(
          {
            success: false,
            error: message || 'Token expirado ou inválido',
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: message || 'Token não existe',
        },
        { status: status }
      );
    }
  }
}
