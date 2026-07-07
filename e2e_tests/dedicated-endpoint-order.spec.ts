import { test, expect, type Page } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/dedicated-endpoint-order（"use client" 确认订单页）。
 *
 * 这一层不只断言「不白屏」（全站 sweep 已覆盖），而是断言**确定性行为/结构**：
 *  - 无 oid query → 客户端 router.push("/pricing")（OrderInfo.tsx useEffect 强分支）；
 *  - 有 oid（数据来自 localforage IndexedDB，非后端 fetch）+ mocked product-list →
 *    渲染计划名 / 原价划线 / 折后价 / 数量 / func_list 行数 / Big.js 算出的 Total；
 *  - 账单方式 radio（Credit Card / Account Balance）默认选 Card，可切到 Balance；
 *  - 有卡 → 渲染卡片摘要且无「Add payment method」；无卡 → 出「Add payment method」+「Top up」。
 *
 * 数据来源（读 src 确认，区别于普通 console 页）：
 *  - 订单详情**不是**后端响应：buyImageDe.tsx 把 { plan_id, plan_name, count, price,
 *    base_price, func_list } 写进 localforage（key=nanoid 的 oid），订单页 OrderInfo.tsx
 *    用 searchParam.get("oid") 从 localforage 读回（localforage 1.10：IndexedDB
 *    dbName "localforage" v2、store "keyvaluepairs"）。本 spec 用 seedOrderAndGoto
 *    把该 IDB 记录确定性种入（先 goto 建 schema → await 提交 put → reload，避免竞争）。
 *  - 客户端 XHR：enterpriseProductInfo()→/v1/enterprise-plan/product-list（{ productList }），
 *    usePaymentMethod→/v3/stripe/paymentMethods（{ paymentMethods }）。均经 mockBackend 注入。
 *
 * 合并契约（OrderInfo.tsx nowProduct）：{ ...localforage data, ...productList.find(name===plan_name) }。
 *  product-list 命中项的 func_list / price / discount_price 覆盖 localforage 同名字段。
 *  fixture：Pro 项 price=199、discount_price=149、func_list 4 条 → 划线 $199.00 + 实付 $149.00、
 *  4 个 func 行；localforage count=2 → 数量 "2 Plans"、Total = Big(149)*2 = $298.00。
 *
 * 选择器纪律：**绝不断言 i18n 文案**。锚点为 locale 无关稳定信号——
 *  - 结构/数据：CSS-module 稳定类片段（[class*="plan_name"] / [class*="list_item"] /
 *    [class*="price_content"]）、埋点 id 后缀（[id$="billing-method-switch-credit-card"]
 *    等，来自 analytics/constants.ts，源码硬编码非 i18n）、getByRole("radio")；
 *  - 数值（$199.00 / $149.00 / $298.00 / 2 Plans / 4242）是 fixture 注入的纯数据，与文案管线无关；
 *  - 计划名 "Pro" / func_list 文案是公开产品字段（fixture 自带），非 i18n 目录键。
 */

/**
 * 确定性地把订单详情种入 localforage 并打开订单页。
 *
 * 为何不用 addInitScript：init 脚本里的 IDB put 是异步、不能 block，会与页面自身
 * 的 getItem 竞争（实测共享 dev server 高负载下间歇丢种、断言超时）。这里改用
 * 「先 goto 让页面起来 → page.evaluate 里把数据 put 进 localforage 的 keyvaluepairs
 * store 并 await tx.oncomplete 保证落盘 → reload」，reload 后页面 getItem 读已提交数据，
 * 无竞争。evaluate 内部自带「store 缺失则建」逻辑（升一个版本号建 keyvaluepairs），
 * 不依赖页面 localforage init 是否已建好该 store（实测高负载下 Submit 渲染后 store 仍可能未就绪）。
 */
