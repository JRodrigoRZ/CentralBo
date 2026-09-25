import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://wuerdwkcpurbtcwyqjep.supabase.co';
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(str: unknown): boolean {
  return typeof str === 'string' && UUID_REGEX.test(str.trim());
}

function timeToMinutes(timeStr: string): number {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido. Solo se admite POST.',
    });
  }

  if (!supabaseServiceRoleKey) {
    console.error('[CentralBo Appointments API] Error crítico: SUPABASE_SERVICE_ROLE_KEY no está configurada.');
    return res.status(500).json({
      success: false,
      error: 'Error de configuración del servidor. No se pueden procesar citas en este momento.',
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Cuerpo de solicitud inválido. Se requiere formato JSON válido.',
      });
    }
  }
  body = body || {};

  const {
    id: inputId,
    tenantId,
    serviceId,
    professionalId,
    customerName,
    customerPhone,
    customerEmail,
    date,
    startTime,
    time,
    notes,
  } = body;

  const actualStartTime = startTime || time;

  // 1. Validar formato de identificadores
  if (!tenantId || !isValidUUID(tenantId)) {
    return res.status(400).json({
      success: false,
      error: 'Identificador de comercio (tenantId) no válido.',
    });
  }

  if (!serviceId || !isValidUUID(serviceId)) {
    return res.status(400).json({
      success: false,
      error: 'Identificador de servicio (serviceId) no válido.',
    });
  }

  if (!professionalId || !isValidUUID(professionalId)) {
    return res.status(400).json({
      success: false,
      error: 'Identificador de profesional no válido.',
    });
  }

  if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      success: false,
      error: 'Fecha no válida. Debe tener formato YYYY-MM-DD.',
    });
  }

  if (!actualStartTime || typeof actualStartTime !== 'string' || !/^\d{1,2}:\d{2}$/.test(actualStartTime)) {
    return res.status(400).json({
      success: false,
      error: 'Hora de inicio no válida. Debe tener formato HH:mm.',
    });
  }

  const trimmedCustName = typeof customerName === 'string' ? customerName.trim() : '';
  if (!trimmedCustName || trimmedCustName.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'El nombre del cliente es obligatorio (mínimo 2 caracteres).',
    });
  }

  const trimmedCustPhone = typeof customerPhone === 'string' ? customerPhone.trim() : '';
  const digitsOnly = trimmedCustPhone.replace(/\D/g, '');
  if (!trimmedCustPhone || digitsOnly.length < 7) {
    return res.status(400).json({
      success: false,
      error: 'El teléfono del cliente es obligatorio y debe contener al menos 7 dígitos válidos.',
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    // 2. Validar que la tienda exista en public.stores y esté activa o en prueba
    const { data: storeData, error: storeErr } = await supabase
      .from('stores')
      .select('id, name, status')
      .eq('id', tenantId)
      .maybeSingle();

    if (storeErr || !storeData) {
      return res.status(404).json({
        success: false,
        error: 'El comercio especificado no existe.',
      });
    }

    if (!['activo', 'prueba'].includes(storeData.status)) {
      return res.status(403).json({
        success: false,
        error: 'El comercio no se encuentra habilitado para recibir citas.',
      });
    }

    // 3. Validar que el servicio exista en public.products, pertenezca al tenant y obtener su duración canónica
    const { data: productData, error: prodErr } = await supabase
      .from('products')
      .select('id, tenant_id, name, status, attributes')
      .eq('id', serviceId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (prodErr || !productData) {
      return res.status(404).json({
        success: false,
        error: 'El servicio solicitado no existe o no pertenece a este comercio.',
      });
    }

    if (productData.status !== 'activo') {
      return res.status(400).json({
        success: false,
        error: 'El servicio solicitado no se encuentra activo actualmente.',
      });
    }

    const prodAttributes = productData.attributes || {};
    if (prodAttributes.is_service === false) {
      return res.status(400).json({
        success: false,
        error: 'El producto seleccionado no corresponde a un servicio agendable.',
      });
    }

    // Extraer duración canónica desde el servicio (NO confiar en lo enviado por el cliente)
    const rawDur = Number(prodAttributes.duration_minutes);
    const serviceDuration = Number.isFinite(rawDur) && rawDur > 0 ? rawDur : 60;
    const serviceName = productData.name;

    // 4. Validar profesional en public.professionals
    const { data: profData, error: profErr } = await supabase
      .from('professionals')
      .select('id, tenant_id, name, is_active, service_ids, schedule')
      .eq('id', professionalId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (profErr || !profData) {
      return res.status(404).json({
        success: false,
        error: 'El profesional seleccionado no existe o no pertenece a este comercio.',
      });
    }

    if (!profData.is_active) {
      return res.status(400).json({
        success: false,
        error: 'El profesional seleccionado no se encuentra activo actualmente.',
      });
    }

    // 5. VALIDACIÓN CRÍTICA: Servicio ↔ Profesional
    // El profesional debe tener asignado el serviceId en su arreglo service_ids
    const profServiceIds = Array.isArray(profData.service_ids) ? profData.service_ids : [];
    if (!profServiceIds.includes(serviceId)) {
      return res.status(400).json({
        success: false,
        error: `El profesional ${profData.name} no atiende el servicio solicitado (${serviceName}).`,
      });
    }

    // 6. Verificar día de la semana y jornada laboral del profesional
    const [y, m, d] = date.split('-').map(Number);
    const dayOfWeek = new Date(y, m - 1, d, 12, 0, 0).getDay();
    const scheduleList = Array.isArray(profData.schedule) ? profData.schedule : [];
    const daySchedule = scheduleList.find((s: any) => s.dayOfWeek === dayOfWeek);

    if (!daySchedule || !daySchedule.isOpen) {
      return res.status(400).json({
        success: false,
        error: `El profesional ${profData.name} no atiende el día seleccionado (${date}).`,
      });
    }

    const workStart = timeToMinutes(daySchedule.startTime || '09:00');
    const workEnd = timeToMinutes(daySchedule.endTime || '18:00');
    const reqStart = timeToMinutes(actualStartTime);
    const reqEnd = reqStart + serviceDuration;

    if (reqStart < workStart || reqEnd > workEnd) {
      return res.status(400).json({
        success: false,
        error: `El horario solicitado (${actualStartTime} a ${minutesToTime(reqEnd)}) excede la jornada laboral de ${profData.name} (${daySchedule.startTime} a ${daySchedule.endTime}).`,
      });
    }

    const appointmentId = inputId && isValidUUID(inputId) ? inputId : crypto.randomUUID();
    const cleanEmail = (typeof customerEmail === 'string' ? customerEmail.trim() : '').slice(0, 150);
    const cleanNotes = (typeof notes === 'string' ? notes.trim() : '').slice(0, 500);

    // 7. PROTECCIÓN CONTRA DOBLE RESERVA Y CONCURRENCIA
    // Intentar ejecutar la función atómica create_appointment_atomic con pg_advisory_xact_lock
    const { data: atomicResult, error: atomicErr } = await supabase.rpc(
      'create_appointment_atomic',
      {
        p_id: appointmentId,
        p_tenant_id: tenantId,
        p_service_id: serviceId,
        p_service_name: serviceName,
        p_professional_id: professionalId,
        p_professional_name: profData.name,
        p_customer_name: trimmedCustName.slice(0, 150),
        p_customer_phone: trimmedCustPhone.slice(0, 50),
        p_customer_email: cleanEmail,
        p_date: date,
        p_start_time: actualStartTime,
        p_duration_minutes: serviceDuration,
        p_notes: cleanNotes,
      }
    );

    if (!atomicErr && atomicResult) {
      if (atomicResult.success && atomicResult.appointment) {
        return res.status(201).json({
          success: true,
          appointment: atomicResult.appointment,
        });
      }

      if (
        atomicResult.error === 'OVERLAP_CONFLICT_APPOINTMENT' ||
        atomicResult.error === 'OVERLAP_CONFLICT_BLOCK'
      ) {
        return res.status(409).json({
          success: false,
          error:
            atomicResult.message ||
            'El horario seleccionado ya no está disponible (ha sido reservado o bloqueado). Por favor selecciona otro horario.',
        });
      }
    }

    // 8. Fallback de verificación directa antes del insert si la función atómica aún no fue desplegada
    // Comprobar solapamiento contra citas activas (pending, confirmed)
    const { data: existingAppts } = await supabase
      .from('appointments')
      .select('id, start_time, duration_minutes, status')
      .eq('professional_id', professionalId)
      .eq('date', date)
      .in('status', ['pending', 'confirmed', 'pendiente', 'confirmada']);

    if (Array.isArray(existingAppts)) {
      for (const appt of existingAppts) {
        const apptStart = timeToMinutes(appt.start_time);
        const apptDur = Number(appt.duration_minutes) || 60;
        const apptEnd = apptStart + apptDur;

        if (reqStart < apptEnd && reqEnd > apptStart) {
          return res.status(409).json({
            success: false,
            error: `El horario seleccionado (${actualStartTime} - ${minutesToTime(reqEnd)}) ya no está disponible (ha sido reservado por otro cliente). Por favor selecciona otro horario.`,
          });
        }
      }
    }

    // Comprobar solapamiento contra bloqueos manuales
    const { data: existingBlocks } = await supabase
      .from('appointment_blocks')
      .select('id, start_time, duration_minutes')
      .eq('professional_id', professionalId)
      .eq('date', date);

    if (Array.isArray(existingBlocks)) {
      for (const blk of existingBlocks) {
        const blkStart = timeToMinutes(blk.start_time);
        const blkDur = Number(blk.duration_minutes) || 60;
        const blkEnd = blkStart + blkDur;

        if (reqStart < blkEnd && reqEnd > blkStart) {
          return res.status(409).json({
            success: false,
            error: `El horario seleccionado (${actualStartTime} - ${minutesToTime(reqEnd)}) se encuentra bloqueado por la administración. Por favor selecciona otro horario.`,
          });
        }
      }
    }

    const newApptPayload = {
      id: appointmentId,
      tenant_id: tenantId,
      service_id: serviceId,
      service_name: serviceName.slice(0, 255),
      professional_id: professionalId,
      professional_name: profData.name.slice(0, 150),
      customer_name: trimmedCustName.slice(0, 150),
      customer_phone: trimmedCustPhone.slice(0, 50),
      customer_email: cleanEmail,
      date: date,
      start_time: actualStartTime,
      duration_minutes: serviceDuration,
      status: 'pending',
      notes: cleanNotes,
    };

    const { data: inserted, error: insertErr } = await supabase
      .from('appointments')
      .insert(newApptPayload)
      .select('*')
      .single();

    if (insertErr) {
      if (insertErr.code === 'PGRST205') {
        console.warn('[CentralBo Appointments API] Tabla "public.appointments" pendiente de migración en Supabase.');
        return res.status(201).json({
          success: true,
          appointment: newApptPayload,
          warning: 'Tabla pendiente de migración en Supabase.',
        });
      }
      return res.status(500).json({
        success: false,
        error: `Error al registrar cita en la base central: ${insertErr.message}`,
      });
    }

    return res.status(201).json({
      success: true,
      appointment: inserted,
    });
  } catch (err: any) {
    console.error('[CentralBo Appointments API] Excepción al procesar cita:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Error interno del servidor al procesar la cita.',
    });
  }
}
