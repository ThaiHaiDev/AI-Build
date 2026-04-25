import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router-dom';
import App from '@/App';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AppLayout } from '@/components/layout/AppLayout/AppLayout';
import { appRoutes } from './routes';
import { lazyComponent } from './LazyRoutes';
import { AuthRoute, ProtectedRoute } from '@/features/auth/components';
import NotFoundPage from '@/pages/NotFound';

function guard(r: typeof appRoutes[number]) {
  const el = lazyComponent(r.lazy);
  if (r.routeType === 'auth')      return <AuthRoute      element={el} />;
  if (r.routeType === 'protected') return <ProtectedRoute element={el} permissions={r.permissions} />;
  return el;
}

const appChildren: RouteObject[] = appRoutes
  .filter((r) => r.layout === 'app')
  .map((r) => ({ path: r.path, element: guard(r) }));

const authChildren: RouteObject[] = appRoutes
  .filter((r) => r.layout === 'auth')
  .map((r) => ({ path: r.path, element: guard(r) }));

export const router = createBrowserRouter([
  {
    path:         '/',
    element:      <App />,
    errorElement: <NotFoundPage />,
    children: [
      {
        element:  <AppLayout />,
        children: appChildren,
      },
      {
        element:  <AuthLayout />,
        children: authChildren,
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
