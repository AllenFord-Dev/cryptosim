import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CryptoSim · Practice crypto safely",
    short_name: "CryptoSim",
    description: "A practice crypto wallet and market for first-timers. Real prices, practice money.",
    start_url: "/",
    display: "standalone",
    background_color: "#5521F5",
    theme_color: "#FFFFFF",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
