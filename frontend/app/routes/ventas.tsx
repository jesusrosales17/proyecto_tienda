import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function VentasPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Módulo de ventas listo para implementar lógica y tabla de registros.
        </p>
      </CardContent>
    </Card>
  );
}
