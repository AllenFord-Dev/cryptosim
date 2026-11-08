// Page-to-page motion. Every in-app navigation runs through `go`, which wraps it in a View Transition
// so the old screen and the new one animate together: pushing deeper slides in from the right,
// going back slides out to the right, and switching tabs crossfades. Browsers without View
// Transitions (or with reduced motion on) just navigate.

export type NavDir = "push" | "back" | "fade";

const TABS = new Set(["/", "/market", "/missions", "/skills"]);
const depth = (path: string) => (TABS.has(path) ? 0 : path.split("/").filter(Boolean).length);

export function navDirection(from: string, to: string): NavDir {
  if (TABS.has(from) && TABS.has(to)) return "fade";
  return depth(to) < depth(from) ? "back" : "push";
}

let impl: ((href: string, dir?: NavDir) => void) | null = null;

export function setNavImpl(fn: typeof impl) {
  impl = fn;
}

export function go(href: string, dir?: NavDir) {
  if (impl) impl(href, dir);
  else window.location.assign(href);
}
