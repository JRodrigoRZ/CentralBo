import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Briefcase,
  X,
  Phone,
  Mail,
  Lock,
} from 'lucide-react';
import {
  Product,
  ProfessionalItem,
  ReservedTimeSlot,
  AppointmentRequest,
  ProfessionalAgendaSlot,
} from '../../types';
import {
  getStoreReservedTimeSlots,
  getStoreAppointments,
  saveStoreAppointments,
  getProfessionalAgendaSlots,
  fetchProfessionalAgendaSlots,
  createStoreAppointment,
  getServiceDurationMinutes,
} from '../../lib/storeAdminService';
import { recordCustomerAppointment, getSavedCustomerProfile } from './cartStorage';

interface ServiceBookingModalProps {
  tenantId: string;
  storeName: string;
  storeWhatsapp: string;
  services: Product[];
  professionals: ProfessionalItem[];
  preselectedServiceId?: string;
  onClose: () => void;
  primaryColor?: string;
}

// SEC-14A-03: Rate Limiting y Protección contra Abuso en Solicitud de Citas
const BOOKING_COOLDOWN_MS = 15000; // 15 segundos entre solicitudes consecutivas
const MAX_PENDING_APPOINTMENTS_PER_CLIENT = 3; // Máximo 3 reservas pendientes por cliente/teléfono

