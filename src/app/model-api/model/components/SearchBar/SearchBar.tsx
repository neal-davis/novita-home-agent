"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SearchBar.module.scss";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SearchBar({
  onSearch,
  onEmpty,
  loading,
  debounceInputSearch,
  inputLoading,
}: {
  onSearch: (text: string) => void;
  debounceInputSearch: (text: string) => void;
  onEmpty: () => void;
  loading: boolean;
  searchModelId: string;
  inputLoading: boolean;
}) {
  const [searchTxt, setSearchTxt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputLoading) {
      inputRef.current?.focus();
    }
  }, [inputLoading]);

  return (
    <div className={styles.searchbar_wrapper}>
      <Input
        placeholder="Search models..."
        value={searchTxt}
        ref={inputRef}
        onChange={(e) => {
          const v = e.target.value;
          setSearchTxt(v);
          if (v === "" && !loading) {
            onEmpty();
            debounceInputSearch("");
          }
        }}
        onInput={(e) => debounceInputSearch(e.currentTarget.value)}
        autoFocus
      />
      <Button
        disabled={loading}
        onClick={() => {
          if (searchTxt === "" && !loading) {
            onEmpty();
            return;
          }
          onSearch(searchTxt);
        }}
      >
        Search
      </Button>
    </div>
  );
}
