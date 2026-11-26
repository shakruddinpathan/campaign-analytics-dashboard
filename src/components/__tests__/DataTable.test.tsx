import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { generateMockData } from '../../data/mockData';
import DataTable from '../DataTable';

const data = generateMockData(10, 3);

describe('DataTable', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('shows only one page of rows (25 by default)', () => {
    render(<DataTable records={data} />);
    // +1 for the header row
    expect(screen.getAllByRole('row')).toHaveLength(26);
  });

  it('filters rows after the debounce delay', () => {
    render(<DataTable records={data} />);
    fireEvent.change(screen.getByLabelText('Search table'), { target: { value: 'no-such-campaign' } });

    // Before 300 ms the old rows are still visible.
    expect(screen.queryByText('No rows match your search or filters.')).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(screen.getByText('No rows match your search or filters.')).toBeInTheDocument();
  });

  it('sorts by clicks when the column header is clicked', () => {
    render(<DataTable records={data} />);
    fireEvent.click(screen.getByRole('button', { name: /Clicks/ }));

    const firstDataRow = screen.getAllByRole('row')[1];
    const minClicks = Math.min(...data.map((r) => r.clicks));
    expect(within(firstDataRow).getByText(minClicks.toLocaleString('en-IN'))).toBeInTheDocument();
  });
});
