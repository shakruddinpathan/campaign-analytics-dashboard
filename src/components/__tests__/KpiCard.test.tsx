import { render, screen } from '@testing-library/react';
import KpiCard from '../KpiCard';
import KpiGrid from '../KpiGrid';

describe('KpiCard', () => {
  it('shows the label, value and hint', () => {
    render(<KpiCard label="Revenue" value="₹12L" hint="₹12,00,000" />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('₹12L')).toBeInTheDocument();
    expect(screen.getByText('₹12,00,000')).toBeInTheDocument();
  });

  it('does not render a hint when none is given', () => {
    const { container } = render(<KpiCard label="Clicks" value="100" />);
    expect(container.querySelector('p')).toBeNull();
  });
});

describe('KpiGrid', () => {
  it('renders all four KPI cards', () => {
    render(<KpiGrid kpis={{ clicks: 1000, conversions: 50, revenue: 25000, conversionRate: 5 }} />);
    ['Clicks', 'Conversions', 'Revenue', 'Conversion rate'].forEach((label) =>
      expect(screen.getByRole('group', { name: label })).toBeInTheDocument(),
    );
    expect(screen.getByText('5.00%')).toBeInTheDocument();
  });
});
