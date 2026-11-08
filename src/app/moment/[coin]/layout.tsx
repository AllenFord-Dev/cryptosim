import { COINS } from "@/lib/coins";

// Pre-builds every market moment page so it opens instantly instead of waiting on the server.
export function generateStaticParams() {
  return COINS.map((c) => ({ coin: c.id }));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
