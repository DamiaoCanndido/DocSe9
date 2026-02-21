'use client';

import { getTowns } from '@/lib/data';
import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

const SearchTowns = () => {
  const [query, setQuery] = useState<string>('');

  const [debouncedQuery] = useDebounce(query, 500);

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('name') || '';

  const path = usePathname();

  const router = useRouter();

  useEffect(() => {
    const filteredItems = async () => {
      await getTowns({ queries: { name: debouncedQuery }, path });
      router.push(`/admin-panel?name=${query}`);
    };
    filteredItems();
  }, [debouncedQuery]);

  useEffect(() => {
    if (!searchQuery) {
      setQuery('');
    }
  }, [searchQuery]);

  return (
    <div className="relative flex-1">
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        placeholder="Procure pelo município"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
};

export default SearchTowns;
