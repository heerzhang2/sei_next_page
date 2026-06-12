'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, Search, X, Building2, User, Check, ExternalLink, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { gql, useClient } from '@urql/next';
import { toast } from 'sonner';
import Link from 'next/link';

interface UnitSearchResult {
  id: string;
  name: string;
  no?: string;
  address?: string;
  linkMen?: string;
  phone?: string;
  company: boolean;
}

interface UnitSearchSelectProps {
  value?: string;
  onChange: (unitId: string | undefined, unitName?: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const SearchUnitQuery = gql`
  query SearchUnit($where: UnitCommonInput, $first: Int, $after: String) {
    getUnitEsFilter(where: $where, first: $first, after: $after) {
      edges {
        node {
          ... on CompanyEs {
            __typename
            id
            name
            no
            address
            linkMen
            phone
          }
          ... on PersonEs {
            __typename
            id
            name
            no
            address
            phone
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export default function UnitSearchSelect({
  value,
  onChange,
  placeholder = '搜索单位名称...',
  disabled,
}: UnitSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UnitSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const client = useClient();

  const searchUnits = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults([]);
      setEndCursor(null);
      setHasMore(false);
      return;
    }
    setLoading(true);
    setEndCursor(null);
    setHasMore(false);
    try {
      const result = await client
        .query(SearchUnitQuery, { where: { name: q }, first: 20 })
        .toPromise();
      if (result.error) {
        console.error('[UnitSearch] GraphQL error:', result.error);
        toast.error(result.error.message || '搜索失败');
        setResults([]);
        return;
      }
      const edges = result.data?.getUnitEsFilter?.edges || [];
      const pageInfo = result.data?.getUnitEsFilter?.pageInfo;
      setResults(
        edges.map((e: any) => {
          const node = e.node;
          return {
            id: node.id,
            name: node.name,
            no: node.no,
            address: node.address,
            linkMen: node.linkMen,
            phone: node.phone,
            company: node.__typename === 'CompanyEs',
          };
        })
      );
      setEndCursor(pageInfo?.endCursor || null);
      setHasMore(pageInfo?.hasNextPage ?? false);
    } catch (e) {
      console.error('[UnitSearch] Search failed:', e);
    } finally {
      setLoading(false);
    }
  }, [client]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !endCursor || !query) return;
    setLoadingMore(true);
    try {
      const result = await client
        .query(SearchUnitQuery, { where: { name: query }, first: 20, after: endCursor })
        .toPromise();
      if (result.error) {
        toast.error(result.error.message || '加载更多失败');
        return;
      }
      const edges = result.data?.getUnitEsFilter?.edges || [];
      const pageInfo = result.data?.getUnitEsFilter?.pageInfo;
      setResults((prev) => [
        ...prev,
        ...edges.map((e: any) => {
          const node = e.node;
          return {
            id: node.id,
            name: node.name,
            no: node.no,
            address: node.address,
            linkMen: node.linkMen,
            phone: node.phone,
            company: node.__typename === 'CompanyEs',
          };
        }),
      ]);
      setEndCursor(pageInfo?.endCursor || null);
      setHasMore(pageInfo?.hasNextPage ?? false);
    } catch (e) {
      console.error('[UnitSearch] Load more failed:', e);
    } finally {
      setLoadingMore(false);
    }
  }, [client, query, endCursor, loadingMore]);

  const handleQueryChange = useCallback(
    (q: string) => {
      setQuery(q);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (q.length < 2) {
        setResults([]);
        setEndCursor(null);
        setHasMore(false);
        return;
      }
      debounceRef.current = setTimeout(() => searchUnits(q), 300);
    },
    [searchUnits]
  );

  const handleSelect = useCallback(
    (unit: UnitSearchResult) => {
      setSelectedName(unit.name);
      setOpen(false);
      setQuery('');
      onChange(unit.id, unit.name);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    setSelectedName(null);
    onChange(undefined);
  }, [onChange]);

  useEffect(() => {
    if (!value) {
      setSelectedName(null);
    }
  }, [value]);

  const formatPhoneTail = (phone?: string) => {
    if (!phone || phone.length < 4) return phone || '';
    return '****' + phone.slice(-4);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            readOnly
            value={selectedName || ''}
            placeholder={placeholder}
            disabled={disabled}
            className="cursor-pointer pr-8"
            onClick={() => setOpen(true)}
          />
          {selectedName ? (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-2 text-gray-400 hover:text-red-500"
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
            >
              <X className="w-4 h-4" />
            </Button>
          ) : (
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 min-w-[480px] sm:min-w-[560px]" align="start" side="bottom">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="输入至少2个字符搜索..."
              className="border-0 shadow-none focus-visible:ring-0 h-10 px-0"
              autoFocus
            />
            {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400 shrink-0" />}
          </div>
          <CommandList className="max-h-80">
            {query.length < 2 ? (
              <CommandEmpty>请输入至少2个字符开始搜索</CommandEmpty>
            ) : results.length === 0 && !loading ? (
              <CommandEmpty>未找到匹配的单位</CommandEmpty>
            ) : null}
            {results.length > 0 && (
              <CommandGroup>
                {results.map((unit) => (
                  <CommandItem
                    key={unit.id}
                    value={unit.id}
                    onSelect={() => handleSelect(unit)}
                    className="flex items-start gap-3 py-3 px-3"
                  >
                    <div className="mt-0.5 shrink-0">
                      {unit.company ? (
                        <Building2 className="w-4 h-4 text-blue-500" />
                      ) : (
                        <User className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm break-all">{unit.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                        {unit.address && <span>{unit.address}</span>}
                        {!unit.company && unit.phone && (
                          <span className="font-mono">{formatPhoneTail(unit.phone)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {unit.id === value && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                      <Link
                        href={`/unit/${unit.id}`}
                        onClick={(e) => e.stopPropagation()}
                        title="查看单位主页"
                      >
                        <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                      </Link>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {hasMore && (
              <div className="border-t px-3 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <ChevronDown className="w-3 h-3 mr-1" />
                  )}
                  加载更多结果
                </Button>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
