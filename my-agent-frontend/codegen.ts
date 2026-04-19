import type { CodegenConfig } from '@graphql-codegen/cli'

const HASURA_URL = process.env.VITE_HASURA_HTTP_URL ?? ''
const ADMIN_SECRET = process.env.VITE_HASURA_ADMIN_SECRET ?? ''

const config: CodegenConfig = {
  schema: HASURA_URL
    ? [{ [HASURA_URL]: { headers: { 'x-hasura-admin-secret': ADMIN_SECRET } } }]
    : [],
  documents: ['src/**/*.graphql', 'src/**/*.{ts,tsx}'],
  generates: {
    'src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: { withHooks: true },
    },
  },
  ignoreNoDocuments: true,
}

export default config