async function seedOrderAndGoto(page: Page, oid: string, value: unknown) {
  // 1) 首次打开：页面起来（此时无数据，渲染 $0.00 壳）
  await page.goto(`/dedicated-endpoint-order?oid=${oid}`);
  await expect(page.getByRole("button", { name: "Submit" })).toBeVisible({
    timeout: 30_000,
  });

  // 2) put 进 keyvaluepairs store（缺失则升级建之），await 事务提交（durable）
  await page.evaluate(
    ([k, v]) =>
      new Promise<void>((resolve, reject) => {
        const STORE = "keyvaluepairs";
        const putInto = (db: IDBDatabase) => {
          const tx = db.transaction(STORE, "readwrite");
          tx.objectStore(STORE).put(v, k);
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => {
            db.close();
            reject(tx.error);
          };
        };
        const probe = indexedDB.open("localforage");
        probe.onsuccess = () => {
          const db = probe.result;
          if (db.objectStoreNames.contains(STORE)) {
            putInto(db);
            return;
          }
          // store 尚未建好（页面 localforage init 落后）：升一个版本号自行创建
          const nextVersion = db.version + 1;
          db.close();
          const up = indexedDB.open("localforage", nextVersion);
          up.onupgradeneeded = () => {
            const udb = up.result;
            if (!udb.objectStoreNames.contains(STORE)) {
              udb.createObjectStore(STORE);
            }
          };
          up.onsuccess = () => putInto(up.result);
          up.onerror = () => reject(up.error);
        };
        probe.onerror = () => reject(probe.error);
      }),
    [oid, value] as const,
  );

  // 3) reload：getItem 读已提交数据，确定性渲染
  await page.reload();
}

const OID = "e2e-oid-pro-1";

/** 上游 buyImageDe.tsx 写入 localforage 的订单详情形状（纯客户端测试输入、无 PII）。 */
const ORDER_DATA = {
  plan_id: 101,
  plan_name: "Pro",
  count: 2,
  price: 199,
  base_price: 299,
  func_list: ["Local Feature A", "Local Feature B"],
};

const PRODUCT_LIST = loadFixture("dedicated-endpoint-order-product-list.json");
const PAYMENT_METHODS_WITH_CARD = loadFixture(
  "dedicated-endpoint-order-payment-methods.json",
);
const PAYMENT_METHODS_EMPTY = loadFixture(
  "dedicated-endpoint-order-payment-methods-empty.json",
);

const ID = {
  switchCard: '[id$="billing-method-switch-credit-card"]',
  switchBalance: '[id$="billing-method-switch-balance"]',
  addPayment: '[id$="billing-method-add-payment-method"]',
  topUp: '[id$="billing-method-top-up"]',
};

const expectNoErrorBoundary = (page: Page) =>
  expect(page.getByRole("heading", { name: "Error", exact: true })).toHaveCount(
    0,
  );

