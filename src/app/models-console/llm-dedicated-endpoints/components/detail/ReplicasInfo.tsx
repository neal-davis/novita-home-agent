"use client";

interface ReplicasInfoProps {
  replica: number;
  readyReplica: number;
  minReplicas: number;
  maxReplicas: number;
}

export default function ReplicasInfo({
  readyReplica,
  minReplicas,
  maxReplicas,
}: ReplicasInfoProps) {
  return (
    <div className="p-4 rounded-[6px] border border-[var(--gray-2)]">
      <p className="text-[11px] font-semibold text-[var(--dark-2)] uppercase tracking-[0.5px] mb-1">
        Running Replicas
      </p>
      {/* Main display: actual running replicas (billable) */}
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-[22px] font-extrabold text-[var(--dark-1)]">
          {readyReplica}
        </span>
      </div>
      {/* Autoscaling settings note */}
      <p className="font-small text-[var(--dark-3)] mt-1 flex items-center gap-1">
        <span>min:</span>
        <span>{minReplicas}</span>
        <span>max:</span>
        <span>{maxReplicas}</span>
      </p>
    </div>
  );
}
