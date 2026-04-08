import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aether — Manifold Intelligence",
  description: "Autonomous yield engine powered by AION, ASTRA & LILYAN. Measurement over Mimesis.",
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
