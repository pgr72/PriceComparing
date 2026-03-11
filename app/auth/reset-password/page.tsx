import Link from "next/link";
import { resetPassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPassword({ searchParams }: { searchParams: { error?: string; success?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Tilbakestill passord</CardTitle>
          <CardDescription>
            Skriv inn e-posten din, så sender vi deg en tilbakestillingslenke
          </CardDescription>
        </CardHeader>
        <form action={resetPassword}>
          <CardContent className="space-y-4">
            {searchParams.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {searchParams.error}
              </div>
            )}
            {searchParams.success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
                {searchParams.success}
              </div>
            )}
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
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              Send tilbakestillingslenke
            </Button>
            <Link href="/auth/signin" className="text-sm text-center text-gray-600 hover:underline w-full">
              ← Tilbake til innlogging
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
