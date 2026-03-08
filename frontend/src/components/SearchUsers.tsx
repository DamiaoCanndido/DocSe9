'use client';

import { getUsers } from '@/app/api/users';
import { ChevronDown, Plus, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

const SearchUsers = (props: {
  me: UserResProps;
  towns: TownResProps[];
  onAdd: () => void;
}) => {
  const [name, setName] = useState<string>('');
  const [townFilter, setTownFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [debouncedName] = useDebounce(name, 500);

  const searchParams = useSearchParams();
  const path = usePathname();
  const router = useRouter();

  // Sync state with URL params on mount
  useEffect(() => {
    setName(searchParams.get('name') || '');
    setTownFilter(searchParams.get('town') || '');
    setRoleFilter(searchParams.get('role') || '');
  }, []);

  // Trigger search whenever debounced name, town or role changes
  useEffect(() => {
    const filteredItems = async () => {
      await getUsers({
        queries: { name: debouncedName, town: townFilter, role: roleFilter },
        path,
      });

      const params = new URLSearchParams();
      if (debouncedName) params.set('name', debouncedName);
      if (townFilter) params.set('town', townFilter);
      if (roleFilter) params.set('role', roleFilter);

      router.replace(`/admin-panel?${params.toString()}`);
    };

    filteredItems();
  }, [debouncedName, townFilter, roleFilter]);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          placeholder="Procure pelo nome..."
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          className="w-full border border-gray-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-colors"
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        {props.me.role.name === 'admin' ? (
          <div className="relative">
            <select
              value={townFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setTownFilter(e.target.value)
              }
              className="border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 dark:text-zinc-100 appearance-none pr-7 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-colors"
            >
              <option value="">Todos</option>
              {props.towns.map((t) => (
                <option key={t.townId} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 pointer-events-none"
            />
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400">
            {props.me.town?.name}
          </div>
        )}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setRoleFilter(e.target.value)
            }
            className="border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 dark:text-zinc-100 appearance-none pr-7 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-colors"
          >
            <option value="">Todas</option>
            <option value="basic">Básico</option>
            <option value="manager">Gerenciador</option>
            {props.me.role.name === 'admin' && (
              <option value="admin">Administrador</option>
            )}
          </select>
          <ChevronDown
            size={13}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 pointer-events-none"
          />
        </div>
        <button
          onClick={props.onAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition whitespace-nowrap"
        >
          <Plus size={15} /> Adicionar
        </button>
      </div>
    </div>
  );
};

export default SearchUsers;
