import { createAdminClient } from '@/lib/supabase/server';

export interface ExchangeRateResult {
  rate: number;
  date: string;
  baseCurrency: string;
  quoteCurrency: string;
}

export interface ExchangeRateHistoryEntry {
  rate: number;
  date: string;
  baseCurrency: string;
  quoteCurrency: string;
}

export async function fetchLatestSEKRate(): Promise<ExchangeRateResult | null> {
  try {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const startPeriod = oneMonthAgo.toISOString().split('T')[0];
    const endPeriod = today.toISOString().split('T')[0];

    const url = `https://data.norges-bank.no/api/data/EXR/B.SEK.NOK.SP?format=sdmx-json&startPeriod=${startPeriod}&endPeriod=${endPeriod}&locale=no`;

    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      console.error('Norges Bank API error:', res.status);
      return null;
    }

    const json = await res.json();

    // Navigate the SDMX-JSON structure safely
    const dataSets = json?.data?.dataSets ?? json?.dataSets;
    const structure = json?.data?.structure ?? json?.structure;

    if (!dataSets?.[0] || !structure) {
      console.error('Norges Bank API: unexpected response structure');
      return null;
    }

    const series = dataSets[0].series['0:0:0:0'];
    if (!series) {
      console.error('No series found in dataSets');
      return null;
    }

    const observations = series.observations;
    const timePeriods = structure.dimensions?.observation?.[0]?.values;

    if (!timePeriods || timePeriods.length === 0) {
      return null;
    }

    // Find the last observation index
    const lastIndex = String(timePeriods.length - 1);
    const lastValue = observations[lastIndex]?.[0];
    const lastDate = timePeriods[timePeriods.length - 1]?.id;

    if (lastValue === undefined || !lastDate) {
      return null;
    }

    return {
      rate: Number(lastValue),
      date: lastDate,
      baseCurrency: 'SEK',
      quoteCurrency: 'NOK',
    };
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return null;
  }
}

export async function fetchAndStoreLatestSEKRate(): Promise<ExchangeRateResult | null> {
  const result = await fetchLatestSEKRate();
  if (!result) return null;

  try {
    const supabase = createAdminClient();
    await supabase
      .from('exchange_rates')
      .upsert(
        {
          base_currency: result.baseCurrency,
          quote_currency: result.quoteCurrency,
          rate: result.rate,
          rate_date: result.date,
          source: 'norges_bank',
        },
        { onConflict: 'base_currency,quote_currency,rate_date' }
      );
  } catch (error) {
    console.error('Error storing exchange rate:', error);
  }

  return result;
}

export async function fetchSEKRateHistory(
  days: number = 30
): Promise<ExchangeRateHistoryEntry[]> {
  try {
    const supabase = createAdminClient();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('exchange_rates')
      .select('rate, rate_date, base_currency, quote_currency')
      .eq('base_currency', 'SEK')
      .eq('quote_currency', 'NOK')
      .gte('rate_date', startDate.toISOString().split('T')[0])
      .order('rate_date', { ascending: true });

    if (error || !data) return [];

    return data.map((row: { rate: number; rate_date: string; base_currency: string; quote_currency: string }) => ({
      rate: Number(row.rate),
      date: row.rate_date,
      baseCurrency: row.base_currency,
      quoteCurrency: row.quote_currency,
    }));
  } catch {
    return [];
  }
}

export async function backfillSEKRates(): Promise<number> {
  try {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const url = `https://data.norges-bank.no/api/data/EXR/B.SEK.NOK.SP?format=sdmx-json&startPeriod=${oneYearAgo.toISOString().split('T')[0]}&endPeriod=${today.toISOString().split('T')[0]}&locale=no`;

    const res = await fetch(url);
    if (!res.ok) return 0;

    const json = await res.json();
    const dataSets = json?.data?.dataSets ?? json?.dataSets;
    const structure = json?.data?.structure ?? json?.structure;
    if (!dataSets?.[0] || !structure) return 0;

    const series = dataSets[0].series['0:0:0:0'];
    if (!series) return 0;

    const observations = series.observations;
    const timePeriods = structure.dimensions?.observation?.[0]?.values;
    if (!timePeriods) return 0;

    const rows = timePeriods
      .map((tp: { id: string }, index: number) => {
        const value = observations[String(index)]?.[0];
        if (value === undefined || !tp.id) return null;
        return {
          base_currency: 'SEK',
          quote_currency: 'NOK',
          rate: Number(value),
          rate_date: tp.id,
          source: 'norges_bank',
        };
      })
      .filter(Boolean);

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('exchange_rates')
      .upsert(rows, { onConflict: 'base_currency,quote_currency,rate_date' });

    return error ? 0 : rows.length;
  } catch (error) {
    console.error('Error backfilling exchange rates:', error);
    return 0;
  }
}
