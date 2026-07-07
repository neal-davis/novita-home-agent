import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RangeButton({
  value,
  onChange,
  range,
}: {
  value: number;
  onChange: (value: number) => void;
  range: { label: string; value: number }[];
}) {
  return (
    <Select
      value={String(value)}
      onValueChange={(value) => onChange(Number(value))}
    >
      <SelectTrigger className="border-common-gray-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-common-dark-3">Refresh Rate: </span>
          <div className="pr-2">
            <SelectValue />
          </div>
        </div>
      </SelectTrigger>
      <SelectContent>
        {range.map((item) => (
          <SelectItem key={item.value} value={String(item.value)}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
