/**
 * MAXINEGO.app — TIENDAS PÚBLICAS 2.0
 * MÓDULO 6 DE 6: SELECCIÓN DE MODELOS ESPECIALES DE TIENDA
 *
 * REGLAS ARQUITECTÓNICAS Y COMERCIALES OFICIALES:
 * 1. PLAN FREE:
 *    - Utiliza exclusivamente el diseño base actual aprobado ('free').
 *    - No puede seleccionar ni aplicar modelos especiales.
 *    - Su diseño permanece 100% intacto, sin alteraciones ni degradación.
 * 2. PLAN BASIC:
 *    - Puede seleccionar y aplicar exclusivamente los dos (2) modelos aprobados para su rubro.
 *    - No puede seleccionar los dos modelos exclusivos de PRO.
 * 3. PLAN PRO:
 *    - Puede seleccionar y aplicar cualquiera de los cuatro (4) modelos de su rubro (2 Basic + 2 Pro).
 * 4. DISTRIBUCIÓN OBLIGATORIA (20 MODELOS):
 *    - Gastronomía: G1, G2 (Basic) / G3, G4 (Pro)
 *    - Moda y Calzado: M2, M4 (Basic) / M1, M3 (Pro)
 *    - Servicios: S1, S4 (Basic) / S2, S3 (Pro)
 *    - Billar: B2, B3 (Basic) / B1, B4 (Pro)
 *    - Comercio General: C1, C3 (Basic) / C2, C4 (Pro)
 * 5. COMERCIOS EXISTENTES:
 *    - Conservan 'free' por defecto hasta que el comerciante decida elegir uno.
 *    - Reutilizan automáticamente todos los datos reales (logo, colores, productos, banners, historias, mapa, QR, WhatsApp).
 */

import { Store, StoreAppearanceSettings } from '../../types';
import { getStorePlan } from '../../lib/storeAdminService';

export type StoreIndustry = 'gastronomia' | 'moda' | 'servicios' | 'billar' | 'general';

export type PublicStorePlanTier = 'free' | 'basic' | 'pro';

export type SpecialTemplateCode =
  // Gastronomía (G1-G4 base + G5-G8 ampliación Pro)
  | 'g1'
  | 'g2'
  | 'g3'
  | 'g4'
  | 'g5'
  | 'g6'
  | 'g7'
  | 'g8'
  // Moda y Calzado
  | 'm1'
  | 'm2'
  | 'm3'
  | 'm4'
  // Servicios
  | 's1'
  | 's2'
  | 's3'
  | 's4'
  // Billar
  | 'b1'
  | 'b2'
  | 'b3'
  | 'b4'
  // Comercio General
  | 'c1'
  | 'c2'
  | 'c3'
  | 'c4';

export type PublicStoreTemplateId = 'free' | SpecialTemplateCode;

export interface SpecialTemplateDefinition {
  id: SpecialTemplateCode;
  code: string;
  name: string;
  industry: StoreIndustry;
  industryLabel: string;
  tier: 'basic' | 'pro';
  tierLabel: 'Basic & Pro' | 'Exclusivo Pro';
  tagline: string;
  description: string;
  compositionSummary: string;
  visualHighlights: string[];
  cardAspect: '16:9' | '4:3' | '3:4' | '1:1' | 'horizontal';
  density: 'compact' | 'balanced' | 'spacious';
  typographyStyle: 'sans-modern' | 'serif-editorial' | 'condensed-bold' | 'clean-minimal';
  badgeStyle: 'express' | 'visual' | 'boutique' | 'street' | 'executive' | 'gold' | 'neon' | 'sport';
}

export const OFFICIAL_FREE_TEMPLATE_ID: PublicStoreTemplateId = 'free';

/**
 * Catálogo canónico de los 20 modelos especiales aprobados
 */
