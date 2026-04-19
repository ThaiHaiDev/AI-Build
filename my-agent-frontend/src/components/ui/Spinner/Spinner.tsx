interface Props {
  fullscreen?: boolean
}

export function Spinner({ fullscreen }: Props) {
  const spinner = (
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
  )
  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/60">{spinner}</div>
    )
  }
  return spinner
}
