import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { UserDto } from '../api/ApiType'

export interface AuthState {
  walletAddress: string
  tokenName: string
  tokenValue: string
  isLoggedIn: boolean
  loading: boolean
  user: UserDto | null
  walletType: string | null // 记录用户使用的钱包类型
}

interface AuthActions {
  setAuth: (auth: Partial<AuthState>) => void
  setUser: (user: UserDto) => void
  clearAuth: () => void
}

const initialState: AuthState = {
  walletAddress: '',
  tokenName: '',
  tokenValue: '',
  isLoggedIn: false,
  loading: false,
  user: null,
  walletType: null,
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,
      setAuth: (auth) => 
        set((state) => ({
          ...state,
          ...auth,
          isLoggedIn: !!(auth.walletAddress || state.walletAddress),
        })),
      setUser: (user) => 
        set((state) => ({
          ...state,
          user,
        })),
      clearAuth: () => set(initialState),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        walletAddress: state.walletAddress,
        tokenName: state.tokenName,
        tokenValue: state.tokenValue,
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        walletType: state.walletType,
      }),
    }
  )
) 