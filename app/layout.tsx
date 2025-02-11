import './globals.css'
import { DM_Sans } from 'next/font/google'
import { AuthProvider } from './_lib/auth/AuthContext'

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
})

export const metadata = {
  title: 'Sistema Ethos',
  description: 'Sistema de gestión inmobiliaria',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={dmSans.variable}>
      <body className={`${dmSans.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
