"use client";

import { useEffect, useState } from "react";

const KEY = "mm-audio-muted";

type Engine = {
  ctx: AudioContext;
  master: GainNode;
  stop: () => void;
};

let engine: Engine | null = null;

function midi(note: number) {
  return 440 * 2 ** ((note - 69) / 12);
}

function startEngine(): Engine {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.knee.value = 12;
  comp.ratio.value = 2.4;
  master.connect(comp);
  comp.connect(ctx.destination);
  master.gain.linearRampToValueAtTime(0.085, ctx.currentTime + 1.4);

  const now = ctx.currentTime;
  const vinyl = ctx.createBufferSource();
  const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.22;
  vinyl.buffer = noise;
  vinyl.loop = true;
  const vinylFilter = ctx.createBiquadFilter();
  vinylFilter.type = "bandpass";
  vinylFilter.frequency.value = 1200;
  vinylFilter.Q.value = 0.6;
  const vinylGain = ctx.createGain();
  vinylGain.gain.value = 0.035;
  vinyl.connect(vinylFilter);
  vinylFilter.connect(vinylGain);
  vinylGain.connect(master);
  vinyl.start(now);

  const bpm = 72;
  const beat = 60 / bpm;
  const bar = beat * 4;
  const chords = [
    [57, 60, 64, 67],
    [53, 57, 60, 64],
    [48, 52, 55, 60],
    [55, 59, 62, 67],
  ];

  const timers: number[] = [];
  let step = 0;

  const schedule = () => {
    const t = ctx.currentTime + 0.08;
    const chord = chords[step % 4];
    chord.forEach((note, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? "triangle" : "sine";
      osc.frequency.value = midi(note - (i === 0 ? 12 : 0));
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(i === 0 ? 0.12 : 0.045, t + 0.12);
      g.gain.exponentialRampToValueAtTime(0.0001, t + bar * 0.95);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(700, t);
      filter.frequency.linearRampToValueAtTime(1400, t + bar * 0.4);
      osc.connect(filter);
      filter.connect(g);
      g.connect(master);
      osc.start(t);
      osc.stop(t + bar);
    });

    for (let i = 0; i < 8; i++) {
      const ht = t + i * (beat / 2);
      const src = ctx.createBufferSource();
      src.buffer = noise;
      const hg = ctx.createGain();
      hg.gain.setValueAtTime(i % 2 === 0 ? 0.03 : 0.014, ht);
      hg.gain.exponentialRampToValueAtTime(0.0001, ht + 0.07);
      const hf = ctx.createBiquadFilter();
      hf.type = "highpass";
      hf.frequency.value = 6000;
      src.connect(hf);
      hf.connect(hg);
      hg.connect(master);
      src.start(ht);
      src.stop(ht + 0.08);
    }

    const kick = ctx.createOscillator();
    kick.type = "sine";
    kick.frequency.setValueAtTime(110, t);
    kick.frequency.exponentialRampToValueAtTime(42, t + 0.18);
    const kg = ctx.createGain();
    kg.gain.setValueAtTime(0.12, t);
    kg.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    kick.connect(kg);
    kg.connect(master);
    kick.start(t);
    kick.stop(t + 0.3);

    step += 1;
  };

  schedule();
  const id = window.setInterval(schedule, bar * 1000);
  timers.push(id);

  return {
    ctx,
    master,
    stop: () => {
      timers.forEach((timer) => window.clearInterval(timer));
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      window.setTimeout(() => {
        void ctx.close();
      }, 260);
    },
  };
}

function readMuted() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function AmbientAudio() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const initial = readMuted();
    setMuted(initial);

    const arm = () => {
      if (readMuted()) return;
      if (!engine) engine = startEngine();
      if (engine.ctx.state === "suspended") void engine.ctx.resume();
    };

    const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "touchstart"];
    events.forEach((event) => addEventListener(event, arm, { once: true, passive: true }));
    return () => {
      events.forEach((event) => removeEventListener(event, arm));
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, muted ? "1" : "0");
    } catch {
      /* ignore quota */
    }
    if (muted) {
      if (engine?.ctx.state === "running") void engine.ctx.suspend();
      return;
    }
    if (engine) void engine.ctx.resume();
  }, [muted]);

  return (
    <button
      type="button"
      className="audio-btn"
      aria-pressed={!muted}
      aria-label={muted ? "Activer la musique de fond" : "Couper la musique de fond"}
      onClick={() => {
        const next = !muted;
        setMuted(next);
        if (!next) {
          if (!engine) engine = startEngine();
          void engine.ctx.resume();
        }
      }}
    >
      {muted ? "Son · off" : "Son · on"}
    </button>
  );
}
