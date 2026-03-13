import { NextRequest } from 'next/server';
import { ICardioSet, IStrengthSet } from '@routine-note/package-shared';

import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';
import { json } from '@/shared/libs/api-route';

type Params = Promise<{ setId: string }>;

const mapSetResponse = (set: any) => {
  if (set.cardio_record_type && set.cardio_record_value) {
    return {
      id: set.id,
      type: set.cardio_record_type,
      value: set.cardio_record_value,
    } as ICardioSet;
  } else {
    return {
      id: set.id,
      weight: set.weight,
      reps: set.reps,
    } as IStrengthSet;
  }
};
interface ICardioSetUpdate extends Omit<ICardioSet, 'type, value'> {
  cardio_record_type: ICardioSet['type'];
  cardio_record_value: ICardioSet['value'];
}
export async function PATCH(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const body = (await request.json()) as ICardioSet | IStrengthSet;

  const params = await Promise.resolve(context.params);
  const setId = params?.setId;

  const supabase = getSupabaseAdmin();
  const { data: owner, error: ownerError } = await supabase.from('sets').select('id').eq('id', setId).maybeSingle();

  if (ownerError) {
    return json(500, { error: { code: 'DB_ERROR', message: ownerError.message } });
  }

  if (!owner) {
    return json(404, { error: { code: 'NOT_FOUND', message: 'set not found' } });
  }

  const update: Partial<
    Pick<ICardioSetUpdate, 'cardio_record_type' | 'cardio_record_value'> & Pick<IStrengthSet, 'weight' | 'reps'>
  > = {};

  if ('weight' in body && 'reps' in body) {
    update.weight = body.weight;
    update.reps = body.reps;
  }
  if ('type' in body && 'value' in body) {
    update.cardio_record_type = body.type;
    update.cardio_record_value = body.value;
  }
  const { data, error } = await supabase
    .from('sets')
    .update(update)
    .eq('id', setId)
    .select('id, weight, reps, cardio_record_type, cardio_record_value')
    .maybeSingle();

  if (error) {
    return json(500, { error: { code: 'DB_ERROR', message: error.message } });
  }

  return json(200, mapSetResponse(data));
}

export async function DELETE(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const params = await Promise.resolve(context.params);
  const setId = params?.setId;

  const supabase = getSupabaseAdmin();
  const { data: owner, error: ownerError } = await supabase.from('sets').select('id').eq('id', setId).maybeSingle();

  if (ownerError) {
    return json(500, { error: { code: 'DB_ERROR', message: 'select sets DB:' + ownerError.message } });
  }

  if (!owner) {
    return json(404, { error: { code: 'NOT_FOUND', message: 'set not found' } });
  }

  const { error } = await supabase.from('sets').delete().eq('id', setId);

  if (error) {
    return json(500, { error: { code: 'DB_ERROR', message: 'sets delete DB:' + error.message } });
  }

  return json(200, { ok: true });
}
