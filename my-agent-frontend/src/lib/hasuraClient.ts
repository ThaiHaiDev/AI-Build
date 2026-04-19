import { GraphQLClient } from 'graphql-request'
import { env, isDev, hasHasura } from '@/config/env'
import { useAuthStore } from '@/features/auth/store/authStore'

export const hasuraClient = hasHasura
  ? new GraphQLClient(env.VITE_HASURA_HTTP_URL!, {
      headers: () => {
        const token = useAuthStore.getState().token
        return {
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : isDev && env.VITE_HASURA_ADMIN_SECRET
              ? { 'x-hasura-admin-secret': env.VITE_HASURA_ADMIN_SECRET }
              : {}),
          'x-hasura-role': useAuthStore.getState().user?.role ?? 'anonymous',
        }
      },
    })
  : null

export async function gqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  if (!hasuraClient) throw new Error('Hasura URL chưa cấu hình (VITE_HASURA_HTTP_URL)')
  try {
    return await hasuraClient.request<T>(query, variables)
  } catch (error: unknown) {
    const e = error as { response?: { errors?: Array<{ message: string }> } }
    const gqlErrors = e?.response?.errors
    if (gqlErrors?.length) throw new Error(gqlErrors[0].message)
    throw error
  }
}
