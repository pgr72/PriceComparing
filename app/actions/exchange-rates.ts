'use server';

import { fetchSEKRateHistory, fetchAndStoreLatestSEKRate } from '@/lib/norgesbank';

export async function getExchangeRateHistory(days: number = 30) {
  const history = await fetchSEKRateHistory(days);
  return { data: history, error: null };
}

export async function getLatestExchangeRate() {
  const result = await fetchAndStoreLatestSEKRate();
  if (!result) {
    return { data: null, error: 'Failed to fetch rate' };
  }
  return { data: result, error: null };
}
