'use client';

import { useState } from 'react';
import { deletePriceAlert, togglePriceAlert } from '@/app/actions/alerts';
import { Button } from '@/components/ui/button';

interface Alert {
  id: string;
  target_price: number;
  is_active: boolean;
  created_at: string;
  good: { name: string; unit: string; category: string };
  currency: { code: string; symbol: string };
}

export default function PriceAlertList({ alerts }: { alerts: Alert[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Er du sikker på at du vil slette dette varselet?')) return;

    setDeletingId(id);
    await deletePriceAlert(id);
    setDeletingId(null);
  }

  async function handleToggle(id: string, currentState: boolean) {
    setTogglingId(id);
    await togglePriceAlert(id, !currentState);
    setTogglingId(null);
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Ingen prisvarsler ennå.</p>
        <p className="text-sm mt-2">Opprett ditt første varsel nedenfor!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg border ${
            alert.is_active ? 'bg-white' : 'bg-gray-50 opacity-60'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-medium">{alert.good.name}</p>
              <p className="text-sm text-gray-500">{alert.good.category}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={alert.is_active ? 'outline' : 'default'}
                onClick={() => handleToggle(alert.id, alert.is_active)}
                disabled={togglingId === alert.id}
              >
                {togglingId === alert.id
                  ? '...'
                  : alert.is_active
                  ? 'Pause'
                  : 'Gjenoppta'}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(alert.id)}
                disabled={deletingId === alert.id}
              >
                {deletingId === alert.id ? '...' : 'Slett'}
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Mål:</span>
            <span className="font-semibold text-green-600">
              {alert.currency.symbol}{alert.target_price} per {alert.good.unit}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Opprettet {new Date(alert.created_at).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
