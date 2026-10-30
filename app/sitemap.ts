import type { MetadataRoute } from "next";
import { projets } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-10-30");
  const staticRoutes = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/a-propos", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/projets", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/services", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.7, changeFrequency: "yearly" as const },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...projets.map((project) => ({
      url: `${SITE_URL}/projets/${project.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: project.featured ? 0.8 : 0.6,
    })),
  ];
}
