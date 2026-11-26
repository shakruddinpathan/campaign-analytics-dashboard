import { CheckCircle2, Info, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ToastItem, ToastVariant } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

const ICONS: Record<ToastVariant, typeof Info> = { success: CheckCircle2, info: Info, destructive: Trash2 };
const ICON_COLORS: Record<ToastVariant, string> = {
  success: 'text-emerald-500',
  info: 'text-sky-500',
  destructive: 'text-destructive',
};

/** Bottom-right stack of toasts. aria-live makes screen readers announce them. */
export function Toaster({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => {
        const Icon = ICONS[toast.variant];
        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-start gap-3 overflow-hidden rounded-lg border bg-popover p-4 text-popover-foreground shadow-lg',
              toast.leaving ? 'animate-toast-out' : 'animate-toast-in',
            )}
          >
            <Icon className={cn('mt-0.5 size-5 shrink-0', ICON_COLORS[toast.variant])} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{toast.title}</p>
              {toast.description && <p className="mt-0.5 truncate text-xs text-muted-foreground">{toast.description}</p>}
            </div>
            {toast.action && (
              <Button
                size="xs"
                variant="outline"
                onClick={() => {
                  toast.action?.onClick();
                  onDismiss(toast.id);
                }}
              >
                {toast.action.label}
              </Button>
            )}
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="rounded-sm text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Dismiss notification"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
