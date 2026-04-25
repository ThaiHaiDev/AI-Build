import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader/AppHeader';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ToastContainer } from '@/components/ui/Toast';

export function AppLayout() {
  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <AppHeader />
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
}
