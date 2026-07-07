"use client";

import type { CSSProperties, ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type TabsItem = {
  key: string;
  label: ReactNode;
  children: ReactNode;
  disabled?: boolean;
};

type TabsItemsProps = {
  items?: TabsItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  className?: string;
  tabBarGutter?: number;
  animated?: unknown;
  tabBarStyle?: CSSProperties;
  onChange?: (key: string) => void;
};

// i18n-disable-next-line
const tabsListStyle = "line";

export function TabsItems({
  items = [],
  activeKey,
  defaultActiveKey,
  className,
  tabBarGutter,
  tabBarStyle,
  onChange,
}: TabsItemsProps) {
  return (
    <Tabs
      value={activeKey}
      defaultValue={defaultActiveKey || items[0]?.key}
      className={className}
      onValueChange={onChange}
    >
      <TabsList
        tabsStyle={tabsListStyle}
        align="left"
        className="h-auto flex-wrap p-0 text-[var(--dark-2)]"
        style={{ ...tabBarStyle, gap: tabBarGutter }}
      >
        {items.map((item) => (
          <TabsTrigger
            key={item.key}
            value={item.key}
            disabled={item.disabled}
            className={cn(
              "rounded-none border-b-2 border-transparent bg-transparent px-0 py-2 text-[var(--dark-2)] shadow-none data-[state=active]:bg-transparent data-[state=active]:text-[var(--black)] data-[state=active]:shadow-none",
            )}
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent key={item.key} value={item.key} className="pt-2">
          {item.children}
        </TabsContent>
      ))}
    </Tabs>
  );
}
