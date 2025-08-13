import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

const cn = (
  ...args: Array<
    | string
    | Array<string | Record<string, unknown> | unknown>
    | Record<string, unknown>
    | undefined
  >
): string => twMerge(clsx(...args))
export default cn
