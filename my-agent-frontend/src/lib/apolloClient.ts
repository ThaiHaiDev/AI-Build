import { ApolloClient, InMemoryCache, createHttpLink, split, ApolloLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { env, isDev, hasHasura } from '@/config/env'
import { useAuthStore } from '@/features/auth/store/authStore'

const httpLink = hasHasura
  ? createHttpLink({ uri: env.VITE_HASURA_HTTP_URL })
  : new ApolloLink(() => null)

const authLink = setContext((_, { headers }) => {
  const token = useAuthStore.getState().token
  return {
    headers: {
      ...headers,
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : isDev && env.VITE_HASURA_ADMIN_SECRET
          ? { 'x-hasura-admin-secret': env.VITE_HASURA_ADMIN_SECRET }
          : {}),
      'x-hasura-role': useAuthStore.getState().user?.role ?? 'anonymous',
    },
  }
})

const wsLink = hasHasura
  ? new GraphQLWsLink(
      createClient({
        url: env.VITE_HASURA_WS_URL!,
        connectionParams: () => {
          const token = useAuthStore.getState().token
          return {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : isDev && env.VITE_HASURA_ADMIN_SECRET
                ? { 'x-hasura-admin-secret': env.VITE_HASURA_ADMIN_SECRET }
                : {},
          }
        },
      })
    )
  : null

const link = wsLink
  ? split(
      ({ query }) => {
        const def = getMainDefinition(query)
        return def.kind === 'OperationDefinition' && def.operation === 'subscription'
      },
      wsLink,
      authLink.concat(httpLink)
    )
  : authLink.concat(httpLink)

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  defaultOptions: { watchQuery: { fetchPolicy: 'cache-and-network' } },
})
