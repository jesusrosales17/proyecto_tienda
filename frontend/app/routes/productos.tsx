import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function ProductosPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Solo administrador: catálogo y existencias de productos.
        </p>
      </CardContent>
    </Card>
  );
}
