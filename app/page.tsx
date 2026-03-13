import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAndStoreLatestSEKRate } from "@/lib/norgesbank";

export default async function Home() {
  const sekRate = await fetchAndStoreLatestSEKRate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-900">PriceCompare</h1>
          <nav className="flex gap-4">
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
            <Link href="/auth/signup">
              <Button>Kom i gang</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6 text-gray-900">
          Finn de beste matvareprisene
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Sammenlign priser fra flere butikker og få øyeblikkelige varsler når favorittvarene dine er på tilbud.
          Spar penger på hver handletur.
        </p>
        <div className="flex gap-4 justify-center items-center">
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
          {sekRate && (
            <div className="flex flex-col items-center ml-4">
              <p className="text-sm text-gray-600 mb-1">Handler du i Sverige? Her er valutakursen.</p>
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
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">Hvorfor velge PriceCompare?</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-3xl">📊</span>
                Faktisk registrerte priser
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Prisene hentes fra virkelige handleturer.Utvalget varer og priser kan derfor være noe begrenset.
                Det registreres stadig nye produkter og priser så datagrunnlaget blir bedre og bedre.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-3xl">🔔</span>
                Prisvarsler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Sett egendefinerte prisvarsler for favorittvarene dine. Få e-postvarsel når prisene
                faller under målet ditt.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-3xl">💰</span>
                Hvilke butikker har lavest priser?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Følg prisutviklingen over tid og finn de beste tilbudene. Plattformen vår hjelper deg
                å spare hundrevis av kroner på matvarehandlingen.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-blue-50 py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Slik fungerer det</h3>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Opprett konto (for å sette opp prisvarsling)</h4>
                <p className="text-gray-600">
                  Registrer deg gratis på sekunder og begynn å sammenligne priser med én gang.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Utforsk og sammenlign</h4>
                <p className="text-gray-600">
                  Se priser på hundrevis av matvarer fra flere butikker i ditt område.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Sett prisvarsler</h4>
                <p className="text-gray-600">
                  Opprett egne varsler for varer du kjøper jevnlig og få beskjed om gode tilbud.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Begynn å spare</h4>
                <p className="text-gray-600">
                  Handle smartere ved å kjøpe til rett tid og sted. Se sparingen din vokse!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h3 className="text-3xl font-bold mb-6">Klar til å begynne å spare?</h3>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Bli med andre smarte handlere som allerede sparer penger med PriceCompare.
        </p>
        <Link href="/auth/signup">
          <Button size="lg" className="text-lg px-8">
            Opprett gratis konto
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 PriceCompare. Utviklet av og med Claude.Code. Alle rettigheter forbeholdt Rækken.</p>
        </div>
      </footer>
    </div>
  );
}
