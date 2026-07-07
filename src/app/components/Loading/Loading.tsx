import { Loader2 } from "lucide-react";

export default function Loading({
  text,
  desc,
  extra,
}: {
  text?: string;
  desc?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 100,
      }}
    >
      <Loader2 className="h-10 w-10 animate-spin" />
      {text && (
        <p
          style={{
            marginTop: 20,
            fontWeight: "bold",
          }}
        >
          {text}
        </p>
      )}
      {desc && (
        <p
          style={{
            marginTop: 10,
          }}
        >
          {desc}
        </p>
      )}
      {extra}
    </div>
  );
}
