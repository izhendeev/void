import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

const ROOT_URL = (process.env.NEXT_PUBLIC_URL || 'https://void3-game2.vercel.app').replace(/\/$/, '')

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'VOID³ - Space Dodge Game',
    description: 'Dodge asteroids and set high scores in this exciting space game. Save your records on Base blockchain.',
    other: {
      'base:app_id': '696fd000b1df0aaec05af3c8',
      'fc:miniapp': JSON.stringify({
        version: 'next',
        imageUrl: `${ROOT_URL}/embed-image.png`,
        button: {
          title: 'Play VOID³',
          action: {
            type: 'launch_miniapp',
            name: 'VOID³',
            url: ROOT_URL,
            splashImageUrl: `${ROOT_URL}/splash.png`,
            splashBackgroundColor: '#000011',
          },
        },
      }),
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="base:app_id" content="696fd000b1df0aaec05af3c8" key="base-app-id" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Michroma&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Script id="base-app-id" strategy="beforeInteractive" dangerouslySetInnerHTML={{
          __html: `if (typeof document !== 'undefined') {
            const meta = document.createElement('meta');
            meta.setAttribute('name', 'base:app_id');
            meta.setAttribute('content', '696fd000b1df0aaec05af3c8');
            document.head.appendChild(meta);
          }`
        }} />
      </body>
    </html>
  )
}
