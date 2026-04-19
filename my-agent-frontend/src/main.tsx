import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloProvider } from '@apollo/client'
import { I18nextProvider } from 'react-i18next'
import { apolloClient } from '@/lib/apolloClient'
import { initSentry } from '@/lib/sentry'
import { AppRouter } from '@/router'
import { Spinner } from '@/components/ui/Spinner'
import i18n from '@/lib/i18n'
import '@/styles/index.css'

initSentry()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<Spinner fullscreen />}>
        <ApolloProvider client={apolloClient}>
          <AppRouter />
        </ApolloProvider>
      </Suspense>
    </I18nextProvider>
  </React.StrictMode>
)
