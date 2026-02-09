import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import GoodsManager from "@/components/admin/GoodsManager";
import StoresManager from "@/components/admin/StoresManager";
import PricesManager from "@/components/admin/PricesManager";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/dashboard');
  }

  // Fetch all data needed for admin operations
  const [
    { data: goods },
    { data: stores },
    { data: prices },
    { data: countries },
    { data: currencies },
  ] = await Promise.all([
    supabase.from('goods').select('*').order('name'),
    supabase.from('stores').select('*, country:countries(name, code)').order('name'),
    supabase
      .from('prices')
      .select(`
        *,
        good:goods(name, unit),
        store:stores(name),
        currency:currencies(code, symbol)
      `)
      .order('date', { ascending: false })
      .limit(50),
    supabase.from('countries').select('*').order('name'),
    supabase.from('currencies').select('*').order('code'),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-green-600">PriceCompare Admin</h1>
          </Link>
          <nav className="flex gap-4 items-center">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/pricelist">
              <Button variant="ghost">Price List</Button>
            </Link>
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
          <h2 className="text-3xl font-bold mb-2">Admin Panel</h2>
          <p className="text-gray-600">
            Manage goods, stores, and prices
          </p>
        </div>

        <div className="space-y-8">
          {/* Goods Management */}
          <Card>
            <CardHeader>
              <CardTitle>Goods Management</CardTitle>
              <CardDescription>
                Add, edit, or remove products from the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoodsManager goods={goods || []} />
            </CardContent>
          </Card>

          {/* Stores Management */}
          <Card>
            <CardHeader>
              <CardTitle>Stores Management</CardTitle>
              <CardDescription>
                Manage store locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StoresManager stores={stores || []} countries={countries || []} />
            </CardContent>
          </Card>

          {/* Prices Management */}
          <Card>
            <CardHeader>
              <CardTitle>Prices Management</CardTitle>
              <CardDescription>
                Update pricing information for products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PricesManager
                prices={prices || []}
                goods={goods || []}
                stores={stores || []}
                currencies={currencies || []}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
