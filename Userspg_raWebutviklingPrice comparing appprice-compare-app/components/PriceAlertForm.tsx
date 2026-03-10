'use client';

import { useState } from 'react';
import { createPriceAlert } from '@/app/actions/alerts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PriceAlertFormProps {
  goods: Array<{ id: string; name: string; unit: string }>;
  currencies: Array<{ id: string; code: string; symbol: string }>;
}

export default function PriceAlertForm({ goods, currencies }: PriceAlertFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setMessage('');

    const result = await createPriceAlert(formData);

    if (result.error) {
      setIsError(true);
      setMessage(result.error);
    } else {
      setIsError(false);
      setMessage('Prisvarsel opprettet!');
      (document.getElementById('alert-form') as HTMLFormElement)?.reset();
    }

    setIsSubmitting(false);
  }

  return (
    <form id="alert-form" action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="good_id">Produkt</Label>
        <select
          id="good_id"
          name="good_id"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">Velg et produkt</option>
          {goods.map((good) => (
            <option key={good.id} value={good.id}>
              {good.name} (per {good.unit})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="target_price">Målpris</Label>
        <Input
          id="target_price"
          name="target_price"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency_id">Valuta</Label>
        <select
          id="currency_id"
          name="currency_id"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">Velg valuta</option>
          {currencies.map((currency) => (
            <option key={currency.id} value={currency.id}>
              {currency.code} ({currency.symbol})
            </option>
          ))}
        </select>
      </div>

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

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Oppretter...' : 'Opprett varsel'}
      </Button>
    </form>
  );
}
