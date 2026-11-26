import { ChartColumnBig, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Theme } from '@/hooks/useTheme';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  const isDark = theme === 'dark';

  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ChartColumnBig className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Campaign Analytics</h1>
          <p className="text-sm text-muted-foreground">Performance of marketing campaigns across traffic sources</p>
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={onToggleTheme}
        // aria-label describes the ACTION, so screen readers say what will happen.
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun /> : <Moon />}
      </Button>
    </header>
  );
}
