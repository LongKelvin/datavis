import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DataVis — Structured Data Visualizer",
  description: "Transform JSON, YAML, XML, CSV, TOML into interactive graph visualizations. Privacy-first, runs entirely in the browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
