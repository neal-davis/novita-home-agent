import type { Page } from "@playwright/test";

/**
 * 演示 HUD：给 `@demo` 用例在画面上叠加 标题卡 / 步骤字幕 / ✅ 通过戳 / 常驻验收清单 / 点击波纹，
 * 让「录屏」自解释——评审只看视频就能逐条核对验收点（验收清单逐条打勾 = 上线判据）。
 *
 * 纪律：
 * - 仅当 process.env.DEMO 置位时生效；普通 `test:e2e:agent` 回归里全部 no-op（零额外耗时），
 *   所以同一个 `@demo` 用例既是快回归、又是演示脚本，无重复维护。
 * - 所有叠加层 pointer-events:none + position:fixed + 超高 z-index，绝不拦截用例自身的点击
 *   （hermetic 下三方 overlay 拦点击是本仓库历史坑）。
 * - HUD 只负责「可视化」；断言仍由用例用 data-testid / 埋点 id 完成，绝不断言 i18n 文案。
 *
 * 用法（样板见 e2e_tests/demo-sample.spec.ts）：
 *   test.beforeEach(({ page }) => installDemoHud(page));
 *   await demoTitle(page, { title, lines });                 // 开场标题卡
 *   await demoChecklist(page, [{ id:"AC1", label:"…" }, …]); // 常驻验收清单（对齐 plan.md 的 AC）
 *   await demoStep(page, { n, total, label, expected });     // 每个 AC 前
 *   ...断言...
 *   await demoPass(page, "AC1 OK", "AC1");                   // 断言通过 → 打戳 + 勾绿清单
 */

const ON = !!process.env.DEMO;

declare global {
  interface Window {
    __demoHud?: {
      title: (html: string) => void;
      clearTitle: () => void;
      step: (html: string) => void;
      clearStep: () => void;
      pass: (msg: string) => void;
      checklist: (items: { id: string; label: string }[]) => void;
      check: (id: string) => void;
    };
  }
}

const esc = (s: string) =>
  s.replace(
    /[&<>]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string,
  );

/**
 * 浏览器侧自包含初始化（addInitScript 序列化执行，**不能闭包任何外部变量**）。
 * 每次导航前重跑：定义 window.__demoHud + 注册点击波纹监听。
 */
function hudInit() {
  if (window.__demoHud) return;
  const Z = 2147483600;
  const mk = (id: string, style: Partial<CSSStyleDeclaration>) => {
    let el = document.getElementById(id) as HTMLDivElement | null;
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      el.style.pointerEvents = "none"; // 绝不拦点击
      el.style.position = "fixed";
      el.style.zIndex = String(Z);
      document.documentElement.appendChild(el);
    }
    Object.assign(el.style, style);
    return el;
  };

  // 点击波纹：capture 阶段、pointer-events:none、动画后自毁
  document.addEventListener(
    "mousedown",
    (e) => {
      const r = document.createElement("div");
      const s = r.style;
      s.position = "fixed";
      s.left = e.clientX - 22 + "px";
      s.top = e.clientY - 22 + "px";
      s.width = "44px";
      s.height = "44px";
      s.border = "3px solid #22c55e";
      s.borderRadius = "50%";
      s.zIndex = String(Z + 1);
      s.pointerEvents = "none";
      s.transition = "transform .45s ease-out, opacity .45s ease-out";
      s.opacity = "1";
      document.documentElement.appendChild(r);
      requestAnimationFrame(() => {
        s.transform = "scale(2.2)";
        s.opacity = "0";
      });
      setTimeout(() => r.remove(), 520);
    },
    true,
  );

  const FONT =
    "system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif";

  // 常驻验收清单（左下角，SPA 导航内持久；状态存在本闭包，全页导航后需重新 demoChecklist）
  let clItems: { id: string; label: string; done: boolean }[] = [];
  const renderChecklist = () => {
    if (!clItems.length) return;
    const c = mk("__demo_checklist", {
      bottom: "20px",
      left: "16px",
      maxWidth: "380px",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      background: "rgba(8,10,15,.82)",
      color: "#fff",
      fontFamily: FONT,
      fontSize: "13px",
      fontWeight: "600",
      padding: "12px 14px",
      borderRadius: "10px",
      borderLeft: "3px solid #22c55e",
    });
    const done = clItems.filter((i) => i.done).length;
    c.innerHTML =
      `<div style="opacity:.6;font-size:11px;letter-spacing:.06em;text-transform:uppercase">验收清单 ${done}/${clItems.length}</div>` +
      clItems
        .map(
          (i) =>
            `<div style="display:flex;gap:8px;align-items:flex-start;${i.done ? "color:#22c55e" : ""}">` +
            `<span>${i.done ? "☑" : "☐"}</span><span><b>${i.id}</b> ${i.label}</span></div>`,
        )
        .join("");
  };

  window.__demoHud = {
    title(html) {
      const c = mk("__demo_title", {
        inset: "0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        background: "rgba(8,10,15,.9)",
        color: "#fff",
        fontFamily: FONT,
        textAlign: "center",
        padding: "0 8%",
      });
      c.innerHTML = html;
      c.style.display = "flex";
    },
    clearTitle() {
      document.getElementById("__demo_title")?.remove();
    },
    step(html) {
      const b = mk("__demo_step", {
        top: "0",
        left: "0",
        right: "0",
        display: "flex",
        gap: "12px",
        alignItems: "center",
        background: "rgba(8,10,15,.84)",
        color: "#fff",
        fontFamily: FONT,
        fontSize: "15px",
        fontWeight: "600",
        padding: "12px 18px",
        borderBottom: "2px solid #22c55e",
      });
      b.innerHTML = html;
    },
    clearStep() {
      document.getElementById("__demo_step")?.remove();
    },
    pass(msg) {
      const p = document.createElement("div");
      const s = p.style;
      s.position = "fixed";
      s.top = "50%";
      s.left = "50%";
      s.transform = "translate(-50%,-50%)";
      s.zIndex = String(Z + 2);
      s.pointerEvents = "none";
      s.background = "rgba(34,197,94,.96)";
      s.color = "#06210f";
      s.fontFamily = FONT;
      s.fontSize = "22px";
      s.fontWeight = "800";
      s.padding = "16px 26px";
      s.borderRadius = "14px";
      s.boxShadow = "0 12px 40px rgba(0,0,0,.45)";
      p.textContent = "✅ " + msg;
      document.documentElement.appendChild(p);
      setTimeout(() => p.remove(), 1500);
    },
    checklist(items) {
      clItems = items.map((i) => ({ ...i, done: false }));
      renderChecklist();
    },
    check(id) {
      const it = clItems.find((x) => x.id === id);
      if (it) it.done = true;
      renderChecklist();
    },
  };
}

