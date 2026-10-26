(() => {
  const room = document.getElementById('room'), card = document.getElementById('regCard');
  const btn = document.getElementById('pull'), wrap = document.getElementById('cordWrap'), cord = wrap.querySelector('.cord');
  let on = false, startY = null, moved = false, suppress = false;
  card.inert = true; // form can't be tabbed to while the room is dark (JS-only, so no-JS users still get the form)

  const set = v => {
    on = v; room.classList.toggle('on', on); card.inert = !on;
    btn.setAttribute('aria-pressed', on);
    btn.setAttribute('aria-label', on ? 'Pull to turn the lamp off' : 'Pull to turn the lamp on');
    if (on) setTimeout(() => { const n = document.getElementById('name'); n && n.offsetParent && n.focus({ preventScroll: true }); }, 800);
  };
  const tug = () => { wrap.style.setProperty('--pull', '22px'); setTimeout(() => wrap.style.setProperty('--pull', '0px'), 140); };

  btn.addEventListener('pointerdown', e => { startY = e.clientY; moved = false; btn.setPointerCapture(e.pointerId); cord.classList.add('drag'); });
  btn.addEventListener('pointermove', e => {
    if (startY === null) return;
    const d = Math.max(0, Math.min(46, e.clientY - startY)); if (d > 4) moved = true;
    wrap.style.setProperty('--pull', d + 'px');
  });
  btn.addEventListener('pointerup', e => {
    if (startY === null) return;
    const d = e.clientY - startY; startY = null; cord.classList.remove('drag'); wrap.style.setProperty('--pull', '0px');
    if (d > 14 || !moved) { set(!on); suppress = true; setTimeout(() => suppress = false, 0); }
  });
  btn.addEventListener('pointercancel', () => { startY = null; cord.classList.remove('drag'); wrap.style.setProperty('--pull', '0px'); });
  btn.addEventListener('click', () => { if (suppress) return; tug(); set(!on); }); // keyboard: Enter / Space
})();
