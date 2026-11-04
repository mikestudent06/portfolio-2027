import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { copy, featuredProjects, notes, type Note, type Project } from "@/lib/content";
import { paintCity, paintTerrace } from "@/components/experience/outdoor";

gsap.registerPlugin(ScrollTrigger);

let live = false;

const $ = (id: string) => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing #${id}`);
  return el;
};

function hushWebGLLogs<T>(fn: () => T): T {
  const error = console.error;
  const warn = console.warn;
  const ignore = (args: unknown[]) =>
    args.some((arg) => /webgl|ANGLE|EGL/i.test(String(arg)));
  console.error = (...args: unknown[]) => {
    if (!ignore(args)) error.apply(console, args);
  };
  console.warn = (...args: unknown[]) => {
    if (!ignore(args)) warn.apply(console, args);
  };
  try {
    return fn();
  } finally {
    console.error = error;
    console.warn = warn;
  }
}

function configureRenderer(renderer: THREE.WebGLRenderer, small: boolean) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !small;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

function createRenderer(
  host: HTMLElement,
  small: boolean,
): { renderer: THREE.WebGLRenderer; canvas: HTMLCanvasElement } | null {
  const params: Omit<THREE.WebGLRendererParameters, "canvas"> = {
    antialias: true,
    alpha: false,
    powerPreference: "default",
    failIfMajorPerformanceCaveat: false,
    stencil: false,
    depth: true,
  };

  const errors: unknown[] = [];
  const tryCtor = (Ctor: typeof THREE.WebGLRenderer | typeof THREE.WebGL1Renderer) => {
    const canvas = document.createElement("canvas");
    canvas.id = "gl";
    canvas.setAttribute("aria-hidden", "true");
    host.replaceChildren(canvas);
    try {
      const renderer = new Ctor({ canvas, ...params });
      configureRenderer(renderer, small);
      return { renderer, canvas };
    } catch (err) {
      errors.push(err);
      canvas.remove();
      return null;
    }
  };

  const created = hushWebGLLogs(
    () => tryCtor(THREE.WebGLRenderer) ?? tryCtor(THREE.WebGL1Renderer),
  );
  if (!created) console.warn("WebGL indisponible, passage en mode statique.", ...errors);
  return created;
}

