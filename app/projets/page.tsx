import { JsonLd } from "@/components/JsonLd";
import { PageShell } from "@/components/site/PageShell";
import { person, projets } from "@/lib/content";
import { breadcrumbJsonLd, projectsListJsonLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  title: "Projets",
  description: `Applications web, mobiles et sites livrés par ${person.nomComplet} : Apkaid, HAMI, Sprint Job, Toud, Lordson Congo et d’autres réalisations.`,
  path: "/projets",
});

export default function ProjectsPage() {
  return (
    <PageShell current="/projets">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "Projets", path: "/projets" },
          ]),
          projectsListJsonLd(),
        ]}
      />
      <p className="chapter">Portfolio</p>
      <h1>Projets qui font avancer le métier.</h1>
      <p className="lede">
        Sites vitrines, plateformes et applications mobiles — pour des clients au Congo-Brazzaville
        et en France. Chaque fiche décrit le problème, la solution et la stack.
      </p>
      <div className="grid cards">
        {projets.map((project) => (
          <Link className="card" key={project.slug} href={`/projets/${project.slug}`}>
            <p className="meta">
              {project.categorie} · {project.annee}
            </p>
            <h2>{project.titre}</h2>
            <p>{project.description}</p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