export const SPECIAL_TEMPLATES: Record<SpecialTemplateCode, SpecialTemplateDefinition> = {
  // --------------------------------------------------------------------------
  // GASTRONOMÍA
  // --------------------------------------------------------------------------
  g1: {
    id: 'g1',
    code: 'G1',
    name: 'G1 — Pedido Express',
    industry: 'gastronomia',
    industryLabel: 'Gastronomía',
    tier: 'basic',
    tierLabel: 'Basic & Pro',
    tagline: 'Exploración ultrarrápida y adición en un toque',
    description:
      'Diseño visual dinámico con cabecera compacta, buscador inmediato y selector de categorías sticky para pedir en segundos.',
    compositionSummary:
      'Portada compacta, categorías de alto protagonismo, tarjetas horizontales y botones directos "+ Agregar" con mínima fricción.',
    visualHighlights: [
      'Portada superior compacta para visualización inmediata del menú',
      'Categorías horizontales prominentes de exploración rápida',
      'Tarjetas de platos de lectura rápida con precio en Bs destacado',
      'Acción directa de agregar sin scroll innecesario',
    ],
    cardAspect: 'horizontal',
    density: 'compact',
    typographyStyle: 'sans-modern',
    badgeStyle: 'express',
  },
  g2: {
    id: 'g2',
    code: 'G2',
    name: 'G2 — Menú Visual',
    industry: 'gastronomia',
    industryLabel: 'Gastronomía',
    tier: 'basic',
    tierLabel: 'Basic & Pro',
    tagline: 'Fotografías amplias y apetitosas como carta gourmet',
    description:
      'Diseño centrado en la belleza visual de los platos con fotografías 16:9 y distribución de restaurante contemporáneo (ideal para sushi, hamburguesas y cocina de autor).',
    compositionSummary:
      'Fotografía dominante en cada plato, badges de ingredientes, títulos gastronómicos cuidados y equilibrio entre imagen y precio.',
    visualHighlights: [
      'Presentación panorámica de platos con gran impacto visual',
      'Distribución moderna de carta culinaria',
      'Insignias de sugerencias del menú y etiquetas de preparación',
      'Equilibrio óptimo entre descripción apetitosa y precio',
    ],
    cardAspect: '16:9',
    density: 'balanced',
    typographyStyle: 'sans-modern',
    badgeStyle: 'visual',
  },
  g3: {
    id: 'g3',
    code: 'G3',
    name: 'G3 — Café & Boutique',
    industry: 'gastronomia',
    industryLabel: 'Gastronomía',
    tier: 'pro',
    tierLabel: 'Exclusivo Pro',
    tagline: 'Ambiente cálido, artesanal y tipografía de autor',
    description:
      'Diseño visual acogedor y editorial para cafeterías de especialidad, pastelerías boutique y bistrós gourmet.',
    compositionSummary:
      'Composición con espacio generoso, tipografía serif expresiva, bordes redondeados orgánicos y tarjetas de acabado artesanal.',
    visualHighlights: [
      'Portada cálida con estilo de bistró o cafetería europea',
      'Tipografía serif refinada y mayor espacio visual',
      'Tarjetas con marcos suaves y textura acogedora',
      'Experiencia de compra relajada y premium',
    ],
    cardAspect: '4:3',
    density: 'spacious',
    typographyStyle: 'serif-editorial',
    badgeStyle: 'boutique',
  },
  g4: {
    id: 'g4',
    code: 'G4',
    name: 'G4 — Especialidades',
    industry: 'gastronomia',
    industryLabel: 'Gastronomía',
    tier: 'pro',
    tierLabel: 'Exclusivo Pro',
    tagline: 'Vitrina de platos insignia y experiencia de alta cocina',
    description:
      'Diseño que eleva cada plato individual con presencia señorial, bordes dobles refinados y sellos de recomendación del chef.',
    compositionSummary:
      'Cabecera señorial, tarjetas de plato con relieve sutil y sellos dorados/ámbar para destacar especialidades culinarias.',
    visualHighlights: [
      'Showcase superior para plato estrella o recomendación destacada',
      'Tarjetas con borde premium y detalles de alta cocina',
      'Mayor jerarquía de nombres y notas gastronómicas',
      'Sensación de restaurante de autor de alto nivel',
    ],
    cardAspect: '16:9',
    density: 'spacious',
    typographyStyle: 'serif-editorial',
    badgeStyle: 'gold',
  },
  g5: {
    id: 'g5',
    code: 'G5',
    name: 'G5 — Pedido Express Visual',
    industry: 'gastronomia',
    industryLabel: 'Gastronomía',
    tier: 'pro',
    tierLabel: 'Exclusivo Pro',
    tagline: 'Alto impacto visual, fotografía protagonista y pedidos rápidos',
    description:
      'Diseño moderno y enérgico con gran presencia fotográfica, categorías en chips visuales con imágenes y recorrido dinámico optimizado para celulares.',
    compositionSummary:
      'Portada de gran impacto visual, categorías en chips circulares de comida, tarjetas de platos compactas y claras, y botón de agregar directo con mínima fricción.',
    visualHighlights: [
      'Portada dinámica con fotografía gastronómica protagonista',
      'Categorías en chips visuales de exploración rápida con imágenes',
      'Tarjetas compactas y claras de alto impacto en celular',
      'Precios en Bs destacados y botón de agregar muy visible',
      'Ideal para delivery, sushi y pedidos rápidos con energía moderna',
    ],
    cardAspect: '4:3',
    density: 'compact',
    typographyStyle: 'sans-modern',
    badgeStyle: 'express',
  },
  g6: {
    id: 'g6',
    code: 'G6',
    name: 'G6 — Menú Visual Fotográfico',
    industry: 'gastronomia',
    industryLabel: 'Gastronomía',
    tier: 'pro',
    tierLabel: 'Exclusivo Pro',
    tagline: 'Carta gastronómica digital moderna, apetitosa y de alta calidad',
    description:
      'Experiencia tipo carta gastronómica contemporánea con fotografía dominante en la apertura, categorías de menú nítidas y cuadrícula de platos con imágenes generosas.',
    compositionSummary:
      'Fotografía gastronómica de apertura, selector horizontal de categorías, tarjetas de platos con imágenes de gran tamaño, ingredientes detallados y botón directo.',
    visualHighlights: [
      'Fotografías grandes y apetitosas con alta presencia visual',
      'Diseño estructurado tipo carta de restaurante moderno',
      'Categorías horizontales organizadas y claras',
      'Tarjetas de platos con imágenes generosas y notas de cocina',
      'Estilo limpio, elegante, apetitoso y profesional',
    ],
    cardAspect: '4:3',
    density: 'balanced',
    typographyStyle: 'sans-modern',
    badgeStyle: 'visual',
  },
  g7: {
    id: 'g7',
    code: 'G7',
    name: 'G7 — Café & Boutique Editorial',
    industry: 'gastronomia',
    industryLabel: 'Gastronomía',
    tier: 'pro',
    tierLabel: 'Exclusivo Pro',
    tagline: 'Ambiente cálido, artesanal y sofisticado con estilo editorial',
    description:
      'Composición acogedora y refinada inspirada en cafeterías de especialidad, pastelerías boutique y heladerías de autor, con espacios generosos y tipografía editorial elegante.',
    compositionSummary:
      'Portada acogedora y ambiental, paleta cálida respetando la marca, espacios visuales amplios, categorías circulares y tarjetas de producto como colección cuidada.',
    visualHighlights: [
      'Portada acogedora y ambiental con atmósfera de bistró o café boutique',
      'Tipografía editorial y refinada para títulos, notas y precios',
      'Tarjetas con mayor espaciado y fotografías de autor',
      'Ideal para cafeterías, pastelerías, repostería y bistrós gourmet',
      'Sensación artesanal, sofisticada y de cercanía premium',
    ],
    cardAspect: '4:3',
    density: 'spacious',
    typographyStyle: 'serif-editorial',
    badgeStyle: 'boutique',
  },
  g8: {
    id: 'g8',
    code: 'G8',
    name: 'G8 — Especialidades Premium',
    industry: 'gastronomia',
    industryLabel: 'Gastronomía',
    tier: 'pro',
    tierLabel: 'Exclusivo Pro',
    tagline: 'Vitrina señorial de platos insignia y experiencia de alta cocina',
    description:
      'Diseño exclusivo de alta gastronomía con contrastes refinados, fondos profundos, tipografía de autor y protagonismo absoluto para los platos insignia del comercio.',
    compositionSummary:
      'Portada señorial con fotografía gastronómica protagonista, jerarquía que resalta especialidades reales, tarjetas exclusivas con sello de especialidad y acentos dorados controlados.',
    visualHighlights: [
      'Portada elegante y sofisticada con contrastes refinados',
      'Platos destacados presentados mediante fotografías amplias',
      'Tarjetas refinadas con sello distintivo de especialidad',
      'Tipografía con carácter y composición visual premium',
      'Ideal para restaurantes de alta cocina y cocina de autor',
    ],
    cardAspect: '16:9',
    density: 'spacious',
    typographyStyle: 'serif-editorial',
    badgeStyle: 'gold',
  },

  // --------------------------------------------------------------------------
  // MODA Y CALZADO
  // --------------------------------------------------------------------------
  m2: {
    id: 'm2',
    code: 'M2',
    name: 'M2 — Lookbook & Colecciones',
    industry: 'moda',
    industryLabel: 'Moda y Calzado',
    tier: 'basic',
    tierLabel: 'Basic & Pro',
    tagline: 'Presentación de prendas completas estilo catálogo de moda',
    description:
      'Composición en cuadrícula vertical (relación 3:4) para lucir vestidos, conjuntos y prendas completas tal como en las tiendas de moda más modernas.',
    compositionSummary:
      'Tarjetas verticales estilo lookbook, etiquetas de colección, selector estilizado de tallas y compra ágil.',
    visualHighlights: [
      'Formato vertical 3:4 ideal para lucir prendas de cuerpo entero',
      'Categorías organizadas como colecciones de temporada',
      'Etiquetas limpias de precio y acceso a guía de tallas',
      'Navegación visual pulida para tiendas de indumentaria',
    ],
    cardAspect: '3:4',
    density: 'balanced',
    typographyStyle: 'sans-modern',
    badgeStyle: 'boutique',
  },
  m4: {
    id: 'm4',
    code: 'M4',
    name: 'M4 — Catálogo de Calzado',
    industry: 'moda',
    industryLabel: 'Moda y Calzado',
    tier: 'basic',
    tierLabel: 'Basic & Pro',
    tagline: 'Cuadrícula nítida optimizada para calzado y accesorios',
    description:
      'Estructura limpia para comparar zapatillas, calzados y marroquinería con proporciones exactas y precios claros.',
    compositionSummary:
      'Cuadrícula 1:1 o 4:3 con fondo neutro, alta nitidez fotográfica y comparación clara entre modelos y variantes.',
    visualHighlights: [
      'Cuadrícula simétrica enfocada en siluetas y acabados de calzado',
      'Tarjetas diseñadas para comparar modelos con facilidad',
      'Etiquetas de disponibilidad y precios destacados',
      'Diseño comercial limpio sin elementos distractores',
    ],
    cardAspect: '4:3',
    density: 'balanced',
    typographyStyle: 'sans-modern',
    badgeStyle: 'express',
  },
  m1: {
    id: 'm1',
    code: 'M1',
    name: 'M1 — Boutique Editorial',
    industry: 'moda',
    industryLabel: 'Moda y Calzado',
    tier: 'pro',
    tierLabel: 'Exclusivo Pro',
    tagline: 'Inspiración en revistas de alta moda y minimalismo absoluto',
    description:
      'Diseño visual sofisticado inspirado en editoriales de pasarela con generoso espacio blanco, líneas finas y tipografía serif clásica.',
    compositionSummary:
      'Márgenes amplios, tipografía editorial, presentación artística de prendas y sellos minimalistas de alta gama.',
    visualHighlights: [
      'Composición editorial con espaciado amplio y elegante',
      'Tipografía serif de alta costura para títulos y precios',
      'Tarjetas con micro-bordes refinados y presencia distinguida',
      'Estilo minimalista puro para marcas exclusivas',
    ],
    cardAspect: '3:4',
    density: 'spacious',
    typographyStyle: 'serif-editorial',
    badgeStyle: 'boutique',
  },
  m3: {
    id: 'm3',
    code: 'M3',
    name: 'M3 — Streetwear Urbano',
    industry: 'moda',
    industryLabel: 'Moda y Calzado',
    tier: 'pro',
    tierLabel: 'Exclusivo Pro',
    tagline: 'Tipografía mayúscula bold, contrastes intensos y energía urbana',
    description:
      'Estética urbana y moderna con tipografía contundente, contrastes oscuros marcados y estética streetwear contemporánea.',
    compositionSummary:
      'Bloques angulares oscuros, tipografía pesada en mayúsculas, insignias técnicas y diseño dinámico de alto impacto.',
    visualHighlights: [
      'Tipografía condensada bold con presencia urbana marcada',
      'Contrastes visuales de alto poder en modo claro y oscuro',
      'Tarjetas con estética streetwear, bordes geométricos y sellos',
      'Personalidad juvenil y comercial de gran atractivo',
    ],
    cardAspect: '3:4',
    density: 'compact',
    typographyStyle: 'condensed-bold',
    badgeStyle: 'street',
  },

  // --------------------------------------------------------------------------
  // SERVICIOS
  // --------------------------------------------------------------------------
  s1: {
    id: 's1',
    code: 'S1',
    name: 'S1 — Profesional Minimalista',
    industry: 'servicios',
    industryLabel: 'Servicios',
    tier: 'basic',
    tierLabel: 'Basic & Pro',
    tagline: 'Presentación ejecutiva clara con lista de servicios ordenada',
    description:
      'Diseño ordenado y directo para profesionales independientes, consultores y empresas de servicios corporativos.',
    compositionSummary:
      'Perfil profesional destacado, lista de servicios limpia con duración y precio en Bs, y llamada directa a agendar.',
    visualHighlights: [
      'Identidad profesional destacada con credenciales y horario',
      'Lista ejecutiva de servicios con duración y costo transparente',
      'Tipografía sobria y distribución de alta confianza comercial',
      'Acceso inmediato a solicitud de citas o contacto directo',
    ],
    cardAspect: 'horizontal',
    density: 'balanced',
    typographyStyle: 'clean-minimal',
    badgeStyle: 'executive',
  },
  s4: {
    id: 's4',
    code: 'S4',
    name: 'S4 — Servicios Técnicos',
    industry: 'servicios',
    industryLabel: 'Servicios',
    tier: 'basic',
    tierLabel: 'Basic & Pro',
    tagline: 'Organización práctica para talleres, mantenimiento y soporte técnico',
    description:
      'Composición enfocada en la claridad operativa: alcances del servicio, tiempos de respuesta y contacto directo para presupuestos.',
    compositionSummary:
      'Tarjetas con viñetas técnicas, sellos de garantía y botones de cotización directa por WhatsApp.',
    visualHighlights: [
      'Estructura funcional orientada a soporte y trabajos técnicos',
      'Insignias de respuesta rápida y garantía de servicio',
      'Bloques informativos de atención en taller o a domicilio',
      'Acceso expedito para consultar y coordinar presupuestos',
    ],
    cardAspect: 'horizontal',
    density: 'compact',
    typographyStyle: 'sans-modern',
    badgeStyle: 'express',
  },
  s2: {
    id: 's2',
    code: 'S2',
    name: 'S2 — Belleza Visual',
    industry: 'servicios',
    industryLabel: 'Servicios',
    tier: 'pro',
    tierLabel: 'Exclusivo Pro',
    tagline: 'Estética delicada para salones de belleza, estética y spa',
    description:
      'Diseño visual suave con tonos cálidos, fotografías protagonistas de tratamientos y tipografía femenina y distinguida.',
    compositionSummary:
      'Tarjetas con curvatura orgánica, sombras delicadas, fotos de sesiones de belleza y presentación armoniosa.',
    visualHighlights: [
      'Superficies y acabados suaves que evocan bienestar y relajación',
      'Fotografías protagonistas de tratamientos y transformaciones',
      'Tarjetas refinadas con detalles de sesión y costo',
      'Ambiente digital de estética o spa de alta categoría',
    ],
    cardAspect: '4:3',
    density: 'spacious',
    typographyStyle: 'serif-editorial',
    badgeStyle: 'boutique',
  },
  s3: {
    id: 's3',
    code: 'S3',
    name: 'S3 — Barbería Premium',
    industry: 'servicios',
    industryLabel: 'Servicios',
    tier: 'pro',
    tierLabel: 'Exclusivo Pro',
    tagline: 'Estilo clásico de barbería con alto contraste y personalidad fuerte',
    description:
      'Estética contundente inspirada en barberías tradicionales y modernas con bloques oscuros, bordes precisos y tipografía con carácter.',
    compositionSummary:
      'Bloques visuales con marcado contraste, iconografía clásica de tijeras y navaja, y tarjetas de corte y afeitado de alta presencia.',
    visualHighlights: [
      'Estética potente con alto contraste y carácter artesanal',
      'Tipografía bold con inspiración en talleres y barberías clásicas',
      'Tarjetas de servicios estructuradas con duración y precio',
      'Perfecta armonía visual en modo claro y modo oscuro',
    ],
    cardAspect: 'horizontal',
    density: 'compact',
    typographyStyle: 'condensed-bold',
    badgeStyle: 'gold',
  },

  // --------------------------------------------------------------------------
  // BILLAR
  // --------------------------------------------------------------------------
  b2: {
    id: 'b2',
    code: 'B2',
    name: 'B2 — Snooker Deportivo',
    industry: 'billar',
    industryLabel: 'Billar',
    tier: 'basic',
    tierLabel: 'Basic & Pro',
    tagline: 'Acentos verdes deportivos inspirados en el paño clásico',
    description:
      'Composición atlética y ordenada con acentos verdes paño de billar respetando la identidad comercial del establecimiento.',
    compositionSummary:
      'Cabecera con sellos deportivos, catálogo organizado de mesas, bebidas y accesorios, e información comercial nítida.',
    visualHighlights: [
      'Acentos deportivos inspirados en el paño tradicional de billar',
      'Información visible de horarios y tarifas de sala',
      'Catálogo limpio de artículos, accesorios y consumos',
      'Navegación ágil para jugadores y visitantes',
    ],
    cardAspect: '4:3',
    density: 'balanced',
    typographyStyle: 'sans-modern',
    badgeStyle: 'sport',
  },
  b3: {
    id: 'b3',
    code: 'B3',
    name: 'B3 — Club Competitivo',
    industry: 'billar',
    industryLabel: 'Billar',
    tier: 'basic',
    tierLabel: 'Basic & Pro',
    tagline: 'Diseño dinámico de club contemporáneo con tipografía fuerte',
    description:
      'Estética deportiva contundente para clubes de billar, pool y carambola con tarjetas sólidas y presentación activa.',
    compositionSummary:
      'Tarjetas con bordes definidos, tipografía atlética y acceso claro a reservas de mesa y carta del bar.',
    visualHighlights: [
      'Composición dinámica con carácter de club moderno',
      'Tipografía deportiva y tarjetas con presencia sólida',
      'Acceso claro a opciones de juego y productos de sala',
      'Visualización clara de horarios de atención nocturna',
    ],
    cardAspect: '4:3',
    density: 'compact',
    typographyStyle: 'condensed-bold',
    badgeStyle: 'sport',
  },
  b1: {
    id: 'b1',
    code: 'B1',
    name: 'B1 — Club Premium',
    industry: 'billar',
    industryLabel: 'Billar',
    tier: 'pro',
    tierLabel: 'Exclusivo Pro',
    tagline: 'Lounge nocturno exclusivo con estética oscura y dorada',
    description:
      'Diseño refinado tipo sala VIP y billar lounge con superficies oscuras de alta categoría y acentos dorados sutiles.',
    compositionSummary:
      'Atmósfera sofisticada de club nocturno, cartas de coctelería y mesas con acabados de lujo y tipografía distinguida.',
    visualHighlights: [
      'Atmósfera de sala VIP con profunda elegancia visual',
      'Acentos dorados sutiles sobre superficies de alta gama',
      'Presentación premium de carta de bebidas y mesas de billar',
      'Identidad visual refinada para establecimientos selectos',
    ],
    cardAspect: '16:9',
    density: 'spacious',
    typographyStyle: 'serif-editorial',
    badgeStyle: 'gold',
  },
  b4: {
    id: 'b4',
    code: 'B4',
    name: 'B4 — Neon Gaming',
    industry: 'billar',
    industryLabel: 'Billar',
    tier: 'pro',
    tierLabel: 'Exclusivo Pro',
    tagline: 'Estética juvenil con acentos luminosos tipo arcade & lounge',
    description:
      'Diseño visual contemporáneo con sutiles auras de luz cian y púrpura para billares juveniles, salas de ocio y pool & darts lounges.',
    compositionSummary:
      'Bordes oscuros con resplandor neón controlado, tarjetas modernas de alta profundidad y contraste óptimo sin perder legibilidad.',
    visualHighlights: [
      'Acentos luminosos suaves inspirados en salas de juego modernas',
      'Profundidad visual con fondos oscuros y brillo de neón controlado',
      'Tarjetas estilizadas con microinteracciones de luces',
      'Experiencia inmersiva y juvenil para el público contemporáneo',
    ],
    cardAspect: '4:3',
    density: 'compact',
    typographyStyle: 'sans-modern',
    badgeStyle: 'neon',
  },

  // --------------------------------------------------------------------------
  // COMERCIO GENERAL
  // --------------------------------------------------------------------------
  c1: {
    id: 'c1',
    code: 'C1',
    name: 'C1 — Minimarket Visual',
    industry: 'general',
    industryLabel: 'Comercio General',
    tier: 'basic',
    tierLabel: 'Basic & Pro',
    tagline: 'Exploración rápida de productos cotidianos y conveniencia',
    description:
      'Diseño ágil y fresco para minimarkets, tiendas de barrio, botillerías y tiendas de conveniencia con compras rápidas.',
    compositionSummary:
      'Categorías en pastillas de rápido escaneo, cuadrícula compacta de productos y botones de agregar al carrito al instante.',
    visualHighlights: [
      'Cuadrícula ágil optimizada para carritos con múltiples productos',
      'Precios en Bs visibles de un solo vistazo con badges claros',
      'Categorías de exploración directa en la parte superior',
      'Diseño comercial accesible y directo para compra cotidiana',
    ],
    cardAspect: '1:1',
    density: 'compact',
    typographyStyle: 'sans-modern',
    badgeStyle: 'express',
  },
  c3: {
    id: 'c3',
    code: 'C3',
    name: 'C3 — Catálogo Multicategoría',
    industry: 'general',
    industryLabel: 'Comercio General',
    tier: 'basic',
    tierLabel: 'Basic & Pro',
    tagline: 'Organización estructurada para tiendas con inventarios amplios',
    description:
      'Estructura densa y bien jerarquizada para librerías, ferreterías, bazares y distribuidores con cientos de artículos.',
    compositionSummary:
      'Menú de categorías estructurado, tarjetas uniformes con información precisa y navegación cómoda entre secciones.',
    visualHighlights: [
      'Densidad de catálogo optimizada para inventarios amplios',
      'Navegación intuitiva por múltiples categorías de productos',
      'Tarjetas uniformes con foto clara, nombre y precio directo',
      'Experiencia de búsqueda y filtrado muy eficiente',
    ],
    cardAspect: '1:1',
    density: 'balanced',
    typographyStyle: 'sans-modern',
    badgeStyle: 'express',
  },
  c2: {
    id: 'c2',
    code: 'C2',
    name: 'C2 — Electrónica Promocional',
    industry: 'general',
    industryLabel: 'Comercio General',
    tier: 'pro',
    tierLabel: 'Exclusivo Pro',
    tagline: 'Vitrina de tecnología con protagonismo de banners y ofertas',
    description:
      'Composición comercial de alto impacto para tiendas de tecnología, telefonía, informática y gadgets con especificaciones técnicas.',
    compositionSummary:
      'Banners promocionales de cabecera destacados, tarjetas con sellos de garantía y tipografía moderna de alta tecnología.',
    visualHighlights: [
      'Integración protagonista de banners y promociones de temporada',
      'Tarjetas con especificaciones claras de tecnología y garantía',
      'Tipografía técnica y contrastes en promociones reales',
      'Apariencia de tienda oficial de tecnología de primer nivel',
    ],
    cardAspect: '16:9',
    density: 'balanced',
    typographyStyle: 'sans-modern',
    badgeStyle: 'street',
  },
  c4: {
    id: 'c4',
    code: 'C4',
    name: 'C4 — Productos Boutique',
    industry: 'general',
    industryLabel: 'Comercio General',
    tier: 'pro',
    tierLabel: 'Exclusivo Pro',
    tagline: 'Espacios aireados para regalos selectos, artesanías y decoración',
    description:
      'Diseño visual refinado con mayor separación entre artículos, fotografías grandes y presentación pausada y sofisticada.',
    compositionSummary:
      'Composición menos densa, tipografía delicada, fondos pulcros y tarjetas de artículo con presencia distinguida.',
    visualHighlights: [
      'Composición aireada con espacios generosos entre artículos',
      'Fotografías protagonistas de alta calidad estética',
      'Tipografía delicada que realza productos selectos o de autor',
      'Experiencia de compra relajada propia de una tienda boutique',
    ],
    cardAspect: '1:1',
    density: 'spacious',
    typographyStyle: 'serif-editorial',
    badgeStyle: 'boutique',
  },
};

