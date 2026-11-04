"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  competences,
  copy,
  featuredProjects,
  liens,
  person,
} from "@/lib/content";
import { mountExperience } from "@/components/experience/engine";
import { ProjectPortal } from "@/components/experience/ProjectPortal";

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
          className="lamp-btn"
          aria-pressed="true"
          aria-label="Allumer ou éteindre la lampe du bureau"
        >
          Lampe · jour
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
        <p className="chapter">À propos</p>
        <h2 id="about-title">{copy.aproposTitre}</h2>
        <p className="body" id="about-body">
          {copy.apropos}
        </p>
        <ul className="skills" id="skills">
          {competences.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
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
        <p className="tip">{copy.projectsTip}</p>
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
