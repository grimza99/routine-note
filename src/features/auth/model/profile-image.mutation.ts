import { useAuthStoreActions } from '@/entities/auth/model/useAuthStore';
import { API, useToast } from '@/shared';
import { api } from '@/shared/libs/api';
import { useMutation } from '@tanstack/react-query';

interface ProfileImageResponse {
  profileUrl: string;
}

export const useProfileImageMutation = () => {
  const { setProfileImage } = useAuthStoreActions();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await api.postForm<ProfileImageResponse>(API.ACCOUNT.PROFILE_IMAGE, formData);

        if (res.error) {
          throw res.error;
        }

        return res.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data?.profileUrl) {
        setProfileImage(data.profileUrl);
      }
    },
    onError: (error) => {
      showToast({ message: error.message, variant: 'error' });
    },
  });
};