export const ServiceBookingModal: React.FC<ServiceBookingModalProps> = ({
  tenantId,
  storeName,
  storeWhatsapp,
  services,
  professionals,
  preselectedServiceId,
  onClose,
  primaryColor = '#10b981',
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    preselectedServiceId || (services[0]?.id || '')
  );

  const selectedService = services.find((s) => s.id === selectedServiceId);

  // Filtrar profesionales activos asignados a este servicio mediante sus serviceIds reales (H-02 Parte 1)
  const eligibleProfessionals = professionals.filter(
    (p) =>
      p.isActive &&
      Array.isArray(p.serviceIds) &&
      p.serviceIds.includes(selectedServiceId)
  );

  const availableProfessionals = eligibleProfessionals;

  const [selectedProfId, setSelectedProfId] = useState<string>(() => {
    const preferredProfId = selectedService?.attributes?.professional_id as string;
    if (preferredProfId && availableProfessionals.some((p) => p.id === preferredProfId)) {
      return preferredProfId;
    }
    return availableProfessionals[0]?.id || '';
  });

  // Si cambia el servicio y el profesional actual no puede realizarlo, auto-seleccionar uno habilitado
  useEffect(() => {
    if (availableProfessionals.length > 0) {
      if (!availableProfessionals.some((p) => p.id === selectedProfId)) {
        setSelectedProfId(availableProfessionals[0].id);
      }
    } else {
      setSelectedProfId('');
    }
  }, [selectedServiceId, availableProfessionals, selectedProfId]);

  const currentProfessional =
    professionals.find((p) => p.id === selectedProfId) ||
    availableProfessionals[0] ||
    null;

  // Fecha: Mismo día (Hoy) o Día siguiente (Mañana)
  const today = new Date();
  const tomorrow = new Date(Date.now() + 86400000);

  const formatDateStr = (d: Date) => d.toISOString().split('T')[0];

  const todayStr = formatDateStr(today);
  const tomorrowStr = formatDateStr(tomorrow);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Perfil guardado si existe
  const savedProfile = getSavedCustomerProfile(tenantId);
  const [customerName, setCustomerName] = useState(savedProfile?.name || '');
  const [customerPhone, setCustomerPhone] = useState(
    savedProfile?.whatsapp || savedProfile?.phone || ''
  );
  const [customerEmail, setCustomerEmail] = useState(savedProfile?.email || '');
  const [notes, setNotes] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedAppointment, setSubmittedAppointment] =
    useState<AppointmentRequest | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // SEC-14A-03: Cooldown temporal para reservas
  const [bookingCooldownRemaining, setBookingCooldownRemaining] = useState<number>(() => {
    const lastTs = Number(sessionStorage.getItem(`cb_last_booking_${tenantId}`) || 0);
    const elapsed = Date.now() - lastTs;
    if (elapsed < BOOKING_COOLDOWN_MS) {
      return Math.ceil((BOOKING_COOLDOWN_MS - elapsed) / 1000);
    }
    return 0;
  });

  useEffect(() => {
    if (bookingCooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      const lastTs = Number(sessionStorage.getItem(`cb_last_booking_${tenantId}`) || 0);
      const elapsed = Date.now() - lastTs;
      const remaining = Math.ceil((BOOKING_COOLDOWN_MS - elapsed) / 1000);
      if (remaining <= 0) {
        setBookingCooldownRemaining(0);
        clearInterval(timer);
      } else {
        setBookingCooldownRemaining(remaining);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [bookingCooldownRemaining, tenantId]);

  const serviceDuration = getServiceDurationMinutes(selectedService);

  // Obtener turnos calculados según la disponibilidad propia de este profesional y duración del servicio
  const [professionalSlots, setProfessionalSlots] = useState<ProfessionalAgendaSlot[]>(() => {
    return currentProfessional
      ? getProfessionalAgendaSlots(tenantId, currentProfessional, selectedDate, serviceDuration)
      : [];
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sincronizar turnos en tiempo real con Supabase y solapamientos reales
  useEffect(() => {
    let mounted = true;
    if (currentProfessional) {
      fetchProfessionalAgendaSlots(tenantId, currentProfessional, selectedDate, serviceDuration)
        .then((fresh) => {
          if (mounted) {
            setProfessionalSlots(fresh);
          }
        })
        .catch(() => {
          if (mounted) {
            setProfessionalSlots(
              getProfessionalAgendaSlots(tenantId, currentProfessional, selectedDate, serviceDuration)
            );
          }
        });
    } else {
      setProfessionalSlots([]);
    }
    return () => {
      mounted = false;
    };
  }, [tenantId, currentProfessional?.id, selectedDate, serviceDuration]);

  // Resetear hora si la hora seleccionada ya no es válida para la nueva fecha/profesional
  useEffect(() => {
    if (selectedTime) {
      const slot = professionalSlots.find((s) => s.time === selectedTime);
      if (!slot || slot.status !== 'disponible') {
        setSelectedTime('');
      }
    }
  }, [selectedDate, selectedProfId, professionalSlots, selectedTime]);

  const isValidCalendarDate = (dateStr: string): boolean => {
    if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return false;
    }
    const [yearStr, monthStr, dayStr] = dateStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    if (year < 2020 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
      return false;
    }

    const parsed = new Date(year, month - 1, day);
    return (
      parsed.getFullYear() === year &&
      parsed.getMonth() === month - 1 &&
      parsed.getDate() === day
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // SEC-14A-03: Verificación de cooldown entre solicitudes de reserva
    const lastBookingTs = Number(sessionStorage.getItem(`cb_last_booking_${tenantId}`) || 0);
    const elapsed = Date.now() - lastBookingTs;
    if (elapsed < BOOKING_COOLDOWN_MS) {
      const remainingSecs = Math.ceil((BOOKING_COOLDOWN_MS - elapsed) / 1000);
      setBookingCooldownRemaining(remainingSecs);
      setErrorMsg(`Por favor espera ${remainingSecs} segundo${remainingSecs === 1 ? '' : 's'} antes de enviar otra solicitud de cita.`);
      return;
    }

    // 1. Validación estricta de Fecha (formato YYYY-MM-DD, existencia en calendario y no pasada)
    if (!selectedDate || typeof selectedDate !== 'string') {
      setErrorMsg('Por favor selecciona una fecha válida para tu cita.');
      return;
    }
    if (!isValidCalendarDate(selectedDate)) {
      setErrorMsg('La fecha seleccionada no es una fecha válida en el calendario (ej. 31 de febrero no existe).');
      return;
    }
    if (selectedDate < todayStr) {
      setErrorMsg('No es posible reservar citas en fechas pasadas. Por favor selecciona hoy o una fecha posterior.');
      return;
    }

    if (!selectedService) {
      setErrorMsg('Selecciona un servicio válido.');
      return;
    }
    if (!currentProfessional) {
      setErrorMsg('Selecciona un profesional para tu atención.');
      return;
    }
    if (!selectedTime) {
      setErrorMsg('Selecciona un horario disponible para tu cita.');
      return;
    }

    // 2. Validación de cliente
    const trimmedName = customerName.trim();
    if (!trimmedName) {
      setErrorMsg('Por favor ingresa tu nombre.');
      return;
    }
    if (trimmedName.length > 100) {
      setErrorMsg('El nombre no puede exceder 100 caracteres.');
      return;
    }

    const trimmedPhone = customerPhone.trim();
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{5,20}$/;
    const digitsOnly = trimmedPhone.replace(/\D/g, '');
    if (
      !trimmedPhone ||
      trimmedPhone.length < 7 ||
      trimmedPhone.length > 25 ||
      !phoneRegex.test(trimmedPhone) ||
      digitsOnly.length < 7
    ) {
      setErrorMsg('Por favor ingresa un número de teléfono válido (mínimo 7 dígitos, ej. 71234567 o +591 71234567).');
      return;
    }

    // SEC-14A-03: Límite de reservas pendientes por cliente/teléfono en este comercio
    const existing = getStoreAppointments(tenantId);
    const pendingForCustomer = existing.filter(
      (appt) =>
        appt.customerPhone.replace(/\D/g, '') === digitsOnly &&
        (appt.status === 'pending' || appt.status === 'pendiente')
    );

    if (pendingForCustomer.length >= MAX_PENDING_APPOINTMENTS_PER_CLIENT) {
      setErrorMsg(
        `Has alcanzado el límite máximo permitido de ${MAX_PENDING_APPOINTMENTS_PER_CLIENT} reservas pendientes para este comercio. Por favor espera a que el comercio confirme o gestione tus citas anteriores antes de realizar otra reserva.`
      );
      return;
    }

    setIsSubmitting(true);
    const result = await createStoreAppointment(tenantId, {
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      professionalId: currentProfessional.id,
      professionalName: currentProfessional.name,
      customerName: trimmedName.slice(0, 100),
      customerPhone: trimmedPhone.slice(0, 25),
      customerEmail: customerEmail.trim().slice(0, 120) || 'cliente@centralbo.bo',
      date: selectedDate,
      time: selectedTime,
      durationMinutes: serviceDuration,
      notes: notes.trim().slice(0, 300),
    });
    setIsSubmitting(false);

    if (!result.success || !result.appointment) {
      setErrorMsg(
        result.error ||
          'El horario seleccionado ya no está disponible (ha sido reservado o bloqueado). Por favor elige otro horario.'
      );
      // Revalidar y actualizar turnos en tiempo real
      if (currentProfessional) {
        fetchProfessionalAgendaSlots(tenantId, currentProfessional, selectedDate, serviceDuration).then(
          (fresh) => setProfessionalSlots(fresh)
        );
      }
      return;
    }

    // Guardar en pedidos/citas del cliente local
    recordCustomerAppointment(result.appointment);

    // SEC-14A-03: Registrar emisión para cooldown temporal
    sessionStorage.setItem(`cb_last_booking_${tenantId}`, String(Date.now()));
    setBookingCooldownRemaining(Math.ceil(BOOKING_COOLDOWN_MS / 1000));

    setSubmittedAppointment(result.appointment);
    setIsSubmitted(true);
  };

  const cleanWhatsapp = (storeWhatsapp || '').replace(/\D/g, '');

  const formatEndTime = (startTimeStr: string, durationMin: number) => {
    const [h, m] = startTimeStr.split(':').map(Number);
    const startM = (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
    const endM = startM + durationMin;
    const endH = Math.floor(endM / 60);
    const endMin = endM % 60;
    return `${String(endH).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
  };

  if (isSubmitted && submittedAppointment) {
    const apptDuration = submittedAppointment.durationMinutes || serviceDuration;
    const endTime = formatEndTime(submittedAppointment.time, apptDuration);

    const waText = `¡Hola *${storeName}*! 👋 Acabo de solicitar una cita para un servicio:

💆 *SERVICIO:* ${submittedAppointment.serviceName} (${apptDuration} min)
👤 *PROFESIONAL:* ${submittedAppointment.professionalName}
📅 *FECHA:* ${submittedAppointment.date === todayStr ? 'Hoy' : 'Mañana'} (${submittedAppointment.date})
⏰ *HORA SOLICITADA:* ${submittedAppointment.time} a ${endTime}

👤 *DATOS DEL CLIENTE:*
Nombre: ${submittedAppointment.customerName}
Teléfono: ${submittedAppointment.customerPhone}
${submittedAppointment.notes ? `Notas: ${submittedAppointment.notes}\n` : ''}
⚠️ _Comprendo que la cita se encuentra *pendiente de confirmación* por el profesional. Quedo atento a su respuesta para confirmar._ Muchas gracias.`;

    const waUrl = cleanWhatsapp
      ? `https://wa.me/${cleanWhatsapp.startsWith('591') ? cleanWhatsapp : '591' + cleanWhatsapp}?text=${encodeURIComponent(waText)}`
      : null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
              ¡Solicitud de Cita Enviada!
            </h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>La cita está pendiente de confirmación por el profesional</span>
            </div>
          </div>

          <div className="rounded-2xl bg-stone-50 dark:bg-stone-950/80 border border-stone-200/80 dark:border-stone-800 p-4 text-left space-y-2 text-xs text-stone-700 dark:text-stone-300">
            <div className="flex justify-between border-b border-stone-200/80 dark:border-stone-800 pb-2">
              <span className="text-stone-500 dark:text-stone-400">Servicio:</span>
              <span className="font-semibold text-stone-900 dark:text-white">{submittedAppointment.serviceName}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200/80 dark:border-stone-800 pb-2">
              <span className="text-stone-500 dark:text-stone-400">Profesional:</span>
              <span className="font-semibold text-stone-900 dark:text-white">{submittedAppointment.professionalName}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200/80 dark:border-stone-800 pb-2">
              <span className="text-stone-500 dark:text-stone-400">Fecha y Hora:</span>
              <span className="font-mono font-bold" style={{ color: primaryColor }}>
                {submittedAppointment.date} a las {submittedAppointment.time}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 dark:text-stone-400">Estado:</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">Pendiente de Aprobación</span>
            </div>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            El profesional revisará su disponibilidad y confirmará o coordinará la cita directamente a través de WhatsApp.
          </p>

          <div className="space-y-2 pt-2">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar Solicitud por WhatsApp al Comercio</span>
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              Cerrar y Volver a la Tienda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-6 shadow-2xl space-y-5 max-h-[92vh] flex flex-col text-stone-900 dark:text-stone-100">
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-2 font-bold text-base">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-2xs"
              style={{ backgroundColor: `${primaryColor}14`, color: primaryColor }}
            >
              <Briefcase className="w-4 h-4" />
            </div>
            <span>Solicitud de Cita — {storeName}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Flujo: Tienda → Servicio → Profesional → Fecha → Hora → Solicitud */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
          {/* Advertencia de confirmación de cita */}
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3.5 flex items-start gap-2.5 text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div className="text-[11px] leading-relaxed">
              <strong className="font-semibold block text-amber-900 dark:text-amber-200">
                La cita está pendiente de confirmación por el profesional.
              </strong>
              Tu solicitud será evaluada por el especialista, quien confirmará o coordinará la cita contigo.
            </div>
          </div>

          {bookingCooldownRemaining > 0 && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5">
              <Clock className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 animate-pulse" />
              <span>
                Protección contra envíos repetidos: Por favor espera{' '}
                <strong className="underline">{bookingCooldownRemaining}s</strong> antes de enviar otra solicitud.
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <form id="service-booking-form" onSubmit={handleSubmit} className="space-y-4">
            {/* 1. SELECCIONAR SERVICIO */}
            <div className="space-y-1.5">
              <label className="block text-stone-700 dark:text-stone-300 font-semibold">
                1. Selecciona el Servicio
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => {
                  setSelectedServiceId(e.target.value);
                  const s = services.find((srv) => srv.id === e.target.value);
                  if (s?.attributes?.professional_id) {
                    setSelectedProfId(s.attributes.professional_id as string);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white focus:outline-none text-xs focus:ring-1 focus:ring-stone-400"
              >
                {services.map((srv) => {
                  const srvDuration = typeof srv.attributes?.duration_minutes === 'number' && srv.attributes.duration_minutes > 0 ? `${srv.attributes.duration_minutes} min` : null;
                  return (
                    <option key={srv.id} value={srv.id}>
                      {srv.name} — Bs {srv.price} {srvDuration ? `(${srvDuration})` : ''}
                    </option>
                  );
                })}
              </select>
              {selectedService?.description && (
                <p className="text-[11px] text-stone-500 dark:text-stone-400 italic">
                  {selectedService.description}
                </p>
              )}
            </div>

            {/* 2. SELECCIONAR PROFESIONAL (Filtrado por servicios que realiza) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-stone-700 dark:text-stone-300 font-semibold">
                  2. Especialista / Profesional
                </label>
                <span className="text-[10px] text-stone-500 dark:text-stone-400">
                  {availableProfessionals.length} disponible{availableProfessionals.length !== 1 ? 's' : ''} para este servicio
                </span>
              </div>
              {availableProfessionals.length === 0 ? (
                <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs text-center font-medium">
                  No hay profesionales o especialistas asignados actualmente a este servicio.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableProfessionals.map((prof) => (
                    <button
                      type="button"
                      key={prof.id}
                      onClick={() => {
                        setSelectedProfId(prof.id);
                        setSelectedTime('');
                      }}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                        selectedProfId === prof.id
                          ? 'bg-stone-100/90 dark:bg-stone-800 border-stone-400 dark:border-stone-600 shadow-xs ring-1 ring-stone-400 dark:ring-stone-500'
                          : 'bg-stone-50/50 dark:bg-stone-950/70 border-stone-200/80 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-700'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          backgroundColor: selectedProfId === prof.id ? `${primaryColor}22` : undefined,
                          color: selectedProfId === prof.id ? primaryColor : undefined,
                        }}
                      >
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs text-stone-900 dark:text-white truncate">{prof.name}</p>
                        {prof.specialty && (
                          <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">{prof.specialty}</p>
                        )}
                        {prof.shiftHours && (
                          <p className="text-[9px] mt-1 font-mono text-stone-500 dark:text-stone-400">
                            Turno: {prof.shiftHours}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. FECHA (Mismo día o día siguiente) */}
            <div className="space-y-1.5">
              <label className="block text-stone-700 dark:text-stone-300 font-semibold">
                3. Fecha de la Cita
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate(todayStr);
                    setSelectedTime('');
                  }}
                  className={`p-2.5 rounded-2xl border text-center font-semibold transition cursor-pointer ${
                    selectedDate === todayStr
                      ? 'shadow-xs text-white'
                      : 'bg-stone-50/60 dark:bg-stone-950 border-stone-200/90 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-300'
                  }`}
                  style={selectedDate === todayStr ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
                >
                  <p className="text-xs">Hoy (Mismo Día)</p>
                  <p className="text-[10px] opacity-80">{todayStr}</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate(tomorrowStr);
                    setSelectedTime('');
                  }}
                  className={`p-2.5 rounded-2xl border text-center font-semibold transition cursor-pointer ${
                    selectedDate === tomorrowStr
                      ? 'shadow-xs text-white'
                      : 'bg-stone-50/60 dark:bg-stone-950 border-stone-200/90 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-300'
                  }`}
                  style={selectedDate === tomorrowStr ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
                >
                  <p className="text-xs">Mañana (Día Siguiente)</p>
                  <p className="text-[10px] opacity-80">{tomorrowStr}</p>
                </button>

                <div className="col-span-2 sm:col-span-1">
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedDate(e.target.value);
                        setSelectedTime('');
                      }
                    }}
                    className="w-full h-full p-2.5 rounded-2xl bg-stone-50/60 dark:bg-stone-950 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-white text-xs font-mono focus:outline-none"
                    title="Otras fechas"
                  />
                </div>
              </div>
            </div>

            {/* 4. HORA (Disponibilidad propia del profesional y estados canónicos) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-stone-700 dark:text-stone-300 font-semibold">
                  4. Horarios Disponibles de {currentProfessional?.name || 'Profesional'}
                </label>
                {professionalSlots.length > 0 && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {professionalSlots.filter((s) => s.status === 'disponible').length} cupos libres
                  </span>
                )}
              </div>

              {professionalSlots.length === 0 ? (
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/80 border border-dashed border-stone-300 dark:border-stone-800 text-center space-y-1.5">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                    Sin atención programada para esta fecha
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    El profesional <strong>{currentProfessional?.name}</strong> no tiene turnos de atención configurados para este día.
                  </p>
                  {currentProfessional?.workDays && currentProfessional.workDays.length > 0 && (
                    <p className="text-[10px] text-stone-500">
                      Días de atención habituales: {currentProfessional.workDays.join(', ')}
                    </p>
                  )}
                  <p className="text-[11px] pt-1 font-medium" style={{ color: primaryColor }}>
                    Por favor selecciona otra fecha o elige otro profesional disponible.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {professionalSlots.map((slot) => {
                    const isAvailable = slot.status === 'disponible';
                    const isBlocked = slot.status === 'bloqueada';
                    const isPending = slot.status === 'pendiente';
                    const isConfirmed = slot.status === 'confirmada';

                    let statusLabel = '';
                    if (isBlocked) {
                      statusLabel = slot.reason?.includes('Externa') ? 'Cita ext.' : 'Bloqueado';
                    } else if (isPending) {
                      statusLabel = 'Pendiente';
                    } else if (isConfirmed) {
                      statusLabel = 'Ocupado';
                    }

                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-2 px-1.5 rounded-xl text-center text-xs font-semibold border transition ${
                          !isAvailable
                            ? 'bg-stone-100/50 dark:bg-stone-950/40 border-stone-200 dark:border-stone-900 text-stone-400 dark:text-stone-600 cursor-not-allowed line-through'
                            : selectedTime === slot.time
                            ? 'text-white shadow-xs cursor-pointer ring-2 ring-stone-400/40'
                            : 'bg-stone-50/60 dark:bg-stone-950 border-stone-200/90 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:border-stone-300 dark:hover:border-stone-700 cursor-pointer'
                        }`}
                        style={isAvailable && selectedTime === slot.time ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
                        title={
                          !isAvailable
                            ? `Horario no disponible (${statusLabel}): ${slot.reason || 'Reservado por otro cliente'}`
                            : `Seleccionar turno de las ${slot.time}`
                        }
                      >
                        <span className="font-mono">{slot.time}</span>
                        {!isAvailable && (
                          <span className="block text-[8px] no-underline font-normal text-rose-500 dark:text-rose-400 truncate px-0.5">
                            {statusLabel}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 5. DATOS DEL CLIENTE */}
            <div className="space-y-3 pt-2 border-t border-stone-200/80 dark:border-stone-800">
              <h4 className="text-stone-900 dark:text-stone-200 font-semibold">5. Tus Datos de Contacto</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] text-stone-600 dark:text-stone-400">Nombre Completo *</label>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500">{customerName.length}/100</span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej. Ana Fernández"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] text-stone-600 dark:text-stone-400">Teléfono / WhatsApp *</label>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500">{customerPhone.length}/25</span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={25}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ej. 71023456"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-stone-600 dark:text-stone-400">Email de Contacto (Opcional)</label>
                <input
                  type="email"
                  maxLength={120}
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] text-stone-600 dark:text-stone-400">Notas o Requerimientos Especiales</label>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500">{notes.length}/300</span>
                </div>
                <textarea
                  rows={2}
                  maxLength={300}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Es mi primera sesión, prefiero presión moderada..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white text-xs focus:outline-none resize-none focus:ring-1 focus:ring-stone-400"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Botón de Enviar */}
        <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800 shrink-0">
          <button
            type="submit"
            form="service-booking-form"
            disabled={bookingCooldownRemaining > 0 || isSubmitting}
            className="w-full py-3 rounded-2xl text-white text-xs font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:brightness-105 active:scale-98"
            style={{ backgroundColor: primaryColor }}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center justify-center gap-1.5 text-white">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Verificando y reservando turno...</span>
              </span>
            ) : bookingCooldownRemaining > 0 ? (
              <span className="inline-flex items-center justify-center gap-1.5 text-amber-200">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Espera ({bookingCooldownRemaining}s) para enviar</span>
              </span>
            ) : (
              <span>Enviar Solicitud de Cita</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
