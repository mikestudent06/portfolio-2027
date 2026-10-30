export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://michelmouhani.apkaid.com"
).replace(/\/$/, "");

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized === "/" ? "" : normalized}`;
}
