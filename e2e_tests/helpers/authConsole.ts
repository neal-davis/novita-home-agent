import { type Page } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./mockBackend";

/**
 * 鉴权 console 页的统一 hermetic 装配：seedAuth（token cookie）+ /v1/user/info fixture
 * （uid+uuid 存在 → 视作已登录会话，不被弹去 /login；teams:[] → 非 basic role）。
 * 其余后端调用走 mockBackend 默认壳 { code:0, data:{} }；个别路由要额外列表壳时传 extra。
 *
 * 复用 console-home-user-info.json（已脱敏，console-home.spec 同款），避免每个 spec 重复造数据。
 */
export async function authConsole(
  page: Page,
  extra: Record<string, unknown> = {},
) {
  await seedAuth(page);
  await mockBackend(page, {
    endpoints: {
      "/v1/user/info": loadFixture("console-home-user-info.json"),
      ...extra,
    },
  });
}
