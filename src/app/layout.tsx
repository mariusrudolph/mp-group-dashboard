import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SAG Digital Dashboard",
  description: "Meisterplan Dashboard für SAG Digital",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className} style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
