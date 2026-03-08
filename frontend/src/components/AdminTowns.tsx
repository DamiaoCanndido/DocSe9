'use client';

import SearchTowns from '@/components/SearchTowns';
import { MapPin, Pencil, Plus, Trash2, Users } from 'lucide-react';
import Image from 'next/image';

interface TownsPageProps {
  towns: TownResProps[];
  onAdd: () => void;
  onEdit: (town: TownResProps) => void;
  onDelete: (town: TownResProps) => void;
}

export default function AdminTowns({
  towns,
  onAdd,
  onEdit,
  onDelete,
}: TownsPageProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchTowns />
        <button
          onClick={onAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition whitespace-nowrap self-start"
        >
          <Plus size={15} /> Novo município
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {towns.map((town) => (
          <div
            key={town.townId}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5 flex flex-col gap-3 hover:border-blue-200 dark:hover:border-blue-800 transition"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center overflow-hidden">
              <Image
                src={town.imageUrl}
                alt={'town_logo'}
                width={44}
                height={44}
                className="object-cover"
              />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">{town.name}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-zinc-500 mt-0.5">
                <MapPin size={11} />
                {town.uf}
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800 mt-auto">
              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-zinc-400">
                <Users size={13} className="text-gray-400 dark:text-zinc-500" />
                <span className="font-medium">{town.totalUsers} Usuários</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(town)}
                  className="p-1.5 text-gray-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => onDelete(town)}
                  className="p-1.5 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
