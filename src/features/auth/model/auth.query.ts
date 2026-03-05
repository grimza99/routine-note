import { API } from '@/shared/constants';
import { api } from '@/shared/libs/api';
import { useQuery } from '@tanstack/react-query';

export interface IAuthProfileResponse {
  id: string;
  email: string;
  username: string;
  nickname: string;
  age: number;
  privacy_policy: boolean;
  profile_image: string | null;
}

export const useAuthProfileQuery = () => {
  return useQuery({
    queryKey: ['auth-profile'],
    queryFn: async () => {
      const res = await api.get<IAuthProfileResponse>(API.ACCOUNT.PROFILE);

      if (res.error) {
        throw res.error;
      }

      return res.data;
    },
  });
};
