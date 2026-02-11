import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true }, { status: 200 });

  response.cookies.delete('sb_refresh_token');
  return response;
}
