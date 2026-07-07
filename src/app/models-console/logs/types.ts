export type LogsTimeRange = "15m" | "1h" | "4h" | "24h" | "7d" | "custom";

export type LogsScopeType = "team" | "member" | "key";

export type LogsScopeState = {
  type: LogsScopeType;
  memberId: string | null;
  memberName?: string;
  keyId: string | null;
  keyName?: string;
  keyMask?: string;
  label: string;
  keyCount?: number;
};

export type LogsScopeOption = {
  team: LogsScopeState;
  members: Array<
    LogsScopeState & {
      keys: LogsScopeState[];
    }
  >;
};

export type RequestLogsCursor = {
  recordAt: number;
  traceId: string;
};
