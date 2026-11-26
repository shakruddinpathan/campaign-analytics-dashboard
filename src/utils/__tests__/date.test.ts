import { isoToLocalDate, localDateToIso } from '../date';

describe('date helpers', () => {
  it('converts ISO strings to local dates and back without shifting the day', () => {
    ['2026-07-01', '2026-12-31', '2026-02-28'].forEach((iso) => {
      expect(localDateToIso(isoToLocalDate(iso))).toBe(iso);
    });
  });

  it('creates the date at local midnight', () => {
    const date = isoToLocalDate('2026-07-05');
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([2026, 6, 5, 0]);
  });
});
