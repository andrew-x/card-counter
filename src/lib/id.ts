import { createId } from '@paralleldrive/cuid2'

export default function generateId(prefix?: string) {
  return `${prefix ? `${prefix}-` : ''}${createId()}`
}
