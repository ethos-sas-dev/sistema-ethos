import './globals.css'
import { Instrument_Sans } from 'next/font/google'

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument-sans',
})

export const metadata = {
  title: 'Sistema Ethos',
  description: 'Sistema de gestión de propiedades',
  icons: {
    icon: '/ethos-logo.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={instrumentSans.variable}>
      <body className="min-h-screen bg-background font-instrumentSans antialiased">
        {children}
      </body>
    </html>
  )
}
