import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchAndStoreLatestSEKRate } from "@/lib/norgesbank";
import Header from "@/components/Header";

export default async function Home() {
  const sekRate = await fetchAndStoreLatestSEKRate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-white">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6 text-gray-900">
          Finn de beste matvareprisene
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Sammenlign priser fra flere butikker og få varsler når favorittvarene dine er på tilbud.
          Spar penger på hver handletur.
        </p>
        <div className="flex gap-4 justify-center items-center flex-wrap">
          <Link href="/auth/signup">
            <Button size="lg" className="text-lg px-8">
              Begynn å spare nå
            </Button>
          </Link>
          <Link href="/pricelist">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Se priser
            </Button>
          </Link>
        </div>
        {sekRate && (
          <div className="flex flex-col items-center mt-6 max-w-2xl mx-auto">
            <p className="text-sm font-medium text-gray-800 mb-1">Handler du i Sverige? Her er valutakursen.</p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <Link href="/prishistorikk#valutakurs">
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white text-sm hover:shadow-md transition-shadow cursor-pointer">
                  <span className="text-gray-500 font-medium">Valutakurs</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500">SEK/NOK</span>
                  <span className="font-bold text-blue-700">
                    {Number(sekRate.rate).toLocaleString('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({new Date(sekRate.date).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit' })})
                  </span>
                </div>
              </Link>
              <Link href="/harryhandel">
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white text-sm hover:shadow-md transition-shadow cursor-pointer">
                  <span className="font-medium text-blue-700">Harryhandel</span>
                  <span className="text-gray-400">&#8594;</span>
                </div>
              </Link>
            </div>
          </div>
        )}
      </section>

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
