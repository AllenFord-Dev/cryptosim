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
    <html lang="en">
      <body>
        <AppProvider>
          <PricesProvider>
            <UIProvider>
              <DesktopAside />
              <div className="relative mx-auto min-h-dvh w-full max-w-[430px] bg-bg sm:shadow-[0_0_40px_rgba(14,23,38,0.08)]">
                {children}
              </div>
            </UIProvider>
          </PricesProvider>
        </AppProvider>
      </body>
    </html>
  );
}
