import { Suspense, type ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

/**
 * shadcn Card wrapper for every chart. It also owns the <Suspense> boundary,
 * so each lazy-loaded chart shows a Skeleton while it downloads, without
 * blocking the rest of the page.
 */
export function ChartCard({ title, subtitle, children, className }: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Skeleton className="h-80 w-full" aria-label="Loading chart" />}>{children}</Suspense>
      </CardContent>
    </Card>
  );
}
