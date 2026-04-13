/**
 * Compras — conecta a GET/POST /api/compras (admin).
 * El insert lo hace el backend (transacción: compra + detalle + suma stock).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Minus, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

import type { Route } from "./+types/compras";

type Producto = {
  id: number;
  nombre: string;
  precioCompra: number;
  stock: number;
};

type CartLine = {
  key: string;
  productoId: number;
  nombre: string;
  precioCompra: number;
  stock: number;
  cantidad: number;
  incluido: boolean;
};

type CompraProducto = {
  nombre: string;
  cantidad: number;
  precio: number;
};

type CompraRegistro = {
  id: number;
  proveedor: string;
  total: number;
  fecha: string;
  usuario: string;
  productos: CompraProducto[];
};

const MAX_CANTIDAD_COMPRA = 999_999;
const MAX_PRECIO_COMPRA = 999_999_999;

const money = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

const newLineKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `line-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function meta({}: Route.MetaArgs) {
  return [{ title: "Compras" }];
}

export default function ComprasPage() {
  const base = import.meta.env.VITE_BACKEND_URL as string;

  const [proveedor, setProveedor] = useState("");
  const [proveedoresHistoricos, setProveedoresHistoricos] = useState<string[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [compras, setCompras] = useState<CompraRegistro[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [modalProductosAbierto, setModalProductosAbierto] = useState(false);
  const [modalNuevoProductoAbierto, setModalNuevoProductoAbierto] = useState(false);
  const [nuevoProductoNombre, setNuevoProductoNombre] = useState("");
  const [nuevoProductoPrecio, setNuevoProductoPrecio] = useState("");
  const [creandoProducto, setCreandoProducto] = useState(false);
  const [candidatosProductos, setCandidatosProductos] = useState<Producto[]>([]);
  const [textoBusquedaProducto, setTextoBusquedaProducto] = useState("");
  const [busquedaProductoFocada, setBusquedaProductoFocada] = useState(false);
  const [indiceSugerencia, setIndiceSugerencia] = useState(0);
  /** Fila del carrito seleccionada para ver stock / orden en el panel lateral */
  const [lineaSeleccionadaKey, setLineaSeleccionadaKey] = useState<string | null>(null);

  const productMap = useMemo(() => new Map(productos.map((p) => [p.id, p])), [productos]);

  /** Siguiente ID de compra que asignará MySQL (AUTO_INCREMENT): max(id)+1 */
  const siguienteNumeroCompra = useMemo(() => {
    if (compras.length === 0) return 1;
    return Math.max(...compras.map((c) => c.id)) + 1;
  }, [compras]);

  const sugerenciasProductos = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return [];
    return productos
      .filter((p) => p.nombre.toLowerCase().includes(q))
      .slice(0, 12);
  }, [busqueda, productos]);

  const mostrarSugerencias =
    busquedaProductoFocada && busqueda.trim().length > 0 && sugerenciasProductos.length > 0;

  const total = useMemo(() => {
    return cart.reduce((acc, line) => {
      if (!line.incluido) return acc;
      return acc + Number(line.precioCompra) * Number(line.cantidad || 0);
    }, 0);
  }, [cart]);

  const lineaSeleccionada = useMemo(
    () => cart.find((l) => l.key === lineaSeleccionadaKey) ?? null,
    [cart, lineaSeleccionadaKey]
  );

  const indiceLineaSeleccionada = lineaSeleccionada
    ? cart.findIndex((l) => l.key === lineaSeleccionada.key) + 1
    : 0;

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [productsRes, comprasRes, provRes] = await Promise.all([
        fetch(`${base}/compras/productos`, { credentials: "include" }),
        fetch(`${base}/compras`, { credentials: "include" }),
        fetch(`${base}/compras/proveedores`, { credentials: "include" }),
      ]);

      if (!productsRes.ok || !comprasRes.ok || !provRes.ok) {
        throw new Error("respuesta no ok");
      }

      setProductos((await productsRes.json()) as Producto[]);
      setCompras((await comprasRes.json()) as CompraRegistro[]);
      setProveedoresHistoricos((await provRes.json()) as string[]);
    } catch {
      toast.error("No se pudo cargar el módulo de compras (revisa API y sesión de admin)");
      setProductos([]);
      setCompras([]);
      setProveedoresHistoricos([]);
    } finally {
      setLoadingData(false);
    }
  }, [base]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const syncCartFromCatalog = (catalog: Producto[]) => {
    const map = new Map(catalog.map((p) => [p.id, p]));
    setCart((lines) =>
      lines.map((line) => {
        const p = map.get(line.productoId);
        if (!p) return line;
        return {
          ...line,
          stock: p.stock,
          precioCompra: Number(p.precioCompra),
          cantidad: Math.min(Math.max(1, line.cantidad), MAX_CANTIDAD_COMPRA),
        };
      })
    );
  };

  useEffect(() => {
    if (productos.length > 0) syncCartFromCatalog(productos);
  }, [productos]);

  const agregarProductoAlCarrito = (chosen: Producto) => {
    const key = newLineKey();
    setCart((prev) => [
      ...prev,
      {
        key,
        productoId: chosen.id,
        nombre: chosen.nombre,
        precioCompra: Number(chosen.precioCompra),
        stock: chosen.stock,
        cantidad: 1,
        incluido: true,
      },
    ]);
    setLineaSeleccionadaKey(key);
    setBusqueda("");
    setBusquedaProductoFocada(false);
    setIndiceSugerencia(0);
    setModalProductosAbierto(false);
    setCandidatosProductos([]);
    setTextoBusquedaProducto("");
  };

  const ordenarCandidatos = (lista: Producto[], qNormalizado: string) => {
    return [...lista].sort((a, b) => {
      const an = a.nombre.toLowerCase();
      const bn = b.nombre.toLowerCase();
      const aExact = an === qNormalizado ? 0 : 1;
      const bExact = bn === qNormalizado ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      return a.nombre.localeCompare(b.nombre, "es");
    });
  };

  const agregarProductoBusqueda = () => {
    const qRaw = busqueda.trim();
    const q = qRaw.toLowerCase();
    if (!q) {
      toast.error("Escribe el nombre del producto");
      return;
    }
    if (mostrarSugerencias && sugerenciasProductos[indiceSugerencia]) {
      agregarProductoAlCarrito(sugerenciasProductos[indiceSugerencia]);
      return;
    }
    const matches = productos.filter((p) => p.nombre.toLowerCase().includes(q));
    if (matches.length === 0) {
      toast.error("No hay productos que coincidan");
      return;
    }
    if (matches.length === 1) {
      agregarProductoAlCarrito(matches[0]);
      return;
    }

    setTextoBusquedaProducto(qRaw);
    setCandidatosProductos(ordenarCandidatos(matches, q));
    setModalProductosAbierto(true);
  };

  const cerrarModalProductos = (open: boolean) => {
    setModalProductosAbierto(open);
    if (!open) {
      setCandidatosProductos([]);
      setTextoBusquedaProducto("");
    }
  };

  const updateLine = (key: string, patch: Partial<CartLine>) => {
    setCart((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line))
    );
  };

  const setCantidad = (line: CartLine, next: number) => {
    const clamped = Math.max(1, Math.min(Math.floor(next), MAX_CANTIDAD_COMPRA));
    if (next > MAX_CANTIDAD_COMPRA) {
      toast.error(`Cantidad máxima por línea: ${MAX_CANTIDAD_COMPRA.toLocaleString("es-MX")}`);
    }
    updateLine(line.key, { cantidad: clamped });
  };

  const setPrecioCompra = (line: CartLine, nextRaw: string) => {
    const cleaned = nextRaw.replace(",", ".").trim();
    const parsed = Number(cleaned);
    if (!Number.isFinite(parsed)) return;
    const rounded = Number(parsed.toFixed(2));
    const clamped = Math.max(0.01, Math.min(rounded, MAX_PRECIO_COMPRA));
    if (rounded > MAX_PRECIO_COMPRA) {
      toast.error(`Precio máximo por línea: ${MAX_PRECIO_COMPRA.toLocaleString("es-MX")}`);
    }
    updateLine(line.key, { precioCompra: clamped });
  };

  const removeLine = (key: string) => {
    setCart((current) => current.filter((l) => l.key !== key));
    setLineaSeleccionadaKey((k) => (k === key ? null : k));
  };

  const handleQuickCreateProduct = async () => {
    if (!nuevoProductoNombre.trim()) {
      toast.error("El nombre del producto es obligatorio");
      return;
    }
    const pc = Number(nuevoProductoPrecio);
    if (isNaN(pc) || pc < 0) {
      toast.error("El precio de compra debe ser un número válido");
      return;
    }

    setCreandoProducto(true);
    try {
      const response = await fetch(`${base}/products/quick-create`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nuevoProductoNombre.trim(),
          precio_compra: pc,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "No se pudo crear el producto");
        return;
      }

      const newProduct: Producto = {
        id: data.product.id,
        nombre: data.product.nombre,
        precioCompra: Number(data.product.precio_compra),
        stock: 0,
      };

      // 1. Actualizar lista de productos para el buscador
      setProductos((prev) => [...prev, newProduct]);

      // 2. Agregar al carrito
      agregarProductoAlCarrito(newProduct);

      toast.success("Producto creado y agregado");
      setModalNuevoProductoAbierto(false);
      setNuevoProductoNombre("");
      setNuevoProductoPrecio("");
    } catch (error) {
      toast.error("Error al crear el producto");
    } finally {
      setCreandoProducto(false);
    }
  };

  const resetForm = () => {
    setProveedor("");
    setCart([]);
    setBusqueda("");
    setLineaSeleccionadaKey(null);
    setModalProductosAbierto(false);
    setCandidatosProductos([]);
    setTextoBusquedaProducto("");
  };

  /**
   * Insert en servidor: POST /api/compras
   * Body: { proveedor, productos: [{ productoId, cantidad, precioCompra }] }
   * El controlador hace INSERT en compras + detalle_compras y UPDATE de stock/precio.
   */
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!proveedor.trim()) {
      toast.error("Ingresa el nombre del proveedor");
      return;
    }

    const included = cart.filter((l) => l.incluido);
    if (included.length === 0) {
      toast.error("Agrega al menos un producto incluido en la compra");
      return;
    }

    const byId = new Map<number, { cantidad: number; subtotal: number }>();
    for (const line of included) {
      const current = byId.get(line.productoId) ?? { cantidad: 0, subtotal: 0 };
      byId.set(line.productoId, {
        cantidad: current.cantidad + line.cantidad,
        subtotal: current.subtotal + line.cantidad * Number(line.precioCompra),
      });
    }

    const items = [...byId.entries()].map(([productoId, data]) => ({
      productoId,
      cantidad: data.cantidad,
      precioCompra: Number((data.subtotal / data.cantidad).toFixed(2)),
    }));

    for (const item of items) {
      const { productoId, cantidad, precioCompra } = item;
      if (!productMap.get(productoId)) {
        toast.error("Hay productos inválidos en la compra");
        return;
      }
      if (cantidad < 1) {
        toast.error("Cantidades inválidas");
        return;
      }
      if (!Number.isFinite(precioCompra) || precioCompra <= 0) {
        toast.error("Precios de compra inválidos");
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(`${base}/compras`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proveedor: proveedor.trim(),
          productos: items,
        }),
      });

      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        toast.error(payload.error || "No se pudo registrar la compra");
        return;
      }

      toast.success(payload.message || "Compra registrada");
      resetForm();
      await fetchData();
    } catch {
      toast.error("Error de red al registrar la compra");
    } finally {
      setLoading(false);
    }
  };

  const inputPos =
    "h-10 rounded-lg border border-input bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 outline-none";

  const stockDespues =
    lineaSeleccionada != null ? lineaSeleccionada.stock + lineaSeleccionada.cantidad : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm">
        <div>
          <p className="font-medium text-foreground">Registro de compra</p>
          <p className="text-muted-foreground">
            Los datos vienen del API. Al guardar se inserta en la base y sube el inventario.
          </p>
        </div>
        {cart.length > 0 ? (
          <div className="rounded-md border border-border bg-background px-3 py-2 text-right">
            <p className="text-xs text-muted-foreground">Próximo número de compra</p>
            <p className="text-lg font-semibold tabular-nums text-foreground">#{siguienteNumeroCompra}</p>
            <p className="text-xs text-muted-foreground">(AUTO_INCREMENT en MySQL al guardar)</p>
          </div>
        ) : null}
      </div>

      <section
        className={cn(
          "overflow-hidden rounded-xl border border-border bg-white text-foreground shadow-sm"
        )}
      >
        <form onSubmit={onSubmit} className="space-y-5 p-5">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground" htmlFor="compras-proveedor">
              Proveedor
            </Label>
            <Input
              id="compras-proveedor"
              className={cn(inputPos, "max-w-md")}
              list="compras-proveedores-datalist"
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              placeholder="Nombre del proveedor"
              disabled={loadingData}
              autoComplete="off"
            />
            <datalist id="compras-proveedores-datalist">
              {proveedoresHistoricos.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground" htmlFor="compras-buscar-producto">
              Buscar producto
            </Label>
            <p className="text-xs text-muted-foreground">
              Escribe y elige de la lista; el orden en la tabla es el orden de la compra (línea 1, 2, 3…).
            </p>
            <div className="flex gap-2">
              <div className="relative z-20 min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="compras-buscar-producto"
                  className={cn(inputPos, "pl-9")}
                  placeholder="Escribe el nombre del producto…"
                  value={busqueda}
                  disabled={loadingData}
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={mostrarSugerencias}
                  aria-controls="compras-sugerencias-productos"
                  aria-activedescendant={
                    mostrarSugerencias && sugerenciasProductos[indiceSugerencia]
                      ? `sugerencia-producto-${sugerenciasProductos[indiceSugerencia].id}`
                      : undefined
                  }
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setIndiceSugerencia(0);
                  }}
                  onFocus={() => setBusquedaProductoFocada(true)}
                  onBlur={() => {
                    window.setTimeout(() => setBusquedaProductoFocada(false), 180);
                  }}
                  onKeyDown={(e) => {
                    if (!mostrarSugerencias) {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        agregarProductoBusqueda();
                      }
                      return;
                    }
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setIndiceSugerencia((i) =>
                        Math.min(i + 1, sugerenciasProductos.length - 1)
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setIndiceSugerencia((i) => Math.max(i - 1, 0));
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      const sel = sugerenciasProductos[indiceSugerencia];
                      if (sel) agregarProductoAlCarrito(sel);
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      setBusquedaProductoFocada(false);
                    }
                  }}
                />
                {mostrarSugerencias ? (
                  <ul
                    id="compras-sugerencias-productos"
                    role="listbox"
                    className="absolute top-full right-0 left-0 z-50 mt-1 max-h-52 overflow-auto rounded-md border border-border bg-popover py-1 text-popover-foreground shadow-md"
                  >
                    {sugerenciasProductos.map((p, idx) => (
                      <li key={p.id} role="presentation">
                        <button
                          id={`sugerencia-producto-${p.id}`}
                          type="button"
                          role="option"
                          aria-selected={idx === indiceSugerencia}
                          className={cn(
                            "flex w-full flex-col gap-0.5 px-3 py-2.5 text-left text-sm transition-colors",
                            idx === indiceSugerencia
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-muted/80"
                          )}
                          onMouseDown={(ev) => {
                            ev.preventDefault();
                            agregarProductoAlCarrito(p);
                          }}
                          onMouseEnter={() => setIndiceSugerencia(idx)}
                        >
                          <span className="font-medium">{p.nombre}</span>
                          <span className="text-xs text-muted-foreground">
                            {money(p.precioCompra)} · Stock actual: {p.stock}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <Button
                type="button"
                className="shrink-0"
                onClick={agregarProductoBusqueda}
                disabled={loadingData}
              >
                Buscar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="shrink-0"
                onClick={() => setModalNuevoProductoAbierto(true)}
                disabled={loadingData}
              >
                + Nuevo
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_min(280px,100%)] lg:items-start">
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="w-10 px-2 py-2.5 text-center">#</th>
                    <th className="w-10 px-2 py-2.5 text-center">✓</th>
                    <th className="px-2 py-2.5">Producto</th>
                    <th className="w-24 px-2 py-2.5">Precio compra</th>
                    <th className="w-36 px-2 py-2.5 text-center">Cantidad</th>
                    <th className="w-28 px-2 py-2.5 text-right">Subtotal</th>
                    <th className="w-12 px-1 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                        {loadingData
                          ? "Cargando catálogo…"
                          : "Agrega productos con la búsqueda. Las filas van en orden (1, 2, 3…)."}
                      </td>
                    </tr>
                  ) : (
                    cart.map((line, index) => {
                      const sub = line.incluido
                        ? Number(line.precioCompra) * line.cantidad
                        : 0;
                      const selected = line.key === lineaSeleccionadaKey;
                      return (
                        <tr
                          key={line.key}
                          className={cn(
                            "cursor-pointer bg-background transition-colors",
                            selected && "bg-muted/40"
                          )}
                          onClick={() => setLineaSeleccionadaKey(line.key)}
                        >
                          <td className="px-2 py-2 align-middle text-center text-xs font-medium tabular-nums text-muted-foreground">
                            {index + 1}
                          </td>
                          <td className="px-2 py-2 align-middle" onClick={(ev) => ev.stopPropagation()}>
                            <div className="flex justify-center">
                              <Checkbox
                                checked={line.incluido}
                                onCheckedChange={(v) =>
                                  updateLine(line.key, { incluido: v === true })
                                }
                              />
                            </div>
                          </td>
                          <td className="px-2 py-2 align-middle font-medium text-foreground">
                            {line.nombre}
                          </td>
                          <td className="px-2 py-2 align-middle text-muted-foreground" onClick={(ev) => ev.stopPropagation()}>
                            <Input
                              type="number"
                              min={0.01}
                              max={MAX_PRECIO_COMPRA}
                              step={0.01}
                              value={line.precioCompra}
                              onChange={(e) => setPrecioCompra(line, e.target.value)}
                              className="h-8 min-w-[7.5rem] bg-background text-right tabular-nums"
                              aria-label={`Precio de compra de ${line.nombre}`}
                            />
                          </td>
                          <td className="px-2 py-2 align-middle" onClick={(ev) => ev.stopPropagation()}>
                            <div className="mx-auto flex w-max items-center gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                className="size-8"
                                onClick={() => setCantidad(line, line.cantidad - 1)}
                                disabled={line.cantidad <= 1}
                              >
                                <Minus className="size-3.5" />
                              </Button>
                              <span className="min-w-[1.5rem] text-center text-sm tabular-nums text-foreground">
                                {line.cantidad}
                              </span>
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                className="size-8"
                                onClick={() => setCantidad(line, line.cantidad + 1)}
                                disabled={line.cantidad >= MAX_CANTIDAD_COMPRA}
                              >
                                <Plus className="size-3.5" />
                              </Button>
                            </div>
                          </td>
                          <td className="px-2 py-2 align-middle text-right font-medium tabular-nums text-foreground">
                            {money(sub)}
                          </td>
                          <td className="px-1 py-2 align-middle" onClick={(ev) => ev.stopPropagation()}>
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="ghost"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => removeLine(line.key)}
                              aria-label="Quitar producto"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <Card
              className={cn(
                "border-border/80 shadow-sm",
                !lineaSeleccionada && "border-dashed opacity-80"
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Detalle de la línea</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Haz clic en una fila de la tabla. Ahí ves stock y orden.
                </p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {lineaSeleccionada ? (
                  <>
                    <div className="flex justify-between gap-2 border-b border-border pb-2">
                      <span className="text-muted-foreground">Orden en la compra</span>
                      <span className="font-medium tabular-nums">
                        Línea {indiceLineaSeleccionada} de {cart.length}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Producto</p>
                      <p className="font-medium">{lineaSeleccionada.nombre}</p>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Stock actual</span>
                      <span className="font-semibold tabular-nums">{lineaSeleccionada.stock}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Cantidad en esta compra</span>
                      <span className="font-semibold tabular-nums">{lineaSeleccionada.cantidad}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Stock después de guardar</span>
                      <span className="font-semibold tabular-nums text-green-700 dark:text-green-400">
                        {stockDespues}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2 text-xs text-muted-foreground">
                      <span>Precio unitario (compra)</span>
                      <span>{money(lineaSeleccionada.precioCompra)}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Selecciona una fila de la tabla para ver stock y número de línea.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg font-semibold tabular-nums text-foreground">Total: {money(total)}</p>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
                disabled={loading || loadingData}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || loadingData}>
                {loading ? "Guardando..." : "Registrar compra"}
              </Button>
            </div>
          </div>
        </form>
      </section>

      <Card className="border-border/80 shadow-md">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base uppercase tracking-wider text-muted-foreground">
            Historial
          </CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => fetchData()} disabled={loadingData}>
            Actualizar
          </Button>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <p className="text-sm text-muted-foreground">Cargando historial…</p>
          ) : compras.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay compras registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/30 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="w-20 px-4 py-3">ID</th>
                    <th className="px-4 py-3">Proveedor</th>
                    <th className="px-4 py-3">Productos</th>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {compras.map((compra) => (
                    <tr key={compra.id} className="transition-colors hover:bg-muted/10">
                      <td className="px-4 py-3 align-top font-medium tabular-nums">#{compra.id}</td>
                      <td className="px-4 py-3 align-top">{compra.proveedor}</td>
                      <td className="px-4 py-3 align-top">
                        <ul className="space-y-1">
                          {compra.productos?.map((p, idx) => (
                            <li key={idx} className="text-xs">
                              <span className="font-medium">{p.nombre}</span>
                              <span className="ml-1 text-muted-foreground">
                                (x{p.cantidad} · {money(Number(p.precio))})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3 align-top text-muted-foreground">{compra.usuario}</td>
                      <td className="px-4 py-3 align-top whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(compra.fecha).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 align-top text-right font-semibold tabular-nums">
                        {money(Number(compra.total))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalProductosAbierto} onOpenChange={cerrarModalProductos}>
        <DialogContent className="max-h-[min(85vh,520px)] gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="border-b border-border px-6 py-4 text-left">
            <DialogTitle>Varios productos coinciden</DialogTitle>
            <DialogDescription>
              Buscaste &quot;{textoBusquedaProducto}&quot;. Elige el producto correcto.
            </DialogDescription>
          </DialogHeader>
          <ul className="max-h-[min(50vh,320px)] overflow-y-auto px-2 py-2">
            {candidatosProductos.map((p) => (
              <li key={p.id} className="border-b border-border/60 last:border-0">
                <button
                  type="button"
                  className="flex w-full flex-col gap-0.5 rounded-md px-3 py-3 text-left text-sm transition-colors hover:bg-muted/80"
                  onClick={() => agregarProductoAlCarrito(p)}
                >
                  <span className="font-medium text-foreground">{p.nombre}</span>
                  <span className="text-xs text-muted-foreground">
                    {money(Number(p.precioCompra))} · Stock: {p.stock}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <DialogFooter className="border-t border-border px-6 py-4">
            <Button type="button" variant="outline" onClick={() => cerrarModalProductos(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalNuevoProductoAbierto} onOpenChange={setModalNuevoProductoAbierto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar nuevo producto</DialogTitle>
            <DialogDescription>
              Crea un producto rápidamente para agregarlo a la compra.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nuevo-nombre">Nombre del producto</Label>
              <Input
                id="nuevo-nombre"
                value={nuevoProductoNombre}
                onChange={(e) => setNuevoProductoNombre(e.target.value)}
                placeholder="Ej. Coca Cola 600ml"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nuevo-precio">Precio de compra</Label>
              <Input
                id="nuevo-precio"
                type="number"
                step="0.01"
                value={nuevoProductoPrecio}
                onChange={(e) => setNuevoProductoPrecio(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalNuevoProductoAbierto(false)}
              disabled={creandoProducto}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleQuickCreateProduct}
              disabled={creandoProducto}
            >
              {creandoProducto ? "Guardando..." : "Crear y agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
