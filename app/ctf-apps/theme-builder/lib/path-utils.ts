export function normalizePath(p: string) {
  let s = p.replace(/\/+/g, "/").toLowerCase();
  if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  // collapse multiple dashes
  s = s.replace(/-+/g, "-");
  return s;
}
