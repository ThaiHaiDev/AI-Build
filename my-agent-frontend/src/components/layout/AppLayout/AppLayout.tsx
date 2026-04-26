import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader/AppHeader';
import { Sidebar } from '@/components/layout/Sidebar/Sidebar';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ToastContainer } from '@/components/ui/Toast';

export function AppLayout() {
  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <AppHeader />
        <div style={{ flex: 1, display: 'flex' }}>
          <Sidebar />
          <main style={{ flex: 1, minWidth: 0 }}>
            <Outlet />
          </main>
        </div>
        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
}
