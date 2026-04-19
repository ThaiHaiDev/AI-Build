import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { env } from '@/config/env'
import { useAuthStore } from '@/features/auth/store/authStore'
import { logger } from '@/lib/logger'

const api: AxiosInstance = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const { data } = await axios.post(
          `${env.VITE_API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        const user = useAuthStore.getState().user
        if (user) useAuthStore.getState().setAuth(user, data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch (refreshErr) {
        logger.warn('Refresh token failed, logging out')
        useAuthStore.getState().logout()
      }
    }

    return Promise.reject(error)
  }
)

export default api
