import { create } from 'zustand'

export type ToastKind = 'success' | 'error' | 'info'

export interface Toast {
  id:   number
  kind: ToastKind
  msg:  string
}

interface State {
  toasts: Toast[]
  push:   (kind: ToastKind, msg: string) => void
  remove: (id: number) => void
}

let uid = 0

export const useToastStore = create<State>()((set) => ({
  toasts: [],
  push: (kind, msg) => {
    const id = ++uid
    set((s) => ({ toasts: [...s.toasts, { id, kind, msg }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 3500)
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export const toast = {
  success: (msg: string) => useToastStore.getState().push('success', msg),
  error:   (msg: string) => useToastStore.getState().push('error', msg),
  info:    (msg: string) => useToastStore.getState().push('info', msg),
}
