import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HRIS CSB - Sistem Absensi Karyawan",
  description: "Sistem informasi absensi karyawan dengan face recognition dan GPS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
