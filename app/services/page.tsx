import { JsonLd } from "@/components/JsonLd";
import { PageShell } from "@/components/site/PageShell";
import { person, services, valeurs } from "@/lib/content";
import { breadcrumbJsonLd, professionalServiceJsonLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  title: "Services",
  description: `Sites vitrines, applications web, apps mobiles et e-commerce par ${person.nomComplet} à Pointe-Noire, Congo-Brazzaville.`,
  path: "/services",
});

export default function ServicesPage() {
  return (
    <PageShell current="/services">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "Services", path: "/services" },
          ]),
          professionalServiceJsonLd(),
        ]}
      />
      <p className="chapter">Offre</p>
      <h1>Du brief au produit en ligne.</h1>
      <p className="lede">
        Je conçois et développe des produits numériques complets — pas seulement une maquette, pas
        seulement un backend. L’objectif : un outil utile, rapide, et trouvable.
      </p>
      <div className="grid cards">
        {services.map((service) => (
          <article className="card" key={service.slug}>
            <h2>{service.titre}</h2>
            <p>{service.description}</p>
          </article>
        ))}
      </div>
      <section aria-labelledby="values-title">
        <h2 id="values-title">La manière de travailler</h2>
        <div className="grid cards">
          {valeurs.map((item) => (
            <article className="card" key={item.titre}>
              <h3>{item.titre}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>
      <div className="actions">
        <Link className="btn" href="/contact">
          Lancer un projet
        </Link>
        <Link className="btn ghost" href="/projets">
          Voir des exemples
        </Link>
      </div>
    </PageShell>
  );
}
