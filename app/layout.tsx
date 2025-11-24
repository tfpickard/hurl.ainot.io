import type { Metadata } from 'next';
import './globals.css';
import { Navigation } from './components/Navigation';

export const metadata: Metadata = {
  title: 'Hurl - AI-Generated Stories',
  description: 'Explore autonomous science fiction tales evolving in real time',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
