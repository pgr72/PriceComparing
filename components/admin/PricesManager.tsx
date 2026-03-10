'use client';

import { useState } from 'react';
import { createPrice, updatePrice, deletePrice } from '@/app/actions/prices';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Price {
  id: string;
  price: number;
  date: string;
  good: { name: string; unit: string };
  store: { name: string };
  currency: { code: string; symbol: string };
}

interface Good {
  id: string;
  name: string;
  unit: string;
}

interface Store {
  id: string;
  name: string;
}

interface Currency {
  id: string;
  code: string;
  symbol: string;
}

export default function PricesManager({
  prices,
  goods,
  stores,
  currencies,
}: {
  prices: Price[];
  goods: Good[];
  stores: Store[];
  currencies: Currency[];
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  async function handleCreate(formData: FormData) {
    const result = await createPrice(formData);
    if (result.error) {
      setIsError(true);
      setMessage(result.error);
    } else {
      setIsError(false);
      setMessage('Pris lagt til! Sjekker prisvarsler...');
      setIsAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Er du sikker på at du vil slette denne prisoppføringen?')) return;
    const result = await deletePrice(id);
    if (result.error) {
      setIsError(true);
      setMessage(result.error);
    } else {
      setIsError(false);
      setMessage('Pris slettet!');
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            !isError
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      {isAdding ? (
        <form action={handleCreate} className="space-y-4 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold">Legg til ny pris</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="good_id">Produkt</Label>
              <select
                id="good_id"
                name="good_id"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Velg produkt</option>
                {goods.map((good) => (
                  <option key={good.id} value={good.id}>
                    {good.name} (per {good.unit})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="store_id">Butikk</Label>
              <select
                id="store_id"
                name="store_id"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Velg butikk</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="price">Pris</Label>
              <Input id="price" name="price" type="number" step="0.01" min="0" required />
            </div>
            <div>
              <Label htmlFor="currency_id">Valuta</Label>
              <select
                id="currency_id"
                name="currency_id"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Velg valuta</option>
                {currencies.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.code} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="date">Dato</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Legg til pris</Button>
            <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
              Avbryt
            </Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setIsAdding(true)}>Legg til ny pris</Button>
      )}

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {prices.map((price) => (
          <div
            key={price.id}
            className="flex justify-between items-start p-4 bg-white rounded-lg border"
          >
            <div>
              <p className="font-medium">{price.good.name}</p>
              <p className="text-sm text-gray-500">
                {price.store.name} • {new Date(price.date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-lg font-semibold text-green-600">
                  {price.currency.symbol} {Number(price.price).toLocaleString('nb-NO')}
                </p>
                <p className="text-xs text-gray-500">per {price.good.unit}</p>
              </div>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(price.id)}>
                Slett
              </Button>
            </div>
          </div>
        ))}
        {prices.length === 0 && (
          <p className="text-center text-gray-500 py-8">Ingen prisoppføringer ennå</p>
        )}
      </div>
    </div>
  );
}
