/** Stylized outdoor canvases for the office window & terrace. */

function sky(g: CanvasRenderingContext2D, w: number, h: number, night: boolean) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  if (night) {
    gr.addColorStop(0, "#070b16");
    gr.addColorStop(0.55, "#152238");
    gr.addColorStop(1, "#2a3344");
  } else {
    gr.addColorStop(0, "#6eafde");
    gr.addColorStop(0.4, "#b9daf0");
    gr.addColorStop(0.72, "#efe6c8");
    gr.addColorStop(1, "#d8c9a4");
  }
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  if (night) {
    for (let i = 0; i < 40; i++) {
      g.fillStyle = `rgba(255,255,255,${0.25 + ((i * 37) % 50) / 100})`;
      g.fillRect((i * 97) % w, ((i * 53) % (h * 0.55)), 1.2, 1.2);
    }
  } else {
    g.fillStyle = "rgba(255,236,180,0.85)";
    g.beginPath();
    g.arc(w * 0.78, h * 0.16, w * 0.06, 0, Math.PI * 2);
    g.fill();
  }
}

function building(
  g: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  bw: number,
  bh: number,
  night: boolean,
  seed: number,
) {
  const tone = night ? 28 + (seed % 18) : 72 + (seed % 40);
  g.fillStyle = `rgb(${tone},${tone + 4},${tone + 10})`;
  g.fillRect(x, baseY - bh, bw, bh);
  const cols = Math.max(2, Math.floor(bw / 10));
  const rows = Math.max(3, Math.floor(bh / 12));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lit = night ? (seed + r * 3 + c) % 5 !== 0 : (seed + r + c) % 7 === 0;
      g.fillStyle = lit
        ? night
          ? "rgba(255,214,140,0.85)"
          : "rgba(220,235,245,0.7)"
        : night
          ? "rgba(10,14,22,0.55)"
          : "rgba(40,55,70,0.25)";
      g.fillRect(x + 3 + c * (bw / cols), baseY - bh + 4 + r * (bh / rows), bw / cols - 4, bh / rows - 4);
    }
  }
}

