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

  async function handleCreate(formData: FormData) {
    const result = await createPrice(formData);
    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage('Price added successfully! Checking for price alerts...');
      setIsAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this price entry?')) return;
    const result = await deletePrice(id);
    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage('Price deleted successfully!');
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.includes('success')
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      {/* Add New Price Form */}
      {isAdding ? (
        <form action={handleCreate} className="space-y-4 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold">Add New Price</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="good_id">Product</Label>
              <select
                id="good_id"
                name="good_id"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select product</option>
                {goods.map((good) => (
                  <option key={good.id} value={good.id}>
                    {good.name} (per {good.unit})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="store_id">Store</Label>
              <select
                id="store_id"
                name="store_id"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select store</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" type="number" step="0.01" min="0" required />
            </div>
            <div>
              <Label htmlFor="currency_id">Currency</Label>
              <select
                id="currency_id"
                name="currency_id"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select currency</option>
                {currencies.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.code} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
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
            <Button type="submit">Add Price</Button>
            <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setIsAdding(true)}>Add New Price</Button>
      )}

      {/* Prices List */}
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
                  {price.currency.symbol}{price.price}
                </p>
                <p className="text-xs text-gray-500">per {price.good.unit}</p>
              </div>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(price.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
        {prices.length === 0 && (
          <p className="text-center text-gray-500 py-8">No price entries yet</p>
        )}
      </div>
    </div>
  );
}
