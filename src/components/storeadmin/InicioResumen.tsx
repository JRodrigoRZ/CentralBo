import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  TrendingUp,
  Calendar,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  Tag,
  BarChart3,
  Eye,
  Inbox,
  Zap,
  Clock,
  ChevronRight,
  AlertCircle,
  Star,
} from 'lucide-react';
import { Store, OrderStatus, Order } from '../../types';
import { fetchStoreOrders } from '../../lib/storeAdminService';
import { useRouter } from '../../context/RouterContext';

interface InicioResumenProps {
  store: Store;
  onNavigateTab: (tab: any) => void;
}

export const InicioResumen: React.FC<InicioResumenProps> = ({ store, onNavigateTab }) => {
  const { navigate } = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const storeOrders = await fetchStoreOrders(store.id);
      setOrders(storeOrders);
    } catch (err: any) {
      console.error('[InicioResumen] Error al cargar pedidos reales:', err);
      setLoadError(err?.message || 'No se pudieron sincronizar los pedidos del comercio.');
    } finally {
      setIsLoading(false);
    }
  }, [store.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Ventas totales en Bs (pedidos no cancelados)
  const totalSales = orders
    .filter((o) => o.status !== 'cancelado')
    .reduce((acc, curr) => acc + curr.total, 0);

  // Total de pedidos no cancelados
  const validOrdersCount = orders.filter((o) => o.status !== 'cancelado').length;

  // Ticket promedio en Bolivianos
  const avgTicket = validOrdersCount > 0 ? totalSales / validOrdersCount : 0;

  // Pedidos completados
  const completedOrdersCount = orders.filter((o) => o.status === 'completado').length;

  // Conteo por cada estado canónico de pedido
  const ordersByStatus: Record<OrderStatus, number> = {
    pendiente: 0,
    recibido: 0,
    pagado: 0,
    en_preparacion: 0,
    despachado: 0,
    completado: 0,
    cancelado: 0,
  };

  orders.forEach((o) => {
    if (ordersByStatus[o.status] !== undefined) {
      ordersByStatus[o.status] += 1;
    }
  });

  // Mapeo a las 5 cápsulas visuales canónicas
  const countPendientes = ordersByStatus.pendiente + ordersByStatus.recibido + ordersByStatus.pagado;
  const countEnPreparacion = ordersByStatus.en_preparacion;
  const countEnCamino = ordersByStatus.despachado;
  const countEntregados = ordersByStatus.completado;
  const countCancelados = ordersByStatus.cancelado;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Estados de Carga y Error */}
      {isLoading ? (
        <div className="p-10 text-center rounded-2xl bg-white dark:bg-[#101B32] border border-[#DEE7F2] dark:border-[#263653] space-y-3 shadow-2xs">
          <div className="w-7 h-7 border-3 border-[#1769FF] dark:border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#475569] dark:text-[#B8C6DA] font-medium">
            Sincronizando métricas operativas de la tienda...
          </p>
        </div>
      ) : loadError ? (
        <div className="p-6 text-center rounded-2xl bg-rose-50/80 dark:bg-[#2E141E]/40 border border-rose-200 dark:border-[#F87171]/40 space-y-3 text-rose-800 dark:text-[#F87171]">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-sm font-semibold">Error al cargar las métricas del comercio</p>
          <p className="text-xs text-rose-700/80 dark:text-[#F87171]/80 max-w-md mx-auto">{loadError}</p>
          <button
            type="button"
            onClick={loadData}
            className="px-4 py-1.5 rounded-xl bg-white dark:bg-[#101B32] border border-[#DEE7F2] dark:border-[#263653] text-[#14213D] dark:text-[#F8FAFC] text-xs hover:bg-[#EEF4FF] dark:hover:bg-[#17243D] cursor-pointer font-semibold shadow-2xs transition"
          >
            Reintentar sincronización
          </button>
        </div>
      ) : (
        <>
          {/* 1. TRES TARJETAS KPI PRINCIPALES (PEDIDOS, VENTAS TOTALES, TICKET PROMEDIO) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            {/* Tarjeta 1: PEDIDOS */}
            <div
              onClick={() => onNavigateTab('pedidos')}
              className="p-5 rounded-2xl bg-white hover:bg-[#EEF4FF]/60 dark:bg-[#101B32] dark:hover:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
              role="button"
              tabIndex={0}
              title="Ir a gestión de pedidos"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-[#EEF4FF] dark:bg-[#17243D] text-[#1769FF] dark:text-[#3B82F6] border border-[#DEE7F2] dark:border-[#263653] flex items-center justify-center flex-shrink-0 shadow-2xs transition-transform group-hover:scale-105">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-[#475569] dark:text-[#B8C6DA] uppercase tracking-wider block">
                    Pedidos
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#14213D] dark:text-[#F8FAFC] tracking-tight mt-0.5">
                    {orders.length}
                  </div>
                  <p className="text-[11px] text-[#475569] dark:text-[#B8C6DA] mt-0.5 truncate">
                    {completedOrdersCount} completados
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-[#EEF4FF] dark:bg-[#17243D] text-[#1769FF] dark:text-[#3B82F6] flex items-center justify-center flex-shrink-0 transition-transform group-hover:translate-x-1">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Tarjeta 2: VENTAS TOTALES */}
            <div
              onClick={() => onNavigateTab('estadisticas')}
              className="p-5 rounded-2xl bg-white hover:bg-emerald-50/40 dark:bg-[#101B32] dark:hover:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
              role="button"
              tabIndex={0}
              title="Ver análisis de ventas"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-[#102A24] text-emerald-600 dark:text-[#34D399] border border-emerald-100 dark:border-[#34D399]/30 flex items-center justify-center flex-shrink-0 shadow-2xs transition-transform group-hover:scale-105">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-[#475569] dark:text-[#B8C6DA] uppercase tracking-wider block">
                    Ventas Totales
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-[#34D399] tracking-tight mt-0.5">
                    Bs {totalSales.toLocaleString('es-BO')}
                  </div>
                  <p className="text-[11px] text-[#475569] dark:text-[#B8C6DA] mt-0.5 truncate">
                    Pedidos no cancelados
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-[#102A24] text-emerald-600 dark:text-[#34D399] flex items-center justify-center flex-shrink-0 transition-transform group-hover:translate-x-1">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Tarjeta 3: TICKET PROMEDIO */}
            <div
              onClick={() => onNavigateTab('estadisticas')}
              className="p-5 rounded-2xl bg-white hover:bg-amber-50/40 dark:bg-[#101B32] dark:hover:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
              role="button"
              tabIndex={0}
              title="Ver ticket promedio en estadísticas"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-[#241C12] text-amber-600 dark:text-[#FBBF24] border border-amber-100 dark:border-[#FBBF24]/30 flex items-center justify-center flex-shrink-0 shadow-2xs transition-transform group-hover:scale-105">
                  <Star className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-[#475569] dark:text-[#B8C6DA] uppercase tracking-wider block">
                    Ticket Promedio
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#14213D] dark:text-[#F8FAFC] tracking-tight mt-0.5">
                    Bs {avgTicket.toFixed(1)}
                  </div>
                  <p className="text-[11px] text-[#475569] dark:text-[#B8C6DA] mt-0.5 truncate">
                    Promedio por orden válida
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-[#241C12] text-amber-600 dark:text-[#FBBF24] flex items-center justify-center flex-shrink-0 transition-transform group-hover:translate-x-1">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 2. SECCIÓN: ESTADOS DE PEDIDOS (5 CÁPSULAS CANÓNICAS CON CONTADORES Y COLOR RESUELTO) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#101B32] border border-[#DEE7F2] dark:border-[#263653] space-y-4 shadow-2xs">
            {/* Cabecera del bloque */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#EEF4FF] dark:bg-[#17243D] text-[#1769FF] dark:text-[#3B82F6] flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#14213D] dark:text-[#F8FAFC] flex items-center gap-1.5 flex-wrap">
                    <span>Estados de Pedidos</span>
                    <span className="text-xs font-normal text-[#475569] dark:text-[#B8C6DA]">
                      ({orders.length} {orders.length === 1 ? 'total registrado' : 'totales registrados'})
                    </span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#475569] dark:text-[#B8C6DA] mt-0.5">
                    Control de flujo de atención y despacho de compras
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={loadData}
                  disabled={isLoading}
                  className="p-1.5 rounded-xl text-[#475569] dark:text-[#B8C6DA] hover:text-[#14213D] dark:hover:text-[#F8FAFC] hover:bg-[#EEF4FF] dark:hover:bg-[#17243D] transition cursor-pointer"
                  title="Actualizar datos"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#1769FF] dark:text-[#3B82F6]' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('pedidos')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#1769FF] hover:text-blue-700 dark:text-[#3B82F6] dark:hover:text-blue-300 transition cursor-pointer"
                >
                  <span>Gestionar Pedidos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Fila de las 5 Cápsulas de Estado con alta legibilidad y contraste */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
              {/* 1. Pendientes (Ámbar / Naranja) */}
              <div className="p-3.5 rounded-2xl border border-[#DEE7F2] dark:border-[#263653] bg-[#F8FAFC] dark:bg-[#17243D] flex items-center gap-3 transition hover:border-amber-300 dark:hover:border-amber-500/40">
                <div className="w-8 h-8 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] dark:bg-[#241C12] dark:text-[#FBBF24] dark:border-[#FBBF24]/30 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {countPendientes}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-[#475569] dark:text-[#B8C6DA] block truncate">
                    Pendientes
                  </span>
                  <span className="text-base sm:text-lg font-bold text-[#14213D] dark:text-[#F8FAFC] block mt-0.5 leading-none">
                    {countPendientes}
                  </span>
                </div>
              </div>

              {/* 2. En preparación (Azul) */}
              <div className="p-3.5 rounded-2xl border border-[#DEE7F2] dark:border-[#263653] bg-[#F8FAFC] dark:bg-[#17243D] flex items-center gap-3 transition hover:border-blue-300 dark:hover:border-blue-500/40">
                <div className="w-8 h-8 rounded-full bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] dark:bg-[#112347] dark:text-[#60A5FA] dark:border-[#60A5FA]/30 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {countEnPreparacion}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-[#475569] dark:text-[#B8C6DA] block truncate">
                    En preparación
                  </span>
                  <span className="text-base sm:text-lg font-bold text-[#14213D] dark:text-[#F8FAFC] block mt-0.5 leading-none">
                    {countEnPreparacion}
                  </span>
                </div>
              </div>

              {/* 3. En camino (Violeta) */}
              <div className="p-3.5 rounded-2xl border border-[#DEE7F2] dark:border-[#263653] bg-[#F8FAFC] dark:bg-[#17243D] flex items-center gap-3 transition hover:border-purple-300 dark:hover:border-purple-500/40">
                <div className="w-8 h-8 rounded-full bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE] dark:bg-[#221C3D] dark:text-[#A78BFA] dark:border-[#A78BFA]/30 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {countEnCamino}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-[#475569] dark:text-[#B8C6DA] block truncate">
                    En camino
                  </span>
                  <span className="text-base sm:text-lg font-bold text-[#14213D] dark:text-[#F8FAFC] block mt-0.5 leading-none">
                    {countEnCamino}
                  </span>
                </div>
              </div>

              {/* 4. Entregados (Verde) */}
              <div className="p-3.5 rounded-2xl border border-[#DEE7F2] dark:border-[#263653] bg-[#F8FAFC] dark:bg-[#17243D] flex items-center gap-3 transition hover:border-emerald-300 dark:hover:border-emerald-500/40">
                <div className="w-8 h-8 rounded-full bg-[#D1FAE5] text-[#047857] border border-[#A7F3D0] dark:bg-[#102A24] dark:text-[#34D399] dark:border-[#34D399]/30 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {countEntregados}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-[#475569] dark:text-[#B8C6DA] block truncate">
                    Entregados
                  </span>
                  <span className="text-base sm:text-lg font-bold text-[#14213D] dark:text-[#F8FAFC] block mt-0.5 leading-none">
                    {countEntregados}
                  </span>
                </div>
              </div>

              {/* 5. Cancelados (Rojo / Rosa) */}
              <div className="p-3.5 rounded-2xl border border-[#DEE7F2] dark:border-[#263653] bg-[#F8FAFC] dark:bg-[#17243D] flex items-center gap-3 transition hover:border-rose-300 dark:hover:border-rose-500/40">
                <div className="w-8 h-8 rounded-full bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3] dark:bg-[#2E141E] dark:text-[#F87171] dark:border-[#F87171]/30 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {countCancelados}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-[#475569] dark:text-[#B8C6DA] block truncate">
                    Cancelados
                  </span>
                  <span className="text-base sm:text-lg font-bold text-[#14213D] dark:text-[#F8FAFC] block mt-0.5 leading-none">
                    {countCancelados}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. FILA INFERIOR: ACCIONES RÁPIDAS + ACTIVIDAD RECIENTE (DOS COLUMNAS) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {/* Columna Izquierda: ACCIONES RÁPIDAS */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#101B32] border border-[#DEE7F2] dark:border-[#263653] flex flex-col justify-between space-y-4 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EEF4FF] dark:bg-[#17243D] text-[#1769FF] dark:text-[#3B82F6] flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#14213D] dark:text-[#F8FAFC]">
                  Acciones rápidas
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {/* 1. Agregar producto */}
                <button
                  type="button"
                  onClick={() => onNavigateTab('catalogo_productos')}
                  className="p-4 rounded-2xl bg-[#F8FAFC] hover:bg-[#EEF4FF] dark:bg-[#17243D] dark:hover:bg-[#1E2D4A] border border-[#DEE7F2] dark:border-[#263653] text-center transition cursor-pointer group flex flex-col items-center justify-center min-h-[110px] shadow-2xs"
                >
                  <PlusCircle className="w-6 h-6 text-emerald-600 dark:text-[#34D399] mb-2 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-semibold text-[#14213D] dark:text-[#F8FAFC] leading-tight">
                    Agregar producto
                  </span>
                </button>

                {/* 2. Crear promoción */}
                <button
                  type="button"
                  onClick={() => onNavigateTab('promociones')}
                  className="p-4 rounded-2xl bg-[#F8FAFC] hover:bg-[#EEF4FF] dark:bg-[#17243D] dark:hover:bg-[#1E2D4A] border border-[#DEE7F2] dark:border-[#263653] text-center transition cursor-pointer group flex flex-col items-center justify-center min-h-[110px] shadow-2xs"
                >
                  <Tag className="w-6 h-6 text-[#1769FF] dark:text-[#3B82F6] mb-2 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-semibold text-[#14213D] dark:text-[#F8FAFC] leading-tight">
                    Crear promoción
                  </span>
                </button>

                {/* 3. Ver estadísticas */}
                <button
                  type="button"
                  onClick={() => onNavigateTab('estadisticas')}
                  className="p-4 rounded-2xl bg-[#F8FAFC] hover:bg-[#EEF4FF] dark:bg-[#17243D] dark:hover:bg-[#1E2D4A] border border-[#DEE7F2] dark:border-[#263653] text-center transition cursor-pointer group flex flex-col items-center justify-center min-h-[110px] shadow-2xs"
                >
                  <BarChart3 className="w-6 h-6 text-[#8B5CF6] dark:text-[#A78BFA] mb-2 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-semibold text-[#14213D] dark:text-[#F8FAFC] leading-tight">
                    Ver estadísticas
                  </span>
                </button>

                {/* 4. Ver mi tienda */}
                <button
                  type="button"
                  onClick={() => {
                    if (store.slug) {
                      navigate(`/tienda/${store.slug}`);
                    }
                  }}
                  className="p-4 rounded-2xl bg-[#F8FAFC] hover:bg-[#EEF4FF] dark:bg-[#17243D] dark:hover:bg-[#1E2D4A] border border-[#DEE7F2] dark:border-[#263653] text-center transition cursor-pointer group flex flex-col items-center justify-center min-h-[110px] shadow-2xs"
                >
                  <Eye className="w-6 h-6 text-amber-600 dark:text-[#FBBF24] mb-2 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-semibold text-[#14213D] dark:text-[#F8FAFC] leading-tight">
                    Ver mi tienda
                  </span>
                </button>
              </div>
            </div>

            {/* Columna Derecha: ACTIVIDAD RECIENTE */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#101B32] border border-[#DEE7F2] dark:border-[#263653] flex flex-col justify-between space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#EEF4FF] dark:bg-[#17243D] text-[#1769FF] dark:text-[#3B82F6] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[#14213D] dark:text-[#F8FAFC]">
                    Actividad reciente
                  </h3>
                </div>

                {orders.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('pedidos')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#1769FF] hover:text-blue-700 dark:text-[#3B82F6] dark:hover:text-blue-300 transition cursor-pointer"
                  >
                    <span>Ver todas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Estado vacío o lista limpia */}
              {orders.length === 0 ? (
                <div className="py-7 px-4 text-center rounded-2xl bg-[#F8FAFC] dark:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] my-auto">
                  <Inbox className="w-9 h-9 text-[#94A3B8] dark:text-[#7E90B0] mx-auto mb-2 stroke-[1.5]" />
                  <p className="text-xs font-semibold text-[#14213D] dark:text-[#F8FAFC]">
                    No hay actividad reciente
                  </p>
                  <p className="text-[11px] text-[#475569] dark:text-[#B8C6DA] max-w-xs mx-auto mt-1 leading-relaxed">
                    Cuando recibas pedidos o realices cambios, aparecerán aquí.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  {orders.slice(0, 3).map((ord) => {
                    const dateFormatted = ord.created_at
                      ? new Date(ord.created_at).toLocaleTimeString('es-BO', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '--:--';

                    return (
                      <div
                        key={ord.id}
                        onClick={() => onNavigateTab('pedidos')}
                        className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#17243D] border border-[#DEE7F2] dark:border-[#263653] flex items-center justify-between gap-3 hover:bg-[#EEF4FF] dark:hover:bg-[#1E2D4A] transition cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-[#1769FF] dark:text-[#3B82F6] font-bold">
                              #{ord.id.slice(-4).toUpperCase()}
                            </span>
                            <span className="text-xs font-semibold text-[#14213D] dark:text-[#F8FAFC] truncate">
                              {ord.customer_name || 'Cliente'}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#475569] dark:text-[#B8C6DA] mt-0.5">
                            Hora: {dateFormatted}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-bold text-[#14213D] dark:text-[#F8FAFC]">
                            Bs {ord.total}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF4FF] text-[#1769FF] dark:bg-[#101B32] dark:text-[#3B82F6] border border-[#DEE7F2] dark:border-[#263653] uppercase">
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
