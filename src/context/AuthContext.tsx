import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthenticatedUser, CentralBoProfile } from '../types';
import { resolveUserProfile } from '../lib/multiTenantService';

const SESSION_STORAGE_KEY = 'centralbo_auth_session';

interface AuthContextType {
  user: AuthenticatedUser | null;
  profile: CentralBoProfile;
  isLoading: boolean;
  error: string | null;
  signInWithPassword: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; user?: AuthenticatedUser }>;
  switchDemoProfile: (type: 'superadmin' | 'adminRoma' | 'adminMilano' | 'adminZenit' | 'adminLosAndes' | 'public') => void;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Inicialización de sesión
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      setIsLoading(true);

      try {
        // Limpieza de cualquier residuo de sesión local previa
        try {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        } catch {}

        // Verificar sesión activa legítima exclusivamente desde Supabase Auth
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn('[CentralBo Auth] Error al obtener sesión Supabase:', sessionError.message);
        }

        if (data?.session?.user && mounted) {
          const resolved = await resolveUserProfile(
            data.session.user.id,
            data.session.user.email || ''
          );
          setUser(resolved);
        } else if (mounted) {
          setUser(null);
        }
      } catch (err: unknown) {
        console.error('[CentralBo Auth] Excepción al inicializar sesión:', err);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    // 2. Suscripción a cambios en Supabase Auth
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          setIsLoading(true);
          const resolved = await resolveUserProfile(
            session.user.id,
            session.user.email || ''
          );
          setUser(resolved);
          try {
            localStorage.removeItem(SESSION_STORAGE_KEY);
          } catch {}
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          try {
            localStorage.removeItem(SESSION_STORAGE_KEY);
          } catch {}
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Iniciar sesión con email y contraseña mediante Supabase Auth
  const signInWithPassword = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const cleanEmail = email.trim();

      // Autenticación legítima y obligatoria mediante Supabase Auth
      // Las credenciales locales en localStorage no pueden otorgar acceso administrativo
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return { success: false, error: authError.message };
      }

      if (data?.user) {
        const resolved = await resolveUserProfile(data.user.id, data.user.email || '');
        setUser(resolved);
        try {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        } catch {}
        setIsLoading(false);
        return { success: true, user: resolved };
      }

      return { success: false, error: 'No se pudo obtener la identidad del usuario' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error inesperado de autenticación';
      setError(message);
      setIsLoading(false);
      return { success: false, error: message };
    }
  };

  // Selector rápido de perfiles (solo permite limpiar sesión o cerrar acceso; no inyecta identidades ficticias)
  const switchDemoProfile = (
    type: 'superadmin' | 'adminRoma' | 'adminMilano' | 'adminZenit' | 'adminLosAndes' | 'public'
  ) => {
    setError(null);
    if (type === 'public') {
      setUser(null);
      try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {}
    }
  };

  // Cerrar sesión
  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('[CentralBo Auth] Advertencia durante signOut:', e);
    } finally {
      setUser(null);
      try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {}
      setIsLoading(false);
    }
  };

  const profile: CentralBoProfile = user ? user.profile : 'public_client';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        error,
        signInWithPassword,
        switchDemoProfile,
        signOut,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
