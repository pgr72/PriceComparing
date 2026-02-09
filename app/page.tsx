import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600">PriceCompare</h1>
          <nav className="flex gap-4">
            <Link href="/pricelist">
              <Button variant="ghost">Price List</Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6 text-gray-900">
          Find the Best Grocery Prices
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Compare prices across multiple stores and get instant alerts when your favorite items go on sale.
          Save money on every shopping trip.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/signup">
            <Button size="lg" className="text-lg px-8">
              Start Saving Now
            </Button>
          </Link>
          <Link href="/pricelist">
            <Button size="lg" variant="outline" className="text-lg px-8">
              View Prices
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">Why Choose PriceCompare?</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-3xl">📊</span>
                Real-Time Prices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Access up-to-date pricing information from multiple grocery stores in your area.
                Make informed decisions based on current market prices.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-3xl">🔔</span>
                Price Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Set custom price alerts for your favorite items. Get notified via email when prices
                drop below your target.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-3xl">💰</span>
                Save Money
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Track price trends over time and discover the best deals. Our platform helps you
                save hundreds on your grocery bills.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-green-50 py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Create Your Account</h4>
                <p className="text-gray-600">
                  Sign up for free in seconds and start accessing price comparisons immediately.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Browse & Compare</h4>
                <p className="text-gray-600">
                  View prices for thousands of grocery items across multiple stores in your area.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Set Price Alerts</h4>
                <p className="text-gray-600">
                  Create custom alerts for items you buy regularly and get notified of great deals.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Start Saving</h4>
                <p className="text-gray-600">
                  Shop smarter by buying at the right time and place. Watch your savings grow!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h3 className="text-3xl font-bold mb-6">Ready to Start Saving?</h3>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of smart shoppers who are already saving money with PriceCompare.
        </p>
        <Link href="/auth/signup">
          <Button size="lg" className="text-lg px-8">
            Create Free Account
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 PriceCompare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
