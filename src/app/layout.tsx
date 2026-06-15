import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '고구마마켓 - 우리 동네 중고거래',
  description: '고구마마켓에서 우리 동네 중고 물건을 사고 팔아보세요!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍠</text></svg>" />
      </head>
      <body className="min-h-screen bg-violet-50">
        {children}
      </body>
    </html>
  )
}
