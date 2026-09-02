'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('query') || '');

  useEffect(() => {
    setSearchInput(searchParams.get('query') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput.trim()) {
      params.set('query', searchInput.trim());
    } else {
      params.delete('query');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input type="text" placeholder="Search by job title, company, or keywords..." className="pl-10 h-12 text-base" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
      </div>
      <Button type="submit" size="lg" className="h-12 px-8">Search</Button>
    </form>
  );
}
