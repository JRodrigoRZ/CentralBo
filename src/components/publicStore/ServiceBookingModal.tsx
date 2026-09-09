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
}

export const ServiceBookingModal: React.FC<ServiceBookingModalProps> = ({
  tenantId,
  storeName,
  storeWhatsapp,
  services,
  professionals,
  preselectedServiceId,
  onClose,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    preselectedServiceId || (services[0]?.id || '')
  );

  const selectedService = services.find((s) => s.id === selectedServiceId);

  // Filtrar profesionales que pueden realizar este servicio
  const eligibleProfessionals = professionals.filter(
    (p) =>
      p.isActive &&
      (!p.serviceIds || p.serviceIds.length === 0 || p.serviceIds.includes(selectedServiceId))
  );

  const availableProfessionals =
    eligibleProfessionals.length > 0
      ? eligibleProfessionals
      : professionals.filter((p) => p.isActive);

  const [selectedProfId, setSelectedProfId] = useState<string>(() => {
    const preferredProfId = selectedService?.attributes?.professional_id as string;
    if (preferredProfId && availableProfessionals.some((p) => p.id === preferredProfId)) {
      return preferredProfId;
    }
    return availableProfessionals[0]?.id || professionals[0]?.id || '';
  });

  // Si cambia el servicio y el profesional actual no puede realizarlo, auto-seleccionar uno habilitado
  useEffect(() => {
    if (
      availableProfessionals.length > 0 &&
      !availableProfessionals.some((p) => p.id === selectedProfId)
    ) {
      setSelectedProfId(availableProfessionals[0].id);
    }
  }, [selectedServiceId, availableProfessionals, selectedProfId]);

  const currentProfessional =
    professionals.find((p) => p.id === selectedProfId) ||
    availableProfessionals[0] ||
    professionals[0];

  // Fecha: Mismo día (Hoy) o Día siguiente (Mañana)
  const today = new Date();
  const tomorrow = new Date(Date.now() + 86400000);

  const formatDateStr = (d: Date) => d.toISOString().split('T')[0];

  const todayStr = formatDateStr(today);
  const tomorrowStr = formatDateStr(tomorrow);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Perfil guardado si existe
  const savedProfile = getSavedCustomerProfile();
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

  // Obtener turnos calculados según la disponibilidad propia de este profesional
  const professionalSlots: ProfessionalAgendaSlot[] = currentProfessional
    ? getProfessionalAgendaSlots(tenantId, currentProfessional, selectedDate)
    : [];

  // Resetear hora si la hora seleccionada ya no es válida para la nueva fecha/profesional
  useEffect(() => {
    if (selectedTime) {
      const slot = professionalSlots.find((s) => s.time === selectedTime);
      if (!slot || slot.status !== 'disponible') {
        setSelectedTime('');
      }
    }
  }, [selectedDate, selectedProfId, professionalSlots, selectedTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

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
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Por favor ingresa tu nombre y número de contacto.');
      return;
    }

    // Revalidar en tiempo real contra los turnos actuales del profesional
    const freshSlots = getProfessionalAgendaSlots(tenantId, currentProfessional, selectedDate);
    const chosenSlot = freshSlots.find((s) => s.time === selectedTime);

    if (!chosenSlot || chosenSlot.status !== 'disponible') {
      setErrorMsg(
        'El horario seleccionado ya no está disponible (ha sido reservado o bloqueado). Por favor elige otro horario.'
      );
      return;
    }

    const newAppointment: AppointmentRequest = {
      id: `cita-${Date.now()}`,
      tenant_id: tenantId,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      professionalId: currentProfessional.id,
      professionalName: currentProfessional.name,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || 'cliente@centralbo.bo',
      date: selectedDate,
      time: selectedTime,
      status: 'pendiente', // Siempre queda pendiente de confirmación por el profesional
      createdAt: new Date().toISOString(),
      notes: notes.trim(),
    };

    // Guardar en la base del tenant
    const existing = getStoreAppointments(tenantId);
    saveStoreAppointments(tenantId, [newAppointment, ...existing]);

    // Guardar en pedidos/citas del cliente local
    recordCustomerAppointment(newAppointment);

    setSubmittedAppointment(newAppointment);
    setIsSubmitted(true);
  };

  const cleanWhatsapp = (storeWhatsapp || '').replace(/\D/g, '');

  if (isSubmitted && submittedAppointment) {
    const waText = `¡Hola *${storeName}*! 👋 Acabo de solicitar una cita para un servicio:

💆 *SERVICIO:* ${submittedAppointment.serviceName}
👤 *PROFESIONAL:* ${submittedAppointment.professionalName}
📅 *FECHA:* ${submittedAppointment.date === todayStr ? 'Hoy' : 'Mañana'} (${submittedAppointment.date})
⏰ *HORA SOLICITADA:* ${submittedAppointment.time}

👤 *DATOS DEL CLIENTE:*
Nombre: ${submittedAppointment.customerName}
Teléfono: ${submittedAppointment.customerPhone}
${submittedAppointment.notes ? `Notas: ${submittedAppointment.notes}\n` : ''}
⚠️ _Comprendo que la cita se encuentra *pendiente de confirmación* por el profesional. Quedo atento a su respuesta para confirmar._ Muchas gracias.`;

    const waUrl = cleanWhatsapp
      ? `https://wa.me/${cleanWhatsapp.startsWith('591') ? cleanWhatsapp : '591' + cleanWhatsapp}?text=${encodeURIComponent(waText)}`
      : null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              ¡Solicitud de Cita Enviada!
            </h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>La cita está pendiente de confirmación por el profesional</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 text-left space-y-2 text-xs text-slate-300">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Servicio:</span>
              <span className="font-semibold text-white">{submittedAppointment.serviceName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Profesional:</span>
              <span className="font-semibold text-white">{submittedAppointment.professionalName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Fecha y Hora:</span>
              <span className="font-mono font-bold text-indigo-400">
                {submittedAppointment.date} a las {submittedAppointment.time}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Estado:</span>
              <span className="text-amber-400 font-semibold">Pendiente de Aprobación</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            El profesional revisará su disponibilidad y confirmará o coordinará la cita directamente a través de WhatsApp.
          </p>

          <div className="space-y-2 pt-2">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar Solicitud por WhatsApp al Comercio</span>
              </a>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              Cerrar y Volver a la Tienda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5 max-h-[92vh] flex flex-col">
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <span>Solicitud de Cita — {storeName}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-semibold p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Flujo: Tienda → Servicio → Profesional → Fecha → Hora → Solicitud */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
          {/* Advertencia de confirmación de cita */}
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 flex items-start gap-2.5 text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="font-semibold block text-amber-200">
                La cita está pendiente de confirmación por el profesional.
              </strong>
              Tu solicitud será evaluada por el especialista, quien confirmará o coordinará la cita contigo.
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <form id="service-booking-form" onSubmit={handleSubmit} className="space-y-4">
            {/* 1. SELECCIONAR SERVICIO */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold">
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
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-xs"
              >
                {services.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name} — Bs {srv.price} ({srv.attributes?.duration_minutes || 60} min)
                  </option>
                ))}
              </select>
              {selectedService?.description && (
                <p className="text-[11px] text-slate-400 italic">
                  {selectedService.description}
                </p>
              )}
            </div>

            {/* 2. SELECCIONAR PROFESIONAL (Filtrado por servicios que realiza) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-slate-300 font-semibold">
                  2. Especialista / Profesional
                </label>
                <span className="text-[10px] text-slate-400">
                  {availableProfessionals.length} disponible{availableProfessionals.length !== 1 ? 's' : ''} para este servicio
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableProfessionals.map((prof) => (
                  <button
                    type="button"
                    key={prof.id}
                    onClick={() => {
                      setSelectedProfId(prof.id);
                      setSelectedTime('');
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 ${
                      selectedProfId === prof.id
                        ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/50'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-xs truncate">{prof.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{prof.specialty}</p>
                      <p className="text-[9px] text-indigo-300/80 mt-1 font-mono">
                        Turno: {prof.shiftHours || 'Horario regular'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. FECHA (Mismo día o día siguiente) */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold">
                3. Fecha de la Cita
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate(todayStr);
                    setSelectedTime('');
                  }}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition cursor-pointer ${
                    selectedDate === todayStr
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
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
                  className={`p-2.5 rounded-xl border text-center font-semibold transition cursor-pointer ${
                    selectedDate === tomorrowStr
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
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
                    className="w-full h-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                    title="Otras fechas"
                  />
                </div>
              </div>
            </div>

            {/* 4. HORA (Disponibilidad propia del profesional y estados canónicos) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-slate-300 font-semibold">
                  4. Horarios Disponibles de {currentProfessional?.name || 'Profesional'}
                </label>
                {professionalSlots.length > 0 && (
                  <span className="text-[10px] text-emerald-400 font-medium">
                    {professionalSlots.filter((s) => s.status === 'disponible').length} cupos libres
                  </span>
                )}
              </div>

              {professionalSlots.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-dashed border-slate-800 text-center space-y-1.5">
                  <p className="text-xs font-semibold text-amber-300">
                    Sin atención programada para esta fecha
                  </p>
                  <p className="text-[11px] text-slate-400">
                    El profesional <strong>{currentProfessional?.name}</strong> no tiene turnos de atención configurados para este día.
                  </p>
                  {currentProfessional?.workDays && currentProfessional.workDays.length > 0 && (
                    <p className="text-[10px] text-slate-500">
                      Días de atención habituales: {currentProfessional.workDays.join(', ')}
                    </p>
                  )}
                  <p className="text-[11px] text-indigo-400 pt-1 font-medium">
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
                            ? 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed line-through'
                            : selectedTime === slot.time
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md cursor-pointer ring-2 ring-indigo-400/50'
                            : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-indigo-500/50 hover:bg-slate-900 cursor-pointer'
                        }`}
                        title={
                          !isAvailable
                            ? `Horario no disponible (${statusLabel}): ${slot.reason || 'Reservado por otro cliente'}`
                            : `Seleccionar turno de las ${slot.time}`
                        }
                      >
                        <span className="font-mono">{slot.time}</span>
                        {!isAvailable && (
                          <span className="block text-[8px] no-underline font-normal text-rose-400 truncate px-0.5">
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
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h4 className="text-slate-200 font-semibold">5. Tus Datos de Contacto</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej. Ana Fernández"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ej. 71023456"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Email de Contacto (Opcional)</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Notas o Requerimientos Especiales</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Es mi primera sesión, prefiero presión moderada..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Botón de Enviar */}
        <div className="pt-3 border-t border-slate-800 shrink-0">
          <button
            type="submit"
            form="service-booking-form"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition cursor-pointer"
          >
            Enviar Solicitud de Cita
          </button>
        </div>
      </div>
    </div>
  );
};
