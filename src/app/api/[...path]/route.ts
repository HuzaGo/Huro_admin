import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://huzago-backend-1.onrender.com';

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const search = new URL(request.url).search;
  const backendUrl = `${BACKEND_URL}/api/${path.join('/')}${search}`;

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  const auth = request.headers.get('authorization');
  if (auth) headers.set('authorization', auth);

  const hasBody = !['GET', 'HEAD'].includes(request.method);
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const response = await fetch(backendUrl, {
    method: request.method,
    headers,
    body: body && body.byteLength > 0 ? body : undefined,
  });

  const responseData = await response.arrayBuffer();

  return new NextResponse(responseData, {
    status: response.status,
    headers: {
      'content-type': response.headers.get('content-type') || 'application/json',
    },
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
