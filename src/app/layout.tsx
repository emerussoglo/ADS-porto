import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import SiteChrome from "../components/SiteChrome";

export const metadata: Metadata = {
  title: "ADS, Fraternite, Jeunes Leaders",
  description: "Le mouvement catholique de jeunesse du Diocese de Porto-Novo.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
