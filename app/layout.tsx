import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Le Grand Quiz des Trentenaires — Édition 2 Couples & 4 Joueurs',
  description:
    'Jeu de quiz multijoueur local (2 Couples / 4 Joueurs) pour trentenaires (nés en 1990-1998). 10 niveaux de difficulté en direct, zéro latence, questions pré-générées sur Supabase.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
