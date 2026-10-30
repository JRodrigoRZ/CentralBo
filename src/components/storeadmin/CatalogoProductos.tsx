import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Share2,
  Check,
  Star,
  DollarSign,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Tag,
  ChefHat,
  Shirt,
  Sparkles,
  Copy,
  ExternalLink,
  Loader2,
  Scissors,
  Utensils,
  X,
  UploadCloud,
  Link as LinkIcon,
} from 'lucide-react';
import { Store, Product, Category, ProductStatus, ProfessionalItem } from '../../types';
import {
  getCachedStoreProducts,
  fetchStoreProducts,
  createStoreProduct,
  updateStoreProduct,
  deleteStoreProduct,
  toggleStoreProductAvailability,
  getCachedStoreCategories,
  fetchStoreCategories,
  getStoreProfessionals,
  fetchStoreProfessionals,
  isValidUUID,
  uploadProductImage,
  deleteProductImage,
  isStorePaidPlan,
  ALLOWED_PRODUCT_IMAGE_MIME_TYPES,
  MAX_PRODUCT_IMAGE_SIZE_BYTES,
} from '../../lib/storeAdminService';

interface CatalogoProductosProps {
  store: Store;
}

export const CatalogoProductos: React.FC<CatalogoProductosProps> = ({ store }) => {
  const [products, setProducts] = useState<Product[]>(() =>
    getCachedStoreProducts(store.id)
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    getCachedStoreCategories(store.id)
  );
  const [professionals, setProfessionals] = useState<ProfessionalItem[]>(() =>
    getStoreProfessionals(store.id)
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Sincronizar catálogo, categorías y profesionales oficiales desde Supabase (Fuente Canónica)
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    Promise.all([
      fetchStoreProducts(store.id),
      fetchStoreCategories(store.id),
      fetchStoreProfessionals(store.id),
    ])
      .then(([remoteProds, remoteCats, remoteProfs]) => {
        if (!mounted) return;
        if (Array.isArray(remoteProds)) {
          setProducts(remoteProds);
        }
        if (Array.isArray(remoteCats)) {
          setCategories(remoteCats);
        }
        if (Array.isArray(remoteProfs)) {
          setProfessionals(remoteProfs);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn('[CatalogoProductos] Error al consultar catálogo en Supabase:', err);
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [store.id]);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Regla Comercial Módulo 3: Galería de hasta 3 fotos para BASIC y PRO, 1 foto para FREE
  const isPaidPlan = isStorePaidPlan(store);
  const maxPhotosAllowed = isPaidPlan ? 3 : 1;

  interface ImageSlotItem {
    url: string;
    file: File | null;
    previewUrl: string | null;
    error: string | null;
  }

  const fileInputRef0 = useRef<HTMLInputElement | null>(null);
  const fileInputRef1 = useRef<HTMLInputElement | null>(null);
  const fileInputRef2 = useRef<HTMLInputElement | null>(null);

  const getFileInputRef = (index: number) => {
    if (index === 0) return fileInputRef0;
    if (index === 1) return fileInputRef1;
    return fileInputRef2;
  };

  const [imageSlots, setImageSlots] = useState<ImageSlotItem[]>([
    { url: '', file: null, previewUrl: null, error: null },
    { url: '', file: null, previewUrl: null, error: null },
    { url: '', file: null, previewUrl: null, error: null },
  ]);
  const [isUploadingImages, setIsUploadingImages] = useState<boolean>(false);

  // Limpieza segura de URLs blob temporales
  const resetImageState = () => {
    imageSlots.forEach((slot) => {
      if (slot.previewUrl && slot.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(slot.previewUrl);
      }
    });
    setImageSlots([
      { url: '', file: null, previewUrl: null, error: null },
      { url: '', file: null, previewUrl: null, error: null },
      { url: '', file: null, previewUrl: null, error: null },
    ]);
    setIsUploadingImages(false);
    if (fileInputRef0.current) fileInputRef0.current.value = '';
    if (fileInputRef1.current) fileInputRef1.current.value = '';
    if (fileInputRef2.current) fileInputRef2.current.value = '';
  };

  const handleCloseModal = () => {
    resetImageState();
    setIsEditing(false);
    setCurrentProduct(null);
  };

  // Limpieza automática al desmontar o cambiar preview blob
  useEffect(() => {
    return () => {
      imageSlots.forEach((slot) => {
        if (slot.previewUrl && slot.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(slot.previewUrl);
        }
      });
    };
  }, [imageSlots]);

  // Selección de archivo nativa para un slot específico (0, 1 o 2)
  const handleSlotFileChange = (slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_PRODUCT_IMAGE_SIZE_BYTES) {
      setImageSlots((prev) => {
        const next = [...prev];
        next[slotIndex] = { ...next[slotIndex], error: 'La imagen supera el tamaño máximo permitido de 5 MB.' };
        return next;
      });
      const ref = getFileInputRef(slotIndex);
      if (ref.current) ref.current.value = '';
      return;
    }

    const normalizedType = file.type?.toLowerCase() || '';
    if (!ALLOWED_PRODUCT_IMAGE_MIME_TYPES.includes(normalizedType)) {
      setImageSlots((prev) => {
        const next = [...prev];
        next[slotIndex] = { ...next[slotIndex], error: 'Formato no permitido. Solo se aceptan imágenes en formato PNG, JPEG o WEBP.' };
        return next;
      });
      const ref = getFileInputRef(slotIndex);
      if (ref.current) ref.current.value = '';
      return;
    }

    const prevBlob = imageSlots[slotIndex]?.previewUrl;
    if (prevBlob && prevBlob.startsWith('blob:')) {
      URL.revokeObjectURL(prevBlob);
    }

    const objectUrl = URL.createObjectURL(file);
    setImageSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = {
        url: next[slotIndex]?.url || '',
        file,
        previewUrl: objectUrl,
        error: null,
      };
      return next;
    });
  };

  // Descartar archivo o limpiar imagen en un slot
  const handleRemoveSlotImage = (slotIndex: number) => {
    const prevBlob = imageSlots[slotIndex]?.previewUrl;
    if (prevBlob && prevBlob.startsWith('blob:')) {
      URL.revokeObjectURL(prevBlob);
    }
    const ref = getFileInputRef(slotIndex);
    if (ref.current) ref.current.value = '';

    setImageSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = {
        url: '',
        file: null,
        previewUrl: null,
        error: null,
      };
      return next;
    });

    if (slotIndex === 0 && currentProduct) {
      setCurrentProduct({ ...currentProduct, image_url: '' });
    }
  };

  const handleSlotUrlChange = (slotIndex: number, newUrl: string) => {
    setImageSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = {
        ...next[slotIndex],
        url: newUrl,
        previewUrl: newUrl.trim() ? newUrl.trim() : null,
        file: null,
        error: null,
      };
      return next;
    });
    if (slotIndex === 0 && currentProduct) {
      setCurrentProduct({ ...currentProduct, image_url: newUrl });
    }
  };

  // Inputs temporales para adición de atributos verticales
  const [newSizeInput, setNewSizeInput] = useState<string>('');
  const [newColorName, setNewColorName] = useState<string>('');
  const [newColorHex, setNewColorHex] = useState<string>('#000000');
  const [newModifierName, setNewModifierName] = useState<string>('');
  const [newModifierPrice, setNewModifierPrice] = useState<string>('');
  const [newComboItemInput, setNewComboItemInput] = useState<string>('');

  // Filtrado de productos
  const filteredProducts = products.filter((p) => {
    if (filterCategory !== 'all' && p.category_id !== filterCategory) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenCreate = () => {
    resetImageState();
    setNewSizeInput('');
    setNewColorName('');
    setNewColorHex('#000000');
    setNewModifierName('');
    setNewModifierPrice('');
    setNewComboItemInput('');
    const defaultCat = categories[0]?.id && isValidUUID(categories[0]?.id) ? categories[0].id : '';
    const newProd: Partial<Product> = {
      tenant_id: store.id,
      category_id: defaultCat || null,
      name: '',
      description: '',
      price: 0,
      is_available: true,
      image_url: '',
      status: 'activo',
      attributes: {
        is_featured: false,
        previous_price: null,
        offer_price: null,
        // Vertical defaults
        modifiers: store.store_type === 'restaurante' ? [] : undefined,
        kitchen_notes_allowed: store.store_type === 'restaurante',
        is_combo: false,
        combo_items: store.store_type === 'restaurante' ? [] : undefined,
        sizes: store.store_type === 'moda' ? ['S', 'M', 'L'] : undefined,
        colors: store.store_type === 'moda' ? [{ name: 'Negro', hex: '#000000' }] : undefined,
        is_service: store.store_type === 'servicios' ? true : undefined,
        duration_minutes: store.store_type === 'servicios' ? 45 : undefined,
        specialty: store.store_type === 'servicios' ? '' : undefined,
        professional_name: store.store_type === 'servicios' ? '' : undefined,
        professional_id: store.store_type === 'servicios' ? professionals[0]?.id || '' : undefined,
      },
    };
    setCurrentProduct(newProd);
    setIsEditing(true);
  };

  const handleOpenEdit = (p: Product) => {
    resetImageState();
    const existingImages: string[] = [];
    if (Array.isArray(p.images) && p.images.length > 0) {
      existingImages.push(...p.images.filter((img) => typeof img === 'string' && img.trim()));
    } else if (Array.isArray(p.attributes?.images)) {
      existingImages.push(...(p.attributes.images as string[]).filter((img) => typeof img === 'string' && img.trim()));
    } else if (Array.isArray(p.attributes?.gallery_images)) {
      existingImages.push(...(p.attributes.gallery_images as string[]).filter((img) => typeof img === 'string' && img.trim()));
    }
    if (p.image_url && !existingImages.includes(p.image_url)) {
      existingImages.unshift(p.image_url);
    }
    const cleanList = existingImages.slice(0, 3);
    setImageSlots([
      { url: cleanList[0] || p.image_url || '', file: null, previewUrl: cleanList[0] || p.image_url || null, error: null },
      { url: cleanList[1] || '', file: null, previewUrl: cleanList[1] || null, error: null },
      { url: cleanList[2] || '', file: null, previewUrl: cleanList[2] || null, error: null },
    ]);
    setNewSizeInput('');
    setNewColorName('');
    setNewColorHex('#000000');
    setNewModifierName('');
    setNewModifierPrice('');
    setNewComboItemInput('');
    setCurrentProduct({ ...p, attributes: { ...p.attributes } });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este producto del catálogo?')) {
      const res = await deleteStoreProduct(store.id, id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showNotification('Producto eliminado correctamente.');
      } else {
        showNotification(res.error || 'Error al eliminar el producto.');
      }
    }
  };

  const handleToggleAvailability = async (p: Product) => {
    const res = await toggleStoreProductAvailability(store.id, p.id, p.is_available);
    if (res.success && res.product) {
      setProducts((prev) => prev.map((item) => (item.id === p.id ? res.product! : item)));
      showNotification(
        `Disponibilidad de "${p.name}" cambiada a ${res.product.is_available ? 'Disponible' : 'Agotado'}.`
      );
    } else {
      showNotification(res.error || 'Error al cambiar la disponibilidad.');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || isSaving) return;

    // 1. Validación runtime estricta de Nombre
    if (
      typeof currentProduct.name !== 'string' ||
      !currentProduct.name.trim()
    ) {
      showNotification('El nombre del producto es obligatorio y no puede estar vacío ni contener solo espacios.');
      return;
    }

    // 2. Validación runtime estricta de Precio
    const rawPrice = currentProduct.price;
    const numPrice = Number(rawPrice);
    if (
      (typeof rawPrice !== 'number' && typeof rawPrice !== 'string') ||
      isNaN(numPrice) ||
      !Number.isFinite(numPrice) ||
      numPrice < 0
    ) {
      showNotification('El precio debe ser un número válido, finito y mayor o igual a 0.');
      return;
    }

    // 3. Validación runtime de Precio Anterior (opcional)
    let cleanPrevPrice: number | null = null;
    const rawPrevPrice = currentProduct.attributes?.previous_price;
    if (rawPrevPrice !== undefined && rawPrevPrice !== null && rawPrevPrice !== '') {
      const numPrev = Number(rawPrevPrice);
      if (isNaN(numPrev) || !Number.isFinite(numPrev) || numPrev < 0) {
        showNotification('El precio anterior debe ser un número válido, finito y no negativo.');
        return;
      }
      cleanPrevPrice = numPrev;
    }

    // 4. Validación runtime de Precio de Oferta (opcional)
    let cleanOfferPrice: number | null = null;
    const rawOfferPrice = currentProduct.attributes?.offer_price;
    if (rawOfferPrice !== undefined && rawOfferPrice !== null && rawOfferPrice !== '') {
      const numOffer = Number(rawOfferPrice);
      if (isNaN(numOffer) || !Number.isFinite(numOffer) || numOffer < 0) {
        showNotification('El precio de oferta debe ser un número válido, finito y no negativo.');
        return;
      }
      cleanOfferPrice = numOffer;
    }

    // 5. Límite estricto de descripción (máx 1000 caracteres)
    const cleanDescription =
      typeof currentProduct.description === 'string' && currentProduct.description.trim()
        ? currentProduct.description.trim().slice(0, 1000)
        : null;

    const cleanName = currentProduct.name.trim().slice(0, 150);

    const baseAttributes = (currentProduct.attributes && typeof currentProduct.attributes === 'object')
      ? currentProduct.attributes
      : {};

    const cleanAttributes: Record<string, unknown> = {
      ...baseAttributes,
      previous_price: cleanPrevPrice,
      offer_price: cleanOfferPrice,
    };

    // Procesar atributos según el vertical manteniendo los existentes
    if (store.store_type === 'moda') {
      if (Array.isArray(baseAttributes.sizes)) {
        cleanAttributes.sizes = baseAttributes.sizes
          .filter((s: unknown) => typeof s === 'string' && s.trim())
          .map((s: string) => s.trim())
          .slice(0, 20);
      }
      if (Array.isArray(baseAttributes.colors)) {
        cleanAttributes.colors = baseAttributes.colors
          .filter((c: any) => c && typeof c === 'object' && typeof c.name === 'string' && c.name.trim())
          .map((c: any) => ({
            name: String(c.name).trim().slice(0, 50),
            hex: typeof c.hex === 'string' && c.hex.trim() ? c.hex.trim() : '#000000',
          }))
          .slice(0, 20);
      }
    } else if (store.store_type === 'restaurante') {
      if (Array.isArray(baseAttributes.modifiers)) {
        cleanAttributes.modifiers = baseAttributes.modifiers
          .filter((m: any) => m && typeof m === 'object' && typeof m.name === 'string' && m.name.trim())
          .map((m: any) => ({
            name: String(m.name).trim().slice(0, 100),
            price: typeof m.price === 'number' && Number.isFinite(m.price) ? Math.max(0, m.price) : 0,
          }))
          .slice(0, 30);
      }
      cleanAttributes.is_combo = Boolean(baseAttributes.is_combo);
      if (Array.isArray(baseAttributes.combo_items)) {
        cleanAttributes.combo_items = baseAttributes.combo_items
          .filter((ci: unknown) => typeof ci === 'string' && ci.trim())
          .map((ci: string) => ci.trim().slice(0, 150))
          .slice(0, 30);
      }
    } else if (store.store_type === 'servicios') {
      cleanAttributes.is_service = baseAttributes.is_service !== false;
      const rawDur = Number(baseAttributes.duration_minutes);
      cleanAttributes.duration_minutes = Number.isFinite(rawDur) && rawDur > 0 ? rawDur : 45;
      cleanAttributes.specialty = typeof baseAttributes.specialty === 'string' ? baseAttributes.specialty.trim().slice(0, 100) : '';
      cleanAttributes.professional_name = typeof baseAttributes.professional_name === 'string' ? baseAttributes.professional_name.trim().slice(0, 100) : '';
      if (typeof baseAttributes.professional_id === 'string' && baseAttributes.professional_id.trim()) {
        cleanAttributes.professional_id = baseAttributes.professional_id.trim();
      }
    }

    const validCategoryId =
      typeof currentProduct.category_id === 'string' && isValidUUID(currentProduct.category_id)
        ? currentProduct.category_id.trim()
        : null;

    const isEditMode = Boolean(currentProduct.id && isValidUUID(currentProduct.id));
    const targetProductId =
      isEditMode && currentProduct.id && isValidUUID(currentProduct.id)
        ? currentProduct.id
        : crypto.randomUUID();

    setIsSaving(true);
    setIsUploadingImages(true);

    const maxSlotsToProcess = isPaidPlan ? 3 : 1;
    const finalImageUrls: string[] = [];

    for (let slotIdx = 0; slotIdx < maxSlotsToProcess; slotIdx++) {
      const slot = imageSlots[slotIdx];
      if (!slot) continue;

      if (slot.file) {
        const uploadRes = await uploadProductImage(store.id, targetProductId, slot.file, slotIdx);
        if (!uploadRes.success || !uploadRes.publicUrl) {
          setIsUploadingImages(false);
          setIsSaving(false);
          const errorMsg = uploadRes.error || `Error al subir la fotografía ${slotIdx + 1}.`;
          setImageSlots((prev) => {
            const next = [...prev];
            next[slotIdx] = { ...next[slotIdx], error: errorMsg };
            return next;
          });
          showNotification(errorMsg);
          return;
        }
        finalImageUrls.push(uploadRes.publicUrl);
      } else if (slot.url && slot.url.trim()) {
        finalImageUrls.push(slot.url.trim());
      }
    }

    setIsUploadingImages(false);

    const trimmedImages = finalImageUrls.slice(0, maxSlotsToProcess);
    const finalImageUrl = trimmedImages[0] || null;

    cleanAttributes.images = trimmedImages;

    if (isEditMode && currentProduct.id) {
      const res = await updateStoreProduct(store.id, currentProduct.id, {
        name: cleanName,
        price: numPrice,
        description: cleanDescription,
        category_id: validCategoryId,
        is_available: currentProduct.is_available ?? true,
        image_url: finalImageUrl,
        images: trimmedImages,
        status:
          currentProduct.status === 'inactivo' || currentProduct.status === 'borrador'
            ? currentProduct.status
            : 'activo',
        attributes: cleanAttributes,
      });

      setIsSaving(false);

      if (res.success && res.product) {
        setProducts((prev) => prev.map((p) => (p.id === res.product!.id ? res.product! : p)));
        showNotification('Producto actualizado exitosamente en Supabase.');
        resetImageState();
        setIsEditing(false);
        setCurrentProduct(null);
      } else {
        showNotification(res.error || 'Error al actualizar el producto en el servidor.');
      }
    } else {
      const newProdPayload: Partial<Product> = {
        id: targetProductId,
        name: cleanName,
        price: numPrice,
        description: cleanDescription,
        category_id: validCategoryId,
        is_available: currentProduct.is_available ?? true,
        image_url: finalImageUrl,
        images: trimmedImages,
        status:
          currentProduct.status === 'inactivo' || currentProduct.status === 'borrador'
            ? currentProduct.status
            : 'activo',
        attributes: cleanAttributes,
      };

      const res = await createStoreProduct(store.id, newProdPayload);

      setIsSaving(false);

      if (res.success && res.product) {
        setProducts((prev) => [res.product!, ...prev.filter((p) => p.id !== res.product!.id)]);
        showNotification('Nuevo producto añadido al catálogo en Supabase.');
        resetImageState();
        setIsEditing(false);
        setCurrentProduct(null);
      } else {
        showNotification(res.error || 'Error al crear el producto en el servidor.');
      }
    }
  };

  const copyShareLink = (productId: string) => {
    const shareUrl = `${window.location.origin}/tienda/${store.slug}?item=${productId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(productId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DEE7F2] dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-[#14213D] dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-[#1769FF] dark:text-indigo-400" />
            <span>Catálogo de Productos</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#EEF4FF] text-[#1769FF] dark:bg-slate-800 dark:text-slate-300 font-medium">
              {products.length} productos
            </span>
          </h2>
          <p className="text-xs text-[#52627A] dark:text-slate-400 mt-0.5">
            Administra precios, existencias, fotografías y atributos específicos de{' '}
            <strong className="text-[#1769FF] dark:text-indigo-300">{store.name}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1769FF] hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-semibold shadow-2xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-500/40 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-950/60 border border-[#DEE7F2] dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-800 text-[#14213D] dark:text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:border-[#1769FF]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Categoría */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-800 text-[#14213D] dark:text-slate-300 text-xs focus:outline-none focus:border-[#1769FF]"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Estado */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-800 text-[#14213D] dark:text-slate-300 text-xs focus:outline-none focus:border-[#1769FF]"
          >
            <option value="all">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="borrador">Borrador</option>
          </select>
        </div>
      </div>

      {/* Grid de Productos */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-950/30 border border-dashed border-[#DEE7F2] dark:border-slate-800 space-y-3">
          <Package className="w-10 h-10 text-[#94A3B8] dark:text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-[#14213D] dark:text-white">No se encontraron productos</p>
          <p className="text-xs text-[#52627A] dark:text-slate-400 max-w-sm mx-auto">
            Prueba ajustando los filtros o añade tu primer artículo usando el botón de arriba.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const cat = categories.find((c) => c.id === product.category_id);
            const isFeatured = product.attributes?.is_featured;
            const offerPrice = product.attributes?.offer_price;
            const previousPrice = product.attributes?.previous_price;

            return (
              <div
                key={product.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition shadow-2xs ${
                  product.is_available
                    ? 'bg-white dark:bg-slate-950/70 border-[#DEE7F2] dark:border-slate-800 hover:border-[#1769FF]/50 dark:hover:border-slate-700'
                    : 'bg-[#F8FAFC] dark:bg-slate-950/40 border-[#DEE7F2] dark:border-slate-900 opacity-70'
                }`}
              >
                <div className="space-y-3">
                  {/* Imagen y Badges */}
                  <div className="relative h-36 rounded-xl overflow-hidden bg-[#F8FAFC] dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-800">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#94A3B8] dark:text-slate-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}

                    {/* Badges superiores */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      {isFeatured && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase flex items-center gap-1 shadow-xs">
                          <Star className="w-3 h-3 fill-slate-950" />
                          <span>Destacado</span>
                        </span>
                      )}
                      {offerPrice && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold shadow-xs">
                          Oferta
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2 right-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          product.status === 'activo'
                            ? 'bg-emerald-600 dark:bg-emerald-500/80 text-white'
                            : product.status === 'inactivo'
                            ? 'bg-rose-600 dark:bg-rose-500/80 text-white'
                            : 'bg-slate-600 text-white'
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>

                    {/* Badge de disponibilidad */}
                    <div className="absolute bottom-2 left-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          product.is_available
                            ? 'bg-white/95 text-emerald-700 border border-emerald-200 dark:bg-slate-950/80 dark:text-emerald-400 dark:border-emerald-500/40'
                            : 'bg-white/95 text-rose-700 border border-rose-200 dark:bg-rose-950/90 dark:text-rose-300 dark:border-rose-500/40'
                        }`}
                      >
                        {product.is_available ? 'Disponible' : 'Agotado'}
                      </span>
                    </div>

                    {/* Badge de galería múltiple (Módulo 3) */}
                    {product.images && product.images.length > 1 && (
                      <div className="absolute bottom-2 right-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-black/70 text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
                          <ImageIcon className="w-3 h-3 text-white" />
                          <span>{product.images.length} fotos</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Datos del producto */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#52627A] dark:text-slate-400 mb-1">
                      <span>{cat?.name || 'Sin categoría'}</span>
                      {product.attributes?.sku && (
                        <span className="font-mono text-[10px] text-[#52627A] dark:text-slate-400">
                          SKU: {product.attributes.sku}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-[#14213D] dark:text-white line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-xs text-[#52627A] dark:text-slate-400 line-clamp-2 mt-1">
                      {product.description || 'Sin descripción detallada.'}
                    </p>
                  </div>

                  {/* Precios (Bs) */}
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      Bs {offerPrice || product.price}
                    </span>
                    {(previousPrice || (offerPrice && product.price)) && (
                      <span className="text-xs text-[#94A3B8] dark:text-slate-400 line-through">
                        Bs {previousPrice || product.price}
                      </span>
                    )}
                  </div>

                  {/* Atributos específicos según vertical */}
                  {store.store_type === 'restaurante' && product.attributes?.modifiers && (
                    <div className="text-[11px] text-[#52627A] dark:text-slate-400 bg-[#F8FAFC] dark:bg-slate-900/60 p-2 rounded-lg border border-[#DEE7F2] dark:border-slate-800">
                      <span className="font-semibold text-[#14213D] dark:text-slate-300 block">Modificadores/Extras:</span>
                      <span>
                        {product.attributes.modifiers.length > 0
                          ? product.attributes.modifiers.map((m: any) => `${m.name} (+Bs ${m.price})`).join(', ')
                          : 'Sin extras configurados'}
                      </span>
                    </div>
                  )}

                  {store.store_type === 'moda' && product.attributes?.sizes && (
                    <div className="text-[11px] text-[#52627A] dark:text-slate-400 bg-[#F8FAFC] dark:bg-slate-900/60 p-2 rounded-lg border border-[#DEE7F2] dark:border-slate-800">
                      <span className="font-semibold text-[#14213D] dark:text-slate-300 block">Tallas:</span>
                      <span className="font-mono">{product.attributes.sizes.join(' • ')}</span>
                    </div>
                  )}

                  {store.store_type === 'servicios' && product.attributes?.duration_minutes && (
                    <div className="text-[11px] text-[#52627A] dark:text-slate-400 bg-[#F8FAFC] dark:bg-slate-900/60 p-2 rounded-lg border border-[#DEE7F2] dark:border-slate-800">
                      <span className="font-semibold text-[#14213D] dark:text-slate-300 block">Duración de Sesión:</span>
                      <span>{product.attributes.duration_minutes} minutos</span>
                    </div>
                  )}
                </div>

                {/* Acciones del Producto */}
                <div className="pt-4 mt-3 border-t border-[#DEE7F2] dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleAvailability(product)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      product.is_available
                        ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/30 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-950/50'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50'
                    }`}
                  >
                    {product.is_available ? 'Marcar Agotado' : 'Habilitar'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Botón de copiar link para compartir */}
                    <button
                      type="button"
                      onClick={() => copyShareLink(product.id)}
                      title="Copiar enlace directo del producto para compartir"
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-800 text-[#52627A] dark:text-slate-300 hover:text-[#14213D] dark:hover:text-white hover:bg-[#F8FAFC] transition cursor-pointer shadow-2xs"
                    >
                      {copiedId === product.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Editar */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(product)}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-800 text-[#52627A] dark:text-slate-300 hover:text-[#14213D] dark:hover:text-white hover:bg-[#F8FAFC] transition cursor-pointer shadow-2xs"
                      title="Editar producto"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Eliminar */}
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-800 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition cursor-pointer shadow-2xs"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal / Formulario de Creación / Edición */}
      {isEditing && currentProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          <div className="bg-white dark:bg-slate-950 border border-[#DEE7F2] dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Cabecera visualmente estable */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#DEE7F2] dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
              <h3 className="text-base font-bold text-[#14213D] dark:text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-[#1769FF] dark:text-indigo-400" />
                <span>
                  {currentProduct.id && products.some((p) => p.id === currentProduct.id)
                    ? 'Editar Producto'
                    : 'Nuevo Producto'}
                </span>
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-2 py-1 rounded-lg text-[#52627A] hover:text-[#14213D] hover:bg-[#F8FAFC] dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900 text-xs font-bold transition cursor-pointer"
              >
                ✕ Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Contenido desplazable internamente */}
              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4 overscroll-contain">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#52627A] dark:text-slate-300 mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={150}
                    value={currentProduct.name || ''}
                    onChange={(e) =>
                      setCurrentProduct({ ...currentProduct, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-[#1769FF] dark:focus:border-indigo-500"
                    placeholder="Ej. Pizza Margherita Di Bufala"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#52627A] dark:text-slate-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={currentProduct.category_id || ''}
                    onChange={(e) =>
                      setCurrentProduct({ ...currentProduct, category_id: e.target.value || null })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-[#1769FF] dark:focus:border-indigo-500"
                  >
                    <option value="">Sin categoría (General)</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-[#52627A] dark:text-slate-300">
                    Descripción
                  </label>
                  <span className="text-[10px] text-[#94A3B8] dark:text-slate-500">
                    {(currentProduct.description || '').length}/1000
                  </span>
                </div>
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={currentProduct.description || ''}
                  onChange={(e) =>
                    setCurrentProduct({ ...currentProduct, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-[#1769FF] dark:focus:border-indigo-500 resize-none"
                  placeholder="Detalles de preparación, ingredientes, materiales o alcance (máx. 1000 caracteres)..."
                />
              </div>

              {/* Precios (Bs) */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#52627A] dark:text-slate-300 mb-1">
                    Precio Regular (Bs) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={currentProduct.price || 0}
                    onChange={(e) =>
                      setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-[#1769FF] dark:focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#52627A] dark:text-slate-300 mb-1">
                    Precio Anterior (Bs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={currentProduct.attributes?.previous_price || ''}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        attributes: {
                          ...currentProduct.attributes,
                          previous_price: e.target.value ? Number(e.target.value) : null,
                        },
                      })
                    }
                    placeholder="Opcional tachado"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-[#1769FF] dark:focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#52627A] dark:text-slate-300 mb-1">
                    Precio Oferta (Bs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={currentProduct.attributes?.offer_price || ''}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        attributes: {
                          ...currentProduct.attributes,
                          offer_price: e.target.value ? Number(e.target.value) : null,
                        },
                      })
                    }
                    placeholder="Opcional promocional"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-[#1769FF] dark:focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Atributos Específicos según Vertical */}
              {store.store_type === 'moda' && (
                <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-slate-900/80 border border-[#DEE7F2] dark:border-slate-700/80 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1769FF] dark:text-indigo-400 uppercase tracking-wider">
                    <Shirt className="w-4 h-4" />
                    <span>Configuración de Moda</span>
                  </div>

                  {/* Tallas */}
                  <div>
                    <label className="block text-xs font-medium text-[#52627A] dark:text-slate-300 mb-1.5">
                      Tallas Disponibles
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {((currentProduct.attributes?.sizes as string[]) || []).map((size, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs shadow-2xs"
                        >
                          <span className="font-semibold">{size}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const curSizes = (currentProduct.attributes?.sizes as string[]) || [];
                              const updated = curSizes.filter((_, i) => i !== idx);
                              setCurrentProduct({
                                ...currentProduct,
                                attributes: { ...currentProduct.attributes, sizes: updated },
                              });
                            }}
                            className="text-[#52627A] hover:text-rose-500 p-0.5 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {(!currentProduct.attributes?.sizes || (currentProduct.attributes.sizes as string[]).length === 0) && (
                        <span className="text-xs text-[#94A3B8] italic">No hay tallas agregadas</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSizeInput}
                        onChange={(e) => setNewSizeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newSizeInput.trim()) {
                              const curSizes = (currentProduct.attributes?.sizes as string[]) || [];
                              if (!curSizes.includes(newSizeInput.trim()) && curSizes.length < 20) {
                                setCurrentProduct({
                                  ...currentProduct,
                                  attributes: { ...currentProduct.attributes, sizes: [...curSizes, newSizeInput.trim()] },
                                });
                                setNewSizeInput('');
                              }
                            }
                          }
                        }}
                        placeholder="Ej: S, M, L, XL, 38, 40..."
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-[#1769FF]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newSizeInput.trim()) {
                            const curSizes = (currentProduct.attributes?.sizes as string[]) || [];
                            if (!curSizes.includes(newSizeInput.trim()) && curSizes.length < 20) {
                              setCurrentProduct({
                                ...currentProduct,
                                attributes: { ...currentProduct.attributes, sizes: [...curSizes, newSizeInput.trim()] },
                              });
                              setNewSizeInput('');
                            }
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#1769FF] hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir</span>
                      </button>
                    </div>
                  </div>

                  {/* Colores */}
                  <div className="pt-2 border-t border-[#DEE7F2] dark:border-slate-800">
                    <label className="block text-xs font-medium text-[#52627A] dark:text-slate-300 mb-1.5">
                      Colores / Variantes
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2.5">
                      {((currentProduct.attributes?.colors as Array<{ name: string; hex: string }>) || []).map((col, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs shadow-2xs"
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 inline-block shadow-2xs"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span>{col.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const curColors = (currentProduct.attributes?.colors as Array<{ name: string; hex: string }>) || [];
                              const updated = curColors.filter((_, i) => i !== idx);
                              setCurrentProduct({
                                ...currentProduct,
                                attributes: { ...currentProduct.attributes, colors: updated },
                              });
                            }}
                            className="text-[#52627A] hover:text-rose-500 p-0.5 cursor-pointer ml-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {(!currentProduct.attributes?.colors || (currentProduct.attributes.colors as any[]).length === 0) && (
                        <span className="text-xs text-[#94A3B8] italic">No hay colores agregados</span>
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                        placeholder="Nombre color (Ej: Azul Marino)"
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-[#1769FF]"
                      />
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-9 h-8 rounded-lg bg-white dark:bg-slate-800 border border-[#DEE7F2] dark:border-slate-700 cursor-pointer p-0.5"
                        title="Seleccionar color"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newColorName.trim()) {
                            const curColors = (currentProduct.attributes?.colors as Array<{ name: string; hex: string }>) || [];
                            if (curColors.length < 20) {
                              setCurrentProduct({
                                ...currentProduct,
                                attributes: {
                                  ...currentProduct.attributes,
                                  colors: [...curColors, { name: newColorName.trim(), hex: newColorHex || '#000000' }],
                                },
                              });
                              setNewColorName('');
                              setNewColorHex('#000000');
                            }
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#1769FF] hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {store.store_type === 'restaurante' && (
                <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-slate-900/80 border border-[#DEE7F2] dark:border-slate-700/80 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    <ChefHat className="w-4 h-4" />
                    <span>Configuración de Gastronomía</span>
                  </div>

                  {/* Modificadores / Extras */}
                  <div>
                    <label className="block text-xs font-medium text-[#52627A] dark:text-slate-300 mb-1.5">
                      Modificadores y Extras (Opcionales con costo adicional)
                    </label>
                    <div className="space-y-1.5 mb-2.5">
                      {((currentProduct.attributes?.modifiers as Array<{ name: string; price: number }>) || []).map((mod, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-[#DEE7F2] dark:border-slate-700 text-xs shadow-2xs"
                        >
                          <span className="text-[#14213D] dark:text-white font-medium">{mod.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              {mod.price > 0 ? `+Bs ${mod.price.toFixed(2)}` : 'Gratis / Sin costo'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const curMods = (currentProduct.attributes?.modifiers as Array<{ name: string; price: number }>) || [];
                                const updated = curMods.filter((_, i) => i !== idx);
                                setCurrentProduct({
                                  ...currentProduct,
                                  attributes: { ...currentProduct.attributes, modifiers: updated },
                                });
                              }}
                              className="text-[#52627A] hover:text-rose-500 p-0.5 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {(!currentProduct.attributes?.modifiers || (currentProduct.attributes.modifiers as any[]).length === 0) && (
                        <span className="text-xs text-[#94A3B8] italic">No hay modificadores agregados</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newModifierName}
                        onChange={(e) => setNewModifierName(e.target.value)}
                        placeholder="Nombre extra (Ej: Doble Queso, Salsa BBQ)"
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-[#1769FF]"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={newModifierPrice}
                        onChange={(e) => setNewModifierPrice(e.target.value)}
                        placeholder="Precio (Bs)"
                        className="w-28 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-[#1769FF]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newModifierName.trim()) {
                            const curMods = (currentProduct.attributes?.modifiers as Array<{ name: string; price: number }>) || [];
                            if (curMods.length < 30) {
                              const parsedPrice = Number(newModifierPrice);
                              const cleanPrice = !isNaN(parsedPrice) && parsedPrice >= 0 ? parsedPrice : 0;
                              setCurrentProduct({
                                ...currentProduct,
                                attributes: {
                                  ...currentProduct.attributes,
                                  modifiers: [...curMods, { name: newModifierName.trim(), price: cleanPrice }],
                                },
                              });
                              setNewModifierName('');
                              setNewModifierPrice('');
                            }
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold cursor-pointer flex items-center gap-1 whitespace-nowrap shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir</span>
                      </button>
                    </div>
                  </div>

                  {/* Configuración de Combo */}
                  <div className="pt-3 border-t border-[#DEE7F2] dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_combo_checkbox"
                        checked={Boolean(currentProduct.attributes?.is_combo)}
                        onChange={(e) =>
                          setCurrentProduct({
                            ...currentProduct,
                            attributes: {
                              ...currentProduct.attributes,
                              is_combo: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 rounded text-amber-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                      />
                      <label htmlFor="is_combo_checkbox" className="text-xs font-bold text-[#14213D] dark:text-white cursor-pointer flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                        <span>Es un Combo / Paquete gastronómico</span>
                      </label>
                    </div>

                    {Boolean(currentProduct.attributes?.is_combo) && (
                      <div className="pl-6 space-y-2">
                        <label className="block text-xs font-medium text-[#52627A] dark:text-slate-300">
                          Elementos incluidos en el combo
                        </label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {((currentProduct.attributes?.combo_items as string[]) || []).map((item, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-amber-900 dark:text-amber-200 text-xs shadow-2xs"
                            >
                              <span>{item}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const curItems = (currentProduct.attributes?.combo_items as string[]) || [];
                                  const updated = curItems.filter((_, i) => i !== idx);
                                  setCurrentProduct({
                                    ...currentProduct,
                                    attributes: { ...currentProduct.attributes, combo_items: updated },
                                  });
                                }}
                                className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                          {(!currentProduct.attributes?.combo_items || (currentProduct.attributes.combo_items as string[]).length === 0) && (
                            <span className="text-xs text-[#94A3B8] italic">No hay ítems detallados para el combo</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newComboItemInput}
                            onChange={(e) => setNewComboItemInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (newComboItemInput.trim()) {
                                  const curItems = (currentProduct.attributes?.combo_items as string[]) || [];
                                  if (curItems.length < 30) {
                                    setCurrentProduct({
                                      ...currentProduct,
                                      attributes: { ...currentProduct.attributes, combo_items: [...curItems, newComboItemInput.trim()] },
                                    });
                                    setNewComboItemInput('');
                                  }
                                }
                              }
                            }}
                            placeholder="Ej: Hamburguesa doble, Papas fritas medianas, Soda 500ml"
                            className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newComboItemInput.trim()) {
                                const curItems = (currentProduct.attributes?.combo_items as string[]) || [];
                                if (curItems.length < 30) {
                                  setCurrentProduct({
                                    ...currentProduct,
                                    attributes: { ...currentProduct.attributes, combo_items: [...curItems, newComboItemInput.trim()] },
                                  });
                                  setNewComboItemInput('');
                                }
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Añadir</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {store.store_type === 'servicios' && (
                <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-slate-900/80 border border-[#DEE7F2] dark:border-slate-700/80 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                    <Scissors className="w-4 h-4" />
                    <span>Configuración de Servicios y Citas</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_service_checkbox"
                      checked={currentProduct.attributes?.is_service !== false}
                      onChange={(e) =>
                        setCurrentProduct({
                          ...currentProduct,
                          attributes: {
                            ...currentProduct.attributes,
                            is_service: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 rounded text-teal-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    />
                    <label htmlFor="is_service_checkbox" className="text-xs font-bold text-[#14213D] dark:text-white cursor-pointer">
                      Tratar como Servicio agendable
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#52627A] dark:text-slate-300 mb-1">
                        Duración estimada (minutos)
                      </label>
                      <input
                        type="number"
                        min="5"
                        step="5"
                        value={currentProduct.attributes?.duration_minutes ?? 45}
                        onChange={(e) =>
                          setCurrentProduct({
                            ...currentProduct,
                            attributes: {
                              ...currentProduct.attributes,
                              duration_minutes: e.target.value ? Number(e.target.value) : 45,
                            },
                          })
                        }
                        placeholder="Ej: 45"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#52627A] dark:text-slate-300 mb-1">
                        Especialidad / Área
                      </label>
                      <input
                        type="text"
                        value={(currentProduct.attributes?.specialty as string) || ''}
                        onChange={(e) =>
                          setCurrentProduct({
                            ...currentProduct,
                            attributes: {
                              ...currentProduct.attributes,
                              specialty: e.target.value,
                            },
                          })
                        }
                        placeholder="Ej: Colorimetría, Masajes, Consulta"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#52627A] dark:text-slate-300 mb-1">
                      Profesional / Especialista Asignado
                    </label>
                    <input
                      type="text"
                      value={(currentProduct.attributes?.professional_name as string) || ''}
                      onChange={(e) =>
                        setCurrentProduct({
                          ...currentProduct,
                          attributes: {
                            ...currentProduct.attributes,
                            professional_name: e.target.value,
                          },
                        })
                      }
                      placeholder="Ej: Dra. García, Carlos Estilista..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              )}

              {/* Sección de Fotografías del Producto (Módulo 3: Galería hasta 3 fotos para BASIC y PRO) */}
              <div className="space-y-4 pt-2 border-t border-[#DEE7F2] dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#14213D] dark:text-white flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#1769FF] dark:text-indigo-400" />
                      <span>{isPaidPlan ? 'Galería del Producto (Hasta 3 Fotografías)' : 'Fotografía del Producto'}</span>
                    </label>
                    <p className="text-[11px] text-[#52627A] dark:text-slate-400 mt-0.5">
                      {isPaidPlan
                        ? 'Planes BASIC y PRO: Administra la fotografía principal y hasta 2 imágenes adicionales para la tienda pública.'
                        : 'Plan FREE: Cada producto incluye una fotografía principal de portada en el catálogo.'}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                      isPaidPlan
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60'
                        : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {isPaidPlan
                      ? `${imageSlots.filter((s) => s.previewUrl || s.url).length}/3 fotos registradas`
                      : 'Plan FREE (1 foto)'}
                  </span>
                </div>

                {/* Inputs file nativos ocultos para cada slot */}
                <input
                  type="file"
                  ref={fileInputRef0}
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => handleSlotFileChange(0, e)}
                  disabled={isUploadingImages || isSaving}
                  className="hidden"
                />
                {isPaidPlan && (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef1}
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => handleSlotFileChange(1, e)}
                      disabled={isUploadingImages || isSaving}
                      className="hidden"
                    />
                    <input
                      type="file"
                      ref={fileInputRef2}
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => handleSlotFileChange(2, e)}
                      disabled={isUploadingImages || isSaving}
                      className="hidden"
                    />
                  </>
                )}

                {/* Grid de Slots de Fotografías */}
                <div className={`grid gap-3 ${isPaidPlan ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1'}`}>
                  {/* SLOT 0: FOTOGRAFÍA PRINCIPAL */}
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900/80 border border-[#DEE7F2] dark:border-slate-800 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#14213D] dark:text-white">
                          Fotografía Principal
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#1769FF] text-white">
                          Principal
                        </span>
                      </div>
                      <p className="text-[11px] text-[#52627A] dark:text-slate-400 mb-2">
                        Portada y tarjeta del catálogo.
                      </p>

                      {imageSlots[0].error && (
                        <div className="p-2 mb-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{imageSlots[0].error}</span>
                        </div>
                      )}

                      {imageSlots[0].previewUrl ? (
                        <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-white dark:bg-slate-950 border border-[#DEE7F2] dark:border-slate-700">
                          <img
                            src={imageSlots[0].previewUrl}
                            alt="Foto principal"
                            className="w-full h-full object-cover"
                          />
                          {imageSlots[0].file && (
                            <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded backdrop-blur-xs">
                              Archivo listo para guardar
                            </span>
                          )}
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef0.current?.click()}
                          className="aspect-4/3 rounded-xl border-2 border-dashed border-[#DEE7F2] hover:border-[#1769FF] dark:border-slate-700 dark:hover:border-indigo-500 bg-white dark:bg-slate-950/60 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition group"
                        >
                          <UploadCloud className="w-6 h-6 text-[#94A3B8] group-hover:text-[#1769FF] dark:text-slate-400 dark:group-hover:text-indigo-400 mb-1 transition" />
                          <span className="text-xs font-semibold text-[#14213D] group-hover:text-[#1769FF] dark:text-slate-200">
                            Subir fotografía
                          </span>
                          <span className="text-[10px] text-[#52627A] dark:text-slate-400 mt-0.5">
                            PNG, JPG o WEBP (máx. 5 MB)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-1 border-t border-[#DEE7F2]/60 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef0.current?.click()}
                          disabled={isUploadingImages || isSaving}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#EEF4FF] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#14213D] dark:text-slate-200 text-xs font-medium border border-[#DEE7F2] dark:border-slate-700 transition cursor-pointer shadow-2xs"
                        >
                          <UploadCloud className="w-3.5 h-3.5 text-[#1769FF] dark:text-indigo-400" />
                          <span>{imageSlots[0].previewUrl ? 'Cambiar' : 'Seleccionar'}</span>
                        </button>
                        {imageSlots[0].previewUrl && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSlotImage(0)}
                            disabled={isUploadingImages || isSaving}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 transition cursor-pointer"
                            title="Quitar foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <details className="group">
                        <summary className="text-[10px] text-[#52627A] hover:text-[#14213D] dark:text-slate-400 cursor-pointer select-none">
                          ¿Ingresar URL externa?
                        </summary>
                        <input
                          type="url"
                          value={imageSlots[0].url}
                          onChange={(e) => handleSlotUrlChange(0, e.target.value)}
                          placeholder="https://..."
                          className="w-full mt-1.5 px-2 py-1 text-[11px] rounded-lg bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white"
                        />
                      </details>
                    </div>
                  </div>

                  {/* SLOTS 1 Y 2 PARA PLANES BASIC Y PRO */}
                  {isPaidPlan && (
                    <>
                      {/* SLOT 1: FOTOGRAFÍA ADICIONAL 1 */}
                      <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900/80 border border-[#DEE7F2] dark:border-slate-800 space-y-2.5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#14213D] dark:text-white">
                              Fotografía Adicional 1
                            </span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[#14213D] dark:text-slate-300">
                              Adicional 1
                            </span>
                          </div>
                          <p className="text-[11px] text-[#52627A] dark:text-slate-400 mb-2">
                            Segunda toma para la galería.
                          </p>

                          {imageSlots[1].error && (
                            <div className="p-2 mb-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{imageSlots[1].error}</span>
                            </div>
                          )}

                          {imageSlots[1].previewUrl ? (
                            <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-white dark:bg-slate-950 border border-[#DEE7F2] dark:border-slate-700">
                              <img
                                src={imageSlots[1].previewUrl}
                                alt="Foto adicional 1"
                                className="w-full h-full object-cover"
                              />
                              {imageSlots[1].file && (
                                <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded backdrop-blur-xs">
                                  Archivo listo para guardar
                                </span>
                              )}
                            </div>
                          ) : (
                            <div
                              onClick={() => fileInputRef1.current?.click()}
                              className="aspect-4/3 rounded-xl border-2 border-dashed border-[#DEE7F2] hover:border-[#1769FF] dark:border-slate-700 dark:hover:border-indigo-500 bg-white dark:bg-slate-950/60 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition group"
                            >
                              <Plus className="w-6 h-6 text-[#94A3B8] group-hover:text-[#1769FF] dark:text-slate-400 dark:group-hover:text-indigo-400 mb-1 transition" />
                              <span className="text-xs font-semibold text-[#14213D] group-hover:text-[#1769FF] dark:text-slate-200">
                                Añadir foto 2
                              </span>
                              <span className="text-[10px] text-[#52627A] dark:text-slate-400 mt-0.5">
                                Opcional para galería
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 pt-1 border-t border-[#DEE7F2]/60 dark:border-slate-800">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => fileInputRef1.current?.click()}
                              disabled={isUploadingImages || isSaving}
                              className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#EEF4FF] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#14213D] dark:text-slate-200 text-xs font-medium border border-[#DEE7F2] dark:border-slate-700 transition cursor-pointer shadow-2xs"
                            >
                              <UploadCloud className="w-3.5 h-3.5 text-[#1769FF] dark:text-indigo-400" />
                              <span>{imageSlots[1].previewUrl ? 'Cambiar' : 'Seleccionar'}</span>
                            </button>
                            {imageSlots[1].previewUrl && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSlotImage(1)}
                                disabled={isUploadingImages || isSaving}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 transition cursor-pointer"
                                title="Quitar foto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <details className="group">
                            <summary className="text-[10px] text-[#52627A] hover:text-[#14213D] dark:text-slate-400 cursor-pointer select-none">
                              ¿Ingresar URL externa?
                            </summary>
                            <input
                              type="url"
                              value={imageSlots[1].url}
                              onChange={(e) => handleSlotUrlChange(1, e.target.value)}
                              placeholder="https://..."
                              className="w-full mt-1.5 px-2 py-1 text-[11px] rounded-lg bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white"
                            />
                          </details>
                        </div>
                      </div>

                      {/* SLOT 2: FOTOGRAFÍA ADICIONAL 2 */}
                      <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900/80 border border-[#DEE7F2] dark:border-slate-800 space-y-2.5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#14213D] dark:text-white">
                              Fotografía Adicional 2
                            </span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[#14213D] dark:text-slate-300">
                              Adicional 2
                            </span>
                          </div>
                          <p className="text-[11px] text-[#52627A] dark:text-slate-400 mb-2">
                            Tercera toma para la galería.
                          </p>

                          {imageSlots[2].error && (
                            <div className="p-2 mb-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{imageSlots[2].error}</span>
                            </div>
                          )}

                          {imageSlots[2].previewUrl ? (
                            <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-white dark:bg-slate-950 border border-[#DEE7F2] dark:border-slate-700">
                              <img
                                src={imageSlots[2].previewUrl}
                                alt="Foto adicional 2"
                                className="w-full h-full object-cover"
                              />
                              {imageSlots[2].file && (
                                <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded backdrop-blur-xs">
                                  Archivo listo para guardar
                                </span>
                              )}
                            </div>
                          ) : (
                            <div
                              onClick={() => fileInputRef2.current?.click()}
                              className="aspect-4/3 rounded-xl border-2 border-dashed border-[#DEE7F2] hover:border-[#1769FF] dark:border-slate-700 dark:hover:border-indigo-500 bg-white dark:bg-slate-950/60 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition group"
                            >
                              <Plus className="w-6 h-6 text-[#94A3B8] group-hover:text-[#1769FF] dark:text-slate-400 dark:group-hover:text-indigo-400 mb-1 transition" />
                              <span className="text-xs font-semibold text-[#14213D] group-hover:text-[#1769FF] dark:text-slate-200">
                                Añadir foto 3
                              </span>
                              <span className="text-[10px] text-[#52627A] dark:text-slate-400 mt-0.5">
                                Opcional para galería
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 pt-1 border-t border-[#DEE7F2]/60 dark:border-slate-800">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => fileInputRef2.current?.click()}
                              disabled={isUploadingImages || isSaving}
                              className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#EEF4FF] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#14213D] dark:text-slate-200 text-xs font-medium border border-[#DEE7F2] dark:border-slate-700 transition cursor-pointer shadow-2xs"
                            >
                              <UploadCloud className="w-3.5 h-3.5 text-[#1769FF] dark:text-indigo-400" />
                              <span>{imageSlots[2].previewUrl ? 'Cambiar' : 'Seleccionar'}</span>
                            </button>
                            {imageSlots[2].previewUrl && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSlotImage(2)}
                                disabled={isUploadingImages || isSaving}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 transition cursor-pointer"
                                title="Quitar foto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <details className="group">
                            <summary className="text-[10px] text-[#52627A] hover:text-[#14213D] dark:text-slate-400 cursor-pointer select-none">
                              ¿Ingresar URL externa?
                            </summary>
                            <input
                              type="url"
                              value={imageSlots[2].url}
                              onChange={(e) => handleSlotUrlChange(2, e.target.value)}
                              placeholder="https://..."
                              className="w-full mt-1.5 px-2 py-1 text-[11px] rounded-lg bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white"
                            />
                          </details>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Banner Informativo si el comercio está en Plan FREE */}
                {!isPaidPlan && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900 dark:text-amber-200">
                      <span className="font-semibold block mb-0.5">
                        Galería de fotos extendida exclusiva para planes BASIC y PRO
                      </span>
                      <span className="text-amber-700 dark:text-amber-300 text-[11px] leading-relaxed block">
                        Tu plan FREE incluye 1 fotografía por producto. Con los planes BASIC o PRO puedes registrar hasta 3 fotografías (1 principal y 2 adicionales) para que tus clientes disfruten de una galería interactiva con navegación táctil en tu tienda pública.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Estado y Opciones */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-[#52627A] dark:text-slate-300 mb-1">
                    Estado en Catálogo
                  </label>
                  <select
                    value={currentProduct.status || 'activo'}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        status: e.target.value as ProductStatus,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#DEE7F2] dark:border-slate-700 text-[#14213D] dark:text-white text-xs focus:outline-none focus:border-[#1769FF]"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="borrador">Borrador</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_available_modal"
                    checked={currentProduct.is_available ?? true}
                    onChange={(e) =>
                      setCurrentProduct({ ...currentProduct, is_available: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#1769FF] bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                  <label
                    htmlFor="is_available_modal"
                    className="text-xs font-bold text-[#14213D] dark:text-white cursor-pointer"
                  >
                    Disponible para Venta
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_featured_modal"
                    checked={Boolean(currentProduct.attributes?.is_featured)}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        attributes: {
                          ...currentProduct.attributes,
                          is_featured: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-[#1769FF] bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                  <label
                    htmlFor="is_featured_modal"
                    className="text-xs font-bold text-[#14213D] dark:text-white cursor-pointer"
                  >
                    Marcar Destacado
                  </label>
                </div>
              </div>
              </div>

              {/* Botones de acción del modal (Fijados y siempre accesibles) */}
              <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-3.5 border-t border-[#DEE7F2] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950/95 shrink-0">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-[#DEE7F2] dark:border-transparent text-[#52627A] dark:text-white text-xs font-semibold cursor-pointer transition shadow-2xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-[#1769FF] hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition shadow-2xs"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSaving ? 'Guardando...' : 'Guardar Producto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
