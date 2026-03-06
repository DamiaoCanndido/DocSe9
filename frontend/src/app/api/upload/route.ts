import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const token = (await cookies()).get('docse9-auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const parentId = formData.get('parentId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const backendFormData = new FormData();
    backendFormData.append('file', file);
    if (parentId && parentId !== 'null') {
      backendFormData.append('folderId', parentId);
    }

    const response = await axios.post(`${process.env.API_URL}/v2/files/upload`, backendFormData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Upload error:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Upload failed' },
      { status: error.response?.status || 500 }
    );
  }
}
