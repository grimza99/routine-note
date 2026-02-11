import { NextRequest } from 'next/server';
import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';
import { json } from '@/shared/libs/api-route';

const PROFILE_IMAGE_BUCKET = 'profile-images';

const isImageFile = (file: File) => file.type.startsWith('image/');

const normalizeFileName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '_');

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: '파일이 필요합니다.' } });
  }

  if (!isImageFile(file)) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: '이미지 파일만 가능합니다.' } });
  }

  const supabase = getSupabaseAdmin();
  const safeName = normalizeFileName(file.name || 'profile');
  const filePath = `${userId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(PROFILE_IMAGE_BUCKET)
    .upload(filePath, file, { contentType: file.type, upsert: true });

  if (uploadError) {
    return json(500, { error: { code: 'STORAGE_ERROR', message: uploadError.message } });
  }

  const { data: publicData } = supabase.storage.from(PROFILE_IMAGE_BUCKET).getPublicUrl(filePath);
  const profileUrl = publicData.publicUrl;

  const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(userId);

  if (authUserError || !authUser?.user) {
    return json(500, { error: { code: 'DB_ERROR', message: authUserError?.message || 'failed to load user' } });
  }

  const { error: updateAuthError } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...(authUser.user.user_metadata ?? {}),
      profile_image: profileUrl,
    },
  });

  if (updateAuthError) {
    return json(500, { error: { code: 'DB_ERROR', message: updateAuthError.message } });
  }

  const { error: updateProfileError } = await supabase
    .from('users')
    .update({ profile_url: profileUrl })
    .eq('id', userId);

  if (updateProfileError) {
    return json(500, { error: { code: 'DB_ERROR', message: updateProfileError.message } });
  }

  return json(200, { profileUrl });
}
