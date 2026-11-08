import { MISSIONS } from "@/lib/missions";

// Pre-builds every mission page so it opens instantly instead of waiting on the server.
export function generateStaticParams() {
  return MISSIONS.map((m) => ({ id: m.id }));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
