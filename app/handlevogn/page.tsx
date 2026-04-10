import { createClient } from "@/lib/supabase/server";
import ShoppingCart from "@/components/ShoppingCart";
import Header from "@/components/Header";

export const dynamic = 'force-dynamic';

export default async function Handlevogn() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch goods catalog for the product search
  const { data: goods } = await supabase
    .from('goods')
    .select('id, name, unit, category')
    .order('name');

  // Fetch all stores
  const { data: stores } = await supabase
    .from('stores')
    .select('id, name, location')
    .order('name');

  // If logged in, fetch user's saved cart items
  let savedCartItems: any[] = [];
  let latestPrices: any[] = [];

  if (user) {
    const { data: cart } = await supabase
      .from('shopping_carts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (cart) {
      const { data: items } = await supabase
        .from('shopping_cart_items')
        .select('*, good:goods(id, name, unit, category)')
        .eq('cart_id', cart.id);
      savedCartItems = items || [];
    }

    // Pre-fetch latest prices for saved cart items
    const goodIds = savedCartItems.map((item: any) => item.good.id);
    if (goodIds.length > 0) {
      const { data } = await supabase.rpc('get_latest_prices_for_goods', {
        good_ids: goodIds,
      });
      latestPrices = data || [];
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <Header variant={user ? 'authenticated' : 'default'} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Handlevogn</h2>
          <p className="text-gray-600">
            Legg til produkter og sammenlign totalprisen mellom butikker
          </p>
        </div>

        <ShoppingCart
          goods={goods || []}
          stores={stores || []}
          savedCartItems={savedCartItems}
          initialLatestPrices={latestPrices}
          isLoggedIn={!!user}
        />
      </main>
    </div>
  );
}
