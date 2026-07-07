import { reqSandboxTemplateList } from "@/api/sandbox";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ChevronDown, Loader2, Search } from "lucide-react";
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandLoading,
} from "@/components/ui/command";
import { Check } from "lucide-react";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import styles from "./selectTemplate.module.scss";

const PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 300;

export default function SelectTemplate({
  onSelect,
  className,
}: {
  onSelect: (member: any | null) => void;
  className?: string;
}) {
  const [filterMember, setFilterMember] = useState<any | null | undefined>(
    undefined,
  );
  const [filterMemberOpen, setFilterMemberOpen] = useState(false);
  const [privateLoading, setPrivateLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [teamMembersError] = useState<string | null>(null);

  const [allTemplates, setAllTemplates] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [retryTimes, setRetryTimes] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchParam, setSearchParam] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const loadPage = useCallback(
    (pageNum: number, append: boolean, search?: string) => {
      if (pageNum === 1) {
        setPrivateLoading(true);
      } else {
        setLoadingMore(true);
      }
      const query: { page: number; pageSize: number; search?: string } = {
        page: pageNum,
        pageSize: PAGE_SIZE,
      };
      if (search != null && search.trim() !== "") {
        query.search = search.trim();
      }
      reqSandboxTemplateList({
        ...query,
        templateType: "all",
        showOfficial: true,
      })
        .then((res: any) => {
          const list = (res?.templates || []).map((ele: any) => ({
            ...ele,
            aliases: [ele.alias ?? ""],
          }));
          if (append) {
            setAllTemplates((prev) => [...prev, ...list]);
            setPage(pageNum);
          } else {
            setAllTemplates(list);
            setPage(1);
          }
          setHasMore(list.length >= PAGE_SIZE);
          if (retryTimes < 3) setRetryTimes((t) => t + 1);
        })
        .catch((error: any) => {
          console.log(error);
          if (retryTimes < 3) setRetryTimes((t) => t + 1);
        })
        .finally(() => {
          setPrivateLoading(false);
          setLoadingMore(false);
        });
    },
    [retryTimes],
  );

  const loadPageRef = useRef(loadPage);
  useEffect(() => {
    loadPageRef.current = loadPage;
  }, [loadPage]);

  const runSearch = useRef(
    debounce((keyword: string) => {
      const search = keyword.trim();
      setSearchParam(search);
      setAllTemplates([]);
      setPage(1);
      setHasMore(true);
      loadPageRef.current(1, false, search);
    }, SEARCH_DEBOUNCE_MS),
  ).current;

  const loadMore = useCallback(() => {
    if (privateLoading || loadingMore || !hasMore) return;
    loadPage(page + 1, true, searchParam);
  }, [page, hasMore, privateLoading, loadingMore, loadPage, searchParam]);

  const handleListScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const threshold = 80;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
        loadMore();
      }
    },
    [loadMore],
  );

  const openedRef = useRef(false);
  useEffect(() => {
    if (!filterMemberOpen) {
      openedRef.current = false;
      return;
    }
    if (retryTimes >= 3) return;
    if (!openedRef.current) {
      openedRef.current = true;
      setAllTemplates([]);
      setPage(1);
      setHasMore(true);
      loadPage(1, false, "");
    }
  }, [filterMemberOpen, retryTimes, loadPage]);

  const handleOpenChange = useCallback((open: boolean) => {
    setFilterMemberOpen(open);
    if (!open) {
      setSearchKeyword("");
      setSearchParam("");
    }
  }, []);

  return (
    <Popover open={filterMemberOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        className={cn(
          "max-w-[350px] min-w-[290px] h-[32px] inline-flex items-center justify-between bg-white px-3 border-[1px] border-[var(--gray-1)] rounded-md",
          className,
        )}
      >
        {filterMember ? (
          <span
            className="overflow-hidden text-ellipsis font-subtle text-[var(--dark-1)]"
            style={{
              whiteSpace: "nowrap",
            }}
          >
            <div className="flex flex-col">
              <div className={`${styles.id}`}>
                ID:{filterMember.templateID}{" "}
                <span className="text-[var(--border-3)]">|</span>{" "}
                {filterMember.cpuCount} Cores{" "}
                <span className="text-[var(--border-3)]">|</span>{" "}
                {filterMember.memoryMB} MiB
              </div>
            </div>
          </span>
        ) : filterMember === undefined ? (
          <span className="font-subtle text-[var(--dark-1)]">{"All"}</span>
        ) : (
          <span className="font-subtle text-[var(--dark-1)]">{"All"}</span>
        )}
        <ChevronDown size={16} className="shrink-0 opacity-50 ml-1" />
      </PopoverTrigger>
      <PopoverContent align="start" className="min-w-[240px] w-fit p-0">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search Templates..."
            value={searchKeyword}
            onChange={(e) => {
              const v = e.target.value;
              setSearchKeyword(v);
              runSearch(v);
            }}
          />
        </div>
        <Command shouldFilter={false}>
          <CommandList ref={listRef} onScroll={handleListScroll}>
            {privateLoading && (
              <CommandLoading>
                <div className="flex items-center justify-center min-h-[100px]">
                  <Loader2 size={24} className="animate-spin" />
                </div>
              </CommandLoading>
            )}
            {allTemplates.length === 0 &&
              !privateLoading &&
              teamMembersError && (
                <CommandEmpty>
                  <div className="flex items-center justify-center min-h-[100px] px-4">
                    {teamMembersError}
                  </div>
                </CommandEmpty>
              )}
            <CommandGroup>
              {allTemplates.length > 0 && (
                <CommandItem
                  value="all"
                  onSelect={() => {
                    setFilterMember(null);
                    setFilterMemberOpen(false);
                    onSelect(null);
                  }}
                >
                  <span className="font-subtle !text-[var(--dark-1)]">All</span>
                  {filterMember === null && (
                    <Check size={14} className="ml-auto" />
                  )}
                </CommandItem>
              )}
              {allTemplates.map((m) => (
                <CommandItem
                  className="flex flex-col items-start py-2"
                  key={m.templateID}
                  value={`${m.templateID} ${
                    m.aliases && m.aliases.length > 0 ? m.aliases[0] : ""
                  }`}
                  onSelect={() => {
                    setFilterMember({
                      templateID: m.templateID,
                      name: m?.aliases?.length > 0 ? m.aliases[0] : "",
                      cpuCount: m.cpuCount,
                      memoryMB: m.memoryMB,
                    });
                    setFilterMemberOpen(false);
                    onSelect({
                      templateID: m.templateID,
                      name: m?.aliases?.length > 0 ? m.aliases[0] : "",
                    });
                  }}
                >
                  <div className="flex w-full justify-between items-center">
                    <div className="flex flex-col">
                      <div className={`${styles.item_id}`}>
                        ID:{m.templateID}{" "}
                        <span className="text-[var(--border-3)]">|</span>{" "}
                        {m.cpuCount} Cores{" "}
                        <span className="text-[var(--border-3)]">|</span>{" "}
                        {m.memoryMB} MiB
                      </div>
                      {m.aliases && m.aliases.length > 0 && m.aliases[0] && (
                        <div className={`${styles.item_name}`}>
                          <span>{`${m.aliases[0]}`}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {m.templateID === filterMember?.templateID && (
                        <Check size={14} className="ml-auto" />
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
              {loadingMore && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 size={20} className="animate-spin opacity-60" />
                </div>
              )}
              {!hasMore && allTemplates.length > 0 && (
                <div className="py-2 text-center text-xs text-muted-foreground">
                  Loaded all
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
