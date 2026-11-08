import { SKILLS } from "@/lib/skills";

// Pre-builds every lesson page so it opens instantly instead of waiting on the server.
export function generateStaticParams() {
  return SKILLS.map((s) => ({ skill: s.id }));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
