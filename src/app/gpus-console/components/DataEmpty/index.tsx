import { NoData } from "@/components/ui/standard/no-data";

export default function DataEmpty({
  showBorder = true,
  title,
  description,
}: {
  showBorder?: boolean;
  title?: string;
  description?: string;
}) {
  return (
    <div
      style={{
        paddingTop: "54px",
        paddingBottom: "64px",
        backgroundColor: "var(--white)",
        border: showBorder ? "1px solid var(--gray-2)" : "none",
        borderRadius: "var(--radius-form)",
      }}
    >
      <NoData title={title} description={description} />
    </div>
  );
}
