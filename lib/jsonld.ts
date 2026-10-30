import {
  featuredProjects,
  person,
  projets,
  sameAs,
  services,
  type Project,
} from "@/lib/content";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { seo as seoCopy } from "@/lib/content";

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: person.nomComplet,
    givenName: person.prenom,
    familyName: person.nom,
    jobTitle: person.jobTitle,
    description: seoCopy.description,
    url: SITE_URL,
    image: absoluteUrl("/opengraph-image"),
    email: person.email,
    telephone: person.telephone,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pointe-Noire",
      addressCountry: "CG",
    },
    worksFor: {
      "@type": "Organization",
      name: "Apkaid",
      url: "https://apkaid.com/",
    },
    knowsAbout: [
      "Next.js",
      "React",
      "React Native",
      "Node.js",
      "TypeScript",
      "SEO",
      "Développement web",
      "Développement mobile",
    ],
    sameAs,
    nationality: {
      "@type": "Country",
      name: "Congo-Brazzaville",
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: `${person.nomComplet} — Portfolio`,
    url: SITE_URL,
    inLanguage: "fr-FR",
    description: seoCopy.description,
    publisher: { "@id": `${SITE_URL}/#person` },
  };
}

export function professionalServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#business`,
    name: `${person.nomComplet} — ${person.jobTitle}`,
    description:
      "Développement web et mobile au Congo-Brazzaville : sites vitrines, e-commerce, applications web et applications natives.",
    url: SITE_URL,
    image: absoluteUrl("/opengraph-image"),
    email: person.email,
    telephone: person.telephone,
    areaServed: [
      { "@type": "Country", name: "Congo-Brazzaville" },
      { "@type": "Country", name: "France" },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pointe-Noire",
      addressCountry: "CG",
    },
    founder: { "@id": `${SITE_URL}/#person` },
    provider: { "@id": `${SITE_URL}/#person` },
    serviceType: services.map((service) => service.titre),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services de développement",
      itemListElement: services.map((service, index) => ({
        "@type": "Offer",
        position: index + 1,
        itemOffered: {
          "@type": "Service",
          name: service.titre,
          description: service.description,
          url: absoluteUrl("/services"),
        },
      })),
    },
    sameAs,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function projectJsonLd(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.titre,
    description: project.description,
    dateCreated: project.annee,
    creator: { "@id": `${SITE_URL}/#person` },
    inLanguage: "fr-FR",
    keywords: project.stack.join(", "),
    url: absoluteUrl(`/projets/${project.slug}`),
    ...(project.lien ? { sameAs: project.lien } : {}),
  };
}

export function projectsListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Projets de Michel Mouhani",
    itemListElement: projets.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/projets/${project.slug}`),
      name: project.titre,
    })),
  };
}

export function featuredItemListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Projets mis en avant",
    itemListElement: featuredProjects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/projets/${project.slug}`),
      name: project.titre,
    })),
  };
}
