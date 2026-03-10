import Link from "next/link";
import { signIn } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Velkommen tilbake</CardTitle>
          <CardDescription>Logg inn på din PriceCompare-konto</CardDescription>
        </CardHeader>
        <form action={signIn}>
          <CardContent className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Passord</Label>
                <Link
                  href="/auth/reset-password"
                  className="text-sm text-green-600 hover:underline"
                >
                  Glemt passord?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              Logg inn
            </Button>
            <p className="text-sm text-center text-gray-600">
              Har du ikke konto?{" "}
              <Link href="/auth/signup" className="text-green-600 hover:underline">
                Registrer deg
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
