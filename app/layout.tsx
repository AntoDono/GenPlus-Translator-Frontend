import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
