import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MISS JŌHOKU 2026',
  description: 'MISS JŌHOKU 2026 投票サイト',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}