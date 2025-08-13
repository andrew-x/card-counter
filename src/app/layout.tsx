import '@/styles/globals.css'
import '@/styles/utils.css'
import { createTheme, MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import '@mantine/notifications/styles.css'
import type { Metadata } from 'next'
import { Geist_Mono, Poppins } from 'next/font/google'

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Card Counter',
  description: 'Count card values quickly and easily',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Card Counter',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: 'theme(colors.blue.500)',
}

const theme = createTheme({})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${geistMono.variable} antialiased`}>
        <MantineProvider
          theme={theme}
          defaultColorScheme="light"
          forceColorScheme="light"
        >
          <ModalsProvider>
            <Notifications />
            <div className="center-col size-full">
              <div className="max-w-screen-sm size-full">{children}</div>
            </div>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  )
}
