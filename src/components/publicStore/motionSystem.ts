import { StoreType } from '../../types';

/**
 * Sistema Unificado de Movimiento & Microinteracciones Globales — CentralBo
 * Multi-Vertical: Gastronomía, Moda, Servicios, Comercio General.
 *
 * Principios:
 * - Movimiento adaptativo por vertical según tono e identidad real del comercio
 * - Soporte riguroso para `prefers-reduced-motion`
 * - Entradas escalonadas suaves con desplazamientos mínimos
 * - Microinteracciones sutiles en botones, tarjetas y selectores
 */

export interface MotionProfile {
  duration: number;
  fastDuration: number;
  ease: [number, number, number, number] | string;
  stagger: number;
  cardElevationClass: string;
  imageHoverScale: number;
  buttonTapScale: number;
  subtleY: number;
}

export function getVerticalMotionProfile(
  storeType: StoreType = 'general',
  shouldReduceMotion: boolean = false
): MotionProfile {
  if (shouldReduceMotion) {
    return {
      duration: 0.12,
      fastDuration: 0.08,
      ease: 'linear',
      stagger: 0,
      cardElevationClass: '',
      imageHoverScale: 1,
      buttonTapScale: 1,
      subtleY: 0,
    };
  }

  switch (storeType) {
    case 'restaurante':
      // Gastronomía: Cálida, sensorial, artesanal y contemporánea
      // Desaceleración suave y orgánica, sin saltos tecnológicos ni rebotes
      return {
        duration: 0.35,
        fastDuration: 0.22,
        ease: [0.25, 1, 0.5, 1], // ease-out cálido y orgánico
        stagger: 0.045,
        cardElevationClass: 'hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-900/5 dark:hover:shadow-black/20',
        imageHoverScale: 1.035,
        buttonTapScale: 0.97,
        subtleY: 8,
      };

    case 'moda':
      // Moda: Editorial, limpia, sofisticada, contemporánea
      // Desplazamientos mínimos, transiciones limpias y elevaciones elegantes
      return {
        duration: 0.3,
        fastDuration: 0.18,
        ease: [0.16, 1, 0.3, 1], // ease-out nítido y editorial
        stagger: 0.035,
        cardElevationClass: 'hover:-translate-y-0.5 hover:shadow-md hover:shadow-stone-900/5 dark:hover:shadow-black/25',
        imageHoverScale: 1.025,
        buttonTapScale: 0.98,
        subtleY: 6,
      };

    case 'servicios':
      // Servicios: Profesionalismo, confianza, claridad y orden
      // Entradas sobrias, feedback claro, estabilidad estructural
      return {
        duration: 0.28,
        fastDuration: 0.18,
        ease: [0.2, 0.8, 0.2, 1], // ease equilibrado y fiable
        stagger: 0.03,
        cardElevationClass: 'hover:-translate-y-0.5 hover:shadow-md hover:shadow-emerald-950/5 dark:hover:shadow-black/25',
        imageHoverScale: 1.02,
        buttonTapScale: 0.975,
        subtleY: 6,
      };

    case 'general':
    default:
      // Comercio General: Equilibrado, comercial, claro, funcional y moderno
      // Transiciones ágiles y respuesta directa en interacción
      return {
        duration: 0.26,
        fastDuration: 0.16,
        ease: [0.25, 0.1, 0.25, 1], // ease-out ágil
        stagger: 0.035,
        cardElevationClass: 'hover:-translate-y-1 hover:shadow-md hover:shadow-slate-900/5 dark:hover:shadow-black/25',
        imageHoverScale: 1.03,
        buttonTapScale: 0.97,
        subtleY: 8,
      };
  }
}

/**
 * Variantes de animación para secciones de página con entrada escalonada suave
 */
export function getSectionVariants(
  storeType: StoreType = 'general',
  shouldReduceMotion: boolean = false,
  delayOffset: number = 0
) {
  const profile = getVerticalMotionProfile(storeType, shouldReduceMotion);

  return {
    hidden: {
      opacity: 0,
      y: profile.subtleY,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: profile.duration,
        ease: profile.ease,
        delay: delayOffset,
      },
    },
  };
}

/**
 * Variantes para contenedores de catálogo o lista que escalonan sus hijos
 */
export function getStaggerContainerVariants(
  storeType: StoreType = 'general',
  shouldReduceMotion: boolean = false
) {
  const profile = getVerticalMotionProfile(storeType, shouldReduceMotion);

  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: profile.stagger,
        delayChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };
}

/**
 * Variantes para tarjetas de producto/servicio dentro del catálogo
 */
export function getCardItemVariants(
  storeType: StoreType = 'general',
  shouldReduceMotion: boolean = false
) {
  const profile = getVerticalMotionProfile(storeType, shouldReduceMotion);

  return {
    hidden: {
      opacity: 0,
      y: profile.subtleY,
      scale: shouldReduceMotion ? 1 : 0.99,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: profile.duration,
        ease: profile.ease,
      },
    },
  };
}

/**
 * Props estándar de animación para modales con apertura y cierre fluidos
 */
export function getModalMotionProps(
  storeType: StoreType = 'general',
  shouldReduceMotion: boolean = false
) {
  const profile = getVerticalMotionProfile(storeType, shouldReduceMotion);

  return {
    initial: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.97,
      y: shouldReduceMotion ? 0 : 8,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: profile.duration,
        ease: profile.ease,
      },
    },
    exit: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.98,
      y: shouldReduceMotion ? 0 : 6,
      transition: {
        duration: profile.fastDuration,
        ease: profile.ease,
      },
    },
  };
}

/**
 * Microinteracción breve y sutil para la canasta flotante al agregar productos
 */
export function getFloatingCartBumpVariants(shouldReduceMotion: boolean = false) {
  if (shouldReduceMotion) {
    return {
      idle: { scale: 1 },
      bump: { scale: 1 },
    };
  }

  return {
    idle: { scale: 1 },
    bump: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.28,
        times: [0, 0.45, 1],
        ease: 'easeOut',
      },
    },
  };
}
