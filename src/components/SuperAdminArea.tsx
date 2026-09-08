import React, { useState } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  Store as StoreIcon,
  Users,
  CreditCard,
  TrendingUp,
  Activity,
  Settings,
  ArrowLeft,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { SuperAdminSection } from '../types';
import { SuperAdminDashboard } from './superadmin/SuperAdminDashboard';
import { SuperAdminStores } from './superadmin/SuperAdminStores';
import { SuperAdminUsers } from './superadmin/SuperAdminUsers';
import { SuperAdminPlans } from './superadmin/SuperAdminPlans';
import { SuperAdminSubscriptions } from './superadmin/SuperAdminSubscriptions';
import { SuperAdminActivity } from './superadmin/SuperAdminActivity';
import { SuperAdminSettings } from './superadmin/SuperAdminSettings';
import { ThemeToggle } from './ThemeToggle';

interface MenuTabItem {
  id: SuperAdminSection;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

const MENU_ITEMS: MenuTabItem[] = [
  { id: 'dashboard', label: '1. Dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard },
  { id: 'comercios', label: '2. Comercios', shortLabel: 'Comercios', icon: StoreIcon },
  { id: 'usuarios', label: '3. Usuarios', shortLabel: 'Usuarios', icon: Users },
  { id: 'planes', label: '4. Planes', shortLabel: 'Planes', icon: CreditCard },
  { id: 'suscripciones', label: '5. Suscripciones', shortLabel: 'Suscripciones', icon: TrendingUp },
  { id: 'actividad', label: '6. Actividad', shortLabel: 'Actividad', icon: Activity },
  { id: 'configuracion', label: '7. Configuración Global', shortLabel: 'Configuración', icon: Settings },
];

export const SuperAdminArea: React.FC = () => {
  const { user, signOut } = useAuth();
  const { navigate } = useRouter();
  const [activeSection, setActiveSection] = useState<SuperAdminSection>('dashboard');

  // Guardia de Seguridad Interna: Disponible ÚNICAMENTE para SuperAdmin Global
  if (!user || user.profile !== 'superadmin') {
    return (
      <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-rose-900/50 text-center space-y-4 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white">
          Acceso Restringido al SuperAdmin Global
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Este panel está reservado exclusivamente para usuarios con el perfil de <strong>SuperAdmin Global</strong>.
          Los administradores de comercios y usuarios públicos tienen restringido el acceso.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer"
        >
          Volver al Portal Principal
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Barra Superior del Panel SuperAdmin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            title="Volver al portal"
            aria-label="Volver al portal principal"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                Panel SuperAdmin Global
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase">
                CentralBo
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
              Sesión activa: <strong className="text-slate-200">{user.email}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <ThemeToggle />

          <button
            onClick={() => signOut()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Menú de 7 Secciones del SuperAdmin (Responsive con scroll horizontal en móvil) */}
      <div className="overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        <nav
          className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 min-w-max sm:min-w-0 sm:flex-wrap"
          aria-label="Menú del SuperAdmin"
        >
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="hidden md:inline">{item.label}</span>
                <span className="md:hidden">{item.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido Dinámico de la Sección Seleccionada */}
      <section className="rounded-3xl bg-slate-900/60 border border-slate-800/80 p-5 sm:p-7 shadow-xl">
        {activeSection === 'dashboard' && (
          <SuperAdminDashboard onNavigateSection={(sec) => setActiveSection(sec)} />
        )}

        {activeSection === 'comercios' && <SuperAdminStores />}

        {activeSection === 'usuarios' && <SuperAdminUsers />}

        {activeSection === 'planes' && <SuperAdminPlans />}

        {activeSection === 'suscripciones' && <SuperAdminSubscriptions />}

        {activeSection === 'actividad' && <SuperAdminActivity />}

        {activeSection === 'configuracion' && <SuperAdminSettings />}
      </section>
    </div>
  );
};
