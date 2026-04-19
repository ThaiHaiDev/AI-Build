import { lazy as reactLazy, Suspense, type ComponentType } from 'react'
import { Spinner } from '@/components/ui/Spinner'

export const lazyComponent = (loader: () => Promise<{ default: ComponentType }>) => {
  const Cmp = reactLazy(loader)
  return (
    <Suspense fallback={<Spinner fullscreen />}>
      <Cmp />
    </Suspense>
  )
}
