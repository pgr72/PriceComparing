import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import ShoppingCart from "@/components/ShoppingCart";

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
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-blue-900">PriceCompare</h1>
          </Link>
          <nav className="flex gap-4">
            <Link href="/">
              <Button variant="ghost">Hjem</Button>
            </Link>
            <Link href="/pricelist">
              <Button variant="ghost">Prisliste</Button>
            </Link>
            <Link href="/prishistorikk">
              <Button variant="ghost">Prishistorikk</Button>
            </Link>
            {user ? (
              <Link href="/dashboard">
                <Button variant="outline">Dashbord</Button>
              </Link>
            ) : (
              <Link href="/auth/signin">
                <Button variant="outline">Logg inn</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

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
