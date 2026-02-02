import { apiServer } from '@/lib/axios';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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
      httpOnly: false,
      secure: false,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({
      accessToken: data.accessToken,
      expiresIn: data.expiresIn,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown',
    });
  }
}
