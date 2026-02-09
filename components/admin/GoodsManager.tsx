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

  async function handleCreate(formData: FormData) {
    const result = await createGood(formData);
    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage('Good created successfully!');
      setIsAdding(false);
    }
  }

  async function handleUpdate(id: string, formData: FormData) {
    const result = await updateGood(id, formData);
    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage('Good updated successfully!');
      setEditingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this good?')) return;
    const result = await deleteGood(id);
    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage('Good deleted successfully!');
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

      {/* Add New Good Form */}
      {isAdding ? (
        <form action={handleCreate} className="space-y-4 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold">Add New Good</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" name="unit" placeholder="kg, liter, piece" required />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" placeholder="Fruits, Dairy, etc." />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Create</Button>
            <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setIsAdding(true)}>Add New Good</Button>
      )}

      {/* Goods List */}
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
                  <Label>Name</Label>
                  <Input name="name" defaultValue={good.name} required />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input name="unit" defaultValue={good.unit} required />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input name="category" defaultValue={good.category || ''} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input name="description" defaultValue={good.description || ''} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div key={good.id} className="flex justify-between items-start p-4 bg-white rounded-lg border">
              <div>
                <p className="font-medium">{good.name}</p>
                <p className="text-sm text-gray-500">
                  {good.category} • Unit: {good.unit}
                </p>
                {good.description && (
                  <p className="text-sm text-gray-600 mt-1">{good.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditingId(good.id)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(good.id)}>
                  Delete
                </Button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
