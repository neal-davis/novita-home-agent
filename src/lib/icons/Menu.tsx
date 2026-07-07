export default function Menu({ color }: { color?: string }) {
  return (
    <span
      className="flex flex-col justify-center items-center w-10 h-10 space-y-1"
      style={{
        borderColor: "var(--border)",
        borderRadius: 6,
      }}
    >
      <span
        className="w-3.5 h-[2px] lg:h-[1px]"
        style={{ backgroundColor: color || "var(--black)" }}
      ></span>
      <span
        className="w-3.5 h-[2px] lg:h-[1px]"
        style={{ backgroundColor: color || "var(--black)" }}
      ></span>
      <span
        className="w-3.5 h-[2px] lg:h-[1px]"
        style={{ backgroundColor: color || "var(--black)" }}
      ></span>
    </span>
  );
}
