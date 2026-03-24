import { TOKEN } from '@routine-note/package-shared';
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true }, { status: 200 });

  response.cookies.delete(TOKEN.REFRESH);
  return response;
}
