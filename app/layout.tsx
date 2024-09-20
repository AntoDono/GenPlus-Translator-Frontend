import './globals.css'
import Nav from '@/components/Nav'

export const metadata = {
  title: 'Gen+ Translator',
  description: "World's first bi-directional brainrot translator",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Nav/>
      <body>{children}</body>
    </html>
  )
}
