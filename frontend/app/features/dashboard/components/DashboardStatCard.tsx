import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type DashboardStatCardProps = {
  title: string;
  value: string | number;
  helper?: string;
};

export const DashboardStatCard = ({ title, value, helper }: DashboardStatCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        {helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}
      </CardContent>
    </Card>
  );
};
