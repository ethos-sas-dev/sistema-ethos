import './globals.css'
import { DM_Sans } from 'next/font/google'
import { metadata } from './metadata'
import { RootProviders } from './_providers/root-providers'

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
})

export { metadata }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={dmSans.variable}>
      <body className={`${dmSans.className} antialiased`}>
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  )
}
