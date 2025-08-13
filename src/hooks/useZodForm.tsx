/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from '@hookform/resolvers/zod'
import type { UseFormProps } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

const useZodForm = <TSchema extends z.ZodTypeAny>(
  props: Omit<UseFormProps, 'resolver'> & {
    schema: TSchema
  }
) => {
  const form = useForm({
    ...props,
    resolver: zodResolver(props.schema as any),
  })
  return form as any
}
export default useZodForm
