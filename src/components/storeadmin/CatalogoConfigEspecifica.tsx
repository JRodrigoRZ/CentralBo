import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChefHat,
  Shirt,
  UserCheck,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  Lock,
  Phone,
  Mail,
  User,
  Scissors,
  Check,
  Ban,
  CheckSquare,
  Square,
  ShieldCheck,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  Store,
  RestaurantSettings,
  FashionSettings,
  GeneralSettings,
  ProfessionalItem,
  ProfessionalDaySchedule,
  ProfessionalAgendaSlot,
  AgendaSlotStatus,
  ReservedTimeSlot,
  AppointmentRequest,
  Product,
} from '../../types';
import {
  getRestaurantSettings,
  saveRestaurantSettings,
  getFashionSettings,
  saveFashionSettings,
  getGeneralSettings,
  saveGeneralSettings,
  getStoreProfessionals,
  saveStoreProfessionals,
  getStoreReservedTimeSlots,
  saveStoreReservedTimeSlots,
  getStoreAppointments,
  saveStoreAppointments,
  getStoreProducts,
  getProfessionalAgendaSlots,
  createDefaultProfessionalSchedule,
} from '../../lib/storeAdminService';

interface CatalogoConfigEspecificaProps {
  store: Store;
}

export const CatalogoConfigEspecifica: React.FC<CatalogoConfigEspecificaProps> = ({
  store,
}) => {
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // --------------------------------------------------------------------------
  // 1. VERTICAL SERVICIOS (Profesionales, Disponibilidad, Citas, Bloqueos)
  // --------------------------------------------------------------------------
  const [services] = useState<Product[]>(() =>
    getStoreProducts(store.id, 'servicios')
  );
  const [professionals, setProfessionals] = useState<ProfessionalItem[]>(() =>
    getStoreProfessionals(store.id)
  );
  const [reservedSlots, setReservedSlots] = useState<ReservedTimeSlot[]>(() =>
    getStoreReservedTimeSlots(store.id)
  );
  const [appointments, setAppointments] = useState<AppointmentRequest[]>(() =>
    getStoreAppointments(store.id)
  );

  // Profesional seleccionado para gestionar su agenda y disponibilidad
  const [selectedProfId, setSelectedProfId] = useState<string>(() => professionals[0]?.id || '');
  const currentProf = professionals.find((p) => p.id === selectedProfId) || professionals[0];

  // Estado local para editar horarios diferenciados por día del profesional
  const [editingSchedule, setEditingSchedule] = useState<ProfessionalDaySchedule[]>(() => {
    return currentProf?.schedule || createDefaultProfessionalSchedule();
  });

  // Estado local para editar servicios que puede realizar este profesional
  const [editingServiceIds, setEditingServiceIds] = useState<string[]>(() => {
    return currentProf?.serviceIds || [];
  });

  // Fecha para visualizar la agenda diaria del profesional
  const todayStr = new Date().toISOString().split('T')[0];
  const [agendaDate, setAgendaDate] = useState<string>(todayStr);

  // Estados para nuevo profesional
  const [isAddingProf, setIsAddingProf] = useState(false);
  const [newProfName, setNewProfName] = useState('');
  const [newProfSpecialty, setNewProfSpecialty] = useState('');
  const [newProfPhone, setNewProfPhone] = useState('');

  // Sincronizar editor cuando cambia el profesional seleccionado
  useEffect(() => {
    if (currentProf) {
      setEditingSchedule(
        currentProf.schedule && currentProf.schedule.length === 7
          ? currentProf.schedule
          : createDefaultProfessionalSchedule()
      );
      setEditingServiceIds(currentProf.serviceIds || []);
      setBlockProfId(currentProf.id);
    }
  }, [selectedProfId]);

  // Estados para nuevo bloqueo manual de horario (ej. citas externas para evitar doble reserva)
  const [blockProfId, setBlockProfId] = useState(currentProf?.id || professionals[0]?.id || '');
  const [blockDate, setBlockDate] = useState(todayStr);
  const [blockTime, setBlockTime] = useState('11:00');
  const [blockReason, setBlockReason] = useState('Cita Externa en Domicilio');

  const handleAddProfessional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfName.trim()) return;

    const defaultSchedule = createDefaultProfessionalSchedule([1, 2, 3, 4, 5], '09:00', '18:00', '13:00');
    const newProf: ProfessionalItem = {
      id: `prof-${Date.now()}`,
      tenant_id: store.id,
      name: newProfName.trim(),
      specialty: newProfSpecialty.trim() || 'Especialista',
      phone: newProfPhone.trim() || '+591 70000000',
      avatarUrl: '',
      isActive: true,
      workDays: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      shiftHours: '09:00 - 18:00',
      serviceIds: services.map((s) => s.id), // Habilitado para todos los servicios inicialmente
      schedule: defaultSchedule,
    };

    const updated = [...professionals, newProf];
    setProfessionals(updated);
    saveStoreProfessionals(store.id, updated);
    setSelectedProfId(newProf.id);
    setNewProfName('');
    setNewProfSpecialty('');
    setNewProfPhone('');
    setIsAddingProf(false);
    showNotification(`Profesional ${newProf.name} añadido con éxito.`);
  };

  const handleToggleProfActive = (id: string) => {
    const updated = professionals.map((p) =>
      p.id === id ? { ...p, isActive: !p.isActive } : p
    );
    setProfessionals(updated);
    saveStoreProfessionals(store.id, updated);
  };

  const handleDeleteProf = (id: string) => {
    if (professionals.length <= 1) {
      alert('Debe existir al menos un profesional en el establecimiento.');
      return;
    }
    if (window.confirm('¿Eliminar este profesional y su agenda asociada?')) {
      const updated = professionals.filter((p) => p.id !== id);
      setProfessionals(updated);
      saveStoreProfessionals(store.id, updated);
      if (selectedProfId === id) {
        setSelectedProfId(updated[0]?.id || '');
      }
      showNotification('Profesional eliminado.');
    }
  };

  // Actualizar un día específico en el horario del profesional
  const handleScheduleDayChange = (
    dayOfWeek: number,
    field: 'isOpen' | 'startTime' | 'endTime',
    value: boolean | string
  ) => {
    setEditingSchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d))
    );
  };

  // Habilitar o deshabilitar un servicio para el profesional
  const handleToggleServiceForProf = (serviceId: string) => {
    setEditingServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Guardar configuración de disponibilidad, horarios por día y servicios
  const handleSaveProfAvailability = () => {
    if (!currentProf) return;

    // Calcular días de trabajo en texto
    const openDaysNames = editingSchedule.filter((d) => d.isOpen).map((d) => d.dayName);
    const summaryHours = editingSchedule.find((d) => d.isOpen)
      ? `${editingSchedule.find((d) => d.isOpen)?.startTime} - ${editingSchedule.find((d) => d.isOpen)?.endTime}`
      : 'Sin turnos';

    const updated = professionals.map((p) =>
      p.id === currentProf.id
        ? {
            ...p,
            schedule: editingSchedule,
            serviceIds: editingServiceIds,
            workDays: openDaysNames,
            shiftHours: summaryHours,
          }
        : p
    );

    setProfessionals(updated);
    saveStoreProfessionals(store.id, updated);
    showNotification(`Agenda y servicios de ${currentProf.name} actualizados.`);
  };

  const handleAddReservedSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlot: ReservedTimeSlot = {
      id: `res-${Date.now()}`,
      tenant_id: store.id,
      professionalId: blockProfId || currentProf?.id || '',
      date: blockDate,
      time: blockTime,
      reason: blockReason.trim() || 'Bloqueo Manual / Cita Externa',
      isExternal: true,
    };

    const updated = [...reservedSlots, newSlot];
    setReservedSlots(updated);
    saveStoreReservedTimeSlots(store.id, updated);
    showNotification(
      `Horario ${blockTime} el ${blockDate} bloqueado correctamente para evitar doble reserva.`
    );
  };

  // Bloqueo rápido de una franja directamente desde la grilla de turnos
  const handleQuickBlockSlot = (time: string) => {
    if (!currentProf) return;
    const newSlot: ReservedTimeSlot = {
      id: `res-${Date.now()}`,
      tenant_id: store.id,
      professionalId: currentProf.id,
      date: agendaDate,
      time,
      reason: 'Cita Externa / Bloqueo Manual',
      isExternal: true,
    };
    const updated = [...reservedSlots, newSlot];
    setReservedSlots(updated);
    saveStoreReservedTimeSlots(store.id, updated);
    showNotification(`Horario ${time} marcado como no disponible para ${currentProf.name}.`);
  };

  const handleRemoveReservedSlot = (id: string) => {
    const updated = reservedSlots.filter((s) => s.id !== id);
    setReservedSlots(updated);
    saveStoreReservedTimeSlots(store.id, updated);
    showNotification('Bloqueo de horario liberado.');
  };

  const handleUpdateAppointmentStatus = (
    id: string,
    newStatus: 'confirmada' | 'rechazada'
  ) => {
    const updated = appointments.map((a) =>
      a.id === id ? { ...a, status: newStatus } : a
    );
    setAppointments(updated);
    saveStoreAppointments(store.id, updated);
    showNotification(
      `Cita ${newStatus === 'confirmada' ? 'confirmada' : 'rechazada'} por el profesional.`
    );
  };

  // Calcular turnos en tiempo real para la agenda del profesional en la fecha seleccionada
  const currentProfSlots: ProfessionalAgendaSlot[] = currentProf
    ? getProfessionalAgendaSlots(store.id, currentProf, agendaDate)
    : [];

  // --------------------------------------------------------------------------
  // 2. VERTICAL RESTAURANTE
  // --------------------------------------------------------------------------
  const [restaurant, setRestaurant] = useState<RestaurantSettings>(() =>
    getRestaurantSettings(store.id)
  );

  const handleSaveRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    saveRestaurantSettings(store.id, restaurant);
    showNotification('Ajustes gastronómicos guardados.');
  };

  // --------------------------------------------------------------------------
  // 3. VERTICAL MODA
  // --------------------------------------------------------------------------
  const [fashion, setFashion] = useState<FashionSettings>(() =>
    getFashionSettings(store.id)
  );

  const handleSaveFashion = (e: React.FormEvent) => {
    e.preventDefault();
    saveFashionSettings(store.id, fashion);
    showNotification('Ajustes de moda y guía de tallas guardados.');
  };

  // --------------------------------------------------------------------------
  // 4. VERTICAL GENERAL
  // --------------------------------------------------------------------------
  const [general, setGeneral] = useState<GeneralSettings>(() =>
    getGeneralSettings(store.id)
  );

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    saveGeneralSettings(store.id, general);
    showNotification('Ajustes generales del catálogo guardados.');
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Configuración Específica de Catálogo</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Módulo adaptativo para el modelo de negocio:{' '}
            <strong className="text-indigo-300 uppercase">{store.store_type}</strong>
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECCIÓN ESPECIAL: TIENDA DE SERVICIOS                                */}
      {/* ==================================================================== */}
      {store.store_type === 'servicios' && (
        <div className="space-y-6">
          {/* Reglas de Servicio y Políticas CentralBo */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-300">
              <UserCheck className="w-4 h-4" />
              <span>Reglas Operativas del Vertical Servicios</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
              <li>
                <strong>Citas no automáticas:</strong> Toda solicitud ingresa como{' '}
                <span className="text-amber-400 font-bold">Pendiente</span>. El profesional
                a cargo debe confirmarla o rechazarla manualmente.
              </li>
              <li>
                <strong>Anticipación estricta:</strong> Solo se permiten citas para el{' '}
                <strong>mismo día</strong> o el <strong>día siguiente</strong> para evitar
                ausencias.
              </li>
              <li>
                <strong>Bloqueo preventivo:</strong> Los profesionales pueden bloquear
                horarios manuales (ej. citas externas, traslados) para evitar doble reserva.
              </li>
              <li>
                <strong>Privacidad:</strong> No se solicitan ni almacenan historias clínicas o
                antecedentes médicos.
              </li>
            </ul>
          </div>

          {/* 1. Profesionales del Establecimiento */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>1. Profesionales y Especialistas del Establecimiento</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Selecciona un profesional para configurar su agenda individual, horarios por día y servicios
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  {professionals.length} registrados
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingProf(!isAddingProf)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingProf ? 'Cancelar' : 'Nuevo Profesional'}</span>
                </button>
              </div>
            </div>

            {/* Formulario para añadir nuevo profesional */}
            {isAddingProf && (
              <form
                onSubmit={handleAddProfessional}
                className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-3 animate-fadeIn"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                  <Plus className="w-4 h-4" />
                  <span>Registrar Nuevo Profesional en CentralBo</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Nombre completo..."
                    value={newProfName}
                    onChange={(e) => setNewProfName(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Especialidad (ej. Fisioterapia, Barbería)..."
                    value={newProfSpecialty}
                    onChange={(e) => setNewProfSpecialty(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Teléfono móvil / WhatsApp..."
                    value={newProfPhone}
                    onChange={(e) => setNewProfPhone(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingProf(false)}
                    className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Guardar Profesional</span>
                  </button>
                </div>
              </form>
            )}

            {/* Selector de pestañas de profesionales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
              {professionals.map((prof) => {
                const isSelected = selectedProfId === prof.id;
                return (
                  <div
                    key={prof.id}
                    onClick={() => setSelectedProfId(prof.id)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer relative flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
                          {prof.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-white truncate">{prof.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{prof.specialty}</p>
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          prof.isActive
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {prof.isActive ? 'Activo' : 'Pausado'}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
                      <span className="truncate">
                        {prof.workDays && prof.workDays.length > 0
                          ? `${prof.workDays.length} días: ${prof.workDays.slice(0, 3).join(', ')}${prof.workDays.length > 3 ? '...' : ''}`
                          : 'Sin días asignados'}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleProfActive(prof.id);
                          }}
                          className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
                          title="Pausar o activar"
                        >
                          {prof.isActive ? 'Pausar' : 'Activar'}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProf(prof.id);
                          }}
                          className="text-rose-400 hover:text-rose-300 p-0.5"
                          title="Eliminar profesional"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. CONFIGURACIÓN INDIVIDUAL DE DISPONIBILIDAD Y SERVICIOS */}
          {currentProf && (
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>2. Disponibilidad y Horarios de {currentProf.name}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Define los días de atención, hora de inicio, hora de fin y horarios diferenciados por día
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveProfAvailability}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Disponibilidad</span>
                </button>
              </div>

              {/* Grilla de Días de Atención y Horarios Diferenciados */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Días y Horarios de Atención Individuales
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
                  {editingSchedule.map((day) => (
                    <div
                      key={day.dayOfWeek}
                      className={`p-3 rounded-xl border flex flex-col justify-between transition ${
                        day.isOpen
                          ? 'bg-slate-900/90 border-slate-700'
                          : 'bg-slate-950/40 border-slate-900 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 pb-2 border-b border-slate-800">
                        <span className="font-bold text-xs text-white">
                          {day.dayName}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={day.isOpen}
                            onChange={(e) =>
                              handleScheduleDayChange(day.dayOfWeek, 'isOpen', e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-7 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>

                      {day.isOpen ? (
                        <div className="space-y-2 pt-2 text-[11px]">
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-0.5">Inicio:</span>
                            <input
                              type="time"
                              value={day.startTime}
                              onChange={(e) =>
                                handleScheduleDayChange(day.dayOfWeek, 'startTime', e.target.value)
                              }
                              className="w-full px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-0.5">Fin:</span>
                            <input
                              type="time"
                              value={day.endTime}
                              onChange={(e) =>
                                handleScheduleDayChange(day.dayOfWeek, 'endTime', e.target.value)
                              }
                              className="w-full px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="py-5 text-center text-[10px] text-slate-500 italic">
                          No atiende
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Servicios que puede realizar este profesional */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                      Servicios que puede realizar {currentProf.name}
                    </label>
                    <p className="text-[11px] text-slate-400">
                      El cliente solo podrá solicitar cita con este profesional para los servicios seleccionados
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingServiceIds(services.map((s) => s.id))}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 underline"
                    >
                      Todos
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() => setEditingServiceIds([])}
                      className="text-[10px] text-slate-400 hover:text-slate-300 underline"
                    >
                      Ninguno
                    </button>
                  </div>
                </div>

                {services.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    No hay servicios creados en la tienda. Puedes crearlos en la pestaña de Productos.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                    {services.map((srv) => {
                      const isAssigned = editingServiceIds.includes(srv.id);
                      return (
                        <button
                          key={srv.id}
                          type="button"
                          onClick={() => handleToggleServiceForProf(srv.id)}
                          className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                            isAssigned
                              ? 'bg-indigo-600/15 border-indigo-500 text-white'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold truncate">{srv.name}</p>
                            <p className="text-[10px] text-slate-400">
                              Bs. {srv.price} • {srv.duration || '60 min'}
                            </p>
                          </div>
                          {isAssigned ? (
                            <CheckSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. AGENDA VISUAL EN TIEMPO REAL POR PROFESIONAL */}
          {currentProf && (
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>3. Agenda Diaria en Vivo: {currentProf.name}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Visualiza y gestiona la disponibilidad en tiempo real (Disponible, Pendiente, Confirmada, Bloqueada)
                  </p>
                </div>

                {/* Selector de fecha de agenda */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAgendaDate(todayStr)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      agendaDate === todayStr
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    Hoy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      setAgendaDate(d.toISOString().split('T')[0]);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      agendaDate !== todayStr &&
                      agendaDate ===
                        new Date(Date.now() + 86400000).toISOString().split('T')[0]
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    Mañana
                  </button>
                  <input
                    type="date"
                    value={agendaDate}
                    onChange={(e) => e.target.value && setAgendaDate(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Leyenda de Estados Obligatorios */}
              <div className="flex items-center gap-4 flex-wrap text-[11px] p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 font-semibold">Estados de Agenda:</span>
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <strong>Disponible</strong> ({currentProfSlots.filter((s) => s.status === 'disponible').length})
                </span>
                <span className="flex items-center gap-1.5 text-amber-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  <strong>Pendiente</strong> ({currentProfSlots.filter((s) => s.status === 'pendiente').length})
                </span>
                <span className="flex items-center gap-1.5 text-blue-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                  <strong>Confirmada</strong> ({currentProfSlots.filter((s) => s.status === 'confirmada').length})
                </span>
                <span className="flex items-center gap-1.5 text-rose-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                  <strong>Bloqueada / Externa</strong> ({currentProfSlots.filter((s) => s.status === 'bloqueada').length})
                </span>
              </div>

              {/* Grilla interactiva de turnos de la agenda */}
              {currentProfSlots.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-1">
                  <p className="text-xs font-semibold text-amber-300">
                    No hay turnos configurados para {currentProf.name} en esta fecha ({agendaDate})
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Verifica que el día de la semana esté habilitado en la sección "Disponibilidad y Horarios".
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {currentProfSlots.map((slot) => {
                    const isAvailable = slot.status === 'disponible';
                    const isPending = slot.status === 'pendiente';
                    const isConfirmed = slot.status === 'confirmada';
                    const isBlocked = slot.status === 'bloqueada';

                    return (
                      <div
                        key={slot.time}
                        className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition ${
                          isAvailable
                            ? 'bg-slate-900/70 border-emerald-500/30'
                            : isPending
                            ? 'bg-amber-950/25 border-amber-500/50'
                            : isConfirmed
                            ? 'bg-blue-950/25 border-blue-500/40'
                            : 'bg-rose-950/20 border-rose-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-sm font-bold text-white">
                            {slot.time}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              isAvailable
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : isPending
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : isConfirmed
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            {slot.status === 'bloqueada'
                              ? slot.reason?.includes('Externa')
                                ? 'Cita Externa'
                                : 'Bloqueado'
                              : slot.status}
                          </span>
                        </div>

                        {/* Detalles del turno según estado */}
                        <div className="text-[11px] min-h-[32px]">
                          {isAvailable && (
                            <p className="text-slate-400">
                              Turno libre para solicitudes de clientes desde la tienda.
                            </p>
                          )}

                          {isPending && slot.appointment && (
                            <div className="space-y-0.5 text-amber-200">
                              <p className="font-semibold text-white truncate">
                                {slot.appointment.customerName}
                              </p>
                              <p className="text-[10px] text-amber-300/90 truncate">
                                {slot.appointment.serviceName} • Tel: {slot.appointment.customerPhone}
                              </p>
                            </div>
                          )}

                          {isConfirmed && slot.appointment && (
                            <div className="space-y-0.5 text-blue-200">
                              <p className="font-semibold text-white truncate">
                                {slot.appointment.customerName}
                              </p>
                              <p className="text-[10px] text-blue-300/90 truncate">
                                {slot.appointment.serviceName} • Confirmada
                              </p>
                            </div>
                          )}

                          {isBlocked && (
                            <div className="space-y-0.5 text-rose-300">
                              <p className="text-[10px] text-slate-300 truncate">
                                Motivo: {slot.reason || 'Bloqueo manual'}
                              </p>
                              <p className="text-[9px] text-rose-400">
                                No visible ni solicitante en tienda pública
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Acciones para el turno */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-1.5">
                          {isAvailable && (
                            <button
                              type="button"
                              onClick={() => handleQuickBlockSlot(slot.time)}
                              className="px-2 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
                              title="Bloquear este horario para citas externas"
                            >
                              <Lock className="w-3 h-3" />
                              <span>+ Cita Externa / Bloqueo</span>
                            </button>
                          )}

                          {isPending && slot.appointment && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateAppointmentStatus(slot.appointment!.id, 'confirmada')
                                }
                                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                <span>Confirmar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateAppointmentStatus(slot.appointment!.id, 'rechazada')
                                }
                                className="px-2 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
                              >
                                <Ban className="w-3 h-3" />
                                <span>Rechazar</span>
                              </button>
                            </>
                          )}

                          {isBlocked && (
                            <button
                              type="button"
                              onClick={() => {
                                const matchingReserved = reservedSlots.find(
                                  (r) =>
                                    r.professionalId === currentProf.id &&
                                    r.date === agendaDate &&
                                    r.time === slot.time
                                );
                                if (matchingReserved) {
                                  handleRemoveReservedSlot(matchingReserved.id);
                                }
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
                            >
                              <span>Liberar Horario</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 4. BLOQUEO MANUAL Y REGISTRO DE CITAS EXTERNAS */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>4. Bloqueo Manual de Horarios y Citas Externas</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Registra citas atendidas fuera de la plataforma o bloquea horarios para evitar que los clientes reserven en ese momento
              </p>
            </div>

            <form
              onSubmit={handleAddReservedSlot}
              className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800"
            >
              <select
                value={blockProfId}
                onChange={(e) => setBlockProfId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none"
              >
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none"
              />

              <input
                type="time"
                value={blockTime}
                onChange={(e) => setBlockTime(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none"
              />

              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Motivo (ej. Cita externa, traslado)..."
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none"
              />

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Bloquear Horario</span>
              </button>
            </form>

            <div className="space-y-2 pt-1">
              {reservedSlots.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No hay bloqueos manuales activos.</p>
              ) : (
                reservedSlots.map((slot) => {
                  const prof = professionals.find((p) => p.id === slot.professionalId);
                  return (
                    <div
                      key={slot.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-amber-400 font-bold">
                          {slot.date} @ {slot.time}
                        </span>
                        <span className="text-white font-semibold">
                          {prof?.name || 'Profesional'}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          ({slot.reason})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveReservedSlot(slot.id)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                        title="Desbloquear horario"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 5. Solicitudes de Citas Generales de Clientes */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  <span>5. Todas las Solicitudes de Citas Registradas</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Confirmación o rechazo directo por el profesional a cargo
                </p>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {appointments.filter((a) => a.status === 'pendiente').length} Pendientes
              </span>
            </div>

            <div className="space-y-3">
              {appointments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hay solicitudes de citas registradas aún.</p>
              ) : (
                appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      apt.status === 'pendiente'
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : apt.status === 'confirmada'
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-rose-950/20 border-rose-500/30'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">
                          {apt.serviceName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                            apt.status === 'pendiente'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : apt.status === 'confirmada'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Fecha: {apt.date} a las {apt.time}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Profesional: <strong>{apt.professionalName}</strong></span>
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-4 flex-wrap">
                        <span>Cliente: <strong className="text-slate-200">{apt.customerName}</strong></span>
                        <span>Tel: <strong className="text-emerald-400">{apt.customerPhone}</strong></span>
                        {apt.customerEmail && <span>Email: {apt.customerEmail}</span>}
                      </div>

                      {apt.notes && (
                        <p className="text-[11px] text-slate-400 italic bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                          "{apt.notes}"
                        </p>
                      )}
                    </div>

                    {/* Acciones para el Profesional */}
                    <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-auto">
                      {apt.status === 'pendiente' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleUpdateAppointmentStatus(apt.id, 'confirmada')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirmar Cita</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateAppointmentStatus(apt.id, 'rechazada')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Rechazar</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          {apt.status === 'confirmada' ? 'Cita Agendada' : 'Cita Desestimada'}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECCIÓN RESTAURANTE                                                 */}
      {/* ==================================================================== */}
      {store.store_type === 'restaurante' && (
        <form
          onSubmit={handleSaveRestaurant}
          className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-amber-400" />
              <span>Opciones Gastronómicas de Pedido</span>
            </h3>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Consumo en Salón</span>
              <input
                type="checkbox"
                checked={restaurant.allowDineIn}
                onChange={(e) =>
                  setRestaurant({ ...restaurant, allowDineIn: e.target.checked })
                }
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Retiro en Local (Pickup)</span>
              <input
                type="checkbox"
                checked={restaurant.allowPickup}
                onChange={(e) =>
                  setRestaurant({ ...restaurant, allowPickup: e.target.checked })
                }
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Notas para Cocina</span>
              <input
                type="checkbox"
                checked={restaurant.allowKitchenNotes}
                onChange={(e) =>
                  setRestaurant({ ...restaurant, allowKitchenNotes: e.target.checked })
                }
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tiempo Estimado de Preparación (Minutos)
              </label>
              <input
                type="number"
                min="5"
                max="180"
                value={restaurant.avgPrepTimeMinutes}
                onChange={(e) =>
                  setRestaurant({
                    ...restaurant,
                    avgPrepTimeMinutes: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between self-end">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Envío Directo a WhatsApp
                </span>
                <span className="text-[10px] text-slate-400">
                  Transfiere el pedido formateado al chat de cocina
                </span>
              </div>
              <input
                type="checkbox"
                checked={restaurant.whatsappDirectOrders}
                onChange={(e) =>
                  setRestaurant({
                    ...restaurant,
                    whatsappDirectOrders: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded text-emerald-500 bg-slate-800"
              />
            </div>
          </div>
        </form>
      )}

      {/* ==================================================================== */}
      {/* SECCIÓN MODA                                                        */}
      {/* ==================================================================== */}
      {store.store_type === 'moda' && (
        <form
          onSubmit={handleSaveFashion}
          className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Shirt className="w-4 h-4 text-pink-400" />
              <span>Configuración de Moda y Prendas</span>
            </h3>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Política de Cambios y Devoluciones
            </label>
            <textarea
              rows={3}
              value={fashion.exchangePolicy}
              onChange={(e) =>
                setFashion({ ...fashion, exchangePolicy: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs resize-none"
            />
          </div>

          {/* Tabla de Guía de Tallas Estándar */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-slate-300">
              Tabla de Medidas / Guía de Tallas
            </label>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-900 text-slate-400 text-[11px] uppercase font-mono">
                  <tr>
                    <th className="p-2.5">Talla</th>
                    <th className="p-2.5">Pecho</th>
                    <th className="p-2.5">Cintura</th>
                    <th className="p-2.5">Cadera</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {fashion.sizeGuide.map((sg, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-bold text-white font-mono">{sg.size}</td>
                      <td className="p-2.5">{sg.chest}</td>
                      <td className="p-2.5">{sg.waist}</td>
                      <td className="p-2.5">{sg.hips}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </form>
      )}

      {/* ==================================================================== */}
      {/* SECCIÓN GENERAL                                                     */}
      {/* ==================================================================== */}
      {store.store_type === 'general' && (
        <form
          onSubmit={handleSaveGeneral}
          className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Diseño de Catálogo General
            </h3>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Disposición Visual de Productos
              </label>
              <select
                value={general.catalogLayout}
                onChange={(e) =>
                  setGeneral({
                    ...general,
                    catalogLayout: e.target.value as 'grid' | 'list',
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              >
                <option value="grid">Cuadrícula Visual (Grid)</option>
                <option value="list">Lista Compacta de Supermercado</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between self-end">
              <span className="text-xs font-semibold text-white">
                Mostrar Insignia de Existencias (Stock)
              </span>
              <input
                type="checkbox"
                checked={general.showStockBadges}
                onChange={(e) =>
                  setGeneral({ ...general, showStockBadges: e.target.checked })
                }
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800"
              />
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
