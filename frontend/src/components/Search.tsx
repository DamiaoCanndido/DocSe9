'use client';

import { getSearchResults } from '@/app/api/folders';
import { getViewUrl } from '@/app/api/files';
import { Search, Filter, Folder, File } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import FormattedDateTime from './FormattedDateTime';

const SearchFoldersAndFiles = () => {
  const [query, setQuery] = useState('');
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('name') || '';
  const path = usePathname();

  const [debouncedQuery] = useDebounce(query, 500);

  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    folders: [],
    files: [],
  });

  const router = useRouter();

  useEffect(() => {
    const filteredItems = async () => {
      const files: SearchResults = await getSearchResults({
        name: debouncedQuery,
      });

      if (debouncedQuery.length === 0) {
        setResults({
          folders: [],
          files: [],
        });
        setOpen(false);
        return router.push(path.replace(searchParams.toString(), ''));
      }

      setResults(files);
      setOpen(true);
    };
    filteredItems();
  }, [debouncedQuery]);

  useEffect(() => {
    if (!searchQuery) {
      setQuery('');
    }
  }, [searchQuery]);

  const handleNodeClick = async (node: NodeResProps) => {
    setOpen(false);
    setResults({
      folders: [],
      files: [],
    });

    setQuery('');

    if (node.nodeType === 'folder') {
      router.push(`/my-docs/${node.id}`);
    } else {
      const result = await getViewUrl(node.id, path);
      window.open(result.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    /* Search Bar */
    <div className="flex-1 max-w-3xl">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center cursor-pointer">
          <Search className="h-5 w-5 text-[#5F6368] group-focus-within:text-blue-600 transition-colors" />
        </div>
        <input
          type="text"
          className="block w-full bg-[#EDF2FC] border-none rounded-full py-2.5 sm:py-3 pl-10 sm:pl-12 pr-10 sm:pr-12 text-[#1F1F1F] placeholder-[#5F6368] focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none text-sm sm:text-base"
          placeholder="Search in Drive"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {open && (
          <div className="absolute left-0 top-16 z-50 flex w-full flex-col gap-3 rounded-4xl bg-white p-4">
            {/* Folders */}
            {results.folders.length > 0 &&
              results.folders.map((folder) => (
                <li
                  className="flex items-center justify-between"
                  key={folder.id}
                  onClick={() => handleNodeClick(folder)}
                >
                  <div className="flex cursor-pointer items-center gap-4">
                    <Folder className="h-4 w-4" />
                    <p className="subtitle-2 line-clamp-1 text-light-100">
                      {folder.name}
                    </p>
                  </div>
                  <FormattedDateTime
                    date={folder.createdAt}
                    className="caption line-clamp-1 text-light-200"
                  />
                </li>
              ))}
            {/* Files */}
            {results.files.length > 0 &&
              results.files.map((file) => (
                <li
                  className="flex items-center justify-between"
                  key={file.id}
                  onClick={() => handleNodeClick(file)}
                >
                  <div className="flex cursor-pointer items-center gap-4">
                    <File className="h-4 w-4" />
                    <p className="subtitle-2 line-clamp-1 text-light-100">
                      {file.name}
                    </p>
                  </div>
                  <FormattedDateTime
                    date={file.createdAt}
                    className="caption line-clamp-1 text-light-200"
                  />
                </li>
              ))}
            {!results.folders.length && !results.files.length && (
              <p
                className="p-4 text-center text-light-200 cursor-pointer"
                onClick={() => {
                  setOpen(false);
                  setQuery('');
                }}
              >
                Nenhum resultado encontrado.
              </p>
            )}
          </div>
        )}
        <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center">
          <button className="p-1.5 sm:p-2 hover:bg-[#F1F3F4] rounded-full text-[#5F6368] transition-colors">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFoldersAndFiles;
