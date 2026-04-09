import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

interface HarryhandelItem {
  goodName: string;
  unit: string;
  category: string;
  cheapestNO: number;
  cheapestNOStore: string;
  cheapestSE: number;
  cheapestSEStore: string;
  differenceNOK: number;
  differencePercent: number;
}

export default async function Harryhandel() {
  const supabase = await createClient();

  const { data: prices } = await supabase
    .from('prices')
    .select(`
      price,
      date,
      good:goods(id, name, unit, category),
      store:stores(name, location, country:countries(code))
    `)
    .order('date', { ascending: false });

  // Group by good and find cheapest price per country
  const goodMap = new Map<string, {
    goodName: string;
    unit: string;
    category: string;
    cheapestNO: number | null;
    cheapestNOStore: string;
    cheapestSE: number | null;
    cheapestSEStore: string;
  }>();

  for (const p of prices || []) {
    const good = p.good as any;
    const store = p.store as any;
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
        cheapestSE: null,
        cheapestSEStore: '',
      });
    }

    const entry = goodMap.get(goodId)!;
    const price = Number(p.price);

    if (countryCode === 'NO' && (entry.cheapestNO === null || price < entry.cheapestNO)) {
      entry.cheapestNO = price;
      entry.cheapestNOStore = `${store.name}${store.location ? `, ${store.location}` : ''}`;
    }

    if (countryCode === 'SE' && (entry.cheapestSE === null || price < entry.cheapestSE)) {
      entry.cheapestSE = price;
      entry.cheapestSEStore = `${store.name}${store.location ? `, ${store.location}` : ''}`;
    }
  }

  // Build comparison items (only products in both countries)
  const items: HarryhandelItem[] = [];
  for (const entry of goodMap.values()) {
    if (entry.cheapestNO === null || entry.cheapestSE === null) continue;
    const differenceNOK = entry.cheapestNO - entry.cheapestSE;
    const differencePercent = (differenceNOK / entry.cheapestNO) * 100;
    items.push({
      goodName: entry.goodName,
      unit: entry.unit,
      category: entry.category,
      cheapestNO: entry.cheapestNO,
      cheapestNOStore: entry.cheapestNOStore,
      cheapestSE: entry.cheapestSE,
      cheapestSEStore: entry.cheapestSEStore,
      differenceNOK,
      differencePercent,
    });
  }

  const cheaperInSweden = items
    .filter(i => i.differenceNOK > 0)
    .sort((a, b) => b.differencePercent - a.differencePercent);

  const cheaperInNorway = items
    .filter(i => i.differenceNOK < 0)
    .sort((a, b) => a.differencePercent - b.differencePercent);

  const formatNOK = (v: number) => v.toLocaleString('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
            Sammenlign priser mellom norske og svenske butikker.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Alle priser er oppgitt i NOK, omregnet etter valutakurs på handledagen.
          </p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cheaper in Sweden (left) */}
            <section>
              <h3 className="text-2xl font-bold mb-4">Varer det lønner seg å handle i Sverige</h3>
              {cheaperInSweden.length === 0 ? (
                <p className="text-gray-500">Ingen varer er billigere i Sverige for øyeblikket.</p>
              ) : (
                <div className="space-y-3">
                  {cheaperInSweden.map((item) => (
                    <Card key={item.goodName}>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold">{item.goodName}</p>
                            <p className="text-xs text-gray-500">{item.unit}{item.category ? ` · ${item.category}` : ''}</p>
                          </div>
                          <div className="flex gap-4 items-center text-sm shrink-0">
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Norge</p>
                              <p className="font-medium">kr {formatNOK(item.cheapestNO)}</p>
                              <p className="text-xs text-gray-400">{item.cheapestNOStore}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Sverige</p>
                              <p className="font-medium">kr {formatNOK(item.cheapestSE)}</p>
                              <p className="text-xs text-gray-400">{item.cheapestSEStore}</p>
                            </div>
                            <div className="text-right min-w-[90px]">
                              <p className="text-green-700 font-bold">-{Math.abs(item.differencePercent).toFixed(1)}%</p>
                              <p className="text-xs text-green-600">kr {formatNOK(item.differenceNOK)}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Cheaper in Norway (right) */}
            <section>
              <h3 className="text-2xl font-bold mb-4">Varer det lønner seg å handle i Norge</h3>
              {cheaperInNorway.length === 0 ? (
                <p className="text-gray-500">Ingen varer er billigere i Norge for øyeblikket.</p>
              ) : (
                <div className="space-y-3">
                  {cheaperInNorway.map((item) => (
                    <Card key={item.goodName}>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold">{item.goodName}</p>
                            <p className="text-xs text-gray-500">{item.unit}{item.category ? ` · ${item.category}` : ''}</p>
                          </div>
                          <div className="flex gap-4 items-center text-sm shrink-0">
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Norge</p>
                              <p className="font-medium">kr {formatNOK(item.cheapestNO)}</p>
                              <p className="text-xs text-gray-400">{item.cheapestNOStore}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Sverige</p>
                              <p className="font-medium">kr {formatNOK(item.cheapestSE)}</p>
                              <p className="text-xs text-gray-400">{item.cheapestSEStore}</p>
                            </div>
                            <div className="text-right min-w-[90px]">
                              <p className="text-blue-700 font-bold">-{Math.abs(item.differencePercent).toFixed(1)}%</p>
                              <p className="text-xs text-blue-600">kr {formatNOK(Math.abs(item.differenceNOK))}</p>
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
