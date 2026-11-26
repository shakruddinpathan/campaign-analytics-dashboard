import type { CampaignRecord } from '../../types';
import { escapeCsvValue, toCsv } from '../csv';

describe('escapeCsvValue', () => {
  it('leaves simple values unchanged', () => {
    expect(escapeCsvValue('Email')).toBe('Email');
    expect(escapeCsvValue(42)).toBe('42');
  });

  it('quotes values with commas and doubles inner quotes', () => {
    expect(escapeCsvValue('Sale, Big')).toBe('"Sale, Big"');
    expect(escapeCsvValue('The "Best" Sale')).toBe('"The ""Best"" Sale"');
  });
});

describe('toCsv', () => {
  it('creates a header row and one line per record', () => {
    const record: CampaignRecord = {
      id: '1',
      date: '2026-07-01',
      campaign: 'Diwali, Mega Sale',
      source: 'Email',
      clicks: 200,
      conversions: 10,
      revenue: 5000,
    };
    const lines = toCsv([record]).split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('Date,Campaign,Source');
    expect(lines[1]).toBe('2026-07-01,"Diwali, Mega Sale",Email,200,10,5000,5.00');
  });
});
