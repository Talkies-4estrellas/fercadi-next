import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ClientProviders from '@/components/ClientProviders'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['200', '300', '400', '900'],
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: 'FERCADI - Materiales de Construcción',
  description:
    'Concreto, texturizados, adhesivos, materiales y herramientas para construcción. Josman Texturizados.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={montserrat.variable} suppressHydrationWarning>
      <head>
        <script
          src="https://kit.fontawesome.com/efc2f668b2.js"
          crossOrigin="anonymous"
          async
        ></script>
      </head>
      <body suppressHydrationWarning>
        <ClientProviders>
          <Header />
          <main>{children}</main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  )
}
