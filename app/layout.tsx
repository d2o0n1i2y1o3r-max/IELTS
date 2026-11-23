import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'IELTSPrep — AI-Powered IELTS & CEFR Practice',
  description:
    'Practice IELTS Speaking, Writing, Reading, and Listening with real-time voice transcription and instant AI band score evaluation.',
  icons: {
    icon: '/favicon.svg',
  },
  other: {
    google: 'notranslate',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="notranslate" translate="no">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body
        suppressHydrationWarning
        className="notranslate antialiased min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100"
      >
        <Providers>
          <Navbar />
          {/* md:pl-64 — sidebar kengligiga teng chap bo'shliq */}
          <div className="md:pl-64 flex flex-col min-h-screen">
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
              © 2026 IELTSPrep — AI-Powered IELTS & CEFR Practice.
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
