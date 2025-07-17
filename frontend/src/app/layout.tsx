import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProviders } from '../lib/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://chusea.com'),
  title: {
    default: 'ChUseA - AI Chat Assistant',
    template: '%s | ChUseA Chat',
  },
  description:
    'Modern AI chat interface with workflow management, document collaboration, and real-time messaging',
  keywords: [
    'AI chat',
    'workflow automation',
    'document collaboration',
    'real-time messaging',
    'AI assistant',
    'productivity tools',
  ],
  authors: [{ name: 'ChUseA Team' }],
  creator: 'ChUseA',
  publisher: 'ChUseA',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://chusea.com',
    siteName: 'ChUseA Chat',
    title: 'ChUseA - Modern AI Chat Assistant',
    description:
      'AI chat interface with workflow management and document collaboration',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ChUseA Chat Interface',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChUseA Chat',
    description: 'Modern AI chat assistant with workflow integration',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  verification: {
    google: 'your-google-verification-code',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="color-scheme" content="light dark" />
        {/* PWA and mobile optimization */}
        <meta name="application-name" content="ChUseA Chat" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ChUseA Chat" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2d89ef" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className='font-sans antialiased bg-gray-50 text-gray-900 min-h-screen' suppressHydrationWarning>
        <AppProviders enableDevtools={process.env.NODE_ENV === 'development'}>
          <div id="app-root" className="min-h-screen">
            {children}
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
