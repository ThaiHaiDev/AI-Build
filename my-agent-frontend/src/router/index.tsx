import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from '@/App'
import { appRoutes } from './routes'
import { lazyComponent } from './LazyRoutes'
import { AuthRoute, ProtectedRoute } from '@/features/auth/components'
import NotFoundPage from '@/pages/NotFound'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />,
    children: appRoutes.map(({ path, routeType, permissions, lazy }) => {
      const element = lazyComponent(lazy)
      return {
        path,
        element:
          routeType === 'auth' ? (
            <AuthRoute element={element} />
          ) : routeType === 'protected' ? (
            <ProtectedRoute element={element} permissions={permissions} />
          ) : (
            element
          ),
      }
    }),
  },
])

export const AppRouter = () => <RouterProvider router={router} />
