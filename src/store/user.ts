import { create } from 'zustand'
import type { UserProfile } from '@/api/user';
import { persist,createJSONStorage } from 'zustand/middleware'



type UserStore = {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
}

const initialUser: UserProfile = {
  id: 0,
  uid: 0,
  nickname: '',
  avatar: '',
  email: '',
  provider: '',
  provider_uid: '',
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: initialUser,
      setUser: (user: UserProfile) => set({ user }),
    }),
    {
      name: 'user',
      storage: createJSONStorage(() => localStorage),
    }
  )
);