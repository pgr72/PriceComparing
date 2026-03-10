import Link from "next/link";
import { signUp } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUp({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Opprett konto</CardTitle>
          <CardDescription>Bli med i PriceCompare og begynn å spare i dag</CardDescription>
        </CardHeader>
        <form action={signUp}>
          <CardContent className="space-y-4">
            {searchParams.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {searchParams.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="full_name">Fullt navn</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Ola Nordmann"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="deg@eksempel.no"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passord</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500">
                Passordet må være minst 6 tegn langt
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              Opprett konto
            </Button>
            <p className="text-sm text-center text-gray-600">
              Har du allerede en konto?{" "}
              <Link href="/auth/signin" className="text-green-600 hover:underline">
                Logg inn
              </Link>
            </p>
            <Link href="/" className="text-sm text-center text-gray-600 hover:underline w-full">
              ← Tilbake til forsiden
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
