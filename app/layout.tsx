import PullToRefresh from "@/components/PullToRefresh";
import type { Metadata, Viewport } from 'next';
import './globals.css';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const viewport: Viewport = {
  themeColor: '#091945',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'QUIZ du 7TER — Le Grand Quiz Show (2 Couples & 4 Joueurs)',
  description:
    'Le Grand Quiz du 7TER ! Jeu de soirée en Jaune & Bleu : 2 Couples ou 4 Joueurs, 10 niveaux en direct, Roulette Surprise, Mode Quitte ou Double et Chrono 20s.',
  manifest: `${basePath}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'QUIZ 7TER',
  },
  icons: {
    icon: [
      { url: `${basePath}/logo-7ter.svg`, type: 'image/svg+xml' },
      { url: `${basePath}/apple-touch-icon.png`, sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: `${basePath}/apple-touch-icon.png`, sizes: '512x512', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen bg-7ter-stage text-slate-100 antialiased selection:bg-yellow-400 selection:text-blue-950">
        <PullToRefresh />
        {children}
      </body>
    </html>
  );
}
