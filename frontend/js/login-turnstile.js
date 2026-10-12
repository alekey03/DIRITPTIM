(() => {
  'use strict';
  const siteKey = '0x4AAAAAAFUzx8wXJZbnr3qN';
  const form = document.getElementById('loginForm');
  const button = document.getElementById('loginButton');
  const screen = document.getElementById('loginScreen');
  if (!form || !button || !screen) return;
  const area = document.createElement('div');
  const widget = document.createElement('div');
  const message = document.createElement('p');
  const retry = document.createElement('button');
  area.className = 'login-turnstile';
  widget.id = 'loginTurnstileWidget';
  message.setAttribute('role', 'status');
  message.textContent = 'Preparando verificación de seguridad…';
  retry.type = 'button'; retry.textContent = 'Reintentar verificación'; retry.hidden = true;
  area.append(widget, message, retry); button.before(area);
  const style = document.createElement('style');
  style.textContent = '.login-turnstile{display:flex;flex-direction:column;align-items:center;gap:8px;margin:14px 0;max-width:100%}.login-turnstile p{font-size:12px;line-height:1.4;color:#c2cddd;text-align:center;margin:0}.login-turnstile>button{font:inherit;font-size:12px;padding:7px 12px;color:#e3c98b;background:transparent;border:1px solid #88744c;border-radius:6px;cursor:pointer}.login-turnstile>button[hidden]{display:none}';
  document.head.append(style);
  let token = '', id = null, busy = false, script = null;
  const update = () => { button.disabled = busy || !token; };
  const clear = text => { token = ''; message.textContent = text; update(); };
  const reset = () => {
    clear('Verificando acceso seguro…');
    if (id !== null && window.turnstile) window.turnstile.reset(id);
  };
  const render = () => {
    if (!window.turnstile || id !== null || screen.classList.contains('hidden')) return;
    try {
      id = window.turnstile.render(widget, {
        sitekey: siteKey, theme: 'dark', language: 'es',
        size: form.clientWidth >= 300 ? 'normal' : 'compact',
        'response-field': false, 'refresh-expired': 'auto', 'refresh-timeout': 'auto',
        callback: value => { token = value; message.textContent = 'Verificación de seguridad completada.'; retry.hidden = true; update(); },
        'expired-callback': () => clear('La verificación venció. Actualizando…'),
        'timeout-callback': () => { clear('Completa la verificación para ingresar.'); retry.hidden = false; },
        'error-callback': () => { clear('No se pudo verificar la conexión. Puedes reintentar.'); retry.hidden = false; return true; }
      });
    } catch { clear('No se pudo cargar la verificación. Puedes reintentar.'); retry.hidden = false; }
  };
  const load = () => {
    if (window.turnstile) { if (id !== null) reset(); else render(); return; }
    script?.remove();
    script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=diritptimTurnstileReady&render=explicit';
    script.async = true; script.defer = true;
    script.onerror = () => { clear('No se pudo conectar con Cloudflare. Revisa tu conexión y reintenta.'); retry.hidden = false; };
    document.head.append(script);
  };
  window.diritptimTurnstileReady = render;
  retry.addEventListener('click', () => { retry.hidden = true; clear('Preparando verificación…'); load(); });
  new MutationObserver(() => {
    if (screen.classList.contains('hidden')) {
      token = ''; if (id !== null && window.turnstile) { window.turnstile.remove(id); id = null; } update();
    } else render();
  }).observe(screen, {attributes:true, attributeFilter:['class']});
  window.TurnstileLogin = {
    update, reset,
    async signIn(client, username, password) {
      if (busy) throw new Error('El ingreso está en curso.');
      if (!token) throw new Error('Completa la verificación de seguridad antes de ingresar.');
      const captchaToken = token;
      busy = true; token = ''; update();
      try {
        const email = `${username === 'amejia' ? 'administrador' : username}@mejia.local`;
        return await client.auth.signInWithPassword({email, password, options:{captchaToken}});
      } finally { busy = false; reset(); }
    }
  };
  update(); load();
})();