function person(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  t: number,
  hue: number,
) {
  const bob = Math.sin(t * 8 + x) * 1.2;
  g.fillStyle = `hsl(${hue} 35% 35%)`;
  g.fillRect(x - 2 * scale, y - 10 * scale + bob, 4 * scale, 8 * scale);
  g.beginPath();
  g.arc(x, y - 12 * scale + bob, 2.2 * scale, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = `hsl(${hue} 25% 25%)`;
  g.fillRect(x - 2.5 * scale, y - 2 * scale + bob, 2 * scale, 5 * scale);
  g.fillRect(x + 0.5 * scale, y - 2 * scale + bob, 2 * scale, 5 * scale);
}

function car(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  color: string,
  left: boolean,
) {
  g.fillStyle = color;
  g.fillRect(x, y - 6, w, 7);
  g.fillRect(x + (left ? w * 0.15 : w * 0.25), y - 12, w * 0.55, 6);
  g.fillStyle = "rgba(180,210,230,0.75)";
  g.fillRect(x + (left ? w * 0.22 : w * 0.32), y - 11, w * 0.2, 4);
  g.fillStyle = "#1a1a1a";
  g.beginPath();
  g.arc(x + w * 0.22, y + 1, 2.4, 0, Math.PI * 2);
  g.arc(x + w * 0.78, y + 1, 2.4, 0, Math.PI * 2);
  g.fill();
}

export function paintCity(
  g: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  night: boolean,
) {
  sky(g, w, h, night);
  const horizon = h * 0.58;
  g.fillStyle = night ? "#1a2030" : "#9aa7b0";
  g.fillRect(0, horizon, w, h - horizon);

  const silhouettes = [
    [0.02, 0.42],
    [0.14, 0.28],
    [0.22, 0.5],
    [0.34, 0.22],
    [0.42, 0.38],
    [0.52, 0.55],
    [0.62, 0.3],
    [0.72, 0.45],
    [0.82, 0.25],
    [0.9, 0.4],
  ] as const;
  silhouettes.forEach(([nx, nh], i) => {
    building(g, nx * w, horizon, w * 0.09, h * nh, night, i * 17 + 3);
  });

  // Road
  g.fillStyle = night ? "#141820" : "#4a5160";
  g.fillRect(0, h * 0.78, w, h * 0.22);
  g.strokeStyle = night ? "rgba(255,220,120,0.45)" : "rgba(255,255,255,0.55)";
  g.setLineDash([10, 12]);
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(0, h * 0.89);
  g.lineTo(w, h * 0.89);
  g.stroke();
  g.setLineDash([]);

  const cars = [
    { speed: 38, y: 0.84, w: 28, color: "#c45a28", left: true },
    { speed: 52, y: 0.91, w: 34, color: "#2a6f8f", left: false },
    { speed: 44, y: 0.86, w: 24, color: "#d8c46a", left: true },
  ];
  cars.forEach((c, i) => {
    const travel = ((t * c.speed + i * 90) % (w + 60)) - 40;
    const x = c.left ? travel : w - travel;
    car(g, x, h * c.y, c.w, c.color, c.left);
  });

  for (let i = 0; i < 7; i++) {
    const px = ((t * (12 + i) * 4 + i * 70) % (w + 20)) - 10;
    person(g, px, h * 0.76, 1 + (i % 3) * 0.15, t, 20 + i * 28);
  }
}

export function paintTerrace(
  g: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  night: boolean,
) {
  sky(g, w, h, night);
  const deck = h * 0.62;
  // Distant city
  for (let i = 0; i < 9; i++) {
    building(g, (i / 9) * w, deck, w * 0.1, h * (0.18 + ((i * 5) % 7) * 0.04), night, i * 11);
  }

  // Terrace floor
  g.fillStyle = night ? "#3a2e24" : "#c4a882";
  g.fillRect(0, deck, w, h - deck);
  g.strokeStyle = night ? "rgba(0,0,0,0.25)" : "rgba(90,60,30,0.25)";
  for (let i = 0; i < 8; i++) {
    g.beginPath();
    g.moveTo(0, deck + i * ((h - deck) / 8));
    g.lineTo(w, deck + i * ((h - deck) / 8));
    g.stroke();
  }

  // Railing
  g.strokeStyle = night ? "#cfc6b8" : "#efe8dc";
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(0, deck);
  g.lineTo(w, deck);
  g.stroke();
  for (let i = 0; i < 12; i++) {
    const x = (i / 11) * w;
    g.beginPath();
    g.moveTo(x, deck);
    g.lineTo(x, deck - 28);
    g.stroke();
  }
  g.beginPath();
  g.moveTo(0, deck - 28);
  g.lineTo(w, deck - 28);
  g.stroke();

  // Planters + chairs
  g.fillStyle = night ? "#2a4030" : "#3f6b4a";
  g.fillRect(w * 0.08, deck - 18, 36, 16);
  g.fillRect(w * 0.78, deck - 18, 36, 16);
  g.fillStyle = night ? "#2a241c" : "#6b4a32";
  g.fillRect(w * 0.08, deck - 4, 36, 8);
  g.fillRect(w * 0.78, deck - 4, 36, 8);

  // Cafe table
  g.fillStyle = night ? "#1c1814" : "#5c4030";
  g.fillRect(w * 0.42, deck + 18, 48, 6);
  g.fillRect(w * 0.48, deck + 24, 4, 28);
  g.fillRect(w * 0.55, deck + 24, 4, 28);

  // People on terrace
  person(g, w * 0.35, deck + 10, 1.3, t, 28);
  person(g, w * 0.62 + Math.sin(t) * 4, deck + 12, 1.25, t, 200);

  // Birds
  g.strokeStyle = night ? "rgba(200,210,230,0.35)" : "rgba(40,50,60,0.45)";
  g.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const bx = ((t * 20 + i * 80) % (w + 40)) - 20;
    const by = h * 0.2 + Math.sin(t * 2 + i) * 8;
    g.beginPath();
    g.moveTo(bx, by);
    g.quadraticCurveTo(bx + 6, by - 4, bx + 12, by);
    g.moveTo(bx + 12, by);
    g.quadraticCurveTo(bx + 18, by - 4, bx + 24, by);
    g.stroke();
  }
}
