"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { notes, type Note } from "@/lib/content";

export const ENTER_NOTE = "mm:enter-note";
export const LEAVE_NOTE = "mm:leave-note";

type EnterDetail = { noteId: string };

export function NotePortal() {
  const [note, setNote] = useState<Note | null>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    document.documentElement.classList.remove("portal-open");
    setNote(null);
    window.dispatchEvent(new CustomEvent(LEAVE_NOTE));
    lastFocus.current?.focus?.();
  }, []);

  useEffect(() => {
    const onEnter = (event: Event) => {
      const detail = (event as CustomEvent<EnterDetail>).detail;
      const found = notes.find((n) => n.id === detail?.noteId);
      if (!found) return;
      lastFocus.current = document.activeElement as HTMLElement | null;
      setNote(found);
      document.documentElement.classList.add("portal-open");
    };
    window.addEventListener(ENTER_NOTE, onEnter);
    return () => window.removeEventListener(ENTER_NOTE, onEnter);
  }, []);

  useEffect(() => {
    if (!note) return;
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
  }, [note, close]);

  if (!note) return null;

  return (
    <div
      className="note-portal open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-title"
    >
      <button ref={backRef} type="button" className="portal-back note-back" onClick={close}>
        <span aria-hidden="true">←</span> Bureau
      </button>
      <article className="note-book">
        <p className="note-date">{note.date}</p>
        <h2 id="note-title">{note.titre}</h2>
        {note.corps.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </article>
    </div>
  );
}