/**
 * Resuelve el rubro comercial de una tienda a partir de sus datos reales
 */
export function getIndustryFromStore(store?: Store | null): StoreIndustry {
  if (!store) return 'general';

  // 1. Detección directa por tipo de tienda registrado
  const rawType = (store.store_type || '').toLowerCase();
  if (rawType === 'restaurante' || rawType === 'gastronomia') return 'gastronomia';
  if (rawType === 'moda' || rawType === 'calzado') return 'moda';
  if (rawType === 'servicios') return 'servicios';
  if (rawType === 'billar') return 'billar';

  // 2. Detección por atributos de perfil o slug si aplica
  const slug = (store.slug || '').toLowerCase();
  const name = (store.name || '').toLowerCase();
  const profile = (store.profile as any) || {};
  const profIndustry = (profile.industry || '').toLowerCase();

  if (profIndustry === 'billar' || slug.includes('billar') || name.includes('billar') || slug.includes('snooker') || slug.includes('pool-club')) {
    return 'billar';
  }
  if (profIndustry === 'gastronomia' || profIndustry === 'restaurante' || slug.includes('sushi') || slug.includes('burger') || slug.includes('pizza') || slug.includes('cafe')) {
    return 'gastronomia';
  }
  if (profIndustry === 'moda' || profIndustry === 'calzado' || slug.includes('boutique') || slug.includes('moda') || slug.includes('outfit')) {
    return 'moda';
  }
  if (profIndustry === 'servicios' || profIndustry === 'spa' || profIndustry === 'barberia' || slug.includes('spa') || slug.includes('barber')) {
    return 'servicios';
  }

  return 'general';
}

