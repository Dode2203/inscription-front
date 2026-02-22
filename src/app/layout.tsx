import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Toaster } from 'sonner';

// --- AJOUTS : Imports de vos données et du Provider ---
import { getInitialData } from '@/lib/appConfig';
import { DataProvider } from '@/context/DataContext';

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Gestion des inscriptions',
  description: 'Application pour gérer les inscriptions des étudiants',
  generator: 'Next.js',
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
}

// Note: RootLayout devient "async" pour appeler getInitialData()
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  
  // 1. On appelle l'API UNE SEULE FOIS côté serveur ici
  const initialData = await getInitialData();

  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <Toaster position="top-right" />
        
        {/* 2. On enveloppe les enfants avec le DataProvider pour partager les données */}
        <DataProvider data={initialData}>
          {children}
        </DataProvider>

        <Analytics />
      </body>
    </html>
  )
}