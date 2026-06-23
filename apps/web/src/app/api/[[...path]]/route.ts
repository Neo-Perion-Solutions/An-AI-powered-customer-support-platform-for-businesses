import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function proxy(request: NextRequest, params: { path: string[] }): Promise<NextResponse> {
  const path = (params.path || []).join('/');
  const url = new URL(`${API_URL}/${path}`);
  url.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.set('host', new URL(API_URL).host);
  headers.delete('content-length');

  const accessToken = request.cookies.get('accessToken')?.value;
  if (accessToken) headers.set('authorization', `Bearer ${accessToken}`);

  const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();

  const upstream = await fetch(url.toString(), {
    method: request.method,
    headers,
    body,
    redirect: 'manual',
  });

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('transfer-encoding');

  return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
