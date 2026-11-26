// Shared types used across the whole app. Keeping them in one place means
// a change to the data shape is caught by TypeScript everywhere at once.

export type TrafficSource = 'Google Ads' | 'Facebook' | 'Instagram' | 'Email' | 'Affiliate' | 'Organic';

/** One row of campaign performance for a single day. */
export interface CampaignRecord {
  id: string;
  date: string; // ISO format "YYYY-MM-DD" so strings sort in date order
  campaign: string;
  source: TrafficSource;
  clicks: number;
  conversions: number;
  revenue: number;
}

/** The editable fields of a row (everything except the id), used by the add/edit form. */
export type RecordInput = Omit<CampaignRecord, 'id'>;

export interface Filters {
  startDate: string;
  endDate: string;
  campaign: string; // 'All' means no campaign filter
  source: string; // 'All' means no source filter
}

export interface KpiTotals {
  clicks: number;
  conversions: number;
  revenue: number;
  conversionRate: number; // percentage, e.g. 3.25 means 3.25%
}

/** Summed metrics for one group (one campaign or one source). */
export interface GroupTotals {
  key: string;
  clicks: number;
  conversions: number;
  revenue: number;
}

/** Columns the table can be sorted by. */
export type SortKey = keyof Omit<CampaignRecord, 'id'>;
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}
