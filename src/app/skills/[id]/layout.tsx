import { SKILLS } from "@/lib/skills";

// Pre-builds every skill page so it opens instantly instead of waiting on the server.
export function generateStaticParams() {
  return SKILLS.map((s) => ({ id: s.id }));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
