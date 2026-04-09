import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fetchAndStoreLatestSEKRate } from "@/lib/norgesbank";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

interface HarryhandelItem {
  goodName: string;
  unit: string;
  category: string;
  cheapestNO: number;
  cheapestNOStore: string;
  cheapestSE_SEK: number;
  cheapestSE_NOK: number;
  cheapestSEStore: string;
  differenceNOK: number;
  differencePercent: number;
}

export default async function Harryhandel() {
  const supabase = await createClient();

  const [{ data: prices }, sekRate] = await Promise.all([
    supabase
      .from('prices')
      .select(`
        price,
        date,
        good:goods(id, name, unit, category),
        store:stores(name, location, country:countries(code)),
        currency:currencies(code)
      `)
      .order('date', { ascending: false }),
    fetchAndStoreLatestSEKRate(),
  ]);

  const rate = sekRate?.rate ?? 1;

  // Group by good and find cheapest price per country
  const goodMap = new Map<string, {
    goodName: string;
    unit: string;
    category: string;
    cheapestNO: number | null;
    cheapestNOStore: string;
    cheapestSE_SEK: number | null;
    cheapestSEStore: string;
  }>();

  for (const p of prices || []) {
    const good = p.good as any;
    const store = p.store as any;
    const currency = p.currency as any;
    if (!good?.id || !store?.country?.code) continue;

    const countryCode = store.country.code as string;
    const goodId = good.id as string;

    if (!goodMap.has(goodId)) {
      goodMap.set(goodId, {
        goodName: good.name,
        unit: good.unit || '',
        category: good.category || '',
        cheapestNO: null,
        cheapestNOStore: '',
        cheapestSE_SEK: null,
        cheapestSEStore: '',
      });
    }

    const entry = goodMap.get(goodId)!;
    const price = Number(p.price);

    if (countryCode === 'NO' && (entry.cheapestNO === null || price < entry.cheapestNO)) {
      entry.cheapestNO = price;
      entry.cheapestNOStore = `${store.name}${store.location ? `, ${store.location}` : ''}`;
    }

    if (countryCode === 'SE' && (entry.cheapestSE_SEK === null || price < entry.cheapestSE_SEK)) {
      entry.cheapestSE_SEK = price;
      entry.cheapestSEStore = `${store.name}${store.location ? `, ${store.location}` : ''}`;
    }
  }

  // Build comparison items (only products in both countries)
  const items: HarryhandelItem[] = [];
  for (const entry of goodMap.values()) {
    if (entry.cheapestNO === null || entry.cheapestSE_SEK === null) continue;
    const cheapestSE_NOK = entry.cheapestSE_SEK * rate;
    const differenceNOK = entry.cheapestNO - cheapestSE_NOK;
    const differencePercent = (differenceNOK / entry.cheapestNO) * 100;
    items.push({
      goodName: entry.goodName,
      unit: entry.unit,
      category: entry.category,
      cheapestNO: entry.cheapestNO,
      cheapestNOStore: entry.cheapestNOStore,
      cheapestSE_SEK: entry.cheapestSE_SEK,
      cheapestSE_NOK: cheapestSE_NOK,
      cheapestSEStore: entry.cheapestSEStore,
      differenceNOK,
      differencePercent,
    });
  }

  const cheaperInSweden = items
    .filter(i => i.differenceNOK > 0)
    .sort((a, b) => b.differenceNOK - a.differenceNOK);

  const cheaperInNorway = items
    .filter(i => i.differenceNOK < 0)
    .sort((a, b) => a.differenceNOK - b.differenceNOK);

  const formatNOK = (v: number) => v.toLocaleString('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatSEK = (v: number) => v.toLocaleString('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
            <Link href="/handlevogn">
              <Button variant="ghost">Handlevogn</Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline">Logg inn</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Harryhandel</h2>
          <p className="text-gray-600">
            Sammenlign priser mellom norske og svenske butikker. Alle svenske priser er omregnet til NOK.
          </p>
          {sekRate && (
            <p className="text-sm text-gray-500 mt-2">
              Valutakurs SEK/NOK: <span className="font-semibold text-blue-700">{formatNOK(rate)}</span>
              {' '}({new Date(sekRate.date).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' })})
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">
                Ingen varer funnet i både norske og svenske butikker ennå.
                Legg til priser fra begge land for å se sammenligningen.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-10">
            {/* Cheaper in Sweden */}
            <section>
              <h3 className="text-2xl font-bold mb-4">Varer det lønner seg å handle i Sverige</h3>
              {cheaperInSweden.length === 0 ? (
                <p className="text-gray-500">Ingen varer er billigere i Sverige for øyeblikket.</p>
              ) : (
                <div className="space-y-3">
                  {cheaperInSweden.map((item) => (
                    <Card key={item.goodName}>
                      <CardContent className="py-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-semibold text-lg">{item.goodName}</p>
                            <p className="text-sm text-gray-500">{item.unit}{item.category ? ` · ${item.category}` : ''}</p>
                          </div>
                          <div className="flex flex-col md:flex-row gap-4 md:items-center text-sm">
                            <div className="text-center md:text-right">
                              <p className="text-gray-500">Norge</p>
                              <p className="font-medium">kr {formatNOK(item.cheapestNO)}</p>
                              <p className="text-xs text-gray-400">{item.cheapestNOStore}</p>
                            </div>
                            <div className="text-center md:text-right">
                              <p className="text-gray-500">Sverige</p>
                              <p className="font-medium">{formatSEK(item.cheapestSE_SEK)} SEK = kr {formatNOK(item.cheapestSE_NOK)}</p>
                              <p className="text-xs text-gray-400">{item.cheapestSEStore}</p>
                            </div>
                            <div className="text-center md:text-right min-w-[100px]">
                              <p className="text-green-700 font-bold">Spar kr {formatNOK(item.differenceNOK)}</p>
                              <p className="text-xs text-green-600">({Math.abs(item.differencePercent).toFixed(1)}%)</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Cheaper in Norway */}
            <section>
              <h3 className="text-2xl font-bold mb-4">Varer det lønner seg å handle i Norge</h3>
              {cheaperInNorway.length === 0 ? (
                <p className="text-gray-500">Ingen varer er billigere i Norge for øyeblikket.</p>
              ) : (
                <div className="space-y-3">
                  {cheaperInNorway.map((item) => (
                    <Card key={item.goodName}>
                      <CardContent className="py-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-semibold text-lg">{item.goodName}</p>
                            <p className="text-sm text-gray-500">{item.unit}{item.category ? ` · ${item.category}` : ''}</p>
                          </div>
                          <div className="flex flex-col md:flex-row gap-4 md:items-center text-sm">
                            <div className="text-center md:text-right">
                              <p className="text-gray-500">Norge</p>
                              <p className="font-medium">kr {formatNOK(item.cheapestNO)}</p>
                              <p className="text-xs text-gray-400">{item.cheapestNOStore}</p>
                            </div>
                            <div className="text-center md:text-right">
                              <p className="text-gray-500">Sverige</p>
                              <p className="font-medium">{formatSEK(item.cheapestSE_SEK)} SEK = kr {formatNOK(item.cheapestSE_NOK)}</p>
                              <p className="text-xs text-gray-400">{item.cheapestSEStore}</p>
                            </div>
                            <div className="text-center md:text-right min-w-[100px]">
                              <p className="text-blue-700 font-bold">Spar kr {formatNOK(Math.abs(item.differenceNOK))}</p>
                              <p className="text-xs text-blue-600">({Math.abs(item.differencePercent).toFixed(1)}%)</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
