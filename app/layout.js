import './globals.css'

export const metadata = {
  title: 'Manipulate',
  description: 'Hand pose manipulation demo with React Three Fiber',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 