/**
 * Obtiene la lista de los 4 modelos correspondientes al rubro del comercio
 */
export function getIndustryTemplates(industry: StoreIndustry): SpecialTemplateDefinition[] {
  switch (industry) {
    case 'gastronomia':
      return [
        SPECIAL_TEMPLATES.g1,
        SPECIAL_TEMPLATES.g2,
        SPECIAL_TEMPLATES.g3,
        SPECIAL_TEMPLATES.g4,
        SPECIAL_TEMPLATES.g5,
        SPECIAL_TEMPLATES.g6,
        SPECIAL_TEMPLATES.g7,
        SPECIAL_TEMPLATES.g8,
      ];
    case 'moda':
      return [SPECIAL_TEMPLATES.m2, SPECIAL_TEMPLATES.m4, SPECIAL_TEMPLATES.m1, SPECIAL_TEMPLATES.m3];
    case 'servicios':
      return [SPECIAL_TEMPLATES.s1, SPECIAL_TEMPLATES.s4, SPECIAL_TEMPLATES.s2, SPECIAL_TEMPLATES.s3];
    case 'billar':
      return [SPECIAL_TEMPLATES.b2, SPECIAL_TEMPLATES.b3, SPECIAL_TEMPLATES.b1, SPECIAL_TEMPLATES.b4];
    case 'general':
    default:
      return [SPECIAL_TEMPLATES.c1, SPECIAL_TEMPLATES.c3, SPECIAL_TEMPLATES.c2, SPECIAL_TEMPLATES.c4];
  }
}