/** 在 page 上装好 HUD（每次导航自动重装）。DEMO 未置位则 no-op。 */
export async function installDemoHud(page: Page): Promise<void> {
  if (!ON) return;
  await page.addInitScript(hudInit);
}

/** 开场标题卡：改动一句话 + 环境 + 判据。停留 ~2.4s 后自动隐去。 */
export async function demoTitle(
  page: Page,
  opts: { title: string; lines?: string[] },
): Promise<void> {
  if (!ON) return;
  const html =
    `<div style="font-size:30px;font-weight:800">${esc(opts.title)}</div>` +
    (opts.lines || [])
      .map((l) => `<div style="opacity:.85">${esc(l)}</div>`)
      .join("");
  await page.evaluate((h) => window.__demoHud?.title(h), html);
  await page.waitForTimeout(2400);
  await page.evaluate(() => window.__demoHud?.clearTitle());
}

/** 渲染常驻验收清单（开场 goto 后调一次）：items=[{id:"AC1",label:"…"}]，对齐 plan.md 的 AC。 */
export async function demoChecklist(
  page: Page,
  items: { id: string; label: string }[],
): Promise<void> {
  if (!ON) return;
  const safe = items.map((i) => ({ id: esc(i.id), label: esc(i.label) }));
  await page.evaluate((its) => window.__demoHud?.checklist(its), safe);
}

/** 步骤字幕条（顶部常驻到下一次 step）：`步骤 n/total  label   预期：expected`。 */
export async function demoStep(
  page: Page,
  opts: { n: number; total: number; label: string; expected?: string },
): Promise<void> {
  if (!ON) return;
  const html =
    `<span style="background:#22c55e;color:#06210f;border-radius:6px;padding:2px 10px;font-weight:800">步骤 ${opts.n}/${opts.total}</span>` +
    `<span>${esc(opts.label)}</span>` +
    (opts.expected
      ? `<span style="margin-left:auto;opacity:.85">预期：${esc(opts.expected)}</span>`
      : "");
  await page.evaluate((h) => window.__demoHud?.step(h), html);
  await page.waitForTimeout(1000);
}

/**
 * 断言通过后打 ✅ 戳并停留 ~1.5s——把「验证瞬间」固定进录屏。
 * 传 acId 时同步把验收清单里对应项勾绿（视频里清单逐条打勾 = 评审的上线判据）。
 */
export async function demoPass(
  page: Page,
  msg: string,
  acId?: string,
): Promise<void> {
  if (!ON) return;
  await page.evaluate((m) => window.__demoHud?.pass(m), msg);
  if (acId) await page.evaluate((i) => window.__demoHud?.check(i), esc(acId));
  await page.waitForTimeout(1500);
}

/** 手动勾绿某条 AC（一般用 demoPass(…, acId) 即可，无需单独调）。 */
export async function demoCheck(page: Page, id: string): Promise<void> {
  if (!ON) return;
  await page.evaluate((i) => window.__demoHud?.check(i), esc(id));
}
