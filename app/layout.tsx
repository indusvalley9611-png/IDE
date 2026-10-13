import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { SyncProvider } from '@/context/SyncContext';
import { ServiceWorkerRegister } from '@/components/layout/ServiceWorkerRegister';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0f172a',
};

export const metadata: Metadata = {
  title: 'SwasthyaSetu — Integrated Public Healthcare & Referral Management System',
  description: 'Public Health Department, National Health Mission. ABDM & FHIR R4 Compliant Healthcare & Smart Triage Referral Platform.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SwasthyaSetu',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full bg-slate-100 dark:bg-slate-950">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SwasthyaSetu" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className={`min-h-full flex flex-col font-sans antialiased text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-950 ${inter.className}`}>
        <AuthProvider>
          <LanguageProvider>
            <SyncProvider>
              {children}
            </SyncProvider>
          </LanguageProvider>
        </AuthProvider>

        {/* Service Worker registration via client component */}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
