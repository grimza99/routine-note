import { NextResponse } from 'next/server';

export const json = (status: number, body: unknown) => NextResponse.json(body, { status });
