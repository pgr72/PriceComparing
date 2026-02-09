import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PriceAlertForm from "@/components/PriceAlertForm";
import PriceAlertList from "@/components/PriceAlertList";

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Fetch user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch user's price alerts
  const { data: alerts } = await supabase
    .from('price_alerts')
    .select(`
      *,
      good:goods(name, unit, category),
      currency:currencies(code, symbol)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch available goods and currencies for the form
  const { data: goods } = await supabase.from('goods').select('*').order('name');
  const { data: currencies } = await supabase.from('currencies').select('*');

  // Fetch recent best deals (prices below average)
  const { data: recentPrices } = await supabase
    .from('prices')
    .select(`
      *,
      good:goods(name, unit, category),
      store:stores(name, location),
      currency:currencies(code, symbol)
    `)
    .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('date', { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-green-600">PriceCompare</h1>
          </Link>
          <nav className="flex gap-4 items-center">
            <Link href="/pricelist">
              <Button variant="ghost">Price List</Button>
            </Link>
            {profile?.is_admin && (
              <Link href="/admin">
                <Button variant="outline">Admin</Button>
              </Link>
            )}
            <form action={signOut}>
              <Button variant="outline" type="submit">
                Sign Out
              </Button>
            </form>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {profile?.full_name}!</h2>
          <p className="text-gray-600">
            Manage your price alerts and track the best deals
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Price Alerts Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Price Alerts</CardTitle>
                <CardDescription>
                  Get notified when prices drop below your target
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PriceAlertList alerts={alerts || []} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create New Alert</CardTitle>
                <CardDescription>
                  Set a target price for any product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PriceAlertForm goods={goods || []} currencies={currencies || []} />
              </CardContent>
            </Card>
          </div>

          {/* Recent Deals Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Deals (Last 7 Days)</CardTitle>
                <CardDescription>
                  Check out the latest price updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPrices && recentPrices.length > 0 ? (
                    recentPrices.map((price: any) => (
                      <div
                        key={price.id}
                        className="flex justify-between items-start p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{price.good.name}</p>
                          <p className="text-sm text-gray-500">
                            {price.store.name} • {price.store.location}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(price.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">
                            {price.currency.symbol}{price.price}
                          </p>
                          <p className="text-xs text-gray-500">
                            per {price.good.unit}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      No recent deals found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
