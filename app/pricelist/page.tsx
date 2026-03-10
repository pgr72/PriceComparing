import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PriceListSearch from "@/components/PriceListSearch";

export const dynamic = 'force-dynamic';

export default async function PriceList() {
  const supabase = await createClient();

  // Fetch all prices with related data
  const { data: prices } = await supabase
    .from('prices')
    .select(`
      *,
      good:goods(name, unit, category),
      store:stores(name, location),
      currency:currencies(code, symbol)
    `)
    .order('date', { ascending: false })
    .limit(100);

  // Group prices by good
  const groupedPrices = prices?.reduce((acc: any, price: any) => {
    const goodName = price.good.name;
    if (!acc[goodName]) {
      acc[goodName] = {
        good: price.good,
        prices: [],
      };
    }
    acc[goodName].prices.push(price);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-green-600">PriceCompare</h1>
          </Link>
          <nav className="flex gap-4">
            <Link href="/">
              <Button variant="ghost">Hjem</Button>
            </Link>
            <Link href="/prishistorikk">
              <Button variant="ghost">Prishistorikk</Button>
            </Link>
            <Link href="/handlevogn">
              <Button variant="ghost">Handlevogn</Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline">Logg inn</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Gjeldende priser</h2>
          <p className="text-gray-600">
            Sammenlign priser mellom butikker og finn de beste tilbudene på dagligvarer
          </p>
        </div>

        {(!groupedPrices || Object.keys(groupedPrices).length === 0) ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Ingen priser tilgjengelig ennå.</p>
              <p className="text-sm text-gray-400 mt-2">
                Kom tilbake snart for oppdatert prisinformasjon.
              </p>
            </CardContent>
          </Card>
        ) : (
          <PriceListSearch groupedPrices={groupedPrices} />
        )}
      </main>
    </div>
  );
}
