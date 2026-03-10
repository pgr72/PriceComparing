'use client';

import { useState, useMemo, useCallback } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { fetchPriceHistory } from '@/app/actions/prices';

interface Good {
  id: string;
  name: string;
  unit: string;
  category: string;
}

interface PriceHistoryEntry {
  id: string;
  price: number;
  date: string;
  store: { name: string; location: string };
  currency: { code: string; symbol: string };
}

interface ChartDataPoint {
  date: string;
  rawDate: string;
  [storeName: string]: number | string;
}

interface PriceHistoryChartProps {
  goods: Good[];
}

function CustomXAxisTick({ x, y, payload, chartData }: any) {
  const rawDate = payload.value; // rawDate is now the dataKey
  const index = chartData.findIndex((d: ChartDataPoint) => d.rawDate === rawDate);
  const currentYear = rawDate?.substring(0, 4) || '';
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit' })
    : '';

  // Show year only if it's the first data point or the year changed from the previous visible tick
  let showYear = false;
  if (currentYear && index >= 0) {
    if (index === 0) {
      showYear = true;
    } else {
      const prevYear = chartData[index - 1]?.rawDate?.substring(0, 4);
      if (prevYear !== currentYear) {
        showYear = true;
      }
    }
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fontSize={12} fill="#666">
        {formattedDate}
      </text>
      {showYear && (
        <text x={0} y={0} dy={30} textAnchor="middle" fontSize={11} fill="#999">
          {currentYear}
        </text>
      )}
    </g>
  );
}

const STORE_COLORS = [
  '#16a34a', '#2563eb', '#dc2626', '#9333ea',
  '#ea580c', '#0891b2', '#ca8a04', '#e11d48',
];

type TimePeriod = '30d' | '3m' | '6m' | '1y' | 'all' | 'custom';

const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
  '30d': '30 dager',
  '3m': '3 mnd',
  '6m': '6 mnd',
  '1y': '1 \u00e5r',
  'all': 'Alt',
  'custom': 'Egendefinert',
};

function getStartDate(period: TimePeriod): string {
  const now = new Date();
  switch (period) {
    case '30d': now.setDate(now.getDate() - 30); break;
    case '3m': now.setMonth(now.getMonth() - 3); break;
    case '6m': now.setMonth(now.getMonth() - 6); break;
    case '1y': now.setFullYear(now.getFullYear() - 1); break;
    case 'all': return '2000-01-01';
    default: now.setMonth(now.getMonth() - 3);
  }
  return now.toISOString().split('T')[0];
}

function transformDataForChart(prices: PriceHistoryEntry[]) {
  const storeNamesSet = new Set<string>();
  const dateMap = new Map<string, Record<string, number>>();
  let currencySymbol = 'kr';

  for (const entry of prices) {
    const storeName = entry.store.name;
    storeNamesSet.add(storeName);
    currencySymbol = entry.currency.symbol;

    if (!dateMap.has(entry.date)) {
      dateMap.set(entry.date, {});
    }
    dateMap.get(entry.date)![storeName] = Number(entry.price);
  }

  const storeNames = Array.from(storeNamesSet);
  const sortedDates = Array.from(dateMap.keys()).sort();

  const chartData: ChartDataPoint[] = sortedDates.map((date) => {
    const point: ChartDataPoint = {
      date: new Date(date).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit' }),
      rawDate: date,
    };
    const storesForDate = dateMap.get(date)!;
    for (const store of storeNames) {
      if (storesForDate[store] !== undefined) {
        point[store] = storesForDate[store];
      }
    }
    return point;
  });

  // Add an empty data point one day after the last date for padding
  if (sortedDates.length > 0) {
    const lastDate = new Date(sortedDates[sortedDates.length - 1]);
    lastDate.setDate(lastDate.getDate() + 1);
    const paddingDate = lastDate.toISOString().split('T')[0];
    chartData.push({
      date: lastDate.toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit' }),
      rawDate: paddingDate,
    });
  }

  return { chartData, storeNames, currencySymbol };
}

