import { memo } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Filters } from '@/types';
import { DateRangePicker } from './DateRangePicker';

interface FilterBarProps {
  filters: Filters;
  campaigns: readonly string[];
  sources: readonly string[];
  minDate: string;
  maxDate: string;
  onChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onReset: () => void;
}

/** Label + shadcn Select, reused for the campaign and source filters. */
function SelectField(props: { id: string; label: string; value: string; options: readonly string[]; onChange: (v: string) => void }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={props.id}>{props.label}</Label>
      <Select value={props.value} onValueChange={props.onChange}>
        <SelectTrigger id={props.id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All {props.label.toLowerCase()}s</SelectItem>
          {props.options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Date range + campaign + source filters, built from shadcn/ui components. */
function FilterBar({ filters, campaigns, sources, minDate, maxDate, onChange, onReset }: FilterBarProps) {
  return (
    <Card aria-label="Filters" className="py-5">
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end">
        <div className="grid gap-2 sm:col-span-2 lg:col-span-1">
          <Label htmlFor="date-range">Date range</Label>
          <DateRangePicker
            id="date-range"
            startDate={filters.startDate}
            endDate={filters.endDate}
            minDate={minDate}
            maxDate={maxDate}
            onChange={(start, end) => {
              onChange('startDate', start);
              onChange('endDate', end);
            }}
          />
        </div>

        <SelectField
          id="campaign"
          label="Campaign"
          value={filters.campaign}
          options={campaigns}
          onChange={(v) => onChange('campaign', v)}
        />
        <SelectField id="source" label="Source" value={filters.source} options={sources} onChange={(v) => onChange('source', v)} />

        <Button variant="outline" onClick={onReset} className="sm:col-span-2 lg:col-span-1">
          <RotateCcw />
          Reset
        </Button>
      </CardContent>
    </Card>
  );
}

export default memo(FilterBar);
