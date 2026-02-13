import { NextRequest } from 'next/server';
import { z } from 'zod';

import { ANALYTICS_EVENT_NAMES } from '@/shared/constants';
import { getClientMeta, json } from '@/shared/libs/api-route';
import { getAuthUserId } from '@/shared/libs/supabase';

const eventSchema = z.object({
  eventName: z.enum(ANALYTICS_EVENT_NAMES),
  userId: z.string().uuid().optional(),
  source: z.string().min(1).max(100).optional(),
  platform: z.string().min(1).max(20).optional(),
  appVersion: z.string().min(1).max(40).optional(),
  appBuild: z.string().min(1).max(40).optional(),
  timestamp: z.string().datetime().optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = eventSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'invalid analytics payload' } });
  }

  const clientMeta = getClientMeta(request);
  const authUserId = (await getAuthUserId(request)) ?? undefined;
  const payload = parsed.data;

  const event = {
    ...payload,
    userId: payload.userId ?? authUserId ?? null,
    platform: payload.platform ?? clientMeta.platform,
    appVersion: payload.appVersion ?? clientMeta.appVersion,
    appBuild: payload.appBuild ?? clientMeta.appBuild,
    timestamp: payload.timestamp ?? new Date().toISOString(),
  };

  // TODO: 추후 DB/외부 분석 툴 적재
  console.info('[analytics]', event);

  return json(202, { ok: true });
}
