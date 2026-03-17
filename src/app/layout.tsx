import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Toaster } from 'sonner';

// --- Imports de vos données et Providers ---
import { getInitialData } from '@/lib/appConfig';
import { DataProvider } from '@/context/DataContext';
import { UserProvider } from '@/context/UserContext'; // <-- 1. NOUVEL IMPORT ICI

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

// ... vos imports

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  
  const initialData = await getInitialData();
  const currentUser = null; 

  return (
    <html lang="fr">
      <body className="font-sans antialiased">
        <Toaster position="top-right" />
        
        <UserProvider initialUser={currentUser}>
          <DataProvider data={initialData}>
            {children}
          </DataProvider>
        </UserProvider>

        <Analytics />
      </body>
    </html>
  )
}