/**
 * Valida si un modelo está estrictamente permitido para un plan y un rubro dados.
 */
export function isTemplateAllowedForPlan(
  templateId: string | undefined | null,
  plan: 'free' | 'basic' | 'pro',
  industry: StoreIndustry
): boolean {
  if (!templateId || templateId === 'free') {
    return true; // La base FREE siempre es válida
  }

  // Plan FREE nunca puede activar modelos especiales
  if (plan === 'free') {
    return false;
  }

  const tmpl = SPECIAL_TEMPLATES[templateId as SpecialTemplateCode];
  if (!tmpl) {
    return false;
  }

  // El modelo debe pertenecer estrictamente al rubro del comercio
  if (tmpl.industry !== industry) {
    return false;
  }

  // Plan BASIC solo permite modelos con tier 'basic'
  if (plan === 'basic') {
    return tmpl.tier === 'basic';
  }

  // Plan PRO permite tanto los de tier 'basic' como los de 'pro' de su rubro
  if (plan === 'pro') {
    return true;
  }

  return false;
}

/**
 * Resuelve la plantilla de tienda pública activa de forma canónica y segura.
 *
 * REGLAS OBLIGATORIAS:
 * 1. Si no hay tienda o apariencia: retorna 'free'.
 * 2. Si el plan es FREE: retorna 'free' (el diseño actual aprobado permanece intacto).
 * 3. Si la plantilla configurada es 'free' o no existe: retorna 'free'.
 * 4. Si la plantilla configurada no es permitida por el plan o rubro vigente:
 *    hace fallback seguro a 'free' sin eliminar la configuración del comerciante.
 * 5. Si la plantilla es válida para el rubro y plan: retorna el identificador del modelo especial.
 */