export default function PriceHistoryChart({ goods }: PriceHistoryChartProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGood, setSelectedGood] = useState<Good | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [timePeriod, setTimePeriod] = useState<TimePeriod>('3m');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState(new Date().toISOString().split('T')[0]);

  const [priceData, setPriceData] = useState<PriceHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredGoods = useMemo(() => {
    if (!searchQuery.trim()) return goods;
    const query = searchQuery.toLowerCase().trim();
    return goods.filter(
      (g) => g.name.toLowerCase().includes(query) || g.category?.toLowerCase().includes(query)
    );
  }, [searchQuery, goods]);

  const { chartData, storeNames, currencySymbol } = useMemo(
    () => transformDataForChart(priceData),
    [priceData]
  );

  const loadPriceHistory = useCallback(
    async (good: Good, period: TimePeriod, custStart?: string, custEnd?: string) => {
      setIsLoading(true);
      setError(null);

      const endDate = custEnd || new Date().toISOString().split('T')[0];
      const startDate = period === 'custom'
        ? (custStart || getStartDate('3m'))
        : getStartDate(period);

      const result = await fetchPriceHistory(good.id, startDate, endDate);

      if (result.error) {
        setError(result.error);
        setPriceData([]);
      } else {
        setPriceData((result.data as PriceHistoryEntry[]) || []);
      }

      setIsLoading(false);
    },
    []
  );

  const handleSelectGood = (good: Good) => {
    setSelectedGood(good);
    setSearchQuery(good.name);
    setShowDropdown(false);
    loadPriceHistory(good, timePeriod);
  };

  const handleTimePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);
    if (selectedGood && period !== 'custom') {
      loadPriceHistory(selectedGood, period);
    }
  };

  const handleCustomDateSearch = () => {
    if (selectedGood && customStart && customEnd) {
      loadPriceHistory(selectedGood, 'custom', customStart, customEnd);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const formattedLabel = label
      ? new Date(label).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : label;
    return (
      <div className="bg-white border rounded-lg shadow-lg p-3">
        <p className="font-medium text-sm mb-1">{formattedLabel}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {currencySymbol} {Number(entry.value).toLocaleString('nb-NO')}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Produktsøk */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Velg produkt</CardTitle>
          <CardDescription>
            Søk etter et produkt for å se prisutviklingen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Søk etter produkt..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
                if (!e.target.value.trim()) {
                  setSelectedGood(null);
                }
              }}
              onFocus={() => { if (!selectedGood) setShowDropdown(true); }}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGood(null);
                  setPriceData([]);
                  setShowDropdown(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Tilbakestill søk"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {showDropdown && searchQuery.trim() && !selectedGood && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredGoods.length > 0 ? (
                  filteredGoods.map((good) => (
                    <button
                      key={good.id}
                      onClick={() => handleSelectGood(good)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <p className="font-medium">{good.name}</p>
                      <p className="text-sm text-gray-500">
                        {good.category} · per {good.unit}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="px-4 py-3 text-gray-500 text-sm">
                    Ingen produkter funnet
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tidsperiode */}
      {selectedGood && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Tidsperiode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(TIME_PERIOD_LABELS) as [TimePeriod, string][]).map(
                ([period, label]) => (
                  <Button
                    key={period}
                    variant={timePeriod === period ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTimePeriodChange(period)}
                  >
                    {label}
                  </Button>
                )
              )}
            </div>

            {timePeriod === 'custom' && (
              <div className="flex flex-wrap items-end gap-4 mt-4">
                <div>
                  <Label htmlFor="start-date">Fra dato</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">Til dato</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                  />
                </div>
                <Button onClick={handleCustomDateSearch}>Vis</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Diagram */}
      {selectedGood && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Prisutvikling for {selectedGood.name}
            </CardTitle>
            <CardDescription>
              Pris per {selectedGood.unit} i ulike butikker
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Laster prisdata...</p>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-red-500">Feil ved lasting av data: {error}</p>
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">
                  Ingen prisdata funnet for denne perioden.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="rawDate"
                    tick={<CustomXAxisTick chartData={chartData} />}
                    interval="preserveStartEnd"
                    height={50}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${currencySymbol} ${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {storeNames.map((storeName, index) => (
                    <Line
                      key={storeName}
                      type="monotone"
                      dataKey={storeName}
                      stroke={STORE_COLORS[index % STORE_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Placeholder når ingen produkt er valgt */}
      {!selectedGood && (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Velg et produkt ovenfor for å se prishistorikk
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
