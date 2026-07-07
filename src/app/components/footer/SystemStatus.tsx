import { CLICK_BTN_IDs } from "../analytics/constants";

export default async function SystemStatus() {
  const render = (status: "up" | "down" | "unknown") => (
    <div className="mt-4 flex gap-3 items-center">
      <span
        style={{
          display: "inline-block",
          width: "8px",
          height: "8px",
          backgroundColor:
            status === "up"
              ? "var(--brand-0)"
              : status === "down"
                ? "var(--red-2)"
                : "var(--yellow-3)",
          borderRadius: "50%",
        }}
      ></span>
      <a
        className={`font-subtle text-[var(--dark-1)] whitespace-nowrap`}
        href="https://status.novita.ai"
        target="_blank"
        id={CLICK_BTN_IDs.FOOTER_LINK_IDs.SYSTEM_STATUS}
      >
        {status === "up"
          ? "All systems normal"
          : status === "down"
            ? "Some systems are down"
            : "System status unknown"}
      </a>
    </div>
  );

  try {
    const headers = new Headers();
    headers.append("Authorization", "Bearer CVnZbR8rU8457uS2f3TQkZFN");
    const response = await fetch(
      "https://uptime.betterstack.com/api/v2/monitors",
      {
        cache: "no-cache",
        headers: headers,
      },
    );
    const res = await response.json();
    if (Array.isArray(res.data)) {
      let flag = true;
      for (const obj of res.data) {
        if (obj?.attributes?.pronounceable_name === "GPU-monitor") {
          // 跳过GPU-monitor
          continue;
        }
        if (obj.type === "monitor") {
          if (obj.attributes && obj.attributes.status) {
            if (obj.attributes.status !== "up") {
              flag = false;
            }
          }
        }
      }
      if (flag) {
        return render("up");
      } else {
        return render("down");
      }
    }
  } catch (error) {
    return render("unknown");
  }
}
