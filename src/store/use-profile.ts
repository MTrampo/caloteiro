import { Profile } from "@/commons/models/user"
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { formatCaseName } from "@/commons/utils/format"
import { PROFILE_STORAGE_KEY, DEFAULT_BRAND_NAME } from "@/commons/constants"

interface ProfileStore {
  profile: Profile | null
  luluzinha: string
  setProfile: (user: Profile | null) => void
  clearStore: () => void
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: null,
      luluzinha: DEFAULT_BRAND_NAME,

      setProfile: (userData) => {
        set({
          profile: userData,
          luluzinha: userData ? formatCaseName(userData.name) : DEFAULT_BRAND_NAME,
        });
      },

      clearStore: () => {
        set({ profile: null, luluzinha: DEFAULT_BRAND_NAME })
        localStorage.removeItem(PROFILE_STORAGE_KEY)
      },
    }),
    {
      name: PROFILE_STORAGE_KEY,
    }
  )
)