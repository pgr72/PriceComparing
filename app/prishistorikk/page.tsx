import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import PriceHistoryChart from "@/components/PriceHistoryChart";

export const dynamic = 'force-dynamic';

export default async function PriceHistory() {
  const supabase = await createClient();

  const { data: goods } = await supabase
    .from('goods')
    .select('id, name, unit, category')
    .order('name');

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
            <Link href="/pricelist">
              <Button variant="ghost">Prisliste</Button>
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
          <h2 className="text-3xl font-bold mb-2">Prishistorikk</h2>
          <p className="text-gray-600">
            Følg prisutviklingen over tid og se hvordan prisene endrer seg mellom butikker
          </p>
        </div>

        <PriceHistoryChart goods={goods || []} />
      </main>
    </div>
  );
}
