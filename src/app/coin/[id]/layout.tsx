import { COINS } from "@/lib/coins";

// Pre-builds every coin page so it opens instantly instead of waiting on the server.
export function generateStaticParams() {
  return COINS.map((c) => ({ id: c.id }));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
