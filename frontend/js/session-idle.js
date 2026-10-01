// Activity is shared only between tabs of this browser, never between devices.
(() => {
  const LIMIT = 30 * 60 * 1000;
  let key = null, last = 0, active = false, expireHandler = null;
  const read = () => { try { return Number(localStorage.getItem(key)); } catch { return last; } };
  const write = value => { last = value; try { localStorage.setItem(key, String(value)); } catch {} };
  function check() {
    if (!active) return false;
    const stored = read();
    if (stored > last) last = stored;
    if (stored === -1 || Date.now() - last >= LIMIT) {
      active = false;
      write(-1);
      expireHandler?.();
      return false;
    }
    return true;
  }
  function activity(event) {
    if (!event.isTrusted || !check()) return;
    write(Date.now());
  }
  window.IdleSession = {
    start(userId, fresh, onExpire) {
      key = `diritptim-idle-v1:${userId}`;
      expireHandler = onExpire;
      last = read();
      if (fresh || !last) write(Date.now());
      active = true;
      return check();
    },
    check,
    stop() { active = false; if (key) write(-1); }
  };
  for (const type of ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart', 'input']) {
    document.addEventListener(type, activity, { passive: true, capture: true });
  }
  // Waking a suspended device/tab checks elapsed wall time, without extending it.
  document.addEventListener('visibilitychange', check);
  window.addEventListener('focus', check);
  window.addEventListener('pageshow', check);
  window.addEventListener('storage', event => { if (event.key === key) check(); });
  setInterval(check, 1000);
})();
