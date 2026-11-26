import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { isoToLocalDate, localDateToIso } from '@/utils/date';
import { formatDate } from '@/utils/format';

interface DateRangePickerProps {
  id?: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;
  minDate: string;
  maxDate: string;
  onChange: (startDate: string, endDate: string) => void;
}

/**
 * shadcn date range picker: a Button that opens a Popover with a 2-month
 * Calendar. The parent only deals with ISO strings; the Date conversion
 * stays inside this component.
 */
export function DateRangePicker({ id, startDate, endDate, minDate, maxDate, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  // While the user is picking, the range may have only a start date.
  // We keep that half-finished range locally and only send complete ranges up.
  const [draft, setDraft] = useState<DateRange | undefined>();
  const selected: DateRange = draft ?? { from: isoToLocalDate(startDate), to: isoToLocalDate(endDate) };

  const handleSelect = (range: DateRange | undefined, clickedDay: Date) => {
    // First click: always start a NEW range from the clicked day, instead of
    // stretching the old range (which would finish the selection in one click).
    if (!draft) {
      setDraft({ from: clickedDay, to: undefined });
      return;
    }

    setDraft(range);
    if (range?.from && range.to) {
      onChange(localDateToIso(range.from), localDateToIso(range.to));
      setDraft(undefined);
      setOpen(false);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) setDraft(undefined); // closing without finishing = cancel
      }}
    >
      <PopoverTrigger asChild>
        <Button id={id} variant="outline" className="w-full justify-start font-normal">
          <CalendarIcon className="text-muted-foreground" />
          {formatDate(startDate)} – {formatDate(endDate)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          numberOfMonths={2}
          defaultMonth={selected.from}
          selected={selected}
          onSelect={handleSelect}
          // Days outside the data can't be picked.
          disabled={{ before: isoToLocalDate(minDate), after: isoToLocalDate(maxDate) }}
          startMonth={isoToLocalDate(minDate)}
          endMonth={isoToLocalDate(maxDate)}
        />
      </PopoverContent>
    </Popover>
  );
}
