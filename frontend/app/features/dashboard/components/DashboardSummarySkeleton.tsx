import { Card, CardContent, CardHeader } from "~/components/ui/card";

type DashboardSummarySkeletonProps = {
  cards: number;
};

export const DashboardSummarySkeleton = ({ cards }: DashboardSummarySkeletonProps) => {
  return (
    <section className={`grid gap-4 sm:grid-cols-2 ${cards === 4 ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>
      {Array.from({ length: cards }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-9 w-20 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-24 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </section>
  );
};
