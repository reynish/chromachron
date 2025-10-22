import type {Metadata} from 'next';
import './globals.css';
import preview from '../media/preview.png';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'ChromaChron',
  description: 'The worst date picker imaginable.',
  openGraph: {
    title: 'ChromaChron',
    description: 'The worst date picker imaginable.',
    images: [
      {
        url: '/preview.png',
        width: 1200,
        height: 630,
        alt: 'ChromaChron',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChromaChron',
    description: 'The worst date picker imaginable.',
    images: ['/preview.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
