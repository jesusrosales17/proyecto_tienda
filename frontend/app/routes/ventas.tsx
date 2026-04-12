import { useEffect, useMemo, useState } from "react";
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

type Producto = {
  id: number;
  nombre: string;
  precioVenta: number;
  stock: number;
};

type CartLine = {
  key: string;
  productoId: number;
  nombre: string;
  precioVenta: number;
  stock: number;
  cantidad: number;
  incluido: boolean;
};

type VentaProducto = {
  nombre: string;
  cantidad: number;
  precio: number;
};

type VentaRegistro = {
  id: number;
  cliente: string;
  total: number;
  fecha: string;
  vendedor: string;
  productos: VentaProducto[];
};

const money = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

const newLineKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `line-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function VentasPage() {
  const [cliente, setCliente] = useState("");
  const [clientesHistoricos, setClientesHistoricos] = useState<string[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<VentaRegistro[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [modalProductosAbierto, setModalProductosAbierto] = useState(false);
  const [candidatosProductos, setCandidatosProductos] = useState<Producto[]>([]);
  const [textoBusquedaProducto, setTextoBusquedaProducto] = useState("");

  const productMap = useMemo(() => new Map(productos.map((p) => [p.id, p])), [productos]);

  const total = useMemo(() => {
    return cart.reduce((acc, line) => {
      if (!line.incluido) return acc;
      return acc + Number(line.precioVenta) * Number(line.cantidad || 0);
    }, 0);
  }, [cart]);

  const fetchData = async () => {
    setLoadingData(true);
    const base = import.meta.env.VITE_BACKEND_URL;
    try {
      const [productsRes, salesRes, clientesRes] = await Promise.all([
        fetch(`${base}/ventas/productos`, { credentials: "include" }),
        fetch(`${base}/ventas`, { credentials: "include" }),
        fetch(`${base}/ventas/clientes`, { credentials: "include" }),
      ]);

      if (!productsRes.ok || !salesRes.ok || !clientesRes.ok) {
        throw new Error("No se pudieron cargar los datos");
      }

      setProductos((await productsRes.json()) as Producto[]);
      setVentas((await salesRes.json()) as VentaRegistro[]);
      setClientesHistoricos((await clientesRes.json()) as string[]);
    } catch {
      toast.error("No se pudo cargar información del módulo de ventas");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const syncCartStockFromCatalog = (catalog: Producto[]) => {
    const map = new Map(catalog.map((p) => [p.id, p]));
    setCart((lines) =>
      lines.map((line) => {
        const p = map.get(line.productoId);
        if (!p) return line;
        return {
          ...line,
          stock: p.stock,
          precioVenta: p.precioVenta,
          cantidad: Math.min(line.cantidad, Math.max(1, p.stock)),
        };
      })
    );
  };

  useEffect(() => {
    if (productos.length > 0) syncCartStockFromCatalog(productos);
  }, [productos]);

  const agregarProductoAlCarrito = (chosen: Producto) => {
    if (chosen.stock < 1) {
      toast.error("Sin stock de ese producto");
      return;
    }

    setCart((prev) => [
      ...prev,
      {
        key: newLineKey(),
        productoId: chosen.id,
        nombre: chosen.nombre,
        precioVenta: Number(chosen.precioVenta),
        stock: chosen.stock,
        cantidad: 1,
        incluido: true,
      },
    ]);
    setBusqueda("");
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
    const clamped = Math.max(1, Math.min(Math.floor(next), line.stock));
    if (next > line.stock) {
      toast.error(`Máximo disponible: ${line.stock}`);
    }
    updateLine(line.key, { cantidad: clamped });
  };

  const removeLine = (key: string) => {
    setCart((current) => current.filter((l) => l.key !== key));
  };

  const resetForm = () => {
    setCliente("");
    setCart([]);
    setBusqueda("");
    setModalProductosAbierto(false);
    setCandidatosProductos([]);
    setTextoBusquedaProducto("");
  };

  const payloadParaRegistrar = (): { productoId: number; cantidad: number }[] => {
    const included = cart.filter((l) => l.incluido);
    const byId = new Map<number, number>();
    for (const line of included) {
      byId.set(line.productoId, (byId.get(line.productoId) ?? 0) + line.cantidad);
    }
    return [...byId.entries()].map(([productoId, cantidad]) => ({ productoId, cantidad }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!cliente.trim()) {
      toast.error("Ingresa el nombre del cliente");
      return;
    }

    const items = payloadParaRegistrar();
    if (items.length === 0) {
      toast.error("Agrega al menos un producto incluido en la venta");
      return;
    }

    for (const item of items) {
      const product = productMap.get(item.productoId);
      if (!product) {
        toast.error("Hay productos inválidos en la venta");
        return;
      }
      if (item.cantidad > product.stock) {
        toast.error(`Stock insuficiente para ${product.nombre}. Disponible: ${product.stock}`);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ventas`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: cliente.trim(),
          productos: items,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.error || "No se pudo registrar la venta");
        return;
      }

      toast.success("Venta registrada correctamente");
      resetForm();
      await fetchData();
    } catch {
      toast.error("Ocurrió un error inesperado al registrar la venta");
    } finally {
      setLoading(false);
    }
  };

  const inputPos =
    "h-10 rounded-lg border border-input bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 outline-none";

  return (
    <div className="flex flex-col gap-6">
      <section
        className={cn(
          "overflow-hidden rounded-xl border border-border bg-white text-foreground shadow-sm"
        )}
      >
        <form onSubmit={onSubmit} className="space-y-5 p-5">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground" htmlFor="ventas-cliente">
              Cliente
            </Label>
            <Input
              id="ventas-cliente"
              className={cn(inputPos)}
              list="ventas-clientes-historicos"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Nombre del cliente"
              disabled={loadingData}
              autoComplete="off"
            />
            <datalist id="ventas-clientes-historicos">
              {clientesHistoricos.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Buscar producto</Label>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className={cn(inputPos, "pl-9")}
                  placeholder="Buscar producto..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      agregarProductoBusqueda();
                    }
                  }}
                  disabled={loadingData}
                />
              </div>
              <Button
                type="button"
                className="shrink-0"
                onClick={agregarProductoBusqueda}
                disabled={loadingData}
              >
                Buscar
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="w-10 px-2 py-2.5" />
                  <th className="px-2 py-2.5">Producto</th>
                  <th className="w-24 px-2 py-2.5">Precio</th>
                  <th className="w-36 px-2 py-2.5 text-center">Cantidad</th>
                  <th className="w-28 px-2 py-2.5 text-right">Subtotal</th>
                  <th className="w-12 px-1 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      Agrega productos con la búsqueda. Solo las filas marcadas se incluyen en la venta.
                    </td>
                  </tr>
                ) : (
                  cart.map((line) => {
                    const sub = line.incluido
                      ? Number(line.precioVenta) * line.cantidad
                      : 0;
                    return (
                      <tr key={line.key} className="bg-background">
                        <td className="px-2 py-2 align-middle">
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
                          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                            Stock: {line.stock}
                          </span>
                        </td>
                        <td className="px-2 py-2 align-middle text-muted-foreground">
                          {money(line.precioVenta)}
                        </td>
                        <td className="px-2 py-2 align-middle">
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
                              disabled={line.cantidad >= line.stock}
                            >
                              <Plus className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                        <td className="px-2 py-2 align-middle text-right font-medium tabular-nums text-foreground">
                          {money(sub)}
                        </td>
                        <td className="px-1 py-2 align-middle">
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

          <div className="flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg font-semibold tabular-nums text-foreground">
              Total: {money(total)}
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || loadingData}
              >
                {loading ? "Registrando..." : "Registrar venta"}
              </Button>
            </div>
          </div>
        </form>
      </section>

      <Card className="border-border/80 shadow-md">
        <CardHeader>
          <CardTitle className="text-base uppercase tracking-wider text-muted-foreground">Historial</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <p className="text-sm text-muted-foreground">Cargando ventas...</p>
          ) : ventas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay ventas registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/30 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 w-20">ID</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Productos</th>
                    <th className="px-4 py-3">Vendedor</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ventas.map((venta) => (
                    <tr key={venta.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3 font-medium tabular-nums align-top">#{venta.id}</td>
                      <td className="px-4 py-3 align-top">{venta.cliente}</td>
                      <td className="px-4 py-3 align-top">
                        <ul className="space-y-1">
                          {venta.productos?.map((p, idx) => (
                            <li key={idx} className="text-xs">
                              <span className="font-medium">{p.nombre}</span>
                              <span className="text-muted-foreground ml-1">
                                (x{p.cantidad} · {money(Number(p.precio))})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground align-top">{venta.vendedor}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap align-top text-xs">
                        {new Date(venta.fecha).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums align-top">
                        {money(Number(venta.total))}
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
                    {money(Number(p.precioVenta))} · Stock: {p.stock}
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
    </div>
  );
}
