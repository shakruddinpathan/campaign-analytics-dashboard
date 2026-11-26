import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { CampaignRecord, RecordInput, TrafficSource } from '@/types';

interface RecordFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = "Add" mode, a record = "Edit" mode */
  record: CampaignRecord | null;
  defaults: RecordInput;
  campaigns: readonly string[];
  sources: readonly TrafficSource[];
  minDate: string;
  maxDate: string;
  onSubmit: (input: RecordInput) => void;
}

type FormState = Record<keyof RecordInput, string>;
type FormErrors = Partial<Record<keyof RecordInput, string>>;

const toFormState = (r: RecordInput): FormState => ({
  date: r.date,
  campaign: r.campaign,
  source: r.source,
  clicks: String(r.clicks),
  conversions: String(r.conversions),
  revenue: String(r.revenue),
});

/** Returns an error message per field; an empty object means the form is valid. */
function validate(form: FormState, minDate: string, maxDate: string): FormErrors {
  const errors: FormErrors = {};
  if (!form.date) errors.date = 'Pick a date';
  else if (form.date < minDate || form.date > maxDate) errors.date = 'Date is outside the data range';

  (['clicks', 'conversions', 'revenue'] as const).forEach((key) => {
    const value = Number(form[key]);
    if (form[key].trim() === '' || !Number.isInteger(value) || value < 0) errors[key] = 'Enter a whole number ≥ 0';
  });

  if (!errors.clicks && !errors.conversions && Number(form.conversions) > Number(form.clicks)) {
    errors.conversions = 'Cannot be more than clicks';
  }
  return errors;
}

/** One dialog for both Create and Update. Invalid submit = shake animation. */
export function RecordFormDialog({
  open,
  onOpenChange,
  record,
  defaults,
  campaigns,
  sources,
  minDate,
  maxDate,
  onSubmit,
}: RecordFormDialogProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(record ?? defaults));
  const [errors, setErrors] = useState<FormErrors>({});
  const [shakeKey, setShakeKey] = useState(0);

  // Fill the form every time the dialog opens (new record or a different row).
  useEffect(() => {
    if (open) {
      setForm(toFormState(record ?? defaults));
      setErrors({});
    }
    // Only re-run when the dialog opens or the edited row changes, not on every defaults change.
  }, [open, record]);

  const isEdit = record !== null;
  const set = (key: keyof FormState) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(form, minDate, maxDate);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setShakeKey((k) => k + 1); // new key → shake animation plays again
      return;
    }
    onSubmit({
      date: form.date,
      campaign: form.campaign,
      source: form.source as TrafficSource,
      clicks: Number(form.clicks),
      conversions: Number(form.conversions),
      revenue: Number(form.revenue),
    });
    onOpenChange(false);
  };

  const field = (key: keyof FormState, label: string, input: ReactNode) => (
    <div className="grid gap-1.5">
      <Label htmlFor={`record-${key}`}>{label}</Label>
      {input}
      {errors[key] && (
        <p id={`record-${key}-error`} className="animate-in fade-in-0 slide-in-from-top-1 text-xs text-destructive">
          {errors[key]}
        </p>
      )}
    </div>
  );

  const numberInput = (key: 'clicks' | 'conversions' | 'revenue') => (
    <Input
      id={`record-${key}`}
      type="number"
      inputMode="numeric"
      min={0}
      step={1}
      value={form[key]}
      onChange={(e) => set(key)(e.target.value)}
      aria-invalid={Boolean(errors[key])}
      aria-describedby={errors[key] ? `record-${key}-error` : undefined}
    />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit row' : 'Add row'}</DialogTitle>
            <DialogDescription>
              {isEdit ? 'Update the numbers for this day.' : 'Add one day of campaign performance.'} KPIs and charts
              update instantly.
            </DialogDescription>
          </DialogHeader>

          <div key={shakeKey} className={cn('grid gap-4 sm:grid-cols-2', shakeKey > 0 && 'animate-shake')}>
            {field(
              'date',
              'Date',
              <Input
                id="record-date"
                type="date"
                min={minDate}
                max={maxDate}
                value={form.date}
                onChange={(e) => set('date')(e.target.value)}
                aria-invalid={Boolean(errors.date)}
              />,
            )}
            {field(
              'campaign',
              'Campaign',
              <Select value={form.campaign} onValueChange={set('campaign')}>
                <SelectTrigger id="record-campaign" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>,
            )}
            {field(
              'source',
              'Source',
              <Select value={form.source} onValueChange={set('source')}>
                <SelectTrigger id="record-source" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>,
            )}
            {field('clicks', 'Clicks', numberInput('clicks'))}
            {field('conversions', 'Conversions', numberInput('conversions'))}
            {field('revenue', 'Revenue (₹)', numberInput('revenue'))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? 'Save changes' : 'Add row'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
