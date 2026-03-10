'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PriceEntry {
  id: string;
  price: number;
  date: string;
  good: { name: string; unit: string; category: string };
  store: { name: string; location: string };
  currency: { code: string; symbol: string };
}

interface GroupedProduct {
  good: { name: string; unit: string; category: string };
  prices: PriceEntry[];
}

interface PriceListSearchProps {
  groupedPrices: Record<string, GroupedProduct>;
}

export default function PriceListSearch({ groupedPrices }: PriceListSearchProps) {
  const [productQuery, setProductQuery] = useState('');
  const [storeQuery, setStoreQuery] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');

  const allEntries = useMemo(() => Object.entries(groupedPrices), [groupedPrices]);

  const hasActiveFilter = productQuery.trim() || storeQuery.trim() || categoryQuery.trim();

  const filteredEntries = useMemo(() => {
    if (!hasActiveFilter) return allEntries;

    const product = productQuery.toLowerCase().trim();
    const store = storeQuery.toLowerCase().trim();
    const category = categoryQuery.toLowerCase().trim();

    return allEntries.filter(([goodName, data]) => {
      if (product && !goodName.toLowerCase().includes(product)) return false;
      if (category && !data.good.category?.toLowerCase().includes(category)) return false;
      if (store && !data.prices.some(p => p.store.name.toLowerCase().includes(store))) return false;
      return true;
    });
  }, [productQuery, storeQuery, categoryQuery, hasActiveFilter, allEntries]);

  const clearAll = () => {
    setProductQuery('');
    setStoreQuery('');
    setCategoryQuery('');
  };

  return (
    <>
      {/* Søkefelt */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Søk etter produkt..."
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {productQuery && (
              <button
                onClick={() => setProductQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Tilbakestill produktsøk"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Søk etter butikk..."
              value={storeQuery}
              onChange={(e) => setStoreQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {storeQuery && (
              <button
                onClick={() => setStoreQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Tilbakestill butikksøk"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Søk etter kategori..."
              value={categoryQuery}
              onChange={(e) => setCategoryQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {categoryQuery && (
              <button
                onClick={() => setCategoryQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Tilbakestill kategorisøk"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <p className="text-sm text-gray-500">
            {hasActiveFilter
              ? `Viser ${filteredEntries.length} av ${allEntries.length} produkter`
              : `Viser alle ${allEntries.length} produkter`
            }
          </p>
          {hasActiveFilter && (
            <Button variant="link" size="sm" onClick={clearAll} className="text-sm p-0 h-auto">
              Tilbakestill alle filter
            </Button>
          )}
        </div>
      </div>

      {/* Produktkort */}
      <div className="grid gap-6">
        {filteredEntries.map(([goodName, data]) => {
          const store = storeQuery.toLowerCase().trim();
          const visiblePrices = store
            ? data.prices.filter(p => p.store.name.toLowerCase().includes(store))
            : data.prices;

          const lowestPrice = visiblePrices.reduce((min, p) =>
            p.price < min.price ? p : min
          );

          return (
            <Card key={goodName}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{goodName}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {data.good.category} • Per {data.good.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Beste pris</p>
                    <p className="text-2xl font-bold text-green-600">
                      {lowestPrice.currency.symbol} {Number(lowestPrice.price).toLocaleString('nb-NO')}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {visiblePrices.map((price) => (
                    <div
                      key={price.id}
                      className={`flex justify-between items-center p-3 rounded-lg ${
                        price.id === lowestPrice.id
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div>
                        <p className="font-medium">{price.store.name}</p>
                        <p className="text-sm text-gray-500">{price.store.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          {price.currency.symbol} {Number(price.price).toLocaleString('nb-NO')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(price.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredEntries.length === 0 && hasActiveFilter && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Ingen produkter samsvarer med søket ditt.</p>
              <Button
                type="button"
                variant="link"
                onClick={clearAll}
                className="mt-2"
              >
                Tilbakestill alle filter
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
