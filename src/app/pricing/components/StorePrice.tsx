import React, { useMemo } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { dealMoneyWithPrecision } from "@/lib/utils/money";
import PricingMobileCard from "./PricingMobileCard";

interface StorePriceProps {
  price: Record<string, number>;
  isConsole?: boolean;
}

const TABLE_HEADS = [
  "Billing Item",
  "Billing Method",
  "Explanation",
  "Billing Logic",
];

const StorePrice: React.FC<StorePriceProps> = ({
  price,
  isConsole = false,
}) => {
  const tableData = useMemo(() => {
    const rootfsStorageFreeSize = price.rootfsStorageFreeSize || "-";
    const localStoragePrice = dealMoneyWithPrecision(
      price.localStoragePrice,
      price.pricePrecision,
    );
    const networkStoragePrice = dealMoneyWithPrecision(
      price.networkStoragePrice,
      price.pricePrecision,
    );

    return [
      [
        "Container Disk",
        "Pay-as-you-go",
        <span key="1-3">
          Supports {rootfsStorageFreeSize}GB free quota, charges for the excess
          based on capacity and usage duration.
        </span>,
        <span key="1-4">
          Unit price for the excess
          <br />
          capacity: ${localStoragePrice}/GB/day
        </span>,
      ],
      [
        "Volume Disk",
        "Pay-as-you-go",
        "Charges based on capacity and usage duration.",
        <span key="2-4">Unit price: ${localStoragePrice}/GB/day</span>,
      ],
      [
        "Network Volume",
        "Pay-as-you-go",
        "Charges based on capacity and usage duration.",
        <span key="3-4">Unit price: ${networkStoragePrice}/GB/day</span>,
      ],
    ];
  }, [price]);

  const headCellCls =
    "font-miletus text-[13px] leading-[18px] text-[var(--text-3)] px-space-12 py-space-8 whitespace-nowrap bg-fill-4 border-b border-[var(--border-default)]";
  const bodyCellCls =
    "font-miletus text-[13px] leading-[18px] text-[var(--text-1)] px-space-12 py-space-12";

  return (
    <div
      className={isConsole ? "w-full pl-4 pr-2" : "max_width_container"}
      style={{ paddingBottom: "74px" }}
    >
      <div className="bg-white rounded-8 p-space-16 mb-space-16 [box-shadow:none]">
        <div className="flex items-center justify-between mb-space-16">
          <h5
            className={`font-miletus text-paragraph-16-medium text-[var(--text-1)] ${isConsole ? "text-sm" : ""}`}
          >
            Storage Resources
          </h5>
        </div>
        <div className="flex flex-col gap-space-12 md:hidden">
          {tableData.map((rowData, index) => (
            <PricingMobileCard
              key={index}
              data-testid="store-price-mobile-card"
              title={rowData[0]}
              fields={[
                { label: TABLE_HEADS[1], value: rowData[1] },
                { label: TABLE_HEADS[2], value: rowData[2] },
                { label: TABLE_HEADS[3], value: rowData[3] },
              ]}
            />
          ))}
        </div>
        <div className="hidden overflow-hidden rounded-8 [box-shadow:none] md:block">
          <Table>
            <TableHeader>
              <TableRow className="h-[48px]">
                {TABLE_HEADS.map((column, index) => (
                  <TableHead key={index} className={headCellCls}>
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((rowData, index) => (
                <TableRow
                  key={index}
                  className="bg-white border-b border-[var(--border-subtle)] hover:bg-transparent"
                >
                  {rowData.map((column, colIndex) => (
                    <TableCell key={colIndex} className={bodyCellCls}>
                      {column}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default StorePrice;
