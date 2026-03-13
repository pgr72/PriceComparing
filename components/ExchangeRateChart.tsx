'use client';

import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getExchangeRateHistory } from '@/app/actions/exchange-rates';

interface ChartDataPoint {
  date: string;
  rawDate: string;
  rate: number;
}

type TimePeriod = '30d' | '90d' | '365d';

const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
  '30d': '30 dager',
  '90d': '3 mnd',
  '365d': '1 år',
};

const TIME_PERIOD_DAYS: Record<TimePeriod, number> = {
  '30d': 30,
  '90d': 90,
  '365d': 365,
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const formattedDate = label
    ? new Date(label).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : label;
  return (
    <div className="bg-white border rounded-lg shadow-lg p-3">
      <p className="font-medium text-sm mb-1">{formattedDate}</p>
      <p className="text-sm text-blue-600">
        SEK/NOK: {Number(payload[0].value).toLocaleString('nb-NO', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
      </p>
    </div>
  );
}

export default function ExchangeRateChart() {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('90d');

  useEffect(() => {
    setIsLoading(true);
    getExchangeRateHistory(TIME_PERIOD_DAYS[timePeriod]).then((result) => {
      const chartData = (result.data || []).map((entry) => ({
        date: new Date(entry.date).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit' }),
        rawDate: entry.date,
        rate: entry.rate,
      }));
      setData(chartData);
      setIsLoading(false);
    });
  }, [timePeriod]);

  const latestRate = data.length > 0 ? data[data.length - 1] : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Valutakurs SEK/NOK
            </CardTitle>
            <CardDescription>
              Historisk utvikling fra Norges Bank
              {latestRate && (
                <span className="ml-2 font-medium text-blue-700">
                  — Siste kurs: {latestRate.rate.toLocaleString('nb-NO', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                  {' '}({new Date(latestRate.rawDate).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' })})
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {(Object.entries(TIME_PERIOD_LABELS) as [TimePeriod, string][]).map(
              ([period, label]) => (
                <Button
                  key={period}
                  variant={timePeriod === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimePeriod(period)}
                >
                  {label}
                </Button>
              )
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Laster kursdata...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">
              Ingen kursdata funnet. Kurser lagres automatisk ved besøk på forsiden.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="rawDate"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit' })
                }
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                domain={['auto', 'auto']}
                tickFormatter={(value) => value.toFixed(2)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#1e40af"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
