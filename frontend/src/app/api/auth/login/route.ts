import { apiServer } from '@/lib/axios';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios, { AxiosError } from 'axios';

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const { email, password }: LoginRequest = await req.json();
    const response = await apiServer.post('/login', {
      email,
      password,
    });

    const data: LoginResponse = await response.data;

    const cookieStore = await cookies();
    cookieStore.set('docse9-auth-token', data.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 30,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      accessToken: data.accessToken,
      expiresIn: data.expiresIn,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      if (axiosError.response) {
        const status = axiosError.response.status;
        const message = axiosError.response.data?.message;

        if (status === 401) {
          return NextResponse.json(
            {
              success: false,
              error: message || 'Email ou senha incorretos',
            },
            { status: 401 }
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: message || 'Erro ao fazer login',
          },
          { status: status }
        );
      }
    }
  }
}