function mountWithoutWebGL(): () => void {
  document.documentElement.classList.add("experience-static");
  document.documentElement.style.overflow = "";
  const root = document.querySelector(".experience");
  root?.classList.add("is-static");
  const loadText = document.getElementById("load-text");
  if (loadText) loadText.textContent = "Le bureau est prêt.";
  const bar = document.getElementById("load-bar");
  if (bar) bar.style.width = "100%";
  const enter = document.getElementById("enter") as HTMLButtonElement | null;
  if (enter) {
    enter.style.opacity = "1";
    enter.style.visibility = "visible";
  }
  const onEnter = () => {
    gsap.to("#loader", { autoAlpha: 0, duration: 0.6, ease: "power2.inOut" });
    gsap.to(".panel", { autoAlpha: 1, y: 0, x: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" });
  };
  enter?.addEventListener("click", onEnter);
  enter?.focus({ preventScroll: true });
  return () => {
    enter?.removeEventListener("click", onEnter);
    document.documentElement.classList.remove("experience-static");
    root?.classList.remove("is-static");
  };
}

type Card = {
  grp: THREE.Group;
  mesh: THREE.Mesh;
  glow: THREE.Mesh;
  side: number;
  hover: number;
  z: number;
};

export function mountExperience(): () => void {
  if (live) return () => {};
  live = true;

  const small = Math.min(innerWidth, innerHeight) < 700;
  const created = createRenderer($("gl-host"), small);
  if (!created) {
    live = false;
    return mountWithoutWebGL();
  }

  const { renderer, canvas } = created;
  const projects = featuredProjects;
  const cleanups: Array<() => void> = [];
  const FONT = getComputedStyle(document.body).fontFamily;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  document.documentElement.style.overflow = "hidden";
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  function rng(seed: number) {
    return () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function canvasTex(
    w: number,
    h: number,
    draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
    repeat?: [number, number],
  ) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d") as CanvasRenderingContext2D, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAniso;
    if (repeat) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(repeat[0], repeat[1]);
    }
    return t;
  }

  function redraw(
    tex: THREE.CanvasTexture,
    fn: (g: CanvasRenderingContext2D, w: number, h: number) => void,
  ) {
    const c = tex.image as HTMLCanvasElement;
    const g = c.getContext("2d");
    if (!g) return;
    g.clearRect(0, 0, c.width, c.height);
    fn(g, c.width, c.height);
    tex.needsUpdate = true;
  }

  const std = (
    color: number,
    rough = 0.85,
    metal = 0,
    extra: THREE.MeshStandardMaterialParameters = {},
  ) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness: rough,
      metalness: metal,
      ...extra,
    });

  function box(
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D,
    shadow = true,
  ) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = shadow;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  function cyl(
    rTop: number,
    rBot: number,
    h: number,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D,
    segs = 16,
  ) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  function limb(
    a: THREE.Vector3,
    b: THREE.Vector3,
    r: number,
    mat: THREE.Material,
    parent: THREE.Object3D,
  ) {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.92, len, 16), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    m.castShadow = true;
    parent.add(m);
    const s = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat);
    s.position.copy(b);
    s.castShadow = true;
    parent.add(s);
    return m;
  }

  const room = new THREE.Scene();
  const roomCam = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.02, 60);

  const oakTex = canvasTex(
    512,
    512,
    (g, w, h) => {
      g.fillStyle = "#cbb08a";
      g.fillRect(0, 0, w, h);
      const r = rng(7);
      const rows = 8;
      const plankH = h / rows;
      for (let row = 0; row < rows; row++) {
        const y = row * plankH;
        const cols = 4;
        const stagger = row % 2 === 0 ? 0 : w / (cols * 2);
        let x = -stagger;
        while (x < w) {
          const pw = w / cols + (r() - 0.5) * 10;
          const warm = 168 + r() * 38;
          g.fillStyle = `rgb(${warm + 32},${warm - 4},${warm - 52})`;
          g.fillRect(x, y, pw - 1.2, plankH - 1.2);
          g.strokeStyle = `rgba(92,62,28,${0.16 + r() * 0.12})`;
          g.lineWidth = 1;
          g.strokeRect(x + 0.5, y + 0.5, pw - 1.2, plankH - 1.2);
          for (let i = 0; i < 7; i++) {
            g.strokeStyle = `rgba(120,82,40,${0.04 + r() * 0.07})`;
            g.beginPath();
            const gx = x + 4 + r() * (pw - 8);
            g.moveTo(gx, y + 1);
            g.lineTo(gx + (r() - 0.5) * 5, y + plankH - 1);
            g.stroke();
          }
          x += pw;
        }
      }
    },
    [7, 7],
  );

  const rugTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#2b3344";
    g.fillRect(0, 0, w, h);
    const r = rng(11);
    for (let i = 0; i < 500; i++) {
      g.fillStyle = `rgba(255,255,255,${r() * 0.05})`;
      g.fillRect(r() * w, r() * h, 2, 2);
    }
    g.strokeStyle = "rgba(214,196,160,0.4)";
    g.lineWidth = 14;
    g.strokeRect(10, 10, w - 20, h - 20);
    g.strokeStyle = "rgba(214,196,160,0.18)";
    g.lineWidth = 4;
    g.strokeRect(22, 22, w - 44, h - 44);
  });

  const skyDay = canvasTex(64, 128, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "#7eb7ea");
    gr.addColorStop(0.45, "#c5e3f6");
    gr.addColorStop(1, "#f4f1de");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  });

  const skyNight = canvasTex(64, 128, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "#070b16");
    gr.addColorStop(0.6, "#152238");
    gr.addColorStop(1, "#1c2433");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    const r = rng(19);
    for (let i = 0; i < 28; i++) {
      g.fillStyle = `rgba(255,255,255,${0.35 + r() * 0.55})`;
      g.fillRect(r() * w, r() * h * 0.7, 1, 1);
    }
  });

  const woodTex = canvasTex(256, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, 0);
    gr.addColorStop(0, "#b0602c");
    gr.addColorStop(0.5, "#c47a42");
    gr.addColorStop(1, "#ad5d2a");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    const r = rng(9);
    for (let i = 0; i < 70; i++) {
      g.strokeStyle = `rgba(${90 + r() * 40},${40 + r() * 20},15,${0.08 + r() * 0.14})`;
      g.lineWidth = 0.6 + r() * 2.2;
      g.beginPath();
      let x = r() * w;
      g.moveTo(x, 0);
      for (let y = 0; y <= h; y += 16) {
        x += (r() - 0.5) * 3;
        g.lineTo(x + Math.sin(y * 0.02 + i) * 3, y);
      }
      g.stroke();
    }
  });

  const shirtTex = canvasTex(
    256,
    256,
    (g, w, h) => {
      g.fillStyle = "#f2f4f7";
      g.fillRect(0, 0, w, h);
      const r = rng(12);
      for (let y = 8; y < h; y += 16)
        for (let x = 8; x < w; x += 16) {
          const ox = ((y / 16) % 2) * 8;
          g.save();
          g.translate(x + ox, y);
          g.rotate(r() * Math.PI);
          g.strokeStyle = r() > 0.5 ? "rgba(70,90,130,.55)" : "rgba(130,140,155,.5)";
          g.lineWidth = 1.4;
          g.beginPath();
          for (let k = 0; k < 3; k++) {
            const a = k * 2.094;
            g.moveTo(0, 0);
            g.lineTo(Math.cos(a) * 3.2, Math.sin(a) * 3.2);
          }
          g.stroke();
          g.restore();
        }
    },
    [3, 3],
  );

  const laptopScreenTex = canvasTex(512, 340, (g, w, h) => {
    g.fillStyle = "#0e1622";
    g.fillRect(0, 0, w, h);
    const r = rng(3);
    const cols = ["#7fd4e0", "#8fa8ff", "#f0a060", "#c9d2df"];
    for (let i = 0; i < 18; i++) {
      let x = 24 + Math.floor(r() * 4) * 22;
      const y = 26 + i * 17;
      const n = 1 + Math.floor(r() * 4);
      for (let k = 0; k < n; k++) {
        const len = 30 + r() * 110;
        g.fillStyle = cols[Math.floor(r() * 4)];
        g.globalAlpha = 0.75;
        g.fillRect(x, y, len, 7);
        x += len + 10;
      }
    }
  });

  const M = {
    wall: std(0xe7e2d8, 0.96),
    floor: std(0xffffff, 0.58, 0, { map: oakTex }),
    wood: std(0xffffff, 0.55, 0, { map: woodTex }),
    woodDark: std(0x6f3f22, 0.55),
    oakPale: std(0xd4c0a0, 0.52),
    desk: std(0xeee8e1, 0.42),
    deskLeg: std(0xf4f2ee, 0.35, 0.25),
    chair: std(0x1c2744, 0.58),
    chrome: std(0xd7dbe0, 0.25, 0.9),
    brass: std(0xc4a15a, 0.28, 0.82),
    ceramic: std(0xeee8e0, 0.32),
    leaf: std(0x3a6b47, 0.78),
    leafDark: std(0x2a4e35, 0.82),
    frame: std(0x1a1a1a, 0.42),
    rug: std(0xffffff, 0.92, 0, { map: rugTex }),
    plastic: std(0x16191f, 0.45, 0.1),
    plasticMid: std(0x2a2e36, 0.5, 0.2),
    skin: std(0x5c3a28, 0.6),
    hair: std(0x17110e, 0.95),
    shirt: std(0xffffff, 0.8, 0, { map: shirtTex }),
    trousers: std(0x252935, 0.8),
    button: std(0x1d3b8a, 0.4),
    white: std(0xf7f4ef, 0.9),
  };

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), M.floor);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  room.add(floor);

  const wallShape = new THREE.Shape();
  wallShape.moveTo(-6, 0);
  wallShape.lineTo(6, 0);
  wallShape.lineTo(6, 3.4);
  wallShape.lineTo(-6, 3.4);
  wallShape.lineTo(-6, 0);
  const hole = new THREE.Path();
  hole.moveTo(2.1, 0);
  hole.lineTo(3.1, 0);
  hole.lineTo(3.1, 2.2);
  hole.lineTo(2.1, 2.2);
  hole.lineTo(2.1, 0);
  wallShape.holes.push(hole);
  const backWall = new THREE.Mesh(new THREE.ShapeGeometry(wallShape), M.wall);
  backWall.position.z = -4;
  backWall.receiveShadow = true;
  room.add(backWall);
  const lw = new THREE.Mesh(new THREE.PlaneGeometry(12, 3.4), M.wall);
  lw.position.set(-5, 1.7, 1);
  lw.rotation.y = Math.PI / 2;
  lw.receiveShadow = true;
  room.add(lw);
  const rw = new THREE.Mesh(new THREE.PlaneGeometry(12, 3.4), M.wall);
  rw.position.set(5.5, 1.7, 1);
  rw.rotation.y = -Math.PI / 2;
  room.add(rw);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), std(0xf6f3ee, 1));
  ceil.position.y = 3.4;
  ceil.rotation.x = Math.PI / 2;
  room.add(ceil);
  box(12, 0.1, 0.02, M.white, 0, 0.05, -3.98, room, false);
  box(0.03, 0.1, 12, M.white, -4.98, 0.05, 1, room, false);
  box(0.08, 0.12, 0.02, M.white, 0.55, 1.18, -3.98, room, false);

  const cityCanvas = document.createElement("canvas");
  cityCanvas.width = 512;
  cityCanvas.height = 512;
  const cityCtx = cityCanvas.getContext("2d") as CanvasRenderingContext2D;
  paintCity(cityCtx, 512, 512, 0, false);
  const cityTex = new THREE.CanvasTexture(cityCanvas);
  cityTex.colorSpace = THREE.SRGBColorSpace;
  cityTex.anisotropy = maxAniso;

  const terraceCanvas = document.createElement("canvas");
  terraceCanvas.width = 512;
  terraceCanvas.height = 512;
  const terraceCtx = terraceCanvas.getContext("2d") as CanvasRenderingContext2D;
  paintTerrace(terraceCtx, 512, 512, 0, false);
  const terraceTex = new THREE.CanvasTexture(terraceCanvas);
  terraceTex.colorSpace = THREE.SRGBColorSpace;
  terraceTex.anisotropy = maxAniso;

  const cityMat = new THREE.MeshBasicMaterial({ map: cityTex, toneMapped: false });
  const skyMat = new THREE.MeshBasicMaterial({
    map: skyDay,
    toneMapped: false,
    transparent: true,
    opacity: 0.82,
  });

  const roomPick: THREE.Object3D[] = [];
  const markPick = (obj: THREE.Object3D, data: Record<string, string>) => {
    obj.userData.interact = data;
    roomPick.push(obj);
    return obj;
  };

  let windowOpen = false;
  let doorForced = false;

  const win = new THREE.Group();
  win.position.set(-4.97, 1.72, 1.45);
  win.rotation.y = Math.PI / 2;
  room.add(win);
  box(1.52, 1.96, 0.05, M.oakPale, 0, 0, 0, win);
  box(1.32, 1.76, 0.01, cityMat, 0, 0, -0.02, win, false);
  const sashL = new THREE.Group();
  sashL.position.set(-0.33, 0, 0.02);
  win.add(sashL);
  const sashR = new THREE.Group();
  sashR.position.set(0.33, 0, 0.02);
  win.add(sashR);
  const glassL = box(0.64, 1.72, 0.02, skyMat, 0.32, 0, 0, sashL, false);
  const glassR = box(0.64, 1.72, 0.02, skyMat, -0.32, 0, 0, sashR, false);
  markPick(glassL, { type: "window" });
  markPick(glassR, { type: "window" });
  box(0.03, 1.76, 0.04, M.oakPale, 0, 0, 0.03, win, false);
  box(1.32, 0.03, 0.04, M.oakPale, 0, 0, 0.03, win, false);
  markPick(box(1.56, 0.04, 0.08, M.oakPale, 0, -1.0, 0.02, win), { type: "window" });

  const winBack = new THREE.Group();
  winBack.position.set(-2.18, 2.12, -3.97);
  room.add(winBack);
  box(1.72, 1.18, 0.05, M.oakPale, 0, 0, 0, winBack);
  box(1.52, 0.98, 0.01, cityMat, 0, 0, -0.02, winBack, false);
  const backSash = new THREE.Group();
  backSash.position.set(0, 0, 0.02);
  winBack.add(backSash);
  markPick(box(1.52, 0.98, 0.02, skyMat, 0, 0, 0, backSash, false), { type: "window" });
  box(0.03, 0.98, 0.04, M.oakPale, 0, 0, 0.03, winBack, false);
  box(1.52, 0.03, 0.04, M.oakPale, 0, 0, 0.03, winBack, false);

  function setWindowOpen(open: boolean) {
    if (open === windowOpen) return;
    windowOpen = open;
    const ease = reduceMotion ? "none" : "power2.out";
    const dur = reduceMotion ? 0.01 : 0.55;
    gsap.to(sashL.rotation, { y: open ? -1.15 : 0, duration: dur, ease });
    gsap.to(sashR.rotation, { y: open ? 1.15 : 0, duration: dur, ease });
    gsap.to(backSash.rotation, { x: open ? -1.05 : 0, duration: dur, ease });
    gsap.to(skyMat, { opacity: open ? 0.08 : 0.82, duration: dur, ease });
  }

  const kolinguaTex = new THREE.TextureLoader().load("/projets/kolingua.png");
  kolinguaTex.colorSpace = THREE.SRGBColorSpace;
  kolinguaTex.anisotropy = maxAniso;
  box(0.92, 0.68, 0.03, M.frame, 0.2, 2.2, -3.97, room);
  const featuredArt = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.56),
    new THREE.MeshBasicMaterial({ map: kolinguaTex, toneMapped: false }),
  );
  featuredArt.position.set(0.2, 2.2, -3.952);
  room.add(featuredArt);
  markPick(featuredArt, { type: "project", slug: "kolingua" });
  box(0.4, 0.52, 0.03, M.frame, 0.95, 2.14, -3.97, room);
  const featuredBadge = box(0.3, 0.42, 0.012, std(0xc45a28, 0.85), 0.95, 2.14, -3.952, room, false);
  markPick(featuredBadge, { type: "project", slug: "kolingua" });

  const beyond = new THREE.Mesh(
    new THREE.PlaneGeometry(5.2, 4.2),
    new THREE.MeshBasicMaterial({ map: terraceTex, toneMapped: false }),
  );
  beyond.position.set(2.6, 1.6, -5.35);
  room.add(beyond);
  box(1.6, 0.04, 1.4, new THREE.MeshBasicMaterial({ color: 0xc4a882 }), 2.6, 0.02, -4.7, room, false);
  box(1.6, 0.35, 0.04, new THREE.MeshBasicMaterial({ color: 0xe8dfd0 }), 2.6, 0.2, -4.05, room, false);

  const jamb = M.woodDark;
  box(0.1, 2.3, 0.16, jamb, 2.05, 1.15, -4, room);
  box(0.1, 2.3, 0.16, jamb, 3.15, 1.15, -4, room);
  box(1.2, 0.1, 0.16, jamb, 2.6, 2.25, -4, room);
  const doorPivot = new THREE.Group();
  doorPivot.position.set(2.1, 0, -4);
  room.add(doorPivot);
  const doorLeaf = box(1.0, 2.2, 0.05, M.wood, 0.5, 1.1, 0, doorPivot);
  markPick(doorLeaf, { type: "door" });
  (
    [
      [0.27, 1.55, 0.32, 0.9],
      [0.73, 1.55, 0.32, 0.9],
      [0.27, 0.55, 0.32, 0.8],
      [0.73, 0.55, 0.32, 0.8],
    ] as const
  ).forEach(([x, y, w, h]) => markPick(box(w, h, 0.025, M.wood, x, y, 0.035, doorPivot), { type: "door" }));
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 12), M.chrome);
  handle.rotation.z = Math.PI / 2;
  handle.position.set(0.88, 1.05, 0.07);
  doorPivot.add(handle);
  markPick(handle, { type: "door" });

  function setDoorForced(open: boolean) {
    doorForced = open;
  }

  const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 2.05), M.rug);
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0.08, 0.012, -0.35);
  rug.receiveShadow = true;
  room.add(rug);

  box(2.6, 0.045, 1.15, M.desk, 0, 0.75, -0.15, room);
  box(2.48, 0.06, 1.08, std(0xe0d8ce, 0.5), 0, 0.7, -0.15, room);
  (
    [
      [-1.25, -0.65],
      [1.25, -0.65],
      [-1.25, 0.38],
      [1.25, 0.38],
    ] as const
  ).forEach(([x, z]) => box(0.05, 0.73, 0.05, M.deskLeg, x, 0.365, z, room));

  const monitor = new THREE.Group();
  monitor.position.set(-0.45, 0.775, 0.2);
  monitor.rotation.y = 2.75;
  room.add(monitor);
  box(0.26, 0.015, 0.18, M.plastic, 0, 0.008, 0, monitor);
  box(0.045, 0.36, 0.03, M.plastic, 0, 0.19, -0.05, monitor);
  box(0.98, 0.58, 0.035, M.plastic, 0, 0.43, 0, monitor);
  // The camera ends up filling the viewport with this screen, so match its resolution.
  const rtSize: [number, number] = [0, 0];
  const sizeScreen = () => {
    const w = Math.round(THREE.MathUtils.clamp(innerWidth * renderer.getPixelRatio(), 1024, 2560));
    rtSize[0] = w;
    rtSize[1] = Math.round((w * 9) / 16);
  };
  sizeScreen();
  const rt = new THREE.WebGLRenderTarget(rtSize[0], rtSize[1], {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    colorSpace: THREE.SRGBColorSpace,
    samples: renderer.capabilities.isWebGL2 ? 4 : 0,
  });
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.5),
    new THREE.MeshBasicMaterial({ map: rt.texture, toneMapped: false }),
  );
  screen.position.set(0, 0.43, 0.0185);
  monitor.add(screen);
  const screenLight = new THREE.PointLight(0x7fd4e0, 0.4, 3, 2);
  screenLight.position.set(0, 0.43, 0.4);
  monitor.add(screenLight);

  const laptop = new THREE.Group();
  laptop.position.set(0.17, 0.777, -0.4);
  room.add(laptop);
  box(0.36, 0.018, 0.25, M.plasticMid, 0, 0.009, 0, laptop);
  box(0.32, 0.002, 0.12, M.plastic, 0, 0.019, 0.02, laptop, false);
  const lid = new THREE.Group();
  lid.position.set(0, 0.018, 0.125);
  lid.rotation.x = 0.28;
  laptop.add(lid);
  box(0.36, 0.24, 0.012, M.plasticMid, 0, 0.12, 0, lid);
  const lscreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.33, 0.21),
    new THREE.MeshBasicMaterial({ map: laptopScreenTex, toneMapped: false }),
  );
  lscreen.position.set(0, 0.12, -0.0065);
  lscreen.rotation.y = Math.PI;
  lid.add(lscreen);

  box(1.45, 0.42, 0.4, M.oakPale, -2.05, 0.21, -3.58, room);
  box(1.45, 0.03, 0.42, M.desk, -2.05, 0.43, -3.58, room);
  box(0.02, 0.36, 0.38, std(0xcfc4b4, 0.5), -2.05, 0.21, -3.58, room, false);
  // Decorative desk stacks only — blog interaction lives on the left shelf
  box(0.16, 0.03, 0.11, std(0x8b2e2e, 0.7), -2.42, 0.46, -3.5, room);
  box(0.16, 0.025, 0.12, std(0x1f3a5f, 0.7), -2.42, 0.488, -3.5, room);
  box(0.16, 0.028, 0.1, std(0xc4a35a, 0.7), -2.42, 0.515, -3.5, room);

  type BlogBook = {
    visual: THREE.Group;
    baseVisualY: number;
    hover: number;
    noteId: string;
  };
  const blogBooks: BlogBook[] = [];

  function hexCss(n: number) {
    return `#${n.toString(16).padStart(6, "0")}`;
  }

  function makeSpineLabel(note: Note, color: number) {
    return canvasTex(160, 640, (g, w, h) => {
      g.fillStyle = hexCss(color);
      g.fillRect(0, 0, w, h);
      g.fillStyle = "rgba(247,241,230,0.16)";
      g.fillRect(0, 0, w, h);
      g.save();
      g.translate(w / 2, h * 0.55);
      g.rotate(-Math.PI / 2);
      g.textAlign = "center";
      g.fillStyle = "#f7f1e6";
      g.font = `800 48px ${FONT}`;
      g.fillText("BLOG", 0, -18);
      g.font = `700 36px ${FONT}`;
      g.fillText(note.spine, 0, 28);
      g.restore();
      g.fillStyle = "rgba(247,241,230,0.45)";
      g.fillRect(10, 18, w - 20, 6);
      g.fillRect(10, h - 24, w - 20, 6);
    });
  }

  /** Upright shelf book: fixed hit box + visual child that lifts on hover (no shake). */
  function addShelfBlogBook(
    depth: number,
    height: number,
    thick: number,
    color: number,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D,
    note: Note,
  ) {
    const root = new THREE.Group();
    root.position.set(x, y, z);
    parent.add(root);

    const visual = new THREE.Group();
    root.add(visual);

    const body = box(depth, height, thick, std(color, 0.72), 0, 0, 0, visual);
    const pages = box(
      depth * 0.04,
      height * 0.9,
      thick * 0.88,
      std(0xf4efe6, 0.55),
      depth / 2 - 0.006,
      0,
      0,
      visual,
      false,
    );

    const spineMap = makeSpineLabel(note, color);
    const spine = new THREE.Mesh(
      new THREE.PlaneGeometry(thick * 0.9, height * 0.88),
      new THREE.MeshBasicMaterial({ map: spineMap, toneMapped: false }),
    );
    spine.rotation.y = Math.PI / 2;
    spine.position.x = depth / 2 + 0.0012;
    visual.add(spine);

    // Invisible fixed collider — does not move with the lift, so raycasts stay stable
    const hit = new THREE.Mesh(
      new THREE.BoxGeometry(depth + 0.04, height + 0.08, thick + 0.02),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    hit.position.y = 0.02;
    root.add(hit);
    markPick(hit, { type: "book", noteId: note.id });

    blogBooks.push({ visual, baseVisualY: 0, hover: 0, noteId: note.id });
    return { root, body, pages };
  }

  const bookColors = [0x1f3a5f, 0x8b2e2e, 0xc4a35a, 0x2d5a45, 0x2b2b2b, 0xe8e0d4, 0x5c3d2e, 0x254e7a, 0x9a4a3a, 0x4a5568];
  const bookMats = bookColors.map((c) => std(c, 0.68));
  const shelfBlogColors = [0x1f3a5f, 0x8b2e2e, 0x254e7a, 0x9a4a3a, 0x2d5a45];
  const shelf = new THREE.Group();
  shelf.position.set(-4.66, 0, -1.55);
  room.add(shelf);
  const sw = 0.34;
  const sh = 2.28;
  const sd = 2.18;
  box(0.02, sh, sd, M.oakPale, -sw / 2 + 0.01, sh / 2, 0, shelf);
  box(sw, sh, 0.03, M.oakPale, 0, sh / 2, -sd / 2, shelf);
  box(sw, sh, 0.03, M.oakPale, 0, sh / 2, sd / 2, shelf);
  const levels = [0.05, 0.5, 0.96, 1.42, 1.88, 2.26];
  levels.forEach((y) => box(sw, 0.03, sd, M.oakPale, 0, y, 0, shelf));

  // Shelf plaque facing the room so the left library reads as blogs
  const shelfBlogSignTex = canvasTex(512, 160, (g, w, h) => {
    g.fillStyle = "#1f3a5f";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#f7f1e6";
    g.font = `800 72px ${FONT}`;
    g.textAlign = "center";
    g.fillText("BLOG", w / 2, 70);
    g.font = `600 32px ${FONT}`;
    g.fillStyle = "rgba(247,241,230,0.88)";
    g.fillText("Survolez · cliquez", w / 2, 118);
  });
  const shelfBlogSign = new THREE.Mesh(
    new THREE.PlaneGeometry(0.28, 0.09),
    new THREE.MeshBasicMaterial({
      map: shelfBlogSignTex,
      toneMapped: false,
      transparent: true,
      side: THREE.DoubleSide,
    }),
  );
  shelfBlogSign.position.set(0.2, 2.1, 0);
  shelfBlogSign.rotation.y = Math.PI / 2;
  shelf.add(shelfBlogSign);

  // Five blog books at fixed, readable spots on the left shelf (rows 1–3)
  const shelfBlogSlots: Array<{ row: number; z: number; height: number; thick: number; depth: number }> = [
    { row: 1, z: -0.85, height: 0.36, thick: 0.052, depth: 0.24 },
    { row: 1, z: -0.35, height: 0.34, thick: 0.048, depth: 0.23 },
    { row: 2, z: 0.15, height: 0.38, thick: 0.055, depth: 0.25 },
    { row: 2, z: 0.65, height: 0.33, thick: 0.05, depth: 0.22 },
    { row: 3, z: -0.2, height: 0.35, thick: 0.05, depth: 0.24 },
  ];
  const blogZones = shelfBlogSlots.map((slot, i) => {
    const note = notes[i];
    const color = shelfBlogColors[i % shelfBlogColors.length];
    const y0 = levels[slot.row] + 0.016;
    addShelfBlogBook(
      slot.depth,
      slot.height,
      slot.thick,
      color,
      0.03,
      y0 + slot.height / 2,
      slot.z,
      shelf,
      note,
    );
    return { row: slot.row, z0: slot.z - slot.thick / 2 - 0.01, z1: slot.z + slot.thick / 2 + 0.01 };
  });

  const br = rng(31);
  for (let row = 0; row < 5; row++) {
    const y0 = levels[row] + 0.016;
    let z = -sd / 2 + 0.07;
    const limit = sd / 2 - 0.08;
    if (row === 2 || row === 4) {
      for (let stack = 0; stack < 3; stack++) {
        const thick = 0.028 + br() * 0.02;
        const depth = 0.2 + br() * 0.06;
        const m = box(depth, thick, 0.16, bookMats[Math.floor(br() * bookMats.length)], 0.01, y0 + 0.04 + stack * 0.032, z + 0.08, shelf);
        m.rotation.z = (br() - 0.5) * 0.08;
      }
      z += 0.22;
    }
    while (z < limit) {
      const thick = 0.032 + br() * 0.04;
      if (z + thick > limit) break;
      const overlapsBlog = blogZones.some(
        (zone) => zone.row === row && z < zone.z1 && z + thick > zone.z0,
      );
      if (overlapsBlog) {
        z = blogZones.find((zone) => zone.row === row && z < zone.z1 && z + thick > zone.z0)!.z1;
        continue;
      }
      const height = 0.26 + br() * 0.14;
      const depth = 0.2 + br() * 0.08;
      const m = box(depth, height, thick, bookMats[Math.floor(br() * bookMats.length)], 0.02, y0 + height / 2, z + thick / 2, shelf);
      m.rotation.x = (br() - 0.5) * 0.03;
      z += thick + 0.004;
    }
  }

  function addPlant(x: number, y: number, z: number, scale = 1) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.scale.setScalar(scale);
    room.add(g);
    cyl(0.09, 0.07, 0.14, M.ceramic, 0, 0.07, 0, g, 14);
    cyl(0.075, 0.075, 0.02, std(0x3a322c, 1), 0, 0.14, 0, g, 12);
    (
      [
        [0, 0.28, 0, 0.13],
        [0.07, 0.26, 0.04, 0.1],
        [-0.06, 0.24, 0.05, 0.09],
        [0.02, 0.34, -0.04, 0.1],
        [-0.04, 0.32, -0.05, 0.08],
      ] as const
    ).forEach(([px, py, pz, r], i) => {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), i % 2 ? M.leafDark : M.leaf);
      leaf.position.set(px, py, pz);
      leaf.scale.set(1.15, 0.82, 1);
      leaf.castShadow = true;
      g.add(leaf);
    });
  }
  addPlant(-2.55, 0.445, -3.52, 0.85);
  addPlant(-1.08, 0.775, -0.48, 0.55);
  addPlant(-4.15, 0, 1.42, 1.35);

  box(0.18, 0.012, 0.13, std(0xf4f0ea, 0.7), 0.72, 0.79, -0.42, room, false);
  box(0.16, 0.01, 0.12, std(0x1d3b8a, 0.7), 0.74, 0.8, -0.4, room, false);
  const mug = cyl(0.035, 0.032, 0.07, std(0xf2f2f0, 0.4), 0.52, 0.81, 0.22, room, 14);
  mug.castShadow = true;
  const handleMug = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 8, 16), std(0xf2f2f0, 0.4));
  handleMug.rotation.y = Math.PI / 2;
  handleMug.position.set(0.555, 0.81, 0.22);
  room.add(handleMug);
  box(0.12, 0.025, 0.09, std(0x254e7a, 0.7), 0.88, 0.79, -0.18, room);
  box(0.12, 0.02, 0.09, std(0x9a4a3a, 0.7), 0.89, 0.81, -0.17, room);

  const lampPick: THREE.Object3D[] = [];
  const markLamp = (m: THREE.Object3D) => {
    lampPick.push(m);
    return m;
  };

  const pendant = new THREE.Group();
  pendant.position.set(0.05, 0, -0.12);
  room.add(pendant);
  markLamp(cyl(0.055, 0.055, 0.025, M.plastic, 0, 3.385, 0, pendant, 32));
  markLamp(cyl(0.006, 0.006, 0.4, M.plastic, 0, 3.18, 0, pendant, 12));
  const pShadeMat = std(0x2a2e36, 0.42, 0.18, {
    side: THREE.DoubleSide,
    emissive: 0xffe8b0,
    emissiveIntensity: 0.12,
  });
  const pShade = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.28, 0.16, 64, 1, true), pShadeMat);
  pShade.position.y = 2.9;
  pendant.add(pShade);
  const pCap = new THREE.Mesh(new THREE.CircleGeometry(0.15, 64), pShadeMat);
  pCap.rotation.x = -Math.PI / 2;
  pCap.position.y = 2.98;
  pendant.add(pCap);
  const pInner = new THREE.Mesh(
    new THREE.CircleGeometry(0.265, 64),
    new THREE.MeshBasicMaterial({ color: 0xfff4d0, toneMapped: false, side: THREE.DoubleSide }),
  );
  pInner.rotation.x = Math.PI / 2;
  pInner.position.y = 2.83;
  pendant.add(pInner);
  lampPick.push(pShade, pCap, pInner);

  const deskLamp = new THREE.Group();
  deskLamp.position.set(1.05, 0.775, 0.22);
  deskLamp.rotation.y = -0.55;
  room.add(deskLamp);
  cyl(0.075, 0.09, 0.022, M.plastic, 0, 0.011, 0, deskLamp, 40);
  const elbow = new THREE.Vector3(0.05, 0.3, 0);
  const tip = new THREE.Vector3(0.22, 0.4, 0);
  limb(new THREE.Vector3(0, 0.022, 0), elbow, 0.011, M.brass, deskLamp);
  limb(elbow, tip, 0.009, M.brass, deskLamp);
  const dHead = new THREE.Group();
  dHead.position.copy(tip);
  dHead.rotation.z = -0.35;
  deskLamp.add(dHead);
  const dShadeMat = std(0xf4efe6, 0.48, 0, {
    side: THREE.DoubleSide,
    emissive: 0xfff1c2,
    emissiveIntensity: 0.25,
  });
  const dShade = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.1, 0.12, 48, 1, true), dShadeMat);
  dShade.position.y = -0.05;
  dHead.add(dShade);
  const dCap = new THREE.Mesh(new THREE.SphereGeometry(0.036, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), dShadeMat);
  dCap.position.y = 0.01;
  dHead.add(dCap);
  const dBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.028, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0xfff4d0, toneMapped: false }),
  );
  dBulb.position.y = -0.08;
  dHead.add(dBulb);
  lampPick.push(deskLamp);

  const chair = new THREE.Group();
  chair.position.set(0.17, 0, -0.92);
  room.add(chair);
  box(0.5, 0.07, 0.48, M.chair, 0, 0.45, 0, chair);
  box(0.48, 0.52, 0.05, M.chair, 0, 0.8, -0.27, chair);
  (
    [
      [-0.2, -0.2],
      [0.2, -0.2],
      [-0.2, 0.2],
      [0.2, 0.2],
    ] as const
  ).forEach(([x, z]) => {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.42, 8), M.chrome);
    l.position.set(x, 0.21, z);
    l.castShadow = true;
    chair.add(l);
  });

  const char = new THREE.Group();
  char.position.set(0.17, 0, -0.85);
  room.add(char);
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.56, 24), M.shirt);
  torso.position.y = 0.82;
  torso.scale.z = 0.72;
  torso.castShadow = true;
  char.add(torso);
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 12), M.shirt);
  chest.position.y = 1.08;
  chest.scale.set(1.05, 0.38, 0.74);
  chest.castShadow = true;
  char.add(chest);
  for (let y = 0.62; y <= 1.02; y += 0.1) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 6), M.button);
    b.position.set(0, y, 0.14);
    char.add(b);
  }
  const hips = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 12), M.trousers);
  hips.position.y = 0.52;
  hips.scale.set(1.15, 0.55, 0.85);
  char.add(hips);
  limb(new THREE.Vector3(0, 1.1, 0.01), new THREE.Vector3(0, 1.2, 0.02), 0.05, M.skin, char);

  const headG = new THREE.Group();
  headG.position.set(0, 1.31, 0.02);
  char.add(headG);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.125, 32, 24), M.skin);
  head.scale.set(0.88, 1.08, 0.95);
  head.castShadow = true;
  headG.add(head);
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.131, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.42),
    M.hair,
  );
  hair.scale.set(0.9, 1.07, 0.97);
  hair.position.set(0, 0.012, -0.004);
  headG.add(hair);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 10), M.skin);
  nose.position.set(0, -0.012, 0.114);
  headG.add(nose);
  ([-1, 1] as const).forEach((s) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.011, 10, 8), M.hair);
    e.position.set(s * 0.04, 0.022, 0.103);
    headG.add(e);
  });
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.142, 0.014, 10, 40, Math.PI), M.plastic);
  band.position.y = 0.006;
  headG.add(band);
  ([-1, 1] as const).forEach((s) => {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.045, 28), M.plastic);
    cup.rotation.z = Math.PI / 2;
    cup.position.set(s * 0.132, -0.01, 0);
    cup.castShadow = true;
    headG.add(cup);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.01, 8, 24), M.plasticMid);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(s * 0.158, -0.01, 0);
    headG.add(ring);
  });
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.15, -0.05, 0.02),
        new THREE.Vector3(0.12, -0.25, 0.12),
        new THREE.Vector3(0.03, -0.55, 0.16),
        new THREE.Vector3(-0.04, -0.82, 0.2),
      ]),
      40,
      0.004,
      6,
    ),
    M.plastic,
  );
  headG.add(cable);

  const hands: THREE.Mesh[] = [];
  ([-1, 1] as const).forEach((s) => {
    const sh = new THREE.Vector3(s * 0.21, 1.03, 0);
    const el = new THREE.Vector3(s * 0.26, 0.84, 0.2);
    const wr = new THREE.Vector3(s * 0.12, 0.81, 0.44);
    const sp = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 12), M.shirt);
    sp.position.copy(sh);
    sp.castShadow = true;
    char.add(sp);
    limb(sh, el, 0.056, M.shirt, char);
    limb(el, wr, 0.046, M.shirt, char);
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.028, 0.1), M.skin);
    hand.position.set(s * 0.11, 0.812, 0.5);
    hand.rotation.y = -s * 0.25;
    hand.castShadow = true;
    char.add(hand);
    hands.push(hand);
    limb(new THREE.Vector3(s * 0.1, 0.5, 0.02), new THREE.Vector3(s * 0.11, 0.52, 0.42), 0.075, M.trousers, char);
    limb(new THREE.Vector3(s * 0.11, 0.52, 0.42), new THREE.Vector3(s * 0.11, 0.09, 0.47), 0.06, M.trousers, char);
    box(0.1, 0.07, 0.22, M.plastic, s * 0.11, 0.035, 0.53, char);
  });

  const hemi = new THREE.HemisphereLight(0xfff8f0, 0xc4b8a8, 0.95);
  room.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff6e8, 1.5);
  sun.position.set(-5.2, 4.8, 1.6);
  sun.target.position.set(0, 0.8, -0.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 16 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  room.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xe8f0ff, 0.48);
  fill.position.set(4, 3.2, 2.4);
  room.add(fill);
  const windowLight = new THREE.DirectionalLight(0xfff4dc, 1.05);
  windowLight.position.set(-6, 2.8, 1.4);
  windowLight.target.position.set(0, 1, -0.2);
  room.add(windowLight, windowLight.target);
  const ceilingLight = new THREE.PointLight(0xfff1d6, 1.55, 9, 1.5);
  ceilingLight.position.set(0.05, 2.88, -0.12);
  room.add(ceilingLight);
  const deskLampLight = new THREE.PointLight(0xffe4b5, 0.45, 3.6, 2);
  deskLampLight.position.set(0.2, 0.3, 0);
  deskLamp.add(deskLampLight);
  const doorLight = new THREE.PointLight(0xffb070, 0, 7, 2);
  doorLight.position.set(2.6, 1.6, -3.5);
  room.add(doorLight);

  const lampBtn = $("lamp-toggle");
  const root = document.getElementById("contenu");
  let lampOn = true;
  let hoveringLamp = false;
  let outdoorT = 0;
  let roomHover: { type: string; noteId?: string; slug?: string } | null = null;

  function applyLighting() {
    const day = lampOn;
    const bg = day ? 0xdce8f2 : 0x121b28;
    room.background = new THREE.Color(bg);
    room.fog = new THREE.Fog(bg, day ? 16 : 14, day ? 30 : 28);
    // Night stays readable: cool moonlight + the monitor glow instead of near-black.
    hemi.intensity = day ? 0.95 : 0.42;
    hemi.color.set(day ? 0xfff8f0 : 0x8a9cc4);
    hemi.groundColor.set(day ? 0xc4b8a8 : 0x2a2433);
    sun.intensity = day ? 1.5 : 0.35;
    sun.color.set(day ? 0xfff6e8 : 0x8098cc);
    fill.intensity = day ? 0.48 : 0.2;
    windowLight.intensity = day ? 1.05 : 0.6;
    windowLight.color.set(day ? 0xfff4dc : 0x9ab4dc);
    ceilingLight.intensity = day ? 1.55 : 0;
    deskLampLight.intensity = day ? 0.6 : 0;
    screenLight.intensity = day ? 0.22 : 2.2;
    renderer.toneMappingExposure = day ? 1.16 : 1.1;
    skyMat.map = day ? skyDay : skyNight;
    skyMat.needsUpdate = true;
    paintCity(cityCtx, 512, 512, outdoorT, !day);
    cityTex.needsUpdate = true;
    paintTerrace(terraceCtx, 512, 512, outdoorT, !day);
    terraceTex.needsUpdate = true;
    pShadeMat.emissiveIntensity = day ? 0.12 : 0;
    dShadeMat.emissiveIntensity = day ? 0.25 : 0;
    (pInner.material as THREE.MeshBasicMaterial).color.set(day ? 0xfff4d0 : 0x2a2620);
    (dBulb.material as THREE.MeshBasicMaterial).color.set(day ? 0xfff4d0 : 0x2a2620);
    lampBtn.setAttribute("aria-pressed", day ? "true" : "false");
    lampBtn.setAttribute("aria-label", day ? "Passer en mode nuit" : "Passer en mode jour");
    root?.setAttribute("data-lamp", day ? "day" : "night");
  }

  function setLamp(on: boolean) {
    if (on === lampOn) return;
    lampOn = on;
    applyLighting();
    const flash = on ? $("flash-warm") : $("flash-cool");
    gsap.fromTo(flash, { opacity: 0.32 }, { opacity: 0, duration: 0.5, overwrite: true });
  }

  applyLighting();
  const onLampBtn = (e: Event) => {
    e.preventDefault();
    setLamp(!lampOn);
  };
  lampBtn.addEventListener("click", onLampBtn);
  cleanups.push(() => lampBtn.removeEventListener("click", onLampBtn));

  const inner = new THREE.Scene();
  inner.background = new THREE.Color(0x060a12);
  inner.fog = new THREE.FogExp2(0x060a12, 0.045);
  const innerCam = new THREE.PerspectiveCamera(55, 16 / 9, 0.05, 90);

  const grid = new THREE.GridHelper(100, 100, 0x2fb4cc, 0x123044);
  const gridMat = grid.material as THREE.LineBasicMaterial;
  gridMat.transparent = true;
  gridMat.opacity = 0.55;
  grid.position.z = -35;
  inner.add(grid);
  const grid2 = grid.clone();
  const gridMat2 = gridMat.clone();
  gridMat2.opacity = 0.18;
  grid2.material = gridMat2;
  grid2.position.y = 5.5;
  inner.add(grid2);

  const pCount = small ? 1200 : 2600;
  const pPos = new Float32Array(pCount * 3);
  const pr = rng(21);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = (pr() - 0.5) * 24;
    pPos[i * 3 + 1] = pr() * 7;
    pPos[i * 3 + 2] = 8 - pr() * 60;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const dots = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({
      color: 0x9fe6f2,
      size: 0.035,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  inner.add(dots);

  function wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
    const words = text.split(" ");
    let line = "";
    for (const w of words) {
      const t = line ? `${line} ${w}` : w;
      if (g.measureText(t).width > maxW && line) {
        g.fillText(line, x, y);
        line = w;
        y += lh;
      } else line = t;
    }
    g.fillText(line, x, y);
  }

  function drawArt(
    g: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    seed: number,
  ) {
    const r = rng(seed);
    const gr = g.createLinearGradient(x, y, x + w, y + h);
    gr.addColorStop(0, color);
    gr.addColorStop(1, "#0b1220");
    g.fillStyle = gr;
    g.fillRect(x, y, w, h);
    g.save();
    g.beginPath();
    g.rect(x, y, w, h);
    g.clip();
    const cx = x + w * (0.55 + r() * 0.3);
    const cy = y + h * (0.3 + r() * 0.4);
    for (let i = 0; i < 14; i++) {
      g.strokeStyle = `rgba(255,255,255,${0.06 + i * 0.012})`;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(cx, cy, 20 + i * 26, 0, Math.PI * 2);
      g.stroke();
    }
    for (let i = 0; i < 22; i++) {
      g.fillStyle = `rgba(255,255,255,${0.05 + r() * 0.12})`;
      g.fillRect(x + r() * w, y + r() * h, 40 + r() * 160, 4);
    }
    g.restore();
  }

  function drawTitle(g: CanvasRenderingContext2D, w: number) {
    g.textAlign = "center";
    g.fillStyle = "#eef2f7";
    g.font = `800 300px ${FONT}`;
    g.fillText("Mes projets", w / 2, 430);
    g.fillStyle = "#7fd4e0";
    g.font = `500 84px ${FONT}`;
    g.fillText("Bienvenue de l’autre côté de l’écran", w / 2, 600);
  }

  const titleTex = canvasTex(2048, 900, (g, w) => drawTitle(g, w));
  const titlePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, 2.8),
    new THREE.MeshBasicMaterial({ map: titleTex, transparent: true, depthWrite: false }),
  );
  titlePlane.position.set(0, 1.9, -2.6);
  inner.add(titlePlane);

  const cards: Card[] = [];
  const previewImgs: Array<HTMLImageElement | null> = [];
  const SPACING = 6;
  const FIRST = -8;

  function drawCover(
    g: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    const ir = img.width / img.height;
    const r = w / h;
    let sx = 0;
    let sy = 0;
    let sw = img.width;
    let sh = img.height;
    if (ir > r) {
      sw = img.height * r;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / r;
      sy = (img.height - sh) / 2;
    }
    g.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  function drawCard(
    g: CanvasRenderingContext2D,
    w: number,
    h: number,
    p: Project,
    i: number,
    preview?: HTMLImageElement | null,
  ) {
    g.fillStyle = "#0b111b";
    g.fillRect(0, 0, w, h);
    if (preview) {
      drawCover(g, preview, 0, 0, w, 470);
      g.fillStyle = "rgba(11,17,27,.35)";
      g.fillRect(0, 0, w, 470);
    } else {
      drawArt(g, 0, 0, w, 470, p.couleur, 100 + i * 7);
    }
    g.fillStyle = "rgba(255,255,255,.92)";
    g.font = `800 150px ${FONT}`;
    g.fillText(String(i + 1), 50, 170);
    g.fillStyle = p.couleur;
    g.font = `500 40px ${FONT}`;
    g.fillText(`${p.categorie}, ${p.annee}`, 56, 545);
    g.fillStyle = "#eef2f7";
    g.font = `700 78px ${FONT}`;
    wrap(g, p.titre, 54, 640, w - 110, 82);
    g.strokeStyle = p.couleur;
    g.globalAlpha = 0.55;
    g.lineWidth = 6;
    g.strokeRect(3, 3, w - 6, h - 6);
    g.globalAlpha = 1;
  }

  projects.forEach((p, i) => {
    const tex = canvasTex(1200, 760, (g, w, h) => drawCard(g, w, h, p, i));
    const side = i % 2 === 0 ? -1 : 1;
    const grp = new THREE.Group();
    grp.position.set(side * 2.35, 1.6, FIRST - i * SPACING);
    grp.rotation.y = -side * 0.34;
    inner.add(grp);
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.5, 2.3),
      new THREE.MeshBasicMaterial({
        color: p.couleur,
        transparent: true,
        opacity: 0.14,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    glow.position.z = -0.02;
    grp.add(glow);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.15, 2), new THREE.MeshBasicMaterial({ map: tex }));
    mesh.userData.index = i;
    grp.add(mesh);
    const line = new THREE.Mesh(new THREE.PlaneGeometry(3.15, 0.02), new THREE.MeshBasicMaterial({ color: p.couleur }));
    line.rotation.x = -Math.PI / 2;
    line.position.set(0, -1.59, 0);
    grp.add(line);
    cards.push({ grp, mesh, glow, side, hover: 0, z: grp.position.z });
    previewImgs[i] = null;
    if (p.image) {
      const img = new Image();
      img.onload = () => {
        previewImgs[i] = img;
        const map = mesh.material as THREE.MeshBasicMaterial;
        if (map.map) redraw(map.map as THREE.CanvasTexture, (g, w, h) => drawCard(g, w, h, p, i, img));
      };
      img.src = p.image;
    }
  });

  const PORTAL_Z = FIRST - (projects.length - 1) * SPACING - 7;
  const portal = new THREE.Group();
  portal.position.set(0, 0, PORTAL_Z);
  inner.add(portal);
  const pm = new THREE.MeshBasicMaterial({ color: 0xffa868, toneMapped: false });
  (
    [
      [-0.68, 1.25, 0.08, 2.5],
      [0.68, 1.25, 0.08, 2.5],
      [0, 2.5, 1.44, 0.08],
    ] as const
  ).forEach(([x, y, w, h]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.08), pm);
    m.position.set(x, y, 0);
    portal.add(m);
  });
  const warmTex = canvasTex(512, 512, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
    gr.addColorStop(0, "rgba(255,240,220,1)");
    gr.addColorStop(0.5, "rgba(255,190,130,.75)");
    gr.addColorStop(1, "rgba(255,150,80,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  });
  const portalGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.3, 2.45),
    new THREE.MeshBasicMaterial({
      map: warmTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  portalGlow.position.set(0, 1.23, -0.01);
  portal.add(portalGlow);
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 6),
    new THREE.MeshBasicMaterial({
      map: warmTex,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  halo.position.set(0, 1.3, -0.3);
  portal.add(halo);
  const contactTex = canvasTex(1024, 256, (g, w) => {
    g.textAlign = "center";
    g.fillStyle = "#ffd2a8";
    g.font = `700 120px ${FONT}`;
    g.fillText("Me contacter", w / 2, 160);
  });
  const contactLabel = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 0.6),
    new THREE.MeshBasicMaterial({ map: contactTex, transparent: true, depthWrite: false }),
  );
  contactLabel.position.set(0, 3.1, 0);
  portal.add(contactLabel);

  const IN_START = 3.2;
  const IN_END = PORTAL_Z - 0.8;
  const mouse = { x: 0, y: 0, sx: 0, sy: 0, ndc: new THREE.Vector2(9, 9) };

  function placeInnerCam(t: number, aspect: number) {
    const z = IN_START + (IN_END - IN_START) * t;
    const settle = 1 - Math.min(1, Math.max(0, (t - 0.82) / 0.14));
    const x = Math.sin(z * 0.22) * 0.35 * settle + mouse.sx * 0.25 * settle;
    innerCam.position.set(x, 1.6 + mouse.sy * 0.12 * settle, z);
    innerCam.lookAt(x * 0.4, 1.55, z - 6);
    if (innerCam.aspect !== aspect) {
      innerCam.aspect = aspect;
      innerCam.updateProjectionMatrix();
    }
    return z;
  }

  let pathCam: THREE.CatmullRomCurve3;
  let pathTgt: THREE.CatmullRomCurve3;
  let exitCam: THREE.CatmullRomCurve3;
  let exitTgt: THREE.CatmullRomCurve3;
  const screenCenter = new THREE.Vector3();
  const screenNormal = new THREE.Vector3();

  function buildPaths() {
    room.updateMatrixWorld(true);
    screen.getWorldPosition(screenCenter);
    screenNormal.set(0, 0, 1).applyQuaternion(monitor.quaternion).normalize();
    const tanH = Math.tan(THREE.MathUtils.degToRad(roomCam.fov / 2));
    const d = Math.min(0.25 / tanH, 0.45 / (tanH * roomCam.aspect)) * 0.93;
    const end = screenCenter.clone().addScaledVector(screenNormal, d);
    const pre = screenCenter.clone().addScaledVector(screenNormal, d + 0.55);
    pre.y += 0.1;
    pathCam = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(2.4, 1.9, 4.6),
        new THREE.Vector3(1.3, 1.45, 2.4),
        new THREE.Vector3(-2.6, 1.8, 0.4),
        new THREE.Vector3(-1.3, 1.75, -2.4),
        pre,
        end,
      ],
      false,
      "centripetal",
    );
    pathTgt = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, 1.0, -0.6),
        new THREE.Vector3(0.17, 1.28, -0.85),
        new THREE.Vector3(-0.1, 1.12, -0.4),
        screenCenter.clone(),
        screenCenter.clone(),
        screenCenter.clone(),
      ],
      false,
      "centripetal",
    );
    exitCam = new THREE.CatmullRomCurve3(
      [new THREE.Vector3(2.6, 1.5, -4.5), new THREE.Vector3(2.3, 1.65, -2.4), new THREE.Vector3(3.4, 2.3, 2.4)],
      false,
      "centripetal",
    );
    exitTgt = new THREE.CatmullRomCurve3(
      [new THREE.Vector3(1.6, 1.25, 0), new THREE.Vector3(0.17, 1.25, -0.85), new THREE.Vector3(0, 1.0, -0.6)],
      false,
      "centripetal",
    );
  }

  function setFov() {
    roomCam.fov = roomCam.aspect < 1 ? 58 : 42;
    roomCam.updateProjectionMatrix();
  }
  setFov();
  buildPaths();

  const state = { roomT: 0, innerT: 0, exitT: 0, world: 0, intro: 1 };
  const onPointerMove = (e: PointerEvent) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / innerHeight) * 2 + 1;
    mouse.ndc.set(mouse.x, mouse.y);
  };
  addEventListener("pointermove", onPointerMove);
  cleanups.push(() => removeEventListener("pointermove", onPointerMove));

  const ray = new THREE.Raycaster();
  let hovered = -1;
  const onCanvasClick = () => {
    if (document.documentElement.classList.contains("portal-open")) return;
    if (state.world === 1 && hovered >= 0) {
      enterProject(hovered);
      return;
    }
    if (state.world === 1) return;
    if (roomHover?.type === "window") {
      setWindowOpen(!windowOpen);
      return;
    }
    if (roomHover?.type === "door") {
      setDoorForced(!doorForced);
      return;
    }
    if (roomHover?.type === "book" && roomHover.noteId) {
      window.dispatchEvent(
        new CustomEvent("mm:enter-note", { detail: { noteId: roomHover.noteId } }),
      );
      return;
    }
    if (roomHover?.type === "project" && roomHover.slug) {
      const project = projects.find((p) => p.slug === roomHover?.slug);
      if (project) {
        window.dispatchEvent(
          new CustomEvent("mm:enter-project", { detail: { project } }),
        );
      }
      return;
    }
    if (hoveringLamp) setLamp(!lampOn);
  };
  canvas.addEventListener("click", onCanvasClick);
  cleanups.push(() => canvas.removeEventListener("click", onCanvasClick));

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: "#scroll",
      start: "top top",
      end: "bottom bottom",
      scrub: reduceMotion ? true : 1.3,
      onUpdate: (s) => {
        gsap.set("#bar", { scaleX: s.progress });
      },
    },
  });

  tl.to(state, { roomT: 0.2, duration: 1.0, ease: "power1.inOut" }, 0.2)
    .to(state, { roomT: 0.4, duration: 1.0, ease: "power1.inOut" }, 1.2)
    .to(state, { roomT: 0.6, duration: 0.8, ease: "power1.inOut" }, 2.2)
    .to(state, { roomT: 1, duration: 1.0, ease: "power2.in" }, 3.0)
    .set(state, { world: 1 }, 4.0)
    .to(state, { innerT: 1, duration: 4.8, ease: "power1.inOut" }, 4.0)
    .set(state, { world: 2 }, 8.8)
    .to(state, { exitT: 1, duration: 1.2, ease: "power2.out" }, 8.8);

  tl.to("#hero", { autoAlpha: 0, y: -24, duration: 0.4 }, 0.55)
    .fromTo("#about", { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: 0.35 }, 1.35)
    .to("#about", { autoAlpha: 0, x: -20, duration: 0.3 }, 2.25)
    .fromTo("#cue", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.25 }, 3.0)
    .to("#cue", { autoAlpha: 0, duration: 0.2 }, 3.6)
    .fromTo("#projects", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 4.25)
    .to("#projects", { autoAlpha: 0, duration: 0.25 }, 8.35)
    .fromTo("#contact", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 9.4);

  tl.to("#scan", { opacity: 0.9, duration: 0.5, ease: "power2.in" }, 3.5)
    .to("#flash-cool", { opacity: 1, duration: 0.14, ease: "power2.in" }, 3.86)
    .to("#flash-cool", { opacity: 0, duration: 0.4, ease: "power2.out" }, 4.0)
    .to("#scan", { opacity: 0.25, duration: 0.4 }, 4.0)
    .to("#vignette", { opacity: 1, duration: 0.3 }, 4.0)
    .to("#scan", { opacity: 0, duration: 0.3 }, 8.4)
    .to("#flash-warm", { opacity: 1, duration: 0.16, ease: "power2.in" }, 8.64)
    .to("#vignette", { opacity: 0, duration: 0.01 }, 8.8)
    .to("#flash-warm", { opacity: 0, duration: 0.45, ease: "power2.out" }, 8.8);

  const chapters: Array<[number, string]> = [
    [1.2, "Le bureau"],
    [3.0, "À propos"],
    [4.0, "Dans l’écran"],
    [8.8, "Les projets"],
    [99, "Contact"],
  ];
  let lastChapter = "";
  function updateChapter() {
    const t = tl.time();
    const c = chapters.find(([lim]) => t < lim)?.[1] ?? "Contact";
    if (c !== lastChapter) {
      $("where").textContent = c;
      lastChapter = c;
    }
  }

  let lastProj = -1;
  function updateProjectHud(camZ: number) {
    let best = 0;
    let bd = 1e9;
    cards.forEach((c, i) => {
      const d = Math.abs(c.z - (camZ - 3.6));
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    if (best === lastProj) return;
    lastProj = best;
    const p = projects[best];
    $("proj-num").textContent = String(best + 1);
    $("proj-title").textContent = p.titre;
    $("proj-meta").textContent = `${p.categorie}, ${p.annee}`;
    [...$("counter").children].forEach((s, i) => s.classList.toggle("on", i <= best));
  }

  function enterProject(i: number) {
    const p = projects[i];
    const flash = document.getElementById("flash-cool");
    if (flash && !reduceMotion) {
      gsap.fromTo(
        flash,
        { opacity: 0 },
        { opacity: 0.55, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" },
      );
    }
    window.dispatchEvent(
      new CustomEvent("mm:enter-project", { detail: { project: p } }),
    );
  }

  const onAgain = () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  $("again").addEventListener("click", onAgain);
  cleanups.push(() => {
    $("again").removeEventListener("click", onAgain);
  });

  const startedAt = performance.now();
  const tmpP = new THREE.Vector3();
  const tmpT = new THREE.Vector3();
  const headW = new THREE.Vector3();
  const introOffset = new THREE.Vector3(2.4, 1.4, 3.4);
  let headYaw = 0;
  let raf = 0;
  let running = true;

  function tick() {
    if (!running) return;
    const t = (performance.now() - startedAt) / 1000;
    const k = reduceMotion ? 1 : 0.06;
    mouse.sx += (mouse.x - mouse.sx) * k;
    mouse.sy += (mouse.y - mouse.sy) * k;

    hands.forEach((h, i) => {
      h.position.y = 0.812 + Math.max(0, Math.sin(t * 13 + i * 1.9)) * 0.007;
    });
    let yawTarget = Math.sin(t * 0.45) * 0.07;
    if (state.world === 2) {
      headG.getWorldPosition(headW);
      const dx = roomCam.position.x - headW.x;
      const dz = roomCam.position.z - headW.z;
      yawTarget = THREE.MathUtils.clamp(Math.atan2(dx, dz), -1.0, 1.0);
    }
    headYaw += (yawTarget - headYaw) * 0.05;
    headG.rotation.y = headYaw;
    headG.rotation.x = Math.sin(t * 0.8) * 0.02 + (state.world === 2 ? -0.05 : 0.08);

    dots.rotation.y = Math.sin(t * 0.05) * 0.05;
    (portalGlow.material as THREE.MeshBasicMaterial).opacity = 0.85 + Math.sin(t * 2.2) * 0.15;
    const doorOpen = state.world === 2 || doorForced;
    const doorTarget = doorOpen ? -1.45 : 0;
    doorPivot.rotation.y += (doorTarget - doorPivot.rotation.y) * (reduceMotion ? 1 : 0.08);
    doorLight.intensity = doorOpen ? 1.4 : 0;

    outdoorT = t;
    if (Math.floor(t * 12) !== Math.floor((t - 1 / 60) * 12)) {
      paintCity(cityCtx, 512, 512, t, !lampOn);
      cityTex.needsUpdate = true;
      if (doorOpen || windowOpen) {
        paintTerrace(terraceCtx, 512, 512, t, !lampOn);
        terraceTex.needsUpdate = true;
      }
    }

    const portalOpen = document.documentElement.classList.contains("portal-open");

    if (state.world === 1) {
      const z = placeInnerCam(state.innerT, innerWidth / innerHeight);
      updateProjectHud(z);
      roomHover = null;
      hoveringLamp = false;
      document.getElementById("book-tip")?.classList.remove("on");
      blogBooks.forEach((b) => {
        b.hover += (0 - b.hover) * 0.14;
        b.visual.position.y = b.baseVisualY + b.hover * 0.08;
      });
      if (portalOpen) {
        hovered = -1;
        canvas.style.cursor = "";
      } else {
        ray.setFromCamera(mouse.ndc, innerCam);
        const hit = ray.intersectObjects(cards.map((c) => c.mesh))[0];
        hovered = hit ? (hit.object.userData.index as number) : -1;
        canvas.style.cursor = hovered >= 0 ? "pointer" : "";
      }
      cards.forEach((c, i) => {
        c.hover += ((i === hovered ? 1 : 0) - c.hover) * 0.1;
        const s = 1 + c.hover * 0.05;
        c.grp.scale.set(s, s, 1);
        c.grp.rotation.y = -c.side * 0.34 + (i === hovered ? mouse.x * 0.12 : 0) * c.hover;
        c.grp.rotation.x = (i === hovered ? -mouse.y * 0.08 : 0) * c.hover;
        (c.glow.material as THREE.MeshBasicMaterial).opacity = 0.14 + c.hover * 0.3;
      });
      renderer.setRenderTarget(null);
      renderer.render(inner, innerCam);
    } else {
      hovered = -1;
      if (portalOpen) {
        hoveringLamp = false;
        roomHover = null;
        canvas.style.cursor = "";
      } else {
        ray.setFromCamera(mouse.ndc, roomCam);
        const roomHit = ray.intersectObjects(roomPick, false)[0];
        const data = roomHit?.object.userData.interact as
          | { type: string; noteId?: string; slug?: string }
          | undefined;
        roomHover = data ?? null;
        hoveringLamp = !roomHover && ray.intersectObjects(lampPick, true).length > 0;
        canvas.style.cursor = roomHover || hoveringLamp ? "pointer" : "";
      }
      const bookTip = document.getElementById("book-tip");
      const hoverNoteId = roomHover?.type === "book" ? roomHover.noteId : undefined;
      const hoveringBook = Boolean(hoverNoteId);
      if (bookTip) {
        bookTip.classList.toggle("on", hoveringBook && !portalOpen);
        if (hoverNoteId) {
          const note = notes.find((n) => n.id === hoverNoteId);
          bookTip.textContent = note
            ? `${copy.blogKicker} · ${note.spine} — cliquez pour lire`
            : copy.blogTip;
        }
      }
      blogBooks.forEach((b) => {
        const active = hoverNoteId === b.noteId && !portalOpen;
        // Smooth ease toward lift — hit collider stays fixed, so no tremble
        b.hover += ((active ? 1 : 0) - b.hover) * 0.14;
        b.visual.position.y = b.baseVisualY + b.hover * 0.08;
      });
      let damp: number;
      if (state.world === 0) {
        pathCam.getPoint(state.roomT, tmpP);
        pathTgt.getPoint(state.roomT, tmpT);
        damp = 1 - THREE.MathUtils.smoothstep(state.roomT, 0.6, 0.95);
      } else {
        exitCam.getPoint(state.exitT, tmpP);
        exitTgt.getPoint(state.exitT, tmpT);
        damp = 1;
      }
      tmpP.addScaledVector(introOffset, state.intro);
      tmpP.x += mouse.sx * 0.18 * damp;
      tmpP.y += mouse.sy * 0.1 * damp;
      roomCam.position.copy(tmpP);
      roomCam.lookAt(tmpT);
      placeInnerCam(0, rtSize[0] / rtSize[1]);
      renderer.setRenderTarget(rt);
      renderer.render(inner, innerCam);
      renderer.setRenderTarget(null);
      renderer.render(room, roomCam);
    }
    updateChapter();
    raf = requestAnimationFrame(tick);
  }

  const onResize = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    sizeScreen();
    rt.setSize(rtSize[0], rtSize[1]);
    roomCam.aspect = innerWidth / innerHeight;
    setFov();
    buildPaths();
    ScrollTrigger.refresh();
  };
  addEventListener("resize", onResize);
  cleanups.push(() => removeEventListener("resize", onResize));

  function rebuildCanvasTextures() {
    redraw(titleTex, (g, w) => drawTitle(g, w));
    redraw(contactTex, (g, w) => {
      g.textAlign = "center";
      g.fillStyle = "#ffd2a8";
      g.font = `700 120px ${FONT}`;
      g.fillText("Me contacter", w / 2, 160);
    });
    cards.forEach((c, i) => {
      const map = (c.mesh.material as THREE.MeshBasicMaterial).map as THREE.CanvasTexture;
      redraw(map, (g, w, h) => drawCard(g, w, h, projects[i], i, previewImgs[i]));
    });
  }

  let disposed = false;
  const revealEnter = () => {
    if (disposed) return;
    $("load-text").textContent = "Le bureau est prêt.";
    const enter = $("enter") as HTMLButtonElement;
    const bar = $("load-bar") as HTMLElement;
    bar.style.width = "100%";
    gsap.to(enter, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" });
    enter.style.opacity = "1";
    enter.style.visibility = "visible";
    enter.focus({ preventScroll: true });
  };

  const fontsReady = Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise((r) => setTimeout(r, 2500)),
  ]);
  gsap.to("#load-bar", { width: "82%", duration: 1.1, ease: "power2.out" });
  fontsReady.then(() => {
    if (disposed) return;
    titleTex.needsUpdate = true;
    contactTex.needsUpdate = true;
    try {
      rebuildCanvasTextures();
    } catch {
      /* canvas text can wait for the first frame */
    }
    raf = requestAnimationFrame(tick);
    gsap.to("#load-bar", {
      width: "100%",
      duration: 0.4,
      ease: "power2.out",
      onComplete: revealEnter,
    });
  }).catch(revealEnter);

  cleanups.push(() => {
    disposed = true;
  });

  const onEnter = () => {
    document.documentElement.style.overflow = "";
    ScrollTrigger.refresh();
    gsap.to("#loader", { autoAlpha: 0, duration: 0.7, ease: "power2.inOut" });
    gsap.to(state, { intro: 0, duration: reduceMotion ? 0.01 : 2.6, ease: "power3.out" });
    gsap.fromTo("#hero", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1, delay: reduceMotion ? 0 : 1.3, ease: "power3.out" });
    gsap.fromTo(
      "#hero h1 span",
      { yPercent: 60, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1, stagger: 0.12, delay: reduceMotion ? 0 : 1.35, ease: "power3.out" },
    );
  };
  $("enter").addEventListener("click", onEnter);
  cleanups.push(() => $("enter").removeEventListener("click", onEnter));

  const dispose = () => {
    running = false;
    disposed = true;
    cancelAnimationFrame(raf);
    tl.kill();
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    rt.dispose();
    renderer.dispose();
    canvas.remove();
    document.documentElement.style.overflow = "";
    cleanups.forEach((fn) => fn());
    live = false;
  };
  return dispose;
}
