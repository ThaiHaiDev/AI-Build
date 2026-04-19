import { forwardRef, type InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { invalid, className = '', ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={`w-full rounded border px-3 py-2 text-sm outline-none focus:ring-2 ${
        invalid ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
      } ${className}`}
      {...rest}
    />
  )
})
