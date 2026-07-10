import type { Metadata } from "next";

import Iconify from '@/components/Iconify';
import "./globals.css";

export const metadata: Metadata = {
  title: "KuliBayar | Bayaran Kuli, Dijamin On-Chain",
  description: "Escrow platform untuk konstruksi Indonesia. Dana dikunci di smart contract, cair otomatis setelah kerja terverifikasi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js" async />
      </head>
      <body className="min-h-screen bg-[#050505] selection:bg-[#FF4500] selection:text-white">
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}
