import { NextRequest } from 'next/server';
import { z } from 'zod';

import { ANALYTICS_EVENT_NAMES } from '@/shared/constants';
import { getClientMeta, json, warnMissingClientMetaHeaders } from '@/shared/libs/api-route';
import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';

const eventSchema = z.object({
  eventName: z.enum(ANALYTICS_EVENT_NAMES),
  userId: z.string().uuid().optional(),
  source: z.string().min(1).max(100).optional(),
  platform: z.string().min(1).max(20).optional(),
  appVersion: z.string().min(1).max(40).optional(),
  appBuild: z.string().min(1).max(40).optional(),
  sessionId: z.string().min(1).max(120).optional(),
  screenName: z.string().min(1).max(120).optional(),
  funnelStep: z.string().min(1).max(120).optional(),
  errorCode: z.string().min(1).max(120).optional(),
  timestamp: z.string().datetime().optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  warnMissingClientMetaHeaders(request, 'events');

  const parsed = eventSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'invalid analytics payload' } });
  }

  const clientMeta = getClientMeta(request);
  const authUserId = (await getAuthUserId(request)) ?? undefined;
  const payload = parsed.data;

  const event = {
    event_name: payload.eventName,
    userId: payload.userId ?? authUserId ?? null,
    source: payload.source ?? null,
    platform: payload.platform ?? clientMeta.platform,
    app_version: payload.appVersion ?? clientMeta.appVersion,
    app_build: payload.appBuild ?? clientMeta.appBuild,
    properties: {
      ...payload.properties,
      sessionId: payload.sessionId ?? null,
      screenName: payload.screenName ?? null,
      funnelStep: payload.funnelStep ?? null,
      errorCode: payload.errorCode ?? null,
    },
    event_at: payload.timestamp ?? new Date().toISOString(),
    ip_address: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    user_agent: request.headers.get('user-agent') ?? null,
  };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('analytics_events').insert({
    event_name: event.event_name,
    user_id: event.userId,
    source: event.source,
    platform: event.platform,
    app_version: event.app_version,
    app_build: event.app_build,
    properties: event.properties,
    event_at: event.event_at,
    ip_address: event.ip_address,
    user_agent: event.user_agent,
  });

  if (error) {
    return json(500, { error: { code: 'DB_ERROR', message: error.message } });
  }

  return json(202, { ok: true });
}
