import { createClient } from "@/lib/supabase/server";
import PriceHistoryChart from "@/components/PriceHistoryChart";
import ExchangeRateChart from "@/components/ExchangeRateChart";
import Header from "@/components/Header";

export const dynamic = 'force-dynamic';

export default async function PriceHistory() {
  const supabase = await createClient();

  const { data: goods } = await supabase
    .from('goods')
    .select('id, name, unit, category')
    .order('name');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Prishistorikk</h2>
          <p className="text-gray-600">
            Følg prisutviklingen over tid og se hvordan prisene endrer seg mellom butikker
          </p>
        </div>

        <PriceHistoryChart goods={goods || []} />

        <div id="valutakurs" className="mt-8 scroll-mt-8">
          <ExchangeRateChart />
        </div>
      </main>
    </div>
  );
}
