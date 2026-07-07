import { UserRound, UsersRound } from "lucide-react";

export default function Avatar({
  size,
  team,
  className,
}: {
  size?: number;
  team?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`flex justify-center items-center rounded-full bg-[var(--gray-3)] text-[var(--brand-1)] ${className}`}
      style={{
        width: `${size || 40}px`,
        height: `${size || 40}px`,
        flex: `0 0 ${size || 40}px`,
      }}
    >
      {team ? (
        <UsersRound size={(size || 40) / 2} />
      ) : (
        <UserRound size={(size || 40) / 2} />
      )}
    </span>
  );
}
