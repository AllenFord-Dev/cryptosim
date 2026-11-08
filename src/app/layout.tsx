import type { Metadata, Viewport } from "next";
import "@fontsource/hanken-grotesk/400.css";
import "@fontsource/hanken-grotesk/500.css";
import "@fontsource/hanken-grotesk/600.css";
import "@fontsource/hanken-grotesk/700.css";
import "@fontsource/hanken-grotesk/800.css";
import "@fontsource/geist-mono/500.css";
import "@fontsource/geist-mono/700.css";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { PricesProvider } from "@/lib/prices";
import { UIProvider } from "@/components/shell";
import { DesktopAside } from "@/components/aside";
import { Device } from "@/components/device";

export const metadata: Metadata = {
  title: "CryptoSim · Practice crypto safely",
  description:
    "A practice crypto wallet and market for first-timers. Make your first mistakes here, not with your money.",
  appleWebApp: { capable: true, title: "CryptoSim", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Already set up: skip the purple launch cover before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: `try{var s=JSON.parse(localStorage.getItem("cryptosim-v2")||"null");if(s&&s.onboarded)document.documentElement.dataset.nosplash="1"}catch(e){}` }} />
      </head>
      <body>
        <AppProvider>
          <PricesProvider>
            <DesktopAside />
            <Device>
              <UIProvider>
                <div className="app-root relative mx-auto min-h-[var(--app-h)] w-full max-w-[430px] bg-bg">{children}</div>
              </UIProvider>
            </Device>
          </PricesProvider>
        </AppProvider>
      </body>
    </html>
  );
}
