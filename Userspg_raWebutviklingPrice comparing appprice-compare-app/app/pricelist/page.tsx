import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

export default async function PriceList() {
  const supabase = await createClient();

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
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-green-600">PriceCompare</h1>
          </Link>
          <nav className="flex gap-4">
            <Link href="/">
              <Button variant="ghost">Hjem</Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline">Logg inn</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Gjeldende priser</h2>
          <p className="text-gray-600">
            Sammenlign priser mellom butikker og finn de beste tilbudene på matvarer
          </p>
        </div>

        <div className="grid gap-6">
          {groupedPrices && Object.entries(groupedPrices).map(([goodName, data]: [string, any]) => {
            const lowestPrice = data.prices.reduce((min: any, p: any) =>
              p.price < min.price ? p : min
            );

            return (
              <Card key={goodName}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{goodName}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {data.good.category} • Per {data.good.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Beste pris</p>
                      <p className="text-2xl font-bold text-green-600">
                        {lowestPrice.currency.symbol}{lowestPrice.price}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.prices.map((price: any) => (
                      <div
                        key={price.id}
                        className={`flex justify-between items-center p-3 rounded-lg ${
                          price.id === lowestPrice.id
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div>
                          <p className="font-medium">{price.store.name}</p>
                          <p className="text-sm text-gray-500">{price.store.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">
                            {price.currency.symbol}{price.price}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(price.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {(!groupedPrices || Object.keys(groupedPrices).length === 0) && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">Ingen priser tilgjengelig ennå.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Sjekk tilbake snart for oppdatert prisinformasjon.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
