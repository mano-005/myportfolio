(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;
  const small = innerWidth < 760;
  let mx = 0, my = 0, tx = 0, ty = 0, prog = 0, sp = 0;

  // ---------- Loader ----------
  const num = $('#ldNum'), bar = $('#ldBar'); let n = 0;
  const tick = () => { n = Math.min(100, n + 2 + Math.random() * 4); num.textContent = n | 0; bar.style.width = n + '%';
    n < 100 ? setTimeout(tick, 30) : setTimeout(() => { document.body.classList.add('ready'); countUp(); }, 250); };
  tick();

  // ---------- Count-up ----------
  function countUp() {
    $$('[data-count]').forEach(el => { const to = +el.dataset.count, t0 = performance.now();
      const f = t => { const k = Math.min(1, (t - t0) / 1600); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 4))); k < 1 && requestAnimationFrame(f); };
      requestAnimationFrame(f); });
  }

  // ---------- Reveal on scroll ----------
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
  $$('[data-r]').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 80 + 'ms'; io.observe(el); });

  // ---------- Active nav + progress ----------
  const links = $$('.pill a'), pbar = $('#progress');
  const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting)
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => so.observe(s));
  addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight; prog = max > 0 ? scrollY / max : 0;
    pbar.style.transform = `scaleX(${prog})`; }, { passive: true });

  // ---------- Pointer: glow + parallax + 3D tilt ----------
  const glow = $('#glow');
  if (fine) {
    addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5;
      glow.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; });
    document.addEventListener('pointerover', e => {
      const c = e.target.closest('.tilt'); if (!c || c._t) return; c._t = 1;
      const mv = ev => { const r = c.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width - .5, y = (ev.clientY - r.top) / r.height - .5;
        c.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(10px)`; };
      const lv = () => { c.style.transform = ''; c.removeEventListener('pointermove', mv); c.removeEventListener('pointerleave', lv); c._t = 0; };
      c.addEventListener('pointermove', mv); c.addEventListener('pointerleave', lv); });
  } else glow.style.display = 'none';

  // ---------- Three.js cinematic scene ----------
  addEventListener('load', () => {
    if (!window.THREE) return;
    try {
      const canvas = $('#bg'), R = new THREE.WebGLRenderer({ canvas, antialias: !small, alpha: true });
      R.setPixelRatio(Math.min(devicePixelRatio, 2)); R.setSize(innerWidth, innerHeight);
      const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x05070f, .055);
      const cam = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, .1, 100); cam.position.z = 9;

      const cyan = new THREE.Color(0x00e5ff), purple = new THREE.Color(0x9b5cff), col = new THREE.Color();
      const mat = c => new THREE.MeshBasicMaterial({ color: c, wireframe: true, transparent: true, opacity: .35 });
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(2.1, 1), mat(0x00e5ff));
      const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(3.6, .06, 220, 8, 2, 3), new THREE.MeshBasicMaterial({ color: 0x9b5cff, transparent: true, opacity: .55 }));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(5.2, .015, 8, 160), new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: .4 }));
      ring.rotation.x = 1.2;
      const hero = new THREE.Group(); hero.add(core, knot, ring); hero.position.x = small ? 0 : 3.2; scene.add(hero);

      // depth particles stretched along the camera path
      const N = small ? 700 : 2200, pos = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 40; pos[i * 3 + 1] = (Math.random() - .5) * 40; pos[i * 3 + 2] = -Math.random() * 70 + 12; }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: .06, color: 0xbfe9ff, transparent: true, opacity: .8, sizeAttenuation: true }));
      scene.add(pts);

      addEventListener('resize', () => { R.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); });
      let run = true, last = scrollY; document.addEventListener('visibilitychange', () => { run = !document.hidden; if (run) loop(); });

      const loop = t => {
        if (!run) return; t = (t || 0) * .001;
        tx += (mx - tx) * .05; ty += (my - ty) * .05; sp += (prog - sp) * .06;       // smoothed scroll progress
        const v = Math.abs(scrollY - last); last = scrollY;                          // scroll velocity -> warp
        cam.position.z = 9 - sp * 38;                                                // fly through the particle tunnel
        cam.position.x = tx * 1.6 + Math.sin(sp * 6) * 1.2; cam.position.y = -ty * 1.2 + Math.cos(sp * 5) * .6;
        cam.lookAt(hero.position.x * (1 - sp), 0, cam.position.z - 10);
        hero.position.z = -sp * 38 - 2;                                              // hero object travels with the camera
        hero.position.x = (small ? 0 : 3.2) * (1 - sp * 1.6);
        core.rotation.x = t * .15 + sp * 5; core.rotation.y = t * .2 + sp * 7;
        knot.rotation.x = -t * .1; knot.rotation.y = t * .12 + sp * 4; ring.rotation.z = t * .2;
        const s = 1 + Math.min(v, 80) * .004; core.scale.setScalar(s);
        col.copy(cyan).lerp(purple, Math.min(1, sp * 1.6)); core.material.color.copy(col);
        pts.rotation.z = t * .01 + sp * .6;
        R.render(scene, cam);
        if (!reduce) requestAnimationFrame(loop);
      };
      reduce ? loop() : requestAnimationFrame(loop);
    } catch (e) { console.warn('WebGL unavailable, using static background.', e); }
  });
})();
