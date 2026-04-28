import Link from "next/link";
import { fetchAndStoreLatestSEKRate } from "@/lib/norgesbank";
import Header from "@/components/Header";
import HomepageSearch from "@/components/HomepageSearch";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

interface PriceEntry {
  id: string;
  price: number;
  date: string;
  good: { name: string; unit: string; category: string };
  store: { name: string };
  currency: { symbol: string };
}

async function getBestPrices() {
  const supabase = await createClient();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data: prices } = await supabase
    .from('prices')
    .select(`
      id, price, date,
      good:goods(name, unit, category),
      store:stores(name),
      currency:currencies(symbol)
    `)
    .gte('date', sixMonthsAgo.toISOString().split('T')[0])
    .order('date', { ascending: false })
    .limit(500);

  if (!prices || prices.length === 0) return [];

  // Group by good, keep latest price per store
  const grouped: Record<string, { good: PriceEntry['good']; latestByStore: Map<string, PriceEntry> }> = {};
  for (const p of prices as unknown as PriceEntry[]) {
    const name = p.good.name;
    if (!grouped[name]) grouped[name] = { good: p.good, latestByStore: new Map() };
    const existing = grouped[name].latestByStore.get(p.store.name);
    if (!existing || new Date(p.date) > new Date(existing.date)) {
      grouped[name].latestByStore.set(p.store.name, p);
    }
  }

  // For each good with prices in 2+ stores, calculate % spread between highest and lowest price
  const bestPerGood = Object.entries(grouped)
    .map(([name, { good, latestByStore }]) => {
      const entries = Array.from(latestByStore.values());
      if (entries.length < 2) return null;
      const best = entries.reduce((min, p) => (p.price < min.price ? p : min));
      const worst = entries.reduce((max, p) => (p.price > max.price ? p : max));
      const spreadPercent = ((worst.price - best.price) / worst.price) * 100;
      return { name, good, best, storeCount: entries.length, spreadPercent };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.spreadPercent - a.spreadPercent);

  return bestPerGood.slice(0, 6);
}

export default async function Home() {
  const [sekRate, bestPrices] = await Promise.all([
    fetchAndStoreLatestSEKRate(),
    getBestPrices(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-white">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold mb-4 text-gray-900">
          Finn de beste matvareprisene
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Sammenlign priser fra flere butikker og spar penger på hver handletur.
        </p>

        {/* Søkefelt — primær handling */}
        <HomepageSearch />

        {/* Sekundære lenker */}
        <div className="flex gap-6 justify-center items-center mt-4 text-sm">
          <Link href="/pricelist" className="text-blue-600 hover:underline font-medium">
            Se alle priser
          </Link>
          <span className="text-gray-300">·</span>
          <Link href="/auth/signup" className="text-blue-600 hover:underline font-medium">
            Opprett gratis konto
          </Link>
        </div>
      </section>

      {/* Info-stripe: valutakurs og Harryhandel */}
      {sekRate && (
        <div className="border-y bg-white py-3">
          <div className="container mx-auto px-4 flex items-center justify-center gap-6 flex-wrap text-sm">
            <span className="text-gray-500">Handler du i Sverige?</span>
            <Link href="/prishistorikk#valutakurs" className="flex items-center gap-2 hover:text-blue-700 transition-colors">
              <span className="text-gray-500">SEK/NOK</span>
              <span className="font-bold text-blue-700">
                {Number(sekRate.rate).toLocaleString('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-gray-400">
                ({new Date(sekRate.date).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit' })})
              </span>
            </Link>
            <span className="text-gray-300">·</span>
            <Link href="/harryhandel" className="font-medium text-blue-600 hover:underline">
              Se Harryhandel-liste →
            </Link>
          </div>
        </div>
      )}

      {/* Live prisdata */}
      {bestPrices.length > 0 && (
        <section className="container mx-auto px-4 pb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">Varer du kan spare mest på – størst prisforskjell mellom butikker</h3>
            <Link href="/pricelist" className="text-sm text-blue-600 hover:underline">
              Se alle priser →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {bestPrices.map(({ name, good, best, storeCount, spreadPercent }) => (
              <Link key={name} href={`/pricelist?q=${encodeURIComponent(name)}`}>
                <div className="bg-white rounded-xl border hover:shadow-md transition-shadow p-4 h-full flex flex-col justify-between cursor-pointer">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">{good.category}</p>
                    <p className="font-semibold text-sm leading-tight mb-3">{name}</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-green-600">
                      {best.currency.symbol} {Number(best.price).toLocaleString('nb-NO')}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{best.store.name}</p>
                    <p className="text-xs text-orange-500 font-medium mt-1">
                      Spar {spreadPercent.toFixed(0)} % • {storeCount} butikker
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-10">Slik fungerer det</h3>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Utforsk og sammenlign</h4>
                <p className="text-gray-600">
                  Se priser på matvarer fra flere butikker — både i Norge og Sverige. Finn ut hvor du får mest for pengene.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Sett prisvarsler</h4>
                <p className="text-gray-600">
                  Opprett en gratis konto og sett opp varsler for varer du kjøper jevnlig. Få e-post når prisene faller.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Handle smartere</h4>
                <p className="text-gray-600">
                  Kjøp til rett tid og sted. Følg prisutviklingen over tid og spar penger på hver handletur.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features — compact */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-center">
          <div>
            <span className="text-2xl">📊</span>
            <h4 className="font-semibold mt-2 mb-1">Faktiske priser</h4>
            <p className="text-sm text-gray-500">
              Priser registrert fra virkelige handleturer. Datagrunnlaget vokser stadig.
            </p>
          </div>
          <div>
            <span className="text-2xl">🔔</span>
            <h4 className="font-semibold mt-2 mb-1">Prisvarsler</h4>
            <p className="text-sm text-gray-500">
              Få e-post når favorittvarene dine faller under din målpris.
            </p>
          </div>
          <div>
            <span className="text-2xl">💰</span>
            <h4 className="font-semibold mt-2 mb-1">Sammenlign butikker</h4>
            <p className="text-sm text-gray-500">
              Finn ut hvilke butikker som har de laveste prisene over tid.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              &copy; 2026 PriceCompare. Utviklet av og med Claude Code. Alle rettigheter forbeholdt Rækken.
            </p>
            <nav className="flex gap-4 text-sm text-gray-500">
              <Link href="/pricelist" className="hover:text-gray-700">Prisliste</Link>
              <Link href="/harryhandel" className="hover:text-gray-700">Harryhandel</Link>
              <Link href="/prishistorikk" className="hover:text-gray-700">Prishistorikk</Link>
              <Link href="/personvern" className="hover:text-gray-700">Personvern</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
