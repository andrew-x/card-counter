import Logout from './_components/Logout'

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="col size-full">
      <main className="grow">{children}</main>
      <footer className="center-col">
        <Logout />
      </footer>
    </div>
  )
}
