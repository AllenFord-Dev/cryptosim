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
import { NavMotion } from "@/components/nav-motion";

export const metadata: Metadata = {
  title: "CryptoSim · Practice crypto safely",
  description:
    "Learn crypto before it costs you. A practice wallet and market for first-timers, with real prices and practice money.",
  appleWebApp: { capable: true, title: "CryptoSim", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
        { color: "#15141c" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* CryptoSim is dark-only: set it before first paint so nothing flashes. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.dataset.theme="dark"`,
          }}
        />
        {/* Before first paint: returning users get the launch animation once per session; otherwise skip the cover. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=JSON.parse(localStorage.getItem("cryptosim-v2")||"null"),d=document.documentElement;if(s&&s.onboarded){if(sessionStorage.getItem("cs-launch")==="1")d.dataset.nosplash="1";else d.dataset.launch="1"}}catch(e){}`,
          }}
        />
      </head>
      <body>
        <AppProvider>
          <PricesProvider>
            <NavMotion />
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
