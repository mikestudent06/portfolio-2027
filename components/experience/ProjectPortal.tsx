"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/content";

export const ENTER_PROJECT = "mm:enter-project";
export const LEAVE_PROJECT = "mm:leave-project";

type EnterDetail = { project: Project };

function canEmbed(project: Project) {
  return Boolean(project.lien) && project.embed !== false;
}

export function ProjectPortal() {
  const [project, setProject] = useState<Project | null>(null);
  const [frameReady, setFrameReady] = useState(false);
  const [frameFailed, setFrameFailed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    document.documentElement.classList.remove("portal-open");
    setProject(null);
    setFrameReady(false);
    setFrameFailed(false);
    window.dispatchEvent(new CustomEvent(LEAVE_PROJECT));
    lastFocus.current?.focus?.();
  }, []);

  useEffect(() => {
    const onEnter = (event: Event) => {
      const detail = (event as CustomEvent<EnterDetail>).detail;
      if (!detail?.project) return;
      lastFocus.current = document.activeElement as HTMLElement | null;
      setFrameReady(false);
      setFrameFailed(false);
      setProject(detail.project);
      document.documentElement.classList.add("portal-open");
    };
    window.addEventListener(ENTER_PROJECT, onEnter);
    return () => window.removeEventListener(ENTER_PROJECT, onEnter);
  }, []);

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    const id = requestAnimationFrame(() => backRef.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(id);
    };
  }, [project, close]);

  useEffect(() => {
    if (!project || !canEmbed(project) || frameFailed) return;
    const timer = window.setTimeout(() => {
      if (!frameReady) setFrameFailed(true);
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [project, frameReady, frameFailed]);

  if (!project) return null;

  const live = Boolean(project.lien);
  const embed = canEmbed(project) && !frameFailed;
  const showFallback = !embed;

  return (
    <div
      id="project-portal"
      className="project-portal open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="portal-title"
    >
      <div className="portal-veil" aria-hidden="true" />

      <header className="portal-chrome">
        <button
          ref={backRef}
          type="button"
          className="portal-back"
          id="portal-back"
          onClick={close}
        >
          <span aria-hidden="true">←</span> Retour au bureau
        </button>

        <div className="portal-identity">
          <p className="portal-meta">
            {project.categorie} · {project.annee}
          </p>
          <h2 id="portal-title">{project.titre}</h2>
        </div>

        <div className="portal-actions">
          {live ? (
            <a
              className="portal-btn primary"
              href={project.lien}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ouvrir ailleurs
            </a>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- portal is outside App Router Link tree during overlay */}
          <a className="portal-btn ghost" href={`/projets/${project.slug}`}>
            Fiche
          </a>
        </div>
      </header>

      <div className="portal-stage" data-mode={embed ? "live" : "stage"}>
        {embed && project.lien ? (
          <>
            {!frameReady ? (
              <div className="portal-loading" aria-live="polite">
                <span className="portal-loading-bar" />
                <p>Entrée dans {project.titre.split("—")[0].trim()}…</p>
              </div>
            ) : null}
            <iframe
              ref={iframeRef}
              className={`portal-frame${frameReady ? " ready" : ""}`}
              title={`Aperçu live — ${project.titre}`}
              src={project.lien}
              referrerPolicy="no-referrer-when-downgrade"
              allow="fullscreen; clipboard-read; clipboard-write"
              onLoad={() => setFrameReady(true)}
            />
          </>
        ) : null}

        {showFallback ? (
          <div className="portal-fallback">
            <div
              className="portal-device"
              style={{ ["--portal-accent" as string]: project.couleur }}
            >
              <div className="portal-device-bar">
                <span />
                <span />
                <span />
                <p>{project.lien?.replace(/^https?:\/\//, "") ?? project.slug}</p>
              </div>
              <div className="portal-device-screen">
                {project.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- dynamic project asset
                  <img src={project.image} alt={`Interface de ${project.titre}`} />
                ) : (
                  <div
                    className="portal-device-blank"
                    style={{ background: project.couleur }}
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>

            <div className="portal-dossier">
              <p className="portal-kicker">
                {live
                  ? frameFailed || project.embed === false
                    ? "Visite guidée — ce site se réserve pour un onglet dédié"
                    : "Visite guidée"
                  : "Dossier projet"}
              </p>
              <p className="portal-desc">{project.description}</p>
              <ul className="portal-stack">
                {project.stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="portal-dossier-actions">
                {live ? (
                  <a
                    className="portal-btn primary"
                    href={project.lien}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Naviguer sur le site
                  </a>
                ) : null}
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a className="portal-btn ghost" href={`/projets/${project.slug}`}>
                  Lire la fiche
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
