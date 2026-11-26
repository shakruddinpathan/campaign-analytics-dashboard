import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
}

/** One metric box, e.g. "Revenue ₹13.9Cr", built on the shadcn Card. */
function KpiCard({ label, value, hint, icon: Icon }: KpiCardProps) {
  return (
    // role="group" + aria-label lets screen readers announce the card as one unit.
    <Card role="group" aria-label={label} className="gap-2 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardDescription className="font-medium">{label}</CardDescription>
        {Icon && <Icon className="size-4 text-muted-foreground" aria-hidden="true" />}
      </CardHeader>
      <CardContent>
        {/* key = value + hint: when the number changes (filter, add, edit, delete) the
            title re-mounts and plays a small "pop" animation. */}
        <CardTitle key={`${value}|${hint ?? ''}`} className="animate-kpi-pop text-2xl font-bold tabular-nums sm:text-3xl">
          {value}
        </CardTitle>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export default memo(KpiCard);
