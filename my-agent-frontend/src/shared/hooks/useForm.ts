import { useForm as useRHF, type UseFormProps, type FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodType } from 'zod'

export function useZodForm<T extends FieldValues>(
  schema: ZodType<T>,
  options?: Omit<UseFormProps<T>, 'resolver'>
) {
  return useRHF<T>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    ...options,
  })
}
