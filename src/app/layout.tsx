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
    "Learn crypto before it costs you. A practice wallet and market for first-timers, with real prices and practice money.",
  appleWebApp: { capable: true, title: "CryptoSim", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#15141c" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Before first paint: pick the theme (saved choice, else the phone's setting) so nothing flashes. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("cs-theme")||"dark",m=window.matchMedia("(prefers-color-scheme: dark)");var a=function(){document.documentElement.dataset.theme=(t==="dark"||(t==="auto"&&m.matches))?"dark":"light"};a();m.addEventListener&&m.addEventListener("change",function(){t=localStorage.getItem("cs-theme")||"dark";a()})}catch(e){}`,
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
