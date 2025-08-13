import { showNotification } from '@mantine/notifications'
import { CheckIcon, InfoIcon, WarningIcon } from '@phosphor-icons/react'

export function showError(message = 'An unexpected error occurred.') {
  showNotification({
    title: 'Error',
    message,
    color: 'red',
    icon: <WarningIcon />,
  })
}

export function showSuccess(message = 'The action was completed.') {
  showNotification({
    title: 'Success',
    message,
    color: 'green',
    icon: <CheckIcon />,
  })
}

export function showInfo(message: string) {
  showNotification({
    title: 'Info',
    message,
    color: 'blue',
    icon: <InfoIcon />,
  })
}
