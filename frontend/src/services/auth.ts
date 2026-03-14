import { api } from './api'
import type { AuthTokenResponse, AuthUser } from '@/types'

export const authService = {
  login: (email: string, password: string) =>
    api.post<AuthTokenResponse>('/auth/login', { email, password }),
  register: (email: string, password: string) =>
    api.post<AuthTokenResponse>('/auth/register', { email, password }),
  me: () => api.get<AuthUser>('/auth/me'),
}
