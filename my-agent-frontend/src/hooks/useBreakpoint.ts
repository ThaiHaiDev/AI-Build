import { useEffect, useState } from 'react'
import { BREAKPOINTS, type BreakpointKey } from '@/utils/constants'

const ORDER: BreakpointKey[] = ['sm', 'md', 'lg', 'xl', '2xl']

function compute(width: number): BreakpointKey {
  let current: BreakpointKey = 'sm'
  for (const bp of ORDER) if (width >= BREAKPOINTS[bp]) current = bp
  return current
}

export function useBreakpoint(): BreakpointKey {
  const [bp, setBp] = useState<BreakpointKey>(() =>
    typeof window === 'undefined' ? 'lg' : compute(window.innerWidth),
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = () => setBp(compute(window.innerWidth))
    handler()
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return bp
}
