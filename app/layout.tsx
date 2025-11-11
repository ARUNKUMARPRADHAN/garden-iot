// app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import "@n8n/chat/style.css";


export const metadata: Metadata = {
  title: "Smart Garden Dashboard",
  description: "Live IoT dashboard (Tailwind CDN)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Tailwind Play CDN – no install needed */}
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
        {/* Optional: light config (colors, fonts, etc.) */}
        <Script id="tailwind-config" strategy="beforeInteractive">
          {`
            tailwind.config = {
              :root {
  --bg: #0d1117;
  --card: #161b22;
  --text: #e6edf3;
  --accent: #39ff14; /* neon green */
}
body {
  background: var(--bg);
  color: var(--text);
}

          `}
        </Script>
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
