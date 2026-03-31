import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function ComprasPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compras</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Solo administrador: gestiona órdenes de compra y proveedores.
        </p>
      </CardContent>
    </Card>
  );
}
