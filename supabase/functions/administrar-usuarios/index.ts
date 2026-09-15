import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from 'jsr:@supabase/server@^1';

// INICIO CATALOGO GENERADO
const DEPENDENCIAS_INSTITUCIONALES = [
  {
    "unidad": "DIVISIÓN DE INVESTIGACIÓN DE TRATA DE PERSONAS",
    "ambito": "SEDE_CENTRAL",
    "departamento": "LIMA"
  },
  {
    "unidad": "DIVISIÓN DE INVESTIGACIÓN DE TRÁFICO ILÍCITO DE MIGRANTES",
    "ambito": "SEDE_CENTRAL",
    "departamento": "LIMA"
  },
  {
    "unidad": "DIVISIÓN DE INVESTIGACIÓN DE PERSONAS DESAPARECIDAS",
    "ambito": "SEDE_CENTRAL",
    "departamento": "LIMA"
  },
  {
    "unidad": "DIVISIÓN DE INTELIGENCIA",
    "ambito": "SEDE_CENTRAL",
    "departamento": "LIMA"
  },
  {
    "unidad": "DEPITPTIM ABANCAY",
    "ambito": "DESCONCENTRADO",
    "departamento": "APURIMAC"
  },
  {
    "unidad": "DEPITPTIM ANDAHUAYLAS",
    "ambito": "DESCONCENTRADO",
    "departamento": "APURIMAC"
  },
  {
    "unidad": "DEPITPTIM AREQUIPA",
    "ambito": "DESCONCENTRADO",
    "departamento": "AREQUIPA"
  },
  {
    "unidad": "DEPITPTIM AYACUCHO",
    "ambito": "DESCONCENTRADO",
    "departamento": "AYACUCHO"
  },
  {
    "unidad": "DEPITPTIM CAJAMARCA",
    "ambito": "DESCONCENTRADO",
    "departamento": "CAJAMARCA"
  },
  {
    "unidad": "DEPITPTIM CHIMBOTE",
    "ambito": "DESCONCENTRADO",
    "departamento": "ANCASH"
  },
  {
    "unidad": "DEPITPTIM CUSCO",
    "ambito": "DESCONCENTRADO",
    "departamento": "CUSCO"
  },
  {
    "unidad": "DEPITPTIM HUANCAVELICA",
    "ambito": "DESCONCENTRADO",
    "departamento": "HUANCAVELICA"
  },
  {
    "unidad": "DEPITPTIM HUARAZ",
    "ambito": "DESCONCENTRADO",
    "departamento": "ANCASH"
  },
  {
    "unidad": "DEPITPTIM HUANUCO",
    "ambito": "DESCONCENTRADO",
    "departamento": "HUANUCO"
  },
  {
    "unidad": "DEPITPTIM ICA",
    "ambito": "DESCONCENTRADO",
    "departamento": "ICA"
  },
  {
    "unidad": "DEPITPTIM JULIACA",
    "ambito": "DESCONCENTRADO",
    "departamento": "PUNO"
  },
  {
    "unidad": "DEPITPTIM JUNIN",
    "ambito": "DESCONCENTRADO",
    "departamento": "JUNIN"
  },
  {
    "unidad": "DEPITPTIM LA LIBERTAD",
    "ambito": "DESCONCENTRADO",
    "departamento": "LA LIBERTAD"
  },
  {
    "unidad": "DEPITPTIM LAMBAYEQUE",
    "ambito": "DESCONCENTRADO",
    "departamento": "LAMBAYEQUE"
  },
  {
    "unidad": "DEPITPTIM LORETO",
    "ambito": "DESCONCENTRADO",
    "departamento": "LORETO"
  },
  {
    "unidad": "DEPITPTIM MADRE DE DIOS",
    "ambito": "DESCONCENTRADO",
    "departamento": "MADRE DE DIOS"
  },
  {
    "unidad": "DEPITPTIM PIURA",
    "ambito": "DESCONCENTRADO",
    "departamento": "PIURA"
  },
  {
    "unidad": "DEPITPTIM PUNO",
    "ambito": "DESCONCENTRADO",
    "departamento": "PUNO"
  },
  {
    "unidad": "DEPITPTIM SAN MARTIN",
    "ambito": "DESCONCENTRADO",
    "departamento": "SAN MARTIN"
  },
  {
    "unidad": "DEPITPTIM TACNA",
    "ambito": "DESCONCENTRADO",
    "departamento": "TACNA"
  },
  {
    "unidad": "DEPITPTIM TUMBES",
    "ambito": "DESCONCENTRADO",
    "departamento": "TUMBES"
  },
  {
    "unidad": "DEPITPTIM UCAYALI",
    "ambito": "DESCONCENTRADO",
    "departamento": "UCAYALI"
  }
];
// FIN CATALOGO GENERADO

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    try {
      const userId = ctx.userClaims?.sub || ctx.userClaims?.id;
      if (!userId) throw new Error('Sesión no válida.');
      const { data: caller, error: callerError } = await ctx.supabaseAdmin
        .from('perfiles').select('rol, activo').eq('id', userId).single();
      if (callerError) throw callerError;
      if (!caller?.activo || caller.rol !== 'administrador') throw new Error('Solo un administrador puede gestionar usuarios.');

      const body = await req.json();
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
        const { error: deleteError } = await ctx.supabaseAdmin.auth.admin.deleteUser(body.id);
        if (deleteError) throw deleteError;
        await ctx.supabaseAdmin.from('perfiles').delete().eq('id', body.id);
        return Response.json({ ok: true });
      }
      const roles = ['administrador', 'supervisor', 'operador'];
      if (!roles.includes(body.rol)) throw new Error('Rol no válido.');
      if (!body.nombres?.trim() || !body.apellidos?.trim() || !body.unidad?.trim()) throw new Error('Complete los datos obligatorios.');
      const scopes = ['NACIONAL', 'SEDE_CENTRAL', 'DESCONCENTRADO'];
      const ambito = body.rol === 'administrador' ? 'NACIONAL' : String(body.ambito || '').trim().toUpperCase();
      if (!scopes.includes(ambito)) throw new Error('Ámbito no válido.');
      const departamento = body.rol === 'administrador' ? 'NACIONAL' : String(body.departamento || '').trim().toUpperCase();
      if (!departamento) throw new Error('Seleccione el departamento del usuario.');
      if (ambito === 'SEDE_CENTRAL' && departamento !== 'LIMA') throw new Error('La Sede Central debe pertenecer a Lima.');
      const unidad = body.rol === 'administrador' ? 'ADMINISTRACIÓN GENERAL DIRITPTIM' : body.unidad.trim().toUpperCase();
      if (body.rol !== 'administrador') {
        const dependency = DEPENDENCIAS_INSTITUCIONALES.find(item => item.unidad === unidad && item.ambito === ambito && item.departamento === departamento);
        if (!dependency) {
          let unchangedLegacy = false;
          if (body.accion === 'actualizar' && body.id) {
            const { data: previous, error: previousError } = await ctx.supabaseAdmin.from('perfiles').select('unidad,ambito,departamento,rol').eq('id',body.id).single();
            if (previousError) throw previousError;
            unchangedLegacy = previous?.unidad === unidad && previous?.ambito === ambito && previous?.departamento === departamento && previous?.rol === body.rol;
          }
          if (!unchangedLegacy) throw new Error('Seleccione una dependencia del catálogo correspondiente al ámbito y departamento.');
        }
      }

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
