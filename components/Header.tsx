'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  variant?: 'default' | 'authenticated' | 'admin';
  isAdmin?: boolean;
  signOutAction?: () => void;
}

const NAV_LINKS = [
  { href: '/pricelist', label: 'Prisliste' },
  { href: '/harryhandel', label: 'Harryhandel' },
  { href: '/prishistorikk', label: 'Prishistorikk' },
];

export default function Header({ variant = 'default', isAdmin = false, signOutAction }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const isAuth = variant === 'authenticated';
  const isAdminPage = variant === 'admin';

  const mainLinks = isAdminPage
    ? [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/pricelist', label: 'Prisliste' },
      ]
    : NAV_LINKS;

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm relative">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold text-blue-900">
            {isAdminPage ? 'PriceCompare Admin' : 'PriceCompare'}
          </h1>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-2 items-center">
          {mainLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button variant="ghost" size="sm">{link.label}</Button>
            </Link>
          ))}

          <div className="w-px h-6 bg-gray-200 mx-1" />

          {!isAdminPage && (
            <Link href="/handlevogn">
              <Button variant="ghost" size="sm" className="px-2">
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </Link>
          )}

          {isAuth || isAdminPage ? (
            <>
              {isAuth && isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm">Admin</Button>
                </Link>
              )}
              {isAuth && (
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
              )}
              {signOutAction && (
                <form action={signOutAction}>
                  <Button variant="outline" size="sm" type="submit">Logg ut</Button>
                </form>
              )}
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="outline" size="sm">Logg inn</Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Kom i gang</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile hamburger button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Lukk meny' : 'Åpne meny'}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white/95 backdrop-blur-sm absolute inset-x-0 top-full z-50 shadow-lg">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {mainLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">{link.label}</Button>
              </Link>
            ))}

            {!isAdminPage && (
              <Link href="/handlevogn" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Handlevogn
                </Button>
              </Link>
            )}

            <div className="h-px bg-gray-200 my-2" />

            {isAuth || isAdminPage ? (
              <>
                {isAuth && isAdmin && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Admin</Button>
                  </Link>
                )}
                {isAuth && (
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
                  </Link>
                )}
                {signOutAction && (
                  <form action={signOutAction}>
                    <Button variant="outline" className="w-full" type="submit">Logg ut</Button>
                  </form>
                )}
              </>
            ) : (
              <>
                <Link href="/auth/signin" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Logg inn</Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setMenuOpen(false)}>
                  <Button className="w-full">Kom i gang</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
