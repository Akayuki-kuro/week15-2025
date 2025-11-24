// app/layout.tsx
import "./globals.css";
import React from "react";

export const metadata = {
  title: "Simple CRUD — Halaman Utama",
  description: "CRUD client-only, compatible with Vercel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        {/* minta browser gunakan light scheme sebagai default */}
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
