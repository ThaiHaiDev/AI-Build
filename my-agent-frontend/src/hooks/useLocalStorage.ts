import { useCallback, useEffect, useState } from 'react'
import { storage } from '@/utils/storage'

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => storage.get<T>(key, initial))

  useEffect(() => {
    storage.set(key, value)
  }, [key, value])

  const remove = useCallback(() => {
    storage.remove(key)
    setValue(initial)
  }, [key, initial])

  return [value, setValue, remove] as const
}
