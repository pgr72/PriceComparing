'use client';

import { useState } from 'react';
import { createStore, updateStore, deleteStore } from '@/app/actions/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Store {
  id: string;
  name: string;
  location: string | null;
  country_id: string | null;
  country?: { name: string; code: string };
}

interface Country {
  id: string;
  name: string;
  code: string;
}

export default function StoresManager({
  stores,
  countries,
}: {
  stores: Store[];
  countries: Country[];
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  async function handleCreate(formData: FormData) {
    const result = await createStore(formData);
    if (result.error) {
      setIsError(true);
      setMessage(result.error);
    } else {
      setIsError(false);
      setMessage('Butikk opprettet!');
      setIsAdding(false);
    }
  }

  async function handleUpdate(id: string, formData: FormData) {
    const result = await updateStore(id, formData);
    if (result.error) {
      setIsError(true);
      setMessage(result.error);
    } else {
      setIsError(false);
      setMessage('Butikk oppdatert!');
      setEditingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Er du sikker på at du vil slette denne butikken?')) return;
    const result = await deleteStore(id);
    if (result.error) {
      setIsError(true);
      setMessage(result.error);
    } else {
      setIsError(false);
      setMessage('Butikk slettet!');
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
          <h3 className="font-semibold">Legg til ny butikk</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="name">Butikknavn</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="location">Sted</Label>
              <Input id="location" name="location" placeholder="By, Fylke" />
            </div>
            <div>
              <Label htmlFor="country_id">Land</Label>
              <select
                id="country_id"
                name="country_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Velg land</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Opprett</Button>
            <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
              Avbryt
            </Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setIsAdding(true)}>Legg til ny butikk</Button>
      )}

      <div className="space-y-3">
        {stores.map((store) =>
          editingId === store.id ? (
            <form
              key={store.id}
              action={(formData) => handleUpdate(store.id, formData)}
              className="p-4 bg-blue-50 rounded-lg space-y-4"
            >
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Butikknavn</Label>
                  <Input name="name" defaultValue={store.name} required />
                </div>
                <div>
                  <Label>Sted</Label>
                  <Input name="location" defaultValue={store.location || ''} />
                </div>
                <div>
                  <Label>Land</Label>
                  <select
                    name="country_id"
                    defaultValue={store.country_id || ''}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Velg land</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  Lagre
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingId(null)}
                >
                  Avbryt
                </Button>
              </div>
            </form>
          ) : (
            <div key={store.id} className="flex justify-between items-start p-4 bg-white rounded-lg border">
              <div>
                <p className="font-medium">{store.name}</p>
                <p className="text-sm text-gray-500">
                  {store.location} {store.country && `• ${store.country.name}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditingId(store.id)}>
                  Rediger
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(store.id)}>
                  Slett
                </Button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
