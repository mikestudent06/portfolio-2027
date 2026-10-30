import type { MetadataRoute } from "next";
import { person, seo } from "@/lib/content";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${person.nomComplet} — ${person.jobTitle}`,
    short_name: person.nomComplet,
    description: seo.description,
    start_url: "/",
    display: "standalone",
    background_color: "#e4e9ee",
    theme_color: "#1d3b8a",
    lang: "fr",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
