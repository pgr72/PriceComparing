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

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/dashboard');
  }

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
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-green-600">PriceCompare Admin</h1>
          </Link>
          <nav className="flex gap-4 items-center">
            <Link href="/dashboard">
              <Button variant="ghost">Oversikt</Button>
            </Link>
            <Link href="/pricelist">
              <Button variant="ghost">Prisliste</Button>
            </Link>
            <form action={signOut}>
              <Button variant="outline" type="submit">
                Logg ut
              </Button>
            </form>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Adminpanel</h2>
          <p className="text-gray-600">
            Administrer varer, butikker og priser
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Vareadministrasjon</CardTitle>
              <CardDescription>
                Legg til, rediger eller fjern produkter fra databasen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoodsManager goods={goods || []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Butikkadministrasjon</CardTitle>
              <CardDescription>
                Administrer butikklokasjoner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StoresManager stores={stores || []} countries={countries || []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prisadministrasjon</CardTitle>
              <CardDescription>
                Oppdater prisinformasjon for produkter
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
