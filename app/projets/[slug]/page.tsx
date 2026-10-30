import { JsonLd } from "@/components/JsonLd";
import { PageShell } from "@/components/site/PageShell";
import { getProject, person, projets } from "@/lib/content";
import { breadcrumbJsonLd, projectJsonLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return projets.map((project) => ({ slug: project.slug }));
}

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return pageMetadata({
    title: project.titre,
    description: `${project.description} Projet de ${person.nomComplet}, ${project.annee}.`,
    path: `/projets/${project.slug}`,
  });
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <PageShell current="/projets">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "Projets", path: "/projets" },
            { name: project.titre, path: `/projets/${project.slug}` },
          ]),
          projectJsonLd(project),
        ]}
      />
      <p className="chapter">
        {project.categorie} · {project.annee}
      </p>
      <h1>{project.titre}</h1>
      <p className="lede">{project.description}</p>
      {project.image ? (
        <div className="project-hero">
          {/* eslint-disable-next-line @next/next/no-img-element -- local public screenshots */}
          <img src={project.image} alt={`Interface de ${project.titre}`} />
        </div>
      ) : null}
      <div className="actions">
        {project.lien ? (
          <a className="btn" href={project.lien} target="_blank" rel="noopener noreferrer">
            {project.lienLabel ?? "Voir le projet en ligne"}
          </a>
        ) : null}
        <Link className="btn ghost" href="/contact">
          Discuter d’un projet similaire
        </Link>
      </div>

      <section className="prose">
        <h2>Problème</h2>
        <p>{project.probleme}</p>
        <h2>Ce qui a été livré</h2>
        <ul>
          {project.fonctionnalites.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h2>Stack</h2>
      </section>
      <ul className="skills">
        {project.stack.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </PageShell>
  );
}
