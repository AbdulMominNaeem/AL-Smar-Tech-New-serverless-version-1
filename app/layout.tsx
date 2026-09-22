import type { Metadata } from 'next';
import { Archivo, Manrope, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const displayFont = Archivo({ subsets: ['latin'], weight: ['600', '700', '800', '900'], variable: '--font-display', display: 'swap' });
const bodyFont = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-body', display: 'swap' });
const monoFont = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = { title: 'Lumen Marketing' };
export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
