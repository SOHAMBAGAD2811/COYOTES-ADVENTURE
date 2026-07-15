import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "The Coyote's Intercept Terminal — Rustbound Frontier",
  description:
    'A diegetic survival/stealth dashboard for intercepting Aegis Corporation water convoys on Kepler-88.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-mono bg-matte-base text-amber-glow antialiased">
        {children}
      </body>
    </html>
  );
}
