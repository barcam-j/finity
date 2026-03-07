import { api } from './api'

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password) => api.post('/auth/register', { email, password }),
  me: () => api.get('/auth/me'),
}
