'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function addToCart(goodId: string, quantity: number = 1) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Get or create cart
  let { data: cart } = await supabase
    .from('shopping_carts')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!cart) {
    const { data: newCart, error } = await supabase
      .from('shopping_carts')
      .insert({ user_id: user.id })
      .select('id')
      .single();
    if (error) return { error: error.message };
    cart = newCart;
  }

  const { error } = await supabase
    .from('shopping_cart_items')
    .upsert(
      { cart_id: cart!.id, good_id: goodId, quantity },
      { onConflict: 'cart_id,good_id' }
    );

  if (error) return { error: error.message };

  revalidatePath('/handlevogn');
  return { success: true };
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  if (quantity < 1) {
    return removeFromCart(itemId);
  }

  const { error } = await supabase
    .from('shopping_cart_items')
    .update({ quantity })
    .eq('id', itemId);

  if (error) return { error: error.message };

  revalidatePath('/handlevogn');
  return { success: true };
}

export async function removeFromCart(itemId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('shopping_cart_items')
    .delete()
    .eq('id', itemId);

  if (error) return { error: error.message };

  revalidatePath('/handlevogn');
  return { success: true };
}

export async function clearCart() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { data: cart } = await supabase
    .from('shopping_carts')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!cart) return { success: true };

  const { error } = await supabase
    .from('shopping_cart_items')
    .delete()
    .eq('cart_id', cart.id);

  if (error) return { error: error.message };

  revalidatePath('/handlevogn');
  return { success: true };
}

export async function saveAnonymousCart(items: { goodId: string; quantity: number }[]) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Get or create cart
  let { data: cart } = await supabase
    .from('shopping_carts')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!cart) {
    const { data: newCart, error } = await supabase
      .from('shopping_carts')
      .insert({ user_id: user.id })
      .select('id')
      .single();
    if (error) return { error: error.message };
    cart = newCart;
  }

  const upsertData = items.map(item => ({
    cart_id: cart!.id,
    good_id: item.goodId,
    quantity: item.quantity,
  }));

  const { error } = await supabase
    .from('shopping_cart_items')
    .upsert(upsertData, { onConflict: 'cart_id,good_id' });

  if (error) return { error: error.message };

  revalidatePath('/handlevogn');
  return { success: true };
}

export async function fetchLatestPricesForGoods(goodIds: string[]) {
  if (goodIds.length === 0) return { data: [], error: null };

  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc('get_latest_prices_for_goods', { good_ids: goodIds });

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}
