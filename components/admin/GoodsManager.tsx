'use client';

import { useState } from 'react';
import { createGood, updateGood, deleteGood } from '@/app/actions/goods';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Good {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  unit: string;
}

export default function GoodsManager({ goods }: { goods: Good[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  async function handleCreate(formData: FormData) {
    const result = await createGood(formData);
    if (result.error) {
      setIsError(true);
      setMessage(result.error);
    } else {
      setIsError(false);
      setMessage('Vare opprettet!');
      setIsAdding(false);
    }
  }

  async function handleUpdate(id: string, formData: FormData) {
    const result = await updateGood(id, formData);
    if (result.error) {
      setIsError(true);
      setMessage(result.error);
    } else {
      setIsError(false);
      setMessage('Vare oppdatert!');
      setEditingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Er du sikker på at du vil slette denne varen?')) return;
    const result = await deleteGood(id);
    if (result.error) {
      setIsError(true);
      setMessage(result.error);
    } else {
      setIsError(false);
      setMessage('Vare slettet!');
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
          <h3 className="font-semibold">Legg til ny vare</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Navn</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="unit">Enhet</Label>
              <Input id="unit" name="unit" placeholder="kg, liter, stk" required />
            </div>
            <div>
              <Label htmlFor="category">Kategori</Label>
              <Input id="category" name="category" placeholder="Frukt, Meieri, osv." />
            </div>
            <div>
              <Label htmlFor="description">Beskrivelse</Label>
              <Input id="description" name="description" />
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
        <Button onClick={() => setIsAdding(true)}>Legg til ny vare</Button>
      )}

      <div className="space-y-3">
        {goods.map((good) =>
          editingId === good.id ? (
            <form
              key={good.id}
              action={(formData) => handleUpdate(good.id, formData)}
              className="p-4 bg-blue-50 rounded-lg space-y-4"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Navn</Label>
                  <Input name="name" defaultValue={good.name} required />
                </div>
                <div>
                  <Label>Enhet</Label>
                  <Input name="unit" defaultValue={good.unit} required />
                </div>
                <div>
                  <Label>Kategori</Label>
                  <Input name="category" defaultValue={good.category || ''} />
                </div>
                <div>
                  <Label>Beskrivelse</Label>
                  <Input name="description" defaultValue={good.description || ''} />
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
            <div key={good.id} className="flex justify-between items-start p-4 bg-white rounded-lg border">
              <div>
                <p className="font-medium">{good.name}</p>
                <p className="text-sm text-gray-500">
                  {good.category} • Enhet: {good.unit}
                </p>
                {good.description && (
                  <p className="text-sm text-gray-600 mt-1">{good.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditingId(good.id)}>
                  Rediger
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(good.id)}>
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
