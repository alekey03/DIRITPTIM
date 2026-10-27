// Retired Google test endpoint. All sign-ins use Supabase Auth with Turnstile.
Deno.serve(() => new Response(JSON.stringify({error:'Esta ruta de prueba fue retirada. Ingresa desde DIRITPTIM.'}), {status:410,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':'https://alekey03.github.io'}}));
