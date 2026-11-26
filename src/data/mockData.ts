import type { CampaignRecord, TrafficSource } from '../types';

export const CAMPAIGNS = [
  'Diwali Mega Sale',
  'Summer Fitness App',
  'Fintech Signup Drive',
  'Gaming Install Push',
  'Edtech Free Trial',
  'Fashion Flash Sale',
  'Travel Weekend Deals',
  'Food Delivery Promo',
] as const;

export const SOURCES: TrafficSource[] = ['Google Ads', 'Facebook', 'Instagram', 'Email', 'Affiliate', 'Organic'];

/**
 * Small seeded random number generator (mulberry32).
 * Why not Math.random()? A fixed seed gives the SAME data on every reload,
 * so screenshots, tests and demos always match.
 */
function createRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Formats a Date as "YYYY-MM-DD" in UTC, so time zones never shift the day. */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Generates realistic daily rows: every campaign gets traffic from a few
 * sources each day. Different sources have different conversion rates, like
 * real ad platforms (email converts better than display ads, for example).
 */
export function generateMockData(days = 120, seed = 42): CampaignRecord[] {
  const random = createRandom(seed);
  const conversionRateBySource: Record<TrafficSource, number> = {
    'Google Ads': 0.045,
    Facebook: 0.028,
    Instagram: 0.024,
    Email: 0.06,
    Affiliate: 0.035,
    Organic: 0.05,
  };

  const records: CampaignRecord[] = [];
  const start = new Date(Date.UTC(2026, 6, 1)); // 1 July 2026

  for (let day = 0; day < days; day++) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + day);
    const isoDate = toIsoDate(date);
    // Weekends get a bit more traffic, which makes the charts look natural.
    const weekendBoost = [0, 6].includes(date.getUTCDay()) ? 1.25 : 1;

    CAMPAIGNS.forEach((campaign, campaignIndex) => {
      SOURCES.forEach((source) => {
        // Skip some source/campaign pairs so not every campaign runs everywhere.
        if (random() < 0.45) return;

        const clicks = Math.round((200 + random() * 1800) * weekendBoost);
        const rate = conversionRateBySource[source] * (0.7 + random() * 0.6);
        const conversions = Math.round(clicks * rate);
        const averageOrderValue = 300 + campaignIndex * 120 + random() * 400;

        records.push({
          id: `${isoDate}-${campaignIndex}-${source}`,
          date: isoDate,
          campaign,
          source,
          clicks,
          conversions,
          revenue: Math.round(conversions * averageOrderValue),
        });
      });
    });
  }

  return records;
}

/**
 * The dataset is generated once when this module loads. It is already sorted
 * by date, which the binary-search date filter depends on.
 */
export const MOCK_DATA: CampaignRecord[] = generateMockData();
