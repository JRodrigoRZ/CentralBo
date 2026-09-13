import React, { useState, useEffect } from 'react';
import {
  Building2,
  User,
  Phone,
  Mail,
  MessageSquare,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Eye,
  Fingerprint,
  Percent,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Store,
  Smartphone,
  Globe,
  Zap,
} from 'lucide-react';

interface ContactFormData {
  businessName: string;
  personName: string;
  phone: string;
  email: string;
  message: string;
}

interface FormErrors {
  businessName?: string;
  personName?: string;
  phone?: string;
  email?: string;
}

// Número oficial de WhatsApp de CentralBo para recibir solicitudes
const CENTRALBO_OFFICIAL_WHATSAPP = '59163527099';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    businessName: '',
    personName: '',
    phone: '',
    email: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [lastGeneratedUrl, setLastGeneratedUrl] = useState<string>('');
  const [activeField, setActiveField] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Ingresa el nombre de tu negocio';
    }

    if (!formData.personName.trim()) {
      newErrors.personName = 'Ingresa tu nombre completo';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Ingresa tu número de WhatsApp o teléfono';
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Ingresa un correo electrónico válido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Construcción estructurada del mensaje según especificación
    const messageLines = [
      '¡Hola CentralBo! Quiero solicitar información para crear mi tienda online.',
      '',
      '📌 *Datos del negocio:*',
      `• *Nombre del negocio:* ${formData.businessName.trim()}`,
      `• *Nombre de la persona:* ${formData.personName.trim()}`,
      `• *WhatsApp / teléfono:* ${formData.phone.trim()}`,
      `• *Correo electrónico:* ${formData.email.trim() ? formData.email.trim() : 'No especificado'}`,
      '',
      '💬 *Mensaje o consulta:*',
      formData.message.trim()
        ? formData.message.trim()
        : 'Me interesa conocer cómo publicar mi catálogo y habilitar pedidos por WhatsApp.',
    ];

    const encodedMessage = encodeURIComponent(messageLines.join('\n'));
    const whatsappUrl = `https://wa.me/${CENTRALBO_OFFICIAL_WHATSAPP}?text=${encodedMessage}`;

    setLastGeneratedUrl(whatsappUrl);
    setIsSubmitted(true);

    // Abrir WhatsApp en nueva pestaña/aplicación
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const benefits = [
    {
      icon: Eye,
      title: 'Más visibilidad',
      description: 'Catálogo digital disponible 24/7 para que clientes de tu ciudad te descubran.',
      accent: 'from-blue-500 to-cyan-400',
    },
    {
      icon: Fingerprint,
      title: 'Tu identidad',
      description: 'Tu propia marca, logo y dirección web sin depender de algoritmos ajenos.',
      accent: 'from-indigo-500 to-blue-400',
    },
    {
      icon: Percent,
      title: 'Sin comisiones',
      description: 'El 100% de cada venta es tuyo, sin porcentajes retenidos por pedido.',
      accent: 'from-emerald-500 to-teal-400',
    },
    {
      icon: HeartHandshake,
      title: 'Acompañamiento',
      description: 'Asesoría y soporte cercano para dar el salto digital con total tranquilidad.',
      accent: 'from-violet-500 to-purple-400',
    },
  ];

  return (
    <section
      id="contacto"
      className="w-full scroll-mt-20 py-4 sm:py-6"
      aria-label="Crear mi tienda y contacto"
    >
      <style>{`
        @keyframes cbSheen {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        @keyframes cbOrbitalSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes cbPulseGlow {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.65; transform: scale(1.05); }
        }
        @keyframes cbNodeTravel {
          0% { transform: rotate(0deg) translateX(86px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(86px) rotate(-360deg); }
        }
        .cb-anim-sheen {
          animation: cbSheen 5s ease-in-out infinite;
        }
        .cb-orbital-spin {
          animation: cbOrbitalSpin 45s linear infinite;
        }
        .cb-pulse-glow {
          animation: cbPulseGlow 6s ease-in-out infinite;
        }
        .cb-node-travel {
          animation: cbNodeTravel 8s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .cb-anim-sheen,
          .cb-orbital-spin,
          .cb-pulse-glow,
          .cb-node-travel {
            animation: none !important;
          }
        }
      `}</style>

      {/* Contenedor Macro con fondo enriquecido de Dark Navy Profundo / Gradiente Luminoso */}
      <div className="relative rounded-3xl sm:rounded-[36px] overflow-hidden border border-slate-200/90 dark:border-blue-500/20 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 dark:from-[#060c21] dark:via-[#0b1432] dark:to-[#121139] p-6 sm:p-10 lg:p-14 shadow-xl dark:shadow-2xl dark:shadow-blue-950/60 ring-1 ring-slate-900/5 dark:ring-white/10">
        
        {/* Iluminación Atmosférica y Orbes de Luz */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 -left-20 w-[420px] h-[420px] bg-blue-500/15 dark:bg-blue-500/18 rounded-full blur-3xl cb-pulse-glow"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -right-20 w-[450px] h-[450px] bg-violet-600/15 dark:bg-violet-600/18 rounded-full blur-3xl cb-pulse-glow"
          style={{ animationDelay: '3s' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-indigo-500/10 dark:bg-indigo-500/12 rounded-full blur-3xl"
        />

        {/* Gráfico Orbital Vectorial de Fondo */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 w-[480px] h-[480px] text-blue-500/10 dark:text-blue-400/10 cb-orbital-spin select-none"
          viewBox="0 0 400 400"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="200" cy="200" r="70" strokeWidth="1.2" strokeDasharray="3 4" />
          <circle cx="200" cy="200" r="120" strokeWidth="1.2" />
          <circle cx="200" cy="200" r="170" strokeWidth="1.2" strokeDasharray="4 6" />
          <line x1="200" y1="10" x2="200" y2="390" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="10" y1="200" x2="390" y2="200" strokeWidth="1" strokeDasharray="3 3" />
        </svg>

        {/* ========================================================================= */}
        {/* COMPOSICIÓN PRINCIPAL DE 2 COLUMNAS                                        */}
        {/* ========================================================================= */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* ----------------------------------------------------------------------- */}
          {/* ÁREA IZQUIERDA: Mensaje Comercial + Beneficios + Elemento Visual       */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-8">
            
            {/* Cabecera & Titular Comercial */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-500/15 border border-blue-300/80 dark:border-blue-400/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider backdrop-blur-xs shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-300" />
                <span>Crear mi tienda en CentralBo</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
                Tu negocio también{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-300 dark:to-violet-400 bg-clip-text text-transparent">
                  puede estar en digital.
                </span>
              </h2>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-200 leading-relaxed max-w-xl">
                Crea tu vitrina online con dirección web propia, muestra tus productos o servicios con precios claros y recibe los pedidos de tus clientes de forma directa en tu WhatsApp sin pagar comisiones.
              </p>
            </div>

            {/* Elemento Visual Central: "Tu Negocio en Digital" */}
            <div className="relative p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-[#0d162b]/80 border border-slate-200/90 dark:border-blue-500/25 backdrop-blur-md shadow-lg shadow-blue-950/5 dark:shadow-blue-950/40 overflow-hidden">
              {/* Resplandor interno sutil */}
              <div className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 bg-blue-500/15 dark:bg-blue-400/20 rounded-full blur-2xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 w-44 h-44 bg-violet-500/15 dark:bg-violet-400/20 rounded-full blur-2xl" />

              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                
                {/* Visualizador Holográfico de Transición Física a Digital */}
                <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                  {/* Órbitas concéntricas */}
                  <div className="absolute inset-0 rounded-full border border-blue-400/30 dark:border-blue-400/30 cb-orbital-spin" />
                  <div className="absolute inset-2.5 rounded-full border border-dashed border-violet-400/40 dark:border-violet-400/40 cb-orbital-spin" style={{ animationDirection: 'reverse', animationDuration: '30s' }} />
                  
                  {/* Nodo luminoso que recorre la órbita ("del comercio físico al digital") */}
                  <div className="absolute inset-0 flex items-center justify-center cb-node-travel">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] ring-2 ring-white" />
                  </div>

                  {/* Núcleo central con icono Storefront / Digital */}
                  <div className="relative w-18 h-18 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white flex flex-col items-center justify-center shadow-lg shadow-indigo-500/30 ring-2 ring-white/30 dark:ring-blue-400/40">
                    <Store className="w-8 h-8" />
                    <span className="text-[9px] font-black uppercase tracking-wider mt-0.5 opacity-90">ONLINE</span>
                  </div>
                </div>

                {/* Síntesis del Ecosistema */}
                <div className="space-y-2 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Conexión Directa a WhatsApp</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Del mostrador a la pantalla de tu cliente
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-snug">
                    Un puente tecnológico simple y eficiente que convierte tu catálogo en pedidos listos para despachar.
                  </p>
                </div>
              </div>

              {/* Indicadores de Capacidad Rápida */}
              <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-[#1c2a47] grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-100/70 dark:bg-[#0b1224]/70">
                  <Smartphone className="w-4 h-4 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
                  <span className="block text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">100% Móvil</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-100/70 dark:bg-[#0b1224]/70">
                  <Globe className="w-4 h-4 mx-auto text-indigo-600 dark:text-indigo-400 mb-1" />
                  <span className="block text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">Enlace Propio</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-100/70 dark:bg-[#0b1224]/70">
                  <Zap className="w-4 h-4 mx-auto text-amber-600 dark:text-amber-400 mb-1" />
                  <span className="block text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">0% Comisión</span>
                </div>
              </div>
            </div>

            {/* Cuadrícula de 4 Beneficios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {benefits.map((b, idx) => {
                const IconComponent = b.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/80 dark:bg-[#0d162b]/70 border border-slate-200/80 dark:border-[#1c2a47] hover:border-blue-400/60 dark:hover:border-blue-500/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-2 group backdrop-blur-xs"
                  >
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${b.accent} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {b.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* ÁREA DERECHA: Formulario de Contacto Tipo Glassmorphism                 */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-6 xl:col-span-6">
            <div
              className={`relative rounded-3xl p-6 sm:p-8 lg:p-10 transition-all duration-300 backdrop-blur-xl border ${
                activeField
                  ? 'border-blue-500/40 dark:border-blue-400/40 shadow-2xl shadow-blue-500/10'
                  : 'border-slate-200/90 dark:border-blue-500/20 shadow-xl shadow-slate-900/5 dark:shadow-blue-950/50'
              } bg-white/90 dark:bg-[#0d162b]/85`}
            >
              {/* Brillo ambiental superior en la tarjeta */}
              <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-b from-blue-500/20 to-transparent rounded-full blur-xl" />

              {/* Cabecera del Formulario */}
              <div className="space-y-2 mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Contacto Directo</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Solicita información
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Completa tus datos a continuación y nuestro equipo se pondrá en contacto contigo por WhatsApp para resolver todas tus preguntas y guiarte en el proceso.
                </p>
              </div>

              {/* Mensaje de Confirmación al Enviar */}
              {isSubmitted && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      Solicitud lista. WhatsApp se abrirá para continuar la conversación con el número oficial <strong>63527099</strong>.
                    </span>
                  </div>
                  {lastGeneratedUrl && (
                    <a
                      href={lastGeneratedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shrink-0 shadow-2xs cursor-pointer"
                    >
                      <span>Abrir WhatsApp</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Formulario Estrictamente de 5 Campos */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
                
                {/* 1. Nombre del negocio * */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="businessName"
                    className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Nombre del negocio <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      onFocus={() => setActiveField('businessName')}
                      onBlur={() => setActiveField(null)}
                      placeholder="Ej. Trattoria Roma, Boutique Milano..."
                      className={`w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm transition-all outline-hidden border ${
                        errors.businessName
                          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                          : 'bg-slate-50/80 dark:bg-[#0b1224] border-slate-200 dark:border-[#1c2a47] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-500 dark:focus:ring-blue-500/30'
                      }`}
                    />
                  </div>
                  {errors.businessName && (
                    <p className="text-[11px] sm:text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.businessName}</span>
                    </p>
                  )}
                </div>

                {/* 2. Nombre de la persona * */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="personName"
                    className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Nombre de la persona <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="personName"
                      name="personName"
                      value={formData.personName}
                      onChange={handleChange}
                      onFocus={() => setActiveField('personName')}
                      onBlur={() => setActiveField(null)}
                      placeholder="Ej. Roberto Mendoza"
                      className={`w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm transition-all outline-hidden border ${
                        errors.personName
                          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                          : 'bg-slate-50/80 dark:bg-[#0b1224] border-slate-200 dark:border-[#1c2a47] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-500 dark:focus:ring-blue-500/30'
                      }`}
                    />
                  </div>
                  {errors.personName && (
                    <p className="text-[11px] sm:text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.personName}</span>
                    </p>
                  )}
                </div>

                {/* 3. WhatsApp / teléfono * */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="phone"
                    className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    WhatsApp / teléfono <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setActiveField('phone')}
                      onBlur={() => setActiveField(null)}
                      placeholder="Ej. 71234567 o 63527099"
                      className={`w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm transition-all outline-hidden border ${
                        errors.phone
                          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                          : 'bg-slate-50/80 dark:bg-[#0b1224] border-slate-200 dark:border-[#1c2a47] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-500 dark:focus:ring-blue-500/30'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] sm:text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>

                {/* 4. Correo electrónico (opcional) */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Correo electrónico <span className="text-xs font-normal text-slate-500 dark:text-slate-400">(opcional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setActiveField('email')}
                      onBlur={() => setActiveField(null)}
                      placeholder="Ej. contacto@tunegocio.com"
                      className={`w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm transition-all outline-hidden border ${
                        errors.email
                          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                          : 'bg-slate-50/80 dark:bg-[#0b1224] border-slate-200 dark:border-[#1c2a47] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-500 dark:focus:ring-blue-500/30'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] sm:text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* 5. Mensaje o consulta */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="message"
                    className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Mensaje o consulta
                  </label>
                  <div className="relative">
                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleChange}
                      onFocus={() => setActiveField('message')}
                      onBlur={() => setActiveField(null)}
                      placeholder="Cuéntanos brevemente sobre tus productos o servicios, horarios o cualquier duda que tengas sobre tu tienda online..."
                      className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm transition-all outline-hidden border bg-slate-50/80 dark:bg-[#0b1224] border-slate-200 dark:border-[#1c2a47] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-500 dark:focus:ring-blue-500/30 resize-y"
                    />
                  </div>
                </div>

                {/* Botón Principal y Mensaje de Apoyo */}
                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    className="w-full group relative overflow-hidden py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 active:scale-[0.99] shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/35 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5"
                  >
                    {/* Brillo lineal ocasional que atraviesa el botón suavemente */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent cb-anim-sheen"
                    />

                    <MessageCircle className="w-5 h-5 relative z-10 transition-transform duration-200 group-hover:scale-110" />
                    <span className="relative z-10">Solicitar información</span>
                    <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>

                  {/* Mensaje de apoyo obligatorio con el número oficial 63527099 */}
                  <p className="text-[11px] sm:text-xs text-center text-slate-500 dark:text-slate-400 leading-relaxed px-2">
                    Al hacer clic, se preparará y abrirá WhatsApp para continuar la conversación con el número oficial de CentralBo:{' '}
                    <strong className="text-slate-700 dark:text-slate-200 font-semibold">63527099</strong>.
                  </p>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
