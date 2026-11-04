"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  copy,
  featuredProjects,
  liens,
  person,
} from "@/lib/content";
import { mountExperience } from "@/components/experience/engine";
import { ProjectPortal } from "@/components/experience/ProjectPortal";
import { NotePortal } from "@/components/experience/NotePortal";

const first = featuredProjects[0];

export function Experience() {
  useEffect(() => {
    let cancelled = false;
    let dispose = () => {};
    const frame = requestAnimationFrame(() => {
      if (cancelled) return;
      dispose = mountExperience();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      dispose();
    };
  }, []);

  return (
    <div className="experience" id="contenu">
      <div id="gl-host" className="gl-host" aria-hidden="true" />
      <div id="scroll" />

      <div className="fx" id="vignette" />
      <div className="fx" id="scan" />
      <div className="fx" id="flash-cool" />
      <div className="fx" id="flash-warm" />

      <header id="topbar">
        <Link className="mark" id="mark" href="/" aria-label="Accueil Michel Mouhani">
          MM
        </Link>
        <div className="track">
          <i id="bar" />
        </div>
        <span id="where">Le bureau</span>
        <button
          type="button"
          id="lamp-toggle"
          className="icon-btn lamp-btn"
          aria-pressed="true"
          aria-label="Passer en mode nuit"
        >
          <svg className="icon-sun" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 4.2a1 1 0 0 1 1 1V7a1 1 0 1 1-2 0V5.2a1 1 0 0 1 1-1zm0 11.3a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zm7.8-4.5H18a1 1 0 1 1 0-2h1.8a1 1 0 1 1 0 2zM6 12a1 1 0 0 1-1-1H3.2a1 1 0 1 1 0 2H5a1 1 0 0 1 1-1zm10.6 5.2a1 1 0 0 1 0 1.4l-1.3 1.3a1 1 0 1 1-1.4-1.4l1.3-1.3a1 1 0 0 1 1.4 0zM8.1 6.1a1 1 0 0 1 0 1.4L6.8 8.8A1 1 0 0 1 5.4 7.4L6.7 6.1a1 1 0 0 1 1.4 0zm9.1 0 1.3 1.3a1 1 0 1 1-1.4 1.4L15.8 7.5a1 1 0 1 1 1.4-1.4zM8.1 17.2l-1.3 1.3a1 1 0 1 1-1.4-1.4l1.3-1.3a1 1 0 0 1 1.4 1.4zM12 17a1 1 0 0 1 1 1v1.8a1 1 0 1 1-2 0V18a1 1 0 0 1 1-1z"
            />
          </svg>
          <svg className="icon-moon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M14.3 3.1a1 1 0 0 1 1.1 1.4A7.5 7.5 0 1 0 19.5 15a1 1 0 0 1 1.5.9A9.5 9.5 0 1 1 13.2 2.8a1 1 0 0 1 1.1.3z"
            />
          </svg>
        </button>
      </header>

      <section className="panel" id="hero" aria-label="Présentation">
        <h1 id="hero-name">
          <span>{person.prenom}</span>
          <span>{person.nom}</span>
        </h1>
        <p className="role" id="hero-role">
          {copy.metier}
        </p>
        <p className="hint">
          <span className="scroll-pill" aria-hidden="true" />
          {copy.heroHint}
        </p>
      </section>

      <section className="panel" id="about" aria-label="À propos">
        <h2 id="about-title">{copy.aproposTitre}</h2>
        <p className="body" id="about-body">
          {copy.apropos}
        </p>
      </section>

      <div className="panel" id="cue">
        <i />
        {copy.cue}
      </div>

      <section className="panel" id="projects" aria-label="Projets" aria-live="polite">
        <p className="chapter">
          Projet <b id="proj-num">1</b> sur <span id="proj-total">{featuredProjects.length}</span>
        </p>
        <h2 id="proj-title">{first?.titre}</h2>
        <p id="proj-meta">
          {first?.categorie}, {first?.annee}
        </p>
        <div className="counter" id="counter">
          {featuredProjects.map((project, index) => (
            <span key={project.slug} className={index === 0 ? "on" : undefined} />
          ))}
        </div>
      </section>

      <section className="panel" id="contact" aria-label="Contact">
        <h2>{copy.contactTitre}</h2>
        <p id="contact-text">{copy.contact}</p>
        <a className="mail" id="mail" href={`mailto:${person.email}`}>
          {person.email}
        </a>
        <div className="links" id="links">
          {liens.map((link) => (
            <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          ))}
        </div>
        <button className="again" id="again" type="button">
          {copy.again}
        </button>
      </section>

      <ProjectPortal />
      <NotePortal />

      <div id="loader">
        <div className="load-inner">
          <p id="load-text">{copy.loaderWait}</p>
          <h2>
            {person.prenom}
            <br />
            {person.nom}
          </h2>
          <div className="load-bar">
            <i id="load-bar" />
          </div>
          <button id="enter" type="button">
            {copy.enter}
          </button>
        </div>
      </div>
    </div>
  );
}
