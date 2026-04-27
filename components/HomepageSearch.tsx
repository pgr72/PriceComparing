'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function HomepageSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/pricelist?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/pricelist');
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mt-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Søk etter vare, f.eks. smør, melk, kjøttdeig..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 text-base h-12"
        />
      </div>
      <Button type="submit" size="lg" className="h-12 px-6">
        Søk
      </Button>
    </form>
  );
}
