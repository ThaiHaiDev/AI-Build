import { Component, type ErrorInfo, type ReactNode } from 'react'
import { logger } from '@/lib/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('ErrorBoundary caught', { error: error.message, stack: info.componentStack })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="text-4xl">⚠️</span>
            <p className="text-base font-semibold text-gray-800">Có lỗi xảy ra.</p>
            <p className="text-sm text-gray-500">Vui lòng thử lại hoặc liên hệ quản trị viên.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              🔄 Tải lại trang
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
