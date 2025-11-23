import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hurl - Interactive Story Graph',
  description: 'Create and explore interconnected stories using graph database technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
