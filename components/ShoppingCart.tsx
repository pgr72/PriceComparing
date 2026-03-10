'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Trash2, Plus, Minus, ShoppingCart as CartIcon, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CartItemSearch from './CartItemSearch';
import {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  saveAnonymousCart,
  fetchLatestPricesForGoods,
} from '@/app/actions/cart';
import {
  getLocalCart,
  addToLocalCart,
  removeFromLocalCart,
  updateLocalCartQuantity,
  clearLocalCart,
  type LocalCartItem,
} from '@/lib/cart-storage';

interface Good {
  id: string;
  name: string;
  unit: string;
  category: string;
}

interface Store {
  id: string;
  name: string;
  location: string;
}

interface CartItem {
  id?: string;
  goodId: string;
  goodName: string;
  goodUnit: string;
  goodCategory: string;
  quantity: number;
}

interface LatestPriceRow {
  good_id: string;
  store_id: string;
  store_name: string;
  store_location: string;
  price: number;
  currency_code: string;
  currency_symbol: string;
  date: string;
}

interface ShoppingCartProps {
  goods: Good[];
  stores: Store[];
  savedCartItems: any[];
  initialLatestPrices: any[];
  isLoggedIn: boolean;
}

export default function ShoppingCart({
  goods,
  stores,
  savedCartItems,
  initialLatestPrices,
  isLoggedIn,
}: ShoppingCartProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [latestPrices, setLatestPrices] = useState<LatestPriceRow[]>(initialLatestPrices || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize cart from server data or localStorage
  useEffect(() => {
    if (isLoggedIn && savedCartItems.length > 0) {
      setCartItems(
        savedCartItems.map((item: any) => ({
          id: item.id,
          goodId: item.good.id,
          goodName: item.good.name,
          goodUnit: item.good.unit,
          goodCategory: item.good.category,
          quantity: item.quantity,
        }))
      );
    } else if (!isLoggedIn) {
      const localItems = getLocalCart();
      if (localItems.length > 0) {
        setCartItems(
          localItems.map((item) => ({
            goodId: item.goodId,
            goodName: item.goodName,
            goodUnit: item.goodUnit,
            goodCategory: item.goodCategory,
            quantity: item.quantity,
          }))
        );
      }
    }
  }, [isLoggedIn, savedCartItems]);

  // Fetch prices when cart items change
  const loadPrices = useCallback(async (goodIds: string[]) => {
    if (goodIds.length === 0) {
      setLatestPrices([]);
      return;
    }
    setIsLoading(true);
    const result = await fetchLatestPricesForGoods(goodIds);
    if (result.data) {
      setLatestPrices(result.data);
    }
    setIsLoading(false);
  }, []);

  // Reload prices when cart items change (for anonymous users or after add/remove)
  useEffect(() => {
    const goodIds = cartItems.map((item) => item.goodId);
    if (goodIds.length > 0 && (!isLoggedIn || initialLatestPrices.length === 0)) {
      loadPrices(goodIds);
    }
  }, [cartItems, isLoggedIn, initialLatestPrices.length, loadPrices]);

  // Build price lookup map
  const priceLookup = useMemo(() => {
    const map = new Map<string, LatestPriceRow>();
    for (const row of latestPrices) {
      map.set(`${row.good_id}-${row.store_id}`, row);
    }
    return map;
  }, [latestPrices]);

  // Determine which stores have any prices for our goods
  const relevantStores = useMemo(() => {
    const storeIds = new Set(latestPrices.map((p) => p.store_id));
    return stores.filter((s) => storeIds.has(s.id));
  }, [stores, latestPrices]);

  // Calculate totals per store
  const storeTotals = useMemo(() => {
    return relevantStores.map((store) => {
      let total = 0;
      let allAvailable = true;
      let currencySymbol = 'kr';

      for (const item of cartItems) {
        const priceRow = priceLookup.get(`${item.goodId}-${store.id}`);
        if (priceRow) {
          total += Number(priceRow.price) * item.quantity;
          currencySymbol = priceRow.currency_symbol;
        } else {
          allAvailable = false;
        }
      }

      return { storeId: store.id, total, allAvailable, currencySymbol };
    });
  }, [relevantStores, cartItems, priceLookup]);

  // Find best store (lowest complete total)
  const bestStoreId = useMemo(() => {
    const completeTotals = storeTotals.filter((s) => s.allAvailable && cartItems.length > 0);
    if (completeTotals.length === 0) return null;
    return completeTotals.reduce((min, s) => (s.total < min.total ? s : min)).storeId;
  }, [storeTotals, cartItems]);

  const existingGoodIds = useMemo(() => cartItems.map((i) => i.goodId), [cartItems]);

  // Handlers
  const handleAddItem = async (good: Good) => {
    const newItem: CartItem = {
      goodId: good.id,
      goodName: good.name,
      goodUnit: good.unit,
      goodCategory: good.category,
      quantity: 1,
    };

    if (isLoggedIn) {
      const result = await addToCart(good.id, 1);
      if (!result.error) {
        setCartItems((prev) => [...prev, newItem]);
        loadPrices([...existingGoodIds, good.id]);
      }
    } else {
      addToLocalCart({
        goodId: good.id,
        goodName: good.name,
        goodUnit: good.unit,
        goodCategory: good.category,
        quantity: 1,
      });
      setCartItems((prev) => [...prev, newItem]);
    }
  };

  const handleUpdateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(item);
      return;
    }

    if (isLoggedIn && item.id) {
      await updateCartItemQuantity(item.id, newQuantity);
    } else {
      updateLocalCartQuantity(item.goodId, newQuantity);
    }
    setCartItems((prev) =>
      prev.map((i) => (i.goodId === item.goodId ? { ...i, quantity: newQuantity } : i))
    );
  };

  const handleRemoveItem = async (item: CartItem) => {
    if (isLoggedIn && item.id) {
      await removeFromCart(item.id);
    } else {
      removeFromLocalCart(item.goodId);
    }
    setCartItems((prev) => prev.filter((i) => i.goodId !== item.goodId));
  };

  const handleClearCart = async () => {
    if (isLoggedIn) {
      await clearCart();
    } else {
      clearLocalCart();
    }
    setCartItems([]);
    setLatestPrices([]);
  };

  const handleSaveCart = async () => {
    if (!isLoggedIn || cartItems.length === 0) return;
    setIsSaving(true);
    const items = cartItems.map((i) => ({ goodId: i.goodId, quantity: i.quantity }));
    await saveAnonymousCart(items);
    clearLocalCart();
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Legg til varer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Legg til produkter</CardTitle>
          <CardDescription>
            Søk etter produkter for å legge dem til i handlevognen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CartItemSearch
            goods={goods}
            onAddItem={handleAddItem}
            existingGoodIds={existingGoodIds}
          />
        </CardContent>
      </Card>

      {/* Prissammenligningstabell */}
      {cartItems.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CartIcon className="h-5 w-5" />
                  Prissammenligning ({cartItems.length} {cartItems.length === 1 ? 'vare' : 'varer'})
                </CardTitle>
                <CardDescription>
                  Sammenlign totalprisen for handlevognen mellom butikker
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {isLoggedIn && (
                  <Button variant="outline" size="sm" onClick={handleSaveCart} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-1" />
                    {isSaving ? 'Lagrer...' : 'Lagre'}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleClearCart}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Tøm vogn
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-500">Laster priser...</p>
              </div>
            ) : relevantStores.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-500">Ingen prisdata tilgjengelig for varene i handlevognen.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">Produkt</th>
                      <th className="text-center py-3 px-2 font-medium w-24">Antall</th>
                      {relevantStores.map((store) => (
                        <th
                          key={store.id}
                          className={`text-right py-3 px-2 font-medium min-w-[120px] ${
                            store.id === bestStoreId ? 'bg-green-50' : ''
                          }`}
                        >
                          <div>{store.name}</div>
                          <div className="text-xs font-normal text-gray-400">{store.location}</div>
                        </th>
                      ))}
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.goodId} className="border-b">
                        <td className="py-3 px-2">
                          <div className="font-medium">{item.goodName}</div>
                          <div className="text-xs text-gray-500">
                            {item.goodCategory} · per {item.goodUnit}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                              className="p-1 rounded hover:bg-gray-100"
                              aria-label="Reduser antall"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                              className="p-1 rounded hover:bg-gray-100"
                              aria-label="Øk antall"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        {relevantStores.map((store) => {
                          const priceRow = priceLookup.get(`${item.goodId}-${store.id}`);
                          return (
                            <td
                              key={store.id}
                              className={`text-right py-3 px-2 ${
                                store.id === bestStoreId ? 'bg-green-50' : ''
                              }`}
                            >
                              {priceRow ? (
                                <span>
                                  {priceRow.currency_symbol}{' '}
                                  {(Number(priceRow.price) * item.quantity).toLocaleString('nb-NO', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs italic">Ikke tilgj.</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="py-3 px-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item)}
                            className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50"
                            aria-label="Fjern fra handlevogn"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 font-bold">
                      <td className="py-3 px-2">Totalt</td>
                      <td></td>
                      {relevantStores.map((store) => {
                        const storeTotal = storeTotals.find((s) => s.storeId === store.id);
                        return (
                          <td
                            key={store.id}
                            className={`text-right py-3 px-2 ${
                              store.id === bestStoreId
                                ? 'bg-green-50 text-green-700'
                                : ''
                            }`}
                          >
                            {storeTotal ? (
                              <>
                                {storeTotal.currencySymbol}{' '}
                                {storeTotal.total.toLocaleString('nb-NO', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                                {!storeTotal.allAvailable && (
                                  <span className="text-amber-500 ml-1">*</span>
                                )}
                              </>
                            ) : (
                              '-'
                            )}
                          </td>
                        );
                      })}
                      <td></td>
                    </tr>
                  </tfoot>
                </table>

                {storeTotals.some((s) => !s.allAvailable) && (
                  <p className="text-xs text-amber-600 mt-3">
                    * Ufullstendig total — noen produkter mangler pris i denne butikken
                  </p>
                )}

                {bestStoreId && (
                  <p className="text-sm text-green-700 mt-3 font-medium">
                    Beste pris:{' '}
                    {relevantStores.find((s) => s.id === bestStoreId)?.name} (
                    {storeTotals.find((s) => s.storeId === bestStoreId)?.currencySymbol}{' '}
                    {storeTotals
                      .find((s) => s.storeId === bestStoreId)
                      ?.total.toLocaleString('nb-NO', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    )
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <CartIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Handlevognen er tom. Søk etter produkter ovenfor for å komme i gang.
            </p>
            {!isLoggedIn && (
              <p className="text-sm text-gray-400 mt-2">
                Logg inn for å lagre handlevognen til neste gang.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