test.describe("Dedicated Endpoint Order（hermetic）", () => {
  test("无 oid query → 客户端重定向到 /pricing", async ({ page }) => {
    await seedAuth(page);
    await mockBackend(page, {
      endpoints: {
        "/v1/enterprise-plan/product-list": PRODUCT_LIST,
        "/v3/stripe/paymentMethods": PAYMENT_METHODS_EMPTY,
      },
    });

    await page.goto("/dedicated-endpoint-order");

    // OrderInfo.tsx：oid 缺失 → router.push("/pricing")（确定性分支）
    await page.waitForURL(/\/pricing/, { timeout: 30_000 });
    await expect(page).toHaveURL(/\/pricing/);
  });

  test("有 oid：从 localforage + product-list 渲染计划/折后价/数量/func_list/Total", async ({
    page,
  }) => {
    await seedAuth(page);
    await mockBackend(page, {
      endpoints: {
        "/v1/enterprise-plan/product-list": PRODUCT_LIST,
        "/v3/stripe/paymentMethods": PAYMENT_METHODS_EMPTY,
      },
    });

    await seedOrderAndGoto(page, OID, ORDER_DATA);

    // 渲染完成的稳定锚点：计划名 span 出现「Pro」（localforage 读回 + product 合并后）
    const planName = page.locator('[class*="plan_name"]').filter({
      hasText: "Pro",
    });
    await expect(planName.first()).toBeVisible({ timeout: 20_000 });

    // 该路由不在 LOGIN_REQUIRED_URL → 不应被弹登录；也不应被弹回 /pricing（oid 有效）
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/pricing/);

    // --- func_list：product-list 命中项的 4 条覆盖 localforage 的 2 条 → 4 个 list_item ---
    await expect(page.locator('[class*="list_item"]')).toHaveCount(4);
    for (const func of [
      "Dedicated GPU instance",
      "Priority scheduling",
      "99.9% uptime SLA",
      "24/7 technical support",
    ]) {
      await expect(page.getByText(func, { exact: true })).toBeVisible();
    }

    // --- 价格：原价 199 划线 + 折后 149（discount_price !== price 才出划线） ---
    const priceContent = page.locator('[class*="price_content"]');
    await expect(priceContent).toContainText("$199.00");
    await expect(priceContent).toContainText("$149.00");
    // 划线元素存在（src：discount_price && discount_price!==price → <span class="line-through">）
    await expect(priceContent.locator(".line-through")).toHaveText("$199.00");

    // --- 数量：localforage count=2 → "2" + "Plans" ---
    await expect(page.locator('[class*="quantity_content"]')).toContainText(
      "2",
    );

    // --- Total = Big(discount_price 149).mul(count 2) = $298.00（真实 Big.js 计算行为） ---
    await expect(page.getByText("$298.00", { exact: true })).toBeVisible();

    await expectNoErrorBoundary(page);
  });

  test("账单方式 radio：默认选 Credit Card，可切到 Account Balance；无卡出 Add/Top up", async ({
    page,
  }) => {
    await seedAuth(page);
    await mockBackend(page, {
      endpoints: {
        "/v1/enterprise-plan/product-list": PRODUCT_LIST,
        "/v3/stripe/paymentMethods": PAYMENT_METHODS_EMPTY,
      },
    });

    await seedOrderAndGoto(page, OID, ORDER_DATA);
    await expect(page.locator(ID.switchCard)).toBeVisible({ timeout: 20_000 });

    const radios = page.getByRole("radio");
    await expect(radios).toHaveCount(2);

    // 默认：Credit Card 选中（SelectBillingMethod 初始 BillingMethodEnum.CARD）
    await expect(radios.nth(0)).toBeChecked();
    await expect(radios.nth(1)).not.toBeChecked();

    // 无卡（paymentMethods []）→ Add payment method + Top up 入口可见
    await expect(page.locator(ID.addPayment)).toBeVisible();
    await expect(page.locator(ID.topUp)).toBeVisible();

    // 交互：点 Account Balance 行 → 选中切换（onValueChange/onClick → setSelectedMethod）
    await page.locator(ID.switchBalance).click();
    await expect(radios.nth(1)).toBeChecked();
    await expect(radios.nth(0)).not.toBeChecked();

    await expectNoErrorBoundary(page);
  });

  test("有卡：渲染卡片摘要（末四位/品牌/有效期），不出 Add payment method", async ({
    page,
  }) => {
    await seedAuth(page);
    await mockBackend(page, {
      endpoints: {
        "/v1/enterprise-plan/product-list": PRODUCT_LIST,
        "/v3/stripe/paymentMethods": PAYMENT_METHODS_WITH_CARD,
      },
    });

    await seedOrderAndGoto(page, OID, ORDER_DATA);
    await expect(page.locator(ID.switchCard)).toBeVisible({ timeout: 20_000 });

    // 卡片摘要：fixture last4 "4242" + brand "visa"（cardInfo 渲染分支）
    await expect(page.getByText("4242", { exact: false })).toBeVisible();
    await expect(page.getByText("visa", { exact: false })).toBeVisible();

    // 有卡 → 不应出现 Add payment method 按钮
    await expect(page.locator(ID.addPayment)).toHaveCount(0);

    await expectNoErrorBoundary(page);
  });
});