export function resolveStoreTemplate(
  store?: Store | null,
  appearance?: StoreAppearanceSettings | null
): PublicStoreTemplateId {
  if (!store) {
    return OFFICIAL_FREE_TEMPLATE_ID;
  }

  const requestedTemplateId = appearance?.templateId;
  if (!requestedTemplateId || requestedTemplateId === 'free') {
    return OFFICIAL_FREE_TEMPLATE_ID;
  }

  const plan = getStorePlan(store.id);
  const industry = getIndustryFromStore(store);

  if (isTemplateAllowedForPlan(requestedTemplateId, plan, industry)) {
    return requestedTemplateId as PublicStoreTemplateId;
  }

  // Fallback seguro a la versión oficial FREE aprobada
  return OFFICIAL_FREE_TEMPLATE_ID;
}

/**
 * Obtiene la definición de un modelo dado (o undefined si es 'free' u desconocido)
 */
export function getTemplateDefinition(templateId?: string | null): SpecialTemplateDefinition | undefined {
  if (!templateId || templateId === 'free') return undefined;
  return SPECIAL_TEMPLATES[templateId as SpecialTemplateCode];
}

/**
 * Obtiene las clases CSS de layout y composición específicas para cada modelo
 */
export function getTemplateVisualClasses(templateId?: PublicStoreTemplateId | string | null): {
  headerWrapper: string;
  catalogGrid: string;
  cardWrapper: string;
  typographyHeading: string;
  typographyBody: string;
  badgeClass: string;
  densityClass: string;
} {
  if (!templateId || templateId === 'free') {
    return {
      headerWrapper: 'w-full',
      catalogGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
      cardWrapper: 'rounded-2xl border transition-all duration-200',
      typographyHeading: 'font-bold tracking-tight',
      typographyBody: 'text-sm text-stone-600 dark:text-stone-300',
      badgeClass: 'rounded-full px-2.5 py-0.5 text-xs font-semibold',
      densityClass: 'p-4 sm:p-5',
    };
  }

  switch (templateId) {
    // ----------------- Gastronomía -----------------
    case 'g1': // Pedido Express
      return {
        headerWrapper: 'w-full max-w-5xl mx-auto',
        catalogGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4',
        cardWrapper: 'rounded-xl border border-stone-200 dark:border-stone-800 hover:border-amber-500/50 shadow-2xs hover:shadow-sm transition-all',
        typographyHeading: 'font-extrabold tracking-tight text-base sm:text-lg',
        typographyBody: 'text-xs text-stone-600 dark:text-stone-400 line-clamp-2',
        badgeClass: 'rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40',
        densityClass: 'p-3 sm:p-3.5',
      };
    case 'g2': // Menú Visual
      return {
        headerWrapper: 'w-full max-w-6xl mx-auto',
        catalogGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6',
        cardWrapper: 'rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm hover:shadow-md transition-all overflow-hidden group',
        typographyHeading: 'font-bold tracking-tight text-lg sm:text-xl',
        typographyBody: 'text-xs sm:text-sm text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed',
        badgeClass: 'rounded-full px-3 py-1 text-xs font-bold tracking-wide shadow-2xs',
        densityClass: 'p-5 sm:p-6',
      };
    case 'g3': // Café & Boutique (Pro)
      return {
        headerWrapper: 'w-full max-w-5xl mx-auto bg-amber-50/40 dark:bg-stone-900/40 p-4 sm:p-6 rounded-3xl border border-amber-100 dark:border-stone-800',
        catalogGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7',
        cardWrapper: 'rounded-3xl border border-amber-200/60 dark:border-stone-800 shadow-xs hover:shadow-md transition-all duration-300 bg-white/95 dark:bg-stone-900/95',
        typographyHeading: 'font-serif font-bold text-lg sm:text-xl tracking-normal',
        typographyBody: 'text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-serif',
        badgeClass: 'rounded-full px-3 py-0.5 text-[11px] font-medium tracking-wide bg-amber-100/70 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200 border border-amber-200/80 dark:border-amber-700/40 font-serif',
        densityClass: 'p-5 sm:p-6',
      };
    case 'g4': // Especialidades (Pro)
      return {
        headerWrapper: 'w-full max-w-6xl mx-auto border-b border-amber-500/20 pb-6',
        catalogGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8',
        cardWrapper: 'rounded-2xl border-2 border-stone-200 dark:border-stone-800 hover:border-amber-500/60 shadow-sm hover:shadow-lg transition-all duration-300 relative',
        typographyHeading: 'font-serif font-extrabold text-lg sm:text-xl tracking-tight text-amber-950 dark:text-amber-100',
        typographyBody: 'text-xs text-stone-600 dark:text-stone-300 leading-relaxed',
        badgeClass: 'rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase bg-amber-500 text-white shadow-xs',
        densityClass: 'p-5 sm:p-6',
      };
    case 'g5': // Pedido Express Visual (Pro)
      return {
        headerWrapper: 'w-full max-w-6xl mx-auto',
        catalogGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4',
        cardWrapper: 'rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-orange-500/60 shadow-xs hover:shadow-md transition-all overflow-hidden',
        typographyHeading: 'font-black tracking-tight text-base sm:text-lg text-stone-900 dark:text-white',
        typographyBody: 'text-xs text-stone-600 dark:text-stone-400 line-clamp-2',
        badgeClass: 'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800/40',
        densityClass: 'p-3.5 sm:p-4',
      };
    case 'g6': // Menú Visual Fotográfico (Pro)
      return {
        headerWrapper: 'w-full max-w-6xl mx-auto',
        catalogGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6',
        cardWrapper: 'rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900/95 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden',
        typographyHeading: 'font-bold tracking-tight text-lg sm:text-xl text-stone-900 dark:text-white',
        typographyBody: 'text-xs sm:text-sm text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed',
        badgeClass: 'rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40',
        densityClass: 'p-4 sm:p-5',
      };
    case 'g7': // Café & Boutique Editorial (Pro)
      return {
        headerWrapper: 'w-full max-w-5xl mx-auto bg-[#FAF5EE] dark:bg-[#1A1614] p-5 sm:p-7 rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-xs',
        catalogGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7',
        cardWrapper: 'rounded-3xl border border-amber-200/70 dark:border-stone-800 bg-[#FFFDF9] dark:bg-stone-900 shadow-xs hover:shadow-md transition-all duration-300',
        typographyHeading: 'font-serif font-bold text-lg sm:text-xl tracking-normal text-amber-950 dark:text-amber-100',
        typographyBody: 'font-serif text-xs text-stone-600 dark:text-stone-300 leading-relaxed',
        badgeClass: 'rounded-full px-3 py-0.5 text-[11px] font-serif font-medium bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 border border-amber-200 dark:border-amber-700/50',
        densityClass: 'p-5 sm:p-6',
      };
    case 'g8': // Especialidades Premium (Pro)
      return {
        headerWrapper: 'w-full max-w-6xl mx-auto bg-[#0B0C0E] text-white p-6 sm:p-8 rounded-3xl border border-amber-500/40 shadow-2xl relative overflow-hidden',
        catalogGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8',
        cardWrapper: 'rounded-3xl border border-amber-500/30 bg-[#121418] text-white shadow-md hover:border-amber-400 hover:shadow-xl transition-all duration-300 relative overflow-hidden',
        typographyHeading: 'font-serif font-bold text-lg sm:text-xl tracking-wide text-amber-200',
        typographyBody: 'text-xs text-stone-300 leading-relaxed',
        badgeClass: 'rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-400/40',
        densityClass: 'p-5 sm:p-6',
      };

    // ----------------- Moda y Calzado -----------------
    case 'm2': // Lookbook & Colecciones
      return {
        headerWrapper: 'w-full max-w-6xl mx-auto',
        catalogGrid: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5',
        cardWrapper: 'rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs hover:shadow-md transition-all overflow-hidden',
        typographyHeading: 'font-medium tracking-tight text-sm sm:text-base',
        typographyBody: 'text-xs text-stone-500 dark:text-stone-400 line-clamp-1',
        badgeClass: 'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-stone-900 text-white dark:bg-white dark:text-stone-900',
        densityClass: 'p-3 sm:p-4',
      };
    case 'm4': // Catálogo de Calzado
      return {
        headerWrapper: 'w-full max-w-6xl mx-auto',
        catalogGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5',
        cardWrapper: 'rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-400 shadow-2xs hover:shadow-sm transition-all',
        typographyHeading: 'font-bold tracking-tight text-sm sm:text-base',
        typographyBody: 'text-xs text-stone-600 dark:text-stone-400',
        badgeClass: 'rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200',
        densityClass: 'p-4',
      };
    case 'm1': // Boutique Editorial (Pro)
      return {
        headerWrapper: 'w-full max-w-5xl mx-auto text-center py-4 border-b border-stone-200 dark:border-stone-800',
        catalogGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10',
        cardWrapper: 'rounded-none border-b border-stone-200 dark:border-stone-800 pb-5 hover:opacity-95 transition-all',
        typographyHeading: 'font-serif font-light text-xl sm:text-2xl tracking-wide',
        typographyBody: 'font-serif text-xs text-stone-500 dark:text-stone-400 leading-relaxed italic',
        badgeClass: 'rounded-none px-2 py-0.5 text-[10px] font-light uppercase tracking-widest border border-stone-300 dark:border-stone-700',
        densityClass: 'p-2 pt-4',
      };
    case 'm3': // Streetwear Urbano (Pro)
      return {
        headerWrapper: 'w-full max-w-6xl mx-auto border-l-4 border-stone-900 dark:border-white pl-4 py-2',
        catalogGrid: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4',
        cardWrapper: 'rounded-none border-2 border-stone-900 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-400 shadow-sm transition-all bg-white dark:bg-stone-950',
        typographyHeading: 'font-black tracking-tighter uppercase text-sm sm:text-base',
        typographyBody: 'text-[11px] font-mono text-stone-600 dark:text-stone-400 line-clamp-1',
        badgeClass: 'rounded-none px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter bg-amber-400 text-black',
        densityClass: 'p-3',
      };

    // ----------------- Servicios -----------------
    case 's1': // Profesional Minimalista
      return {
        headerWrapper: 'w-full max-w-4xl mx-auto',
        catalogGrid: 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5',
        cardWrapper: 'rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-emerald-500/50 shadow-2xs hover:shadow-sm transition-all',
        typographyHeading: 'font-bold tracking-tight text-base sm:text-lg',
        typographyBody: 'text-xs text-stone-600 dark:text-stone-400 leading-relaxed',
        badgeClass: 'rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40',
        densityClass: 'p-4 sm:p-5',
      };
    case 's4': // Servicios Técnicos
      return {
        headerWrapper: 'w-full max-w-5xl mx-auto',
        catalogGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5',
        cardWrapper: 'rounded-xl border border-stone-200 dark:border-stone-800 hover:border-blue-500 shadow-2xs hover:shadow-xs transition-all',
        typographyHeading: 'font-bold tracking-tight text-base',
        typographyBody: 'text-xs text-stone-600 dark:text-stone-400',
        badgeClass: 'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40',
        densityClass: 'p-4',
      };
    case 's2': // Belleza Visual (Pro)
      return {
        headerWrapper: 'w-full max-w-5xl mx-auto bg-rose-50/30 dark:bg-stone-900/30 p-4 sm:p-6 rounded-3xl border border-rose-100 dark:border-stone-800',
        catalogGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
        cardWrapper: 'rounded-3xl border border-rose-200/60 dark:border-stone-800 shadow-xs hover:shadow-md transition-all duration-300 bg-white dark:bg-stone-900',
        typographyHeading: 'font-semibold tracking-tight text-base sm:text-lg text-stone-900 dark:text-rose-100',
        typographyBody: 'text-xs text-stone-600 dark:text-stone-300 leading-relaxed',
        badgeClass: 'rounded-full px-3 py-0.5 text-[11px] font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200 border border-rose-200 dark:border-rose-800/40',
        densityClass: 'p-5 sm:p-6',
      };
    case 's3': // Barbería Premium (Pro)
      return {
        headerWrapper: 'w-full max-w-5xl mx-auto border-t-2 border-b-2 border-amber-600/40 py-4',
        catalogGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5',
        cardWrapper: 'rounded-xl border-2 border-stone-800 dark:border-stone-700 bg-stone-900 text-white shadow-md hover:border-amber-500 transition-all',
        typographyHeading: 'font-extrabold tracking-tight text-base sm:text-lg uppercase text-white',
        typographyBody: 'text-xs text-stone-300 leading-relaxed',
        badgeClass: 'rounded px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-amber-600 text-stone-950',
        densityClass: 'p-4 sm:p-5',
      };

    // ----------------- Billar -----------------
    case 'b2': // Snooker Deportivo
      return {
        headerWrapper: 'w-full max-w-5xl mx-auto',
        catalogGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5',
        cardWrapper: 'rounded-2xl border border-emerald-800/30 dark:border-emerald-500/20 hover:border-emerald-500 shadow-2xs hover:shadow-sm transition-all',
        typographyHeading: 'font-bold tracking-tight text-base sm:text-lg',
        typographyBody: 'text-xs text-stone-600 dark:text-stone-400',
        badgeClass: 'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700',
        densityClass: 'p-4 sm:p-5',
      };
    case 'b3': // Club Competitivo
      return {
        headerWrapper: 'w-full max-w-6xl mx-auto',
        catalogGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5',
        cardWrapper: 'rounded-xl border-2 border-stone-300 dark:border-stone-700 hover:border-indigo-500 shadow-xs hover:shadow-md transition-all',
        typographyHeading: 'font-extrabold tracking-tight text-base sm:text-lg uppercase',
        typographyBody: 'text-xs text-stone-600 dark:text-stone-400',
        badgeClass: 'rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white',
        densityClass: 'p-4',
      };
    case 'b1': // Club Premium (Pro)
      return {
        headerWrapper: 'w-full max-w-5xl mx-auto bg-stone-950 text-white p-5 rounded-3xl border border-amber-500/30 shadow-lg',
        catalogGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
        cardWrapper: 'rounded-2xl border border-amber-500/30 bg-stone-900/90 text-white shadow-md hover:border-amber-400 transition-all',
        typographyHeading: 'font-serif font-bold text-lg sm:text-xl text-amber-200 tracking-wide',
        typographyBody: 'text-xs text-stone-300 leading-relaxed',
        badgeClass: 'rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-400/40',
        densityClass: 'p-5 sm:p-6',
      };
    case 'b4': // Neon Gaming (Pro)
      return {
        headerWrapper: 'w-full max-w-6xl mx-auto rounded-3xl p-4 sm:p-5 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] bg-slate-950',
        catalogGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
        cardWrapper: 'rounded-2xl border border-cyan-500/30 hover:border-cyan-400 dark:bg-slate-900/80 shadow-[0_0_10px_rgba(6,182,212,0.08)] hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all',
        typographyHeading: 'font-bold tracking-tight text-sm sm:text-base text-cyan-400 dark:text-cyan-300',
        typographyBody: 'text-xs text-slate-400',
        badgeClass: 'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-400/40',
        densityClass: 'p-4',
      };

    // ----------------- Comercio General -----------------
    case 'c1': // Minimarket Visual
      return {
        headerWrapper: 'w-full max-w-5xl mx-auto',
        catalogGrid: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4',
        cardWrapper: 'rounded-xl border border-stone-200 dark:border-stone-800 hover:border-blue-500 shadow-2xs hover:shadow-xs transition-all',
        typographyHeading: 'font-bold tracking-tight text-xs sm:text-sm',
        typographyBody: 'text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1',
        badgeClass: 'rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
        densityClass: 'p-3',
      };
    case 'c3': // Catálogo Multicategoría
      return {
        headerWrapper: 'w-full max-w-6xl mx-auto',
        catalogGrid: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4',
        cardWrapper: 'rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs hover:shadow-xs transition-all',
        typographyHeading: 'font-semibold tracking-tight text-xs sm:text-sm',
        typographyBody: 'text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1',
        badgeClass: 'rounded px-1.5 py-0.5 text-[9px] font-semibold bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
        densityClass: 'p-2.5 sm:p-3',
      };
    case 'c2': // Electrónica Promocional (Pro)
      return {
        headerWrapper: 'w-full max-w-6xl mx-auto border-b border-indigo-500/20 pb-4',
        catalogGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5',
        cardWrapper: 'rounded-2xl border-2 border-stone-200 dark:border-slate-800 hover:border-indigo-500 shadow-xs hover:shadow-md transition-all',
        typographyHeading: 'font-bold tracking-tight text-sm sm:text-base text-slate-900 dark:text-white',
        typographyBody: 'text-xs text-stone-600 dark:text-slate-400 line-clamp-2',
        badgeClass: 'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white',
        densityClass: 'p-4 sm:p-4.5',
      };
    case 'c4': // Productos Boutique (Pro)
      return {
        headerWrapper: 'w-full max-w-5xl mx-auto text-center py-4',
        catalogGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8',
        cardWrapper: 'rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs hover:shadow-md transition-all duration-300',
        typographyHeading: 'font-serif font-semibold text-lg tracking-normal',
        typographyBody: 'font-serif text-xs text-stone-600 dark:text-stone-400 leading-relaxed',
        badgeClass: 'rounded-full px-3 py-0.5 text-[10px] font-medium uppercase tracking-widest bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200',
        densityClass: 'p-5 sm:p-6',
      };

    default:
      return {
        headerWrapper: 'w-full',
        catalogGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
        cardWrapper: 'rounded-2xl border transition-all duration-200',
        typographyHeading: 'font-bold tracking-tight',
        typographyBody: 'text-sm text-stone-600 dark:text-stone-300',
        badgeClass: 'rounded-full px-2.5 py-0.5 text-xs font-semibold',
        densityClass: 'p-4 sm:p-5',
      };
  }
}
