import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POS System Dashboard",
  description: "Modern Point of Sale Management System",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        {children}
      </body>
    </html>
  );
}
