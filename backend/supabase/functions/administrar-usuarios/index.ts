import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from 'jsr:@supabase/server@^1';

const DEPENDENCIAS_INSTITUCIONALES = [{"unidad": "DIVISIÓN DE INVESTIGACIÓN DE TRATA DE PERSONAS", "ambito": "SEDE_CENTRAL", "departamento": "LIMA"}, {"unidad": "DIVISIÓN DE INVESTIGACIÓN DE TRÁFICO ILÍCITO DE MIGRANTES", "ambito": "SEDE_CENTRAL", "departamento": "LIMA"}, {"unidad": "DIVISIÓN DE INVESTIGACIÓN Y BÚSQUEDA DE PERSONAS DESAPARECIDAS", "ambito": "SEDE_CENTRAL", "departamento": "LIMA"}, {"unidad": "DIVISIÓN DE EXTRANJERIA", "ambito": "SEDE_CENTRAL", "departamento": "LIMA"}, {"unidad": "DIVISIÓN DE INVESTIGACIÓN DE CRIMEN ORGANIZADO CONTRA LA TRATA DE PERSONAS", "ambito": "SEDE_CENTRAL", "departamento": "LIMA"}, {"unidad": "DEPITPTIM ABANCAY", "ambito": "DESCONCENTRADO", "departamento": "APURIMAC"}, {"unidad": "DEPITPTIM ANDAHUAYLAS", "ambito": "DESCONCENTRADO", "departamento": "APURIMAC"}, {"unidad": "DEPITPTIM AREQUIPA", "ambito": "DESCONCENTRADO", "departamento": "AREQUIPA"}, {"unidad": "DEPITPTIM AYACUCHO", "ambito": "DESCONCENTRADO", "departamento": "AYACUCHO"}, {"unidad": "DEPITPTIM CAJAMARCA", "ambito": "DESCONCENTRADO", "departamento": "CAJAMARCA"}, {"unidad": "DEPITPTIM CHIMBOTE", "ambito": "DESCONCENTRADO", "departamento": "ANCASH"}, {"unidad": "DEPITPTIM CUSCO", "ambito": "DESCONCENTRADO", "departamento": "CUSCO"}, {"unidad": "DEPITPTIM HUANCAVELICA", "ambito": "DESCONCENTRADO", "departamento": "HUANCAVELICA"}, {"unidad": "DEPITPTIM HUARAZ", "ambito": "DESCONCENTRADO", "departamento": "ANCASH"}, {"unidad": "DEPITPTIM HUANUCO", "ambito": "DESCONCENTRADO", "departamento": "HUANUCO"}, {"unidad": "DEPITPTIM ICA", "ambito": "DESCONCENTRADO", "departamento": "ICA"}, {"unidad": "DEPITPTIM JULIACA", "ambito": "DESCONCENTRADO", "departamento": "PUNO"}, {"unidad": "DEPITPTIM JUNIN", "ambito": "DESCONCENTRADO", "departamento": "JUNIN"}, {"unidad": "DEPITPTIM LA LIBERTAD", "ambito": "DESCONCENTRADO", "departamento": "LA LIBERTAD"}, {"unidad": "DEPITPTIM LAMBAYEQUE", "ambito": "DESCONCENTRADO", "departamento": "LAMBAYEQUE"}, {"unidad": "DEPITPTIM LORETO", "ambito": "DESCONCENTRADO", "departamento": "LORETO"}, {"unidad": "DEPITPTIM MADRE DE DIOS", "ambito": "DESCONCENTRADO", "departamento": "MADRE DE DIOS"}, {"unidad": "DEPITPTIM PIURA", "ambito": "DESCONCENTRADO", "departamento": "PIURA"}, {"unidad": "DEPITPTIM PUNO", "ambito": "DESCONCENTRADO", "departamento": "PUNO"}, {"unidad": "DEPITPTIM SAN MARTIN", "ambito": "DESCONCENTRADO", "departamento": "SAN MARTIN"}, {"unidad": "DEPITPTIM TACNA", "ambito": "DESCONCENTRADO", "departamento": "TACNA"}, {"unidad": "DEPITPTIM TUMBES", "ambito": "DESCONCENTRADO", "departamento": "TUMBES"}, {"unidad": "DEPITPTIM UCAYALI", "ambito": "DESCONCENTRADO", "departamento": "UCAYALI"}];

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    try {
      const userId = ctx.userClaims?.sub || ctx.userClaims?.id;
      if (!userId) throw new Error('Sesión no válida.');
      const { data: caller, error: callerError } = await ctx.supabaseAdmin
        .from('perfiles').select('rol, activo, usuario').eq('id', userId).single();
      if (callerError) throw callerError;
      if (!caller?.activo || !['administrador','estadistico_direccion'].includes(caller.rol)) throw new Error('Solo Dirección y el administrador general pueden crear usuarios.');
      const isRoot=caller.rol==='administrador' && caller.usuario==='administrador';

      const body = await req.json();
      if (!isRoot && body.accion!=='crear') throw new Error('Solo el administrador general puede modificar o eliminar cuentas.');
      if (!isRoot && body.rol==='estadistico_direccion') throw new Error('Solo el administrador general asigna los dos estadísticos de Dirección.');
      if (body.rol==='administrador' && (body.accion!=='actualizar' || body.id!==userId || !isRoot)) throw new Error('La administración general está reservada a la cuenta principal.');
      if (body.accion === 'eliminar') {
        if (!body.id) throw new Error('Usuario no identificado.');
        if (body.id === userId) throw new Error('No puede eliminar su propia cuenta.');
        const { data: target, error: targetError } = await ctx.supabaseAdmin.from('perfiles').select('rol,nombres,apellidos').eq('id', body.id).single();
        if (targetError) throw targetError;
        if (target.rol === 'administrador') {
          const { count, error: countError } = await ctx.supabaseAdmin.from('perfiles').select('id', { count: 'exact', head: true }).eq('rol', 'administrador').eq('activo', true);
          if (countError) throw countError;
          if ((count || 0) <= 1) throw new Error('Debe conservar al menos un administrador activo.');
        }
        const activityChecks = await Promise.all([
          ctx.supabaseAdmin.from('fichas').select('id', { count: 'exact', head: true }).eq('creado_por', body.id),
          ctx.supabaseAdmin.from('personas').select('id', { count: 'exact', head: true }).eq('creado_por', body.id),
          ctx.supabaseAdmin.from('detenciones').select('id', { count: 'exact', head: true }).eq('creado_por', body.id)
        ]);
        if (activityChecks.some(result => result.error)) throw activityChecks.find(result => result.error)?.error;
        if (activityChecks.some(result => (result.count || 0) > 0)) throw new Error('Este usuario tiene registros históricos. Por seguridad y auditoría, desactívelo en lugar de eliminarlo.');
        // Eliminar accesos no debe eliminar producción ni su autoría.
        const {data: fullProfile,error: fullError}=await ctx.supabaseAdmin.from('perfiles').select('*').eq('id',body.id).single();
        if(fullError) throw fullError;
        const {error: profileDeleteError}=await ctx.supabaseAdmin.from('perfiles').delete().eq('id',body.id);
        if(profileDeleteError) throw new Error('La cuenta tiene historial vinculado. Desactívela para conservar la autoría.');
        const { error: deleteError } = await ctx.supabaseAdmin.auth.admin.deleteUser(body.id);
        if(deleteError){await ctx.supabaseAdmin.from('perfiles').insert(fullProfile);throw deleteError;}
        return Response.json({ ok: true });
      }
      const roles = ['administrador','estadistico_direccion','estadistico_division','estadistico_jefatura','estadistico_depitptim','visualizador'];
      if (!roles.includes(body.rol)) throw new Error('Rol no válido.');
      if (!body.nombres?.trim() || !body.apellidos?.trim() || !body.unidad?.trim()) throw new Error('Complete los datos obligatorios.');
      const national=['administrador','estadistico_direccion','visualizador'].includes(body.rol);
      const jef=body.rol==='estadistico_jefatura';
      const ambito=national?'NACIONAL':body.rol==='estadistico_division'?'SEDE_CENTRAL':'DESCONCENTRADO';
      const unidad=body.rol==='visualizador'?'VISUALIZACIÓN NACIONAL DIRITPTIM':body.rol==='administrador'?'ADMINISTRACIÓN GENERAL DIRITPTIM':body.rol==='estadistico_direccion'?'ESTADÍSTICA DE DIRECCIÓN DIRITPTIM':jef?'JEFDDITP':String(body.unidad||'').trim().toUpperCase();
      const dependency=DEPENDENCIAS_INSTITUCIONALES.find(d=>d.unidad===unidad && d.ambito===ambito);
      if(!national && !jef && !dependency) throw new Error('Seleccione una dependencia válida para el perfil estadístico.');
      const departamento=national||jef?'NACIONAL':dependency.departamento;

      if (body.accion === 'crear') {
        const usuario = String(body.usuario || '').trim().toLowerCase();
        if (!/^[a-z0-9._-]{3,30}$/.test(usuario)) throw new Error('El nombre de usuario no es válido.');
        if (String(body.contrasena || '').length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
        const { data: created, error: authError } = await ctx.supabaseAdmin.auth.admin.createUser({
          email: `${usuario}@mejia.local`, password: body.contrasena, email_confirm: true
        });
        if (authError) throw authError;
        const { error: profileError } = await ctx.supabaseAdmin.from('perfiles').insert({
          id: created.user.id, usuario, nombres: body.nombres.trim(), apellidos: body.apellidos.trim(),
          unidad, departamento, ambito, rol: body.rol, activo: true
        });
        if (profileError) {
          await ctx.supabaseAdmin.auth.admin.deleteUser(created.user.id);
          throw profileError;
        }
      } else if (body.accion === 'actualizar') {
        if (!body.id) throw new Error('Usuario no identificado.');
        if (body.id === userId && (body.rol !== 'administrador' || body.activo === false)) throw new Error('No puede quitarse su propio acceso de administrador.');
        if (body.contrasena && String(body.contrasena).length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
        const { error: profileError } = await ctx.supabaseAdmin.from('perfiles').update({
          nombres: body.nombres.trim(), apellidos: body.apellidos.trim(), unidad, departamento, ambito,
          rol: body.rol, activo: Boolean(body.activo)
        }).eq('id', body.id);
        if (profileError) throw profileError;
        if (body.contrasena) {
          const { error: passwordError } = await ctx.supabaseAdmin.auth.admin.updateUserById(body.id, { password: body.contrasena });
          if (passwordError) throw passwordError;
        }
      } else {
        throw new Error('Acción no válida.');
      }
      return Response.json({ ok: true });
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : typeof error === 'object' && error && 'message' in error
          ? String(error.message)
          : JSON.stringify(error);
      console.error('Error al administrar usuario:', error);
      return Response.json({ ok: false, error: message || 'Error inesperado.' }, { status: 400 });
    }
  }),
};
