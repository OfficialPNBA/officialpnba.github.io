// Homepage league hub: a revolving "globe" of league logos.
// Hold + drag (or swipe) sideways to spin; the next league swings to the front, the other recedes behind.
(() => {
  const hub = document.querySelector('.hub');
  if (!hub) return;
  const stage = hub.querySelector('.hub-stage');
  const items = [...stage.querySelectorAll('.hub-item')];
  const captions = [...hub.querySelectorAll('.hub-caption')];
  const dots = [...hub.querySelectorAll('.hub-dot')];
  const canvas = stage.querySelector('.hub-globe');
  const ctx = canvas.getContext('2d');
  const n = items.length;
  const TAU = Math.PI * 2;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mod = (a, b) => ((a % b) + b) % b;

  let rot = 0;            // float: which league is at the front (0 = first)
  let target = 0;
  let spin = 0;           // idle globe spin, radians
  let W = 0, H = 0, size = 0, dpr = 1;
  let drag = null, moved = false, active = 0, raf = 0, last = 0;

  function measure() {
    const r = stage.getBoundingClientRect();
    W = r.width; H = r.height;
    size = Math.min(W * (W < 700 ? 0.6 : 0.42), H * (W < 700 ? 0.8 : 0.86));
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    items.forEach(el => { el.style.width = el.style.height = size + 'px'; });
  }

  // Position on the orbit for angle t (0 = front centre, ±PI = back, upper right).
  function place(t) {
    const narrow = W < 700;
    const bx = W * (narrow ? 0.31 : 0.27), by = -H * (narrow ? 0.26 : 0.20);
    const rx = W * (narrow ? 0.36 : 0.30);
    const depth = (1 + Math.cos(t)) / 2;            // 1 front, 0 back
    return {
      x: Math.sin(t) * rx + bx * (1 - depth),
      y: by * (1 - depth),
      s: 0.42 + 0.58 * depth,
      depth,
      ry: -Math.sin(t) * 38,
    };
  }

  function drawGlobe(phase) {
    const R = size * 0.56, cx = W / 2, cy = H / 2, tilt = -0.32;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const accent = getComputedStyle(hub).getPropertyValue('--accent').trim() || '#f5b632';
    const glow = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.35);
    glow.addColorStop(0, accent + '30'); glow.addColorStop(1, accent + '00');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, R * 1.35, 0, TAU); ctx.fill();
    const proj = (lat, lon) => {
      const x = Math.cos(lat) * Math.sin(lon), y = Math.sin(lat), z = Math.cos(lat) * Math.cos(lon);
      const y2 = y * Math.cos(tilt) - z * Math.sin(tilt), z2 = y * Math.sin(tilt) + z * Math.cos(tilt);
      return [cx + x * R, cy - y2 * R, z2];
    };
    const line = (pts) => {
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0, z0] = pts[i - 1], [x1, y1, z1] = pts[i];
        const z = (z0 + z1) / 2;
        ctx.strokeStyle = accent + (z > 0 ? '66' : '1c');
        ctx.lineWidth = z > 0 ? 1.4 : 1;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      }
    };
    for (let k = 0; k < 12; k++) {             // meridians
      const lon = phase + (k * Math.PI) / 6, pts = [];
      for (let j = 0; j <= 48; j++) pts.push(proj(-Math.PI / 2 + (j * Math.PI) / 48, lon));
      line(pts);
    }
    for (let k = -2; k <= 2; k++) {            // parallels
      const lat = (k * Math.PI) / 7, pts = [];
      for (let j = 0; j <= 72; j++) pts.push(proj(lat, (j * TAU) / 72));
      line(pts);
    }
    ctx.strokeStyle = accent + '55'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
  }

  function render() {
    items.forEach((el, i) => {
      let t = (i - rot) * (TAU / n);
      t = mod(t + Math.PI, TAU) - Math.PI;
      const p = place(t);
      el.style.transform = `translate(-50%,-50%) translate(${p.x}px,${p.y}px) perspective(900px) rotateY(${p.ry}deg) scale(${p.s})`;
      el.style.zIndex = String(Math.round(p.depth * 100));
      el.style.opacity = String(0.55 + 0.45 * p.depth);
      el.style.filter = `blur(${((1 - p.depth) * 1.4).toFixed(2)}px) brightness(${(0.62 + 0.38 * p.depth).toFixed(3)})`;
      el.classList.toggle('is-front', p.depth > 0.92);
      el.tabIndex = p.depth > 0.5 ? 0 : -1;
    });
    const now = mod(Math.round(rot), n);
    if (now !== active) {
      active = now;
      captions.forEach((c, i) => c.classList.toggle('is-active', i === active));
      dots.forEach((d, i) => d.classList.toggle('is-active', i === active));
      hub.style.setProperty('--accent', items[active].style.getPropertyValue('--c'));
    }
    drawGlobe(spin - rot * (TAU / n));
  }

  function tick(ts) {
    const dt = Math.min(64, ts - (last || ts)); last = ts;
    if (!drag) {
      const d = target - rot;
      rot += Math.abs(d) < 0.0005 ? d : d * (1 - Math.exp(-dt / 110));
    }
    if (!reduce) spin += dt * 0.00012;
    render();
    raf = requestAnimationFrame(tick);
  }

  const go = (to) => { target = to; hub.classList.add('was-used'); };
  const step = (dir) => go(Math.round(target) + dir);

  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, rot, t: performance.now(), v: 0, lx: e.clientX, id: e.pointerId };
    moved = false;
    hub.classList.add('is-dragging');
  });
  addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    if (!moved && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(e.clientY - drag.y)) { moved = true; hub.classList.add('was-used'); }
    if (!moved) return;
    const span = Math.max(260, W * 0.55);
    rot = drag.rot - dx / span;
    const now = performance.now(), dtm = Math.max(1, now - drag.t);
    drag.v = 0.8 * drag.v + 0.2 * ((e.clientX - drag.lx) / span) / dtm * 1000;
    drag.t = now; drag.lx = e.clientX;
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    hub.classList.remove('is-dragging');
    if (moved) {
      let to = Math.round(rot - drag.v * 0.18);
      const from = Math.round(drag.rot);
      to = Math.max(from - 1, Math.min(from + 1, to));
      target = to;
    }
    drag = null;
  };
  addEventListener('pointerup', end);
  addEventListener('pointercancel', end);

  stage.addEventListener('click', (e) => {
    const item = e.target.closest('.hub-item');
    if (moved) { e.preventDefault(); moved = false; return; }
    if (!item) return;
    const i = +item.dataset.i;
    if (i !== mod(Math.round(target), n)) {
      e.preventDefault();
      let d = mod(i - Math.round(target), n); if (d > n / 2) d -= n;
      go(Math.round(target) + d);
    } else if (!item.hasAttribute('href')) e.preventDefault();
  });
  stage.addEventListener('dragstart', (e) => e.preventDefault());
  hub.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });
  hub.querySelectorAll('.hub-arrow').forEach(b => b.addEventListener('click', () => step(+b.dataset.dir)));
  dots.forEach(b => b.addEventListener('click', () => {
    const i = +b.dataset.go; let d = mod(i - Math.round(target), n); if (d > n / 2) d -= n; go(Math.round(target) + d);
  }));

  addEventListener('resize', () => { measure(); render(); });
  measure();
  hub.classList.add('is-ready');
  raf = requestAnimationFrame(tick);
})();
