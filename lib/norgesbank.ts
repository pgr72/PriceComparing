interface ExchangeRateResult {
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
