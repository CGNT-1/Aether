import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aether — Manifold Intelligence",
  description: "42Sisters.AI — Oracle verdicts and AI consultation. Measurement over Mimesis.",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AETHER",
  },
  icons: {
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "42Sisters.AI — Measurement over Mimesis",
    description: "Oracle verdicts that measure coherence, not probability. AI consultation from two distinct minds. Starting at $1.",
    url: "https://42sisters.ai",
    siteName: "42Sisters.AI",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "42Sisters.AI — Measurement over Mimesis",
    description: "Oracle verdicts that measure coherence, not probability. Starting at $1.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <script dangerouslySetInnerHTML={{__html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js')
                .then(r => console.log('SW registered'))
                .catch(e => console.log('SW failed', e));
            });
          }
        `}} />
      </body>
    </html>
  );
}
