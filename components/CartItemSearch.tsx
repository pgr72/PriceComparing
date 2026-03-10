'use client';

import { useState, useMemo } from 'react';
import { Search, X, Plus, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Good {
  id: string;
  name: string;
  unit: string;
  category: string;
}

interface CartItemSearchProps {
  goods: Good[];
  onAddItem: (good: Good) => void;
  existingGoodIds: string[];
}

export default function CartItemSearch({ goods, onAddItem, existingGoodIds }: CartItemSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredGoods = useMemo(() => {
    if (!searchQuery.trim()) return goods;
    const query = searchQuery.toLowerCase().trim();
    return goods.filter(
      (g) => g.name.toLowerCase().includes(query) || g.category?.toLowerCase().includes(query)
    );
  }, [searchQuery, goods]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder="Søk etter produkt å legge til..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        className="pl-10 pr-10"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => {
            setSearchQuery('');
            setShowDropdown(false);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Tilbakestill søk"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {showDropdown && searchQuery.trim() && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredGoods.length > 0 ? (
            filteredGoods.map((good) => {
              const inCart = existingGoodIds.includes(good.id);
              return (
                <button
                  key={good.id}
                  type="button"
                  onClick={() => {
                    if (!inCart) {
                      onAddItem(good);
                      setSearchQuery('');
                      setShowDropdown(false);
                    }
                  }}
                  disabled={inCart}
                  className={`w-full text-left px-4 py-3 border-b last:border-b-0 flex items-center justify-between ${
                    inCart
                      ? 'bg-gray-50 text-gray-400 cursor-default'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <p className="font-medium">{good.name}</p>
                    <p className="text-sm text-gray-500">
                      {good.category} · per {good.unit}
                    </p>
                  </div>
                  {inCart ? (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <Check className="h-3 w-3" />
                      I vognen
                    </span>
                  ) : (
                    <Plus className="h-4 w-4 text-green-600" />
                  )}
                </button>
              );
            })
          ) : (
            <p className="px-4 py-3 text-gray-500 text-sm">
              Ingen produkter funnet
            </p>
          )}
        </div>
      )}
    </div>
  );
}
