import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { env } from '@/config/env'
import { useAuthStore } from '@/features/auth/store/authStore'
import { ENDPOINTS } from './endpoints'
import { logger } from '@/lib/logger'
import { toast } from '@/components/ui/Toast'
import i18n from '@/lib/i18n'

const api: AxiosInstance = axios.create({
  baseURL:         env.VITE_API_BASE_URL,
  timeout:         10_000,
  headers:         { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

const SKIP_REFRESH = new Set<string>([
  ENDPOINTS.AUTH.LOGIN,
  ENDPOINTS.AUTH.REGISTER,
  ENDPOINTS.AUTH.REFRESH,
  ENDPOINTS.AUTH.LOGOUT,
])

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const url             = originalRequest?.url ?? ''

    const errorCode = error.response?.data?.error?.code
    if (errorCode === 'ACCOUNT_DEACTIVATED') {
      useAuthStore.getState().logout()
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry && !SKIP_REFRESH.has(url)) {
      originalRequest._retry = true
      try {
        const { data } = await axios.post<{ accessToken: string }>(
          `${env.VITE_API_BASE_URL}${ENDPOINTS.AUTH.REFRESH}`,
          {},
          { withCredentials: true },
        )
        useAuthStore.getState().setToken(data.accessToken)
        originalRequest.headers = originalRequest.headers ?? {}
        ;(originalRequest.headers as Record<string, string>).Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch (refreshErr) {
        logger.warn('Refresh token failed, logging out')
        useAuthStore.getState().logout()
      }
    }

    if (!error.response && (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.request?.status)) {
      toast.error(i18n.t('common:error_network'))
    }

    return Promise.reject(error)
  },
)

export default api
