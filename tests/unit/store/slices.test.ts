jest.mock(
  "@/api/api",
  () => ({
    request: jest.fn(() => Promise.resolve({})),
  }),
  { virtual: true },
);

jest.mock(
  "@/api/billing",
  () => ({
    getBalanceDetail: jest.fn(),
    queryBillingInfo: jest.fn(),
  }),
  { virtual: true },
);

jest.mock(
  "@/api/enterprise",
  () => ({
    queryEnterpriseConfig: jest.fn(),
  }),
  { virtual: true },
);

jest.mock(
  "@/api/user",
  () => ({
    info: jest.fn(),
    queryUserDiscount: jest.fn(),
  }),
  { virtual: true },
);

jest.mock(
  "@/api/price",
  () => ({
    getBatchPrice: jest.fn(),
  }),
  { virtual: true },
);

jest.mock(
  "@/api/team",
  () => ({
    getAllTeamMembers: jest.fn(),
    getInviteInfo: jest.fn(),
  }),
  { virtual: true },
);

jest.mock(
  "@/api/fusion-product",
  () => ({
    getEnabledFusionProductConfigs: jest.fn(),
  }),
  { virtual: true },
);

jest.mock("@/lib/utils/dynamic-pricing/transform-processor", () => ({
  processValueTransformsBatch: jest.fn((configs) => configs),
}));

import { configureStore } from "@reduxjs/toolkit";
import { getEnabledFusionProductConfigs } from "@/api/fusion-product";
import { getBatchPrice } from "@/api/price";
import { appInfoSlice, setAppCurrentMenu } from "@/store/slice/appInfoSlice";
import billingReducer, {
  fetchBalanceDetail,
  fetchBillingInfo,
} from "@/store/slice/billingSlice";
import {
  configSlice,
  closeInfoDialog,
  closeNotice,
  closeNoticeForever,
  fetchEnterprise,
  fetchModelProductPrice,
  fetchUserDiscount,
  processPriceResponse,
  selectResourceStructure,
  setConfigTitle,
  setEnterprise,
  setInfoDialog,
  setImgKey,
  setIsMobile,
  setIsReg,
  setLocale,
  setLoginModalType,
  setModelRole,
  setModelProductPrice,
  setOpenCollect,
  setPaymethods,
  setShowLoginModal,
} from "@/store/slice/configSlice";
import {
  multimodalSlice,
  clearError,
  clearMultimodalConfigs,
  fetchMultimodalConfigs,
  selectMultimodalConfigs,
  selectMultimodalConfigsByCategory,
  selectMultimodalError,
  selectMultimodalLoading,
  selectMultimodalPriceMap,
  setMultimodalConfigs,
  setMultimodalPriceMap,
} from "@/store/slice/multimodalSlice";
import {
  fetchAllTeamMembers,
  fetchTeamInvite,
  setUserState,
  updateUserInfo,
  userSlice,
  logout,
  selectTeamMembers,
  setToken,
  setUserInfo,
  switchTeam,
  UserState,
} from "@/store/slice/userSlice";

jest.mock(
  "js-cookie",
  () => ({
    get: jest.fn(() => "token-from-cookie"),
    set: jest.fn(),
    remove: jest.fn(),
  }),
  { virtual: true },
);

const mockGetEnabledFusionProductConfigs =
  getEnabledFusionProductConfigs as jest.Mock;
const mockGetBatchPrice = getBatchPrice as jest.Mock;

describe("store slices", () => {
  it("updates app info menu", () => {
    expect(
      appInfoSlice.reducer(undefined, setAppCurrentMenu("billing")),
    ).toEqual({
      currentMenu: "billing",
    });
  });

  it("updates billing async states", () => {
    let state = billingReducer(
      undefined,
      fetchBalanceDetail.fulfilled(
        {
          availableCredit: "1.0000",
          accountBalance: "2.0000",
          pendingCharges: "3.0000",
          creditLimit: "4.0000",
          outstandingInvoices: "5.0000",
        },
        "request-id",
      ),
    );
    expect(state.balanceDetail.status).toBe("success");
    expect(state.balanceDetail.availableCredit).toBe("1.0000");

    state = billingReducer(
      state,
      fetchBalanceDetail.rejected(null, "request-id"),
    );
    expect(state.balanceDetail.status).toBe("error");

    state = billingReducer(
      state,
      fetchBillingInfo.fulfilled({ isEnterprise: true }, "request-id"),
    );
    expect(state.billingInfo?.isEnterprise).toBe(true);
  });

  it("updates config state and selectors", () => {
    let state = configSlice.reducer(undefined, setIsMobile(true));
    state = configSlice.reducer(state, setLocale("zh-CN"));
    state = configSlice.reducer(state, setConfigTitle("Console"));
    state = configSlice.reducer(
      state,
      setImgKey({ key: "hero", value: "a.png" }),
    );
    state = configSlice.reducer(
      state,
      setImgKey({ key: "", value: "ignored.png" }),
    );
    state = configSlice.reducer(state, setModelRole(true));
    state = configSlice.reducer(state, setPaymethods(["card"]));
    state = configSlice.reducer(state, setIsReg(true));
    state = configSlice.reducer(
      state,
      setEnterprise({ isWhiteListUser: true, billingMethod: 2 }),
    );
    state = configSlice.reducer(state, setShowLoginModal(true));
    state = configSlice.reducer(state, setLoginModalType("sign-up"));
    state = configSlice.reducer(
      state,
      setInfoDialog({
        title: "Title",
        description: "Description",
        confirmRedirect: "/next",
        emphasisContent: "Important",
      }),
    );
    state = configSlice.reducer(state, closeInfoDialog());
    state = configSlice.reducer(state, setOpenCollect(true));
    state = configSlice.reducer(
      state,
      setModelProductPrice({ sku: { originalPrice: 1, discountPrice: 1 } }),
    );

    expect(state.isMobile).toBe(true);
    expect(state.locale).toBe("zh-CN");
    expect(state.title).toBe("Console");
    expect(state.keyImg.hero).toBe("a.png");
    expect(state.keyImg).not.toHaveProperty("");
    expect(state.modelRole).toBe(true);
    expect(state.paymethods).toEqual(["card"]);
    expect(state.isReg).toBe(true);
    expect(state.enterprise.isWhiteListUser).toBe(true);
    expect(state.showLoginModal).toBe(true);
    expect(state.loginModalType).toBe("sign-up");
    expect(state.infoDialog.title).toBe("");
    expect(state.openCollect).toBe(true);
    expect((state.modelProductPrice as any).sku.originalPrice).toBe(1);

    const resources = selectResourceStructure({
      config: {
        ...state,
        permissionsConfig: {
          owner: [
            { action: "view", resource_group: "billing", resource: "recharge" },
            { action: "view", resource_group: "billing", resource: "balance" },
            { action: "view", resource_group: "sandbox", resource: "view" },
            { action: "view", resource_group: "sandbox", resource: "view" },
          ],
        },
      },
    });
    expect(resources).toEqual({
      billing: ["balance", "recharge"],
      sandbox: ["view"],
    });
    expect(
      selectResourceStructure({ config: { ...state, permissionsConfig: {} } }),
    ).toEqual({});
  });

  it("updates notice visibility and config async reducer state", () => {
    let state = configSlice.reducer(undefined, {
      type: fetchEnterprise.fulfilled.type,
      payload: undefined,
    });
    expect(state.enterprise).toEqual({
      isWhiteListUser: false,
      isEnterprisePlan: false,
      playgroundAPIConfig: "",
      billingMethod: 1,
    });

    state = configSlice.reducer(state, {
      type: fetchEnterprise.fulfilled.type,
      payload: {
        isWhiteListUser: true,
        isEnterprisePlan: true,
        playgroundAPIConfig: "enabled",
        billingMethod: 3,
      },
    });
    expect(state.enterprise.billingMethod).toBe(3);

    state = configSlice.reducer(state, {
      type: fetchUserDiscount.fulfilled.type,
      payload: {
        couponId: "coupon",
        percentOff: 10,
        amountOff: 0,
        redeemBy: 123,
        valid: true,
      },
    });
    expect(state.discount.valid).toBe(true);

    state = configSlice.reducer(state, {
      type: fetchModelProductPrice.fulfilled.type,
      payload: { sku: { originalPrice: 1, discountPrice: 0.5 } },
    });
    expect((state.modelProductPrice as any).sku.discountPrice).toBe(0.5);

    state = {
      ...state,
      notice: {
        show: true,
        showInConsole: true,
        name: "notice",
        content: "content",
        url: "/notice",
        updatedAt: "2024-01-02T00:00:00.000Z",
        height: 40,
      },
    };
    state = configSlice.reducer(state, closeNotice());
    expect(state.notice.show).toBe(false);

    state = configSlice.reducer(
      {
        ...state,
        notice: { ...state.notice, show: true },
      },
      closeNoticeForever(),
    );
    expect(state.notice.show).toBe(false);
  });

  it("processes discounted and non-discounted prices", () => {
    expect(
      processPriceResponse([
        {
          productId: "a",
          basePrice0: 10000,
          discountPrice0: 5000,
          pricePrecision: 4,
        },
        {
          productId: "b",
          basePrice0: 10000,
          discountPrice0: 15000,
          pricePrecision: 4,
        },
      ]),
    ).toEqual({
      a: { originalPrice: 0.25, discountPrice: 0.125 },
      b: { originalPrice: 0.25, discountPrice: 0.25 },
    });
  });

  it("updates user info, team selection and logout state", () => {
    let state = userSlice.reducer(undefined, setToken("token-from-cookie"));
    state = userSlice.reducer(
      state,
      setUserInfo({
        uid: 1,
        email: "user@example.com",
        mobilePhone: "",
        role: 2,
        uuid: "uuid",
        firstName: "First",
        lastName: "Last",
        billingAccount: "acct",
        isAlreadyTopup: true,
        isQuestionnaire: false,
        thirdPartyName: "google",
        username: "user@example.com",
        companyName: "Novita",
        country: "US",
        teamOwnerUuid: "owner",
        teams: [
          {
            teamId: "team-a",
            teamName: "Team A",
            role: "owner",
            maxMemberCount: 10,
            memberId: "m1",
            remarkName: "Alias",
          },
        ],
        teamId: "team-a",
        tier: "pro",
      }),
    );

    expect(state.state).toBe(UserState.login);
    expect(state.currentTeam?.id).toBe("team-a");

    state = userSlice.reducer(state, switchTeam("missing"));
    expect(state.currentTeam).toBeNull();

    state = userSlice.reducer(state, logout());
    expect(state.state).toBe(UserState.logout);
    expect(state.token).toBe("");
  });

  it("handles user reset, async state and team payload reducers", () => {
    const mutableState = JSON.parse(
      JSON.stringify(
        userSlice.reducer(
          undefined,
          setUserInfo({
            uid: 1,
            email: "user@example.com",
            mobilePhone: "",
            role: 2,
            uuid: "uuid",
            firstName: "First",
            lastName: "Last",
            billingAccount: "acct",
            isAlreadyTopup: true,
            isQuestionnaire: false,
            thirdPartyName: "google",
            username: "user@example.com",
            companyName: "Novita",
            country: "US",
            teams: [],
            tier: "pro",
          }),
        ),
      ),
    );
    const mockConsoleWarn = jest.spyOn(console, "warn").mockImplementation();
    const mockConsoleError = jest.spyOn(console, "error").mockImplementation();

    updateUserInfo(mutableState, { payload: "401" });
    mockConsoleWarn.mockRestore();
    mockConsoleError.mockRestore();
    expect(mutableState.state).toBe(UserState.logout);
    expect(mutableState.isVerifyLimit).toBe(true);

    let state = userSlice.reducer(undefined, {
      type: setUserState.fulfilled.type,
      payload: UserState.login,
    });
    expect(state.state).toBe(UserState.login);

    state = userSlice.reducer(state, {
      type: fetchTeamInvite.fulfilled.type,
      payload: {
        email: "invite@example.com",
        name: "Team",
        role: "developer",
        phone: "15500000000",
        team_id: "team-1",
      },
    });
    expect(state.teamInvite).toEqual({
      email: "invite@example.com",
      phone: "15500000000",
      teamName: "Team",
      role: "developer",
      teamId: "team-1",
    });

    state = userSlice.reducer(state, {
      type: fetchAllTeamMembers.fulfilled.type,
      payload: {
        members: [
          {
            email: "member@example.com",
            role: "owner",
            status: "Active",
            member_id: "member-1",
            joined_at: "1700000000",
            user_id: "user-1",
            phone: "15500000000",
            remark_name: "Alias",
          },
        ],
      },
    });
    expect(state.allTeamMembers).toEqual([
      {
        email: "member@example.com",
        role: "owner",
        status: "Active",
        memberId: "member-1",
        joinedAt: 1700000000,
        userId: "user-1",
        phone: "15500000000",
        alias: "Alias",
      },
    ]);
  });

  it("selects grouped team members", () => {
    expect(
      selectTeamMembers({
        user: {
          currentTeam: null,
          allTeamMembers: [],
        } as any,
      }),
    ).toEqual([]);

    expect(
      selectTeamMembers({
        user: {
          currentTeam: { id: "team-a" },
          allTeamMembers: [
            {
              email: "a@example.com",
              role: "owner",
              status: "left_team",
              memberId: "1",
              joinedAt: 1,
              userId: "u1",
              phone: "",
              alias: "old",
            },
            {
              email: "a@example.com",
              role: "member",
              status: "Active",
              memberId: "2",
              joinedAt: 2,
              userId: "u2",
              phone: "",
              alias: "new",
            },
          ],
        } as any,
      }),
    ).toEqual([
      {
        email: "a@example.com",
        role: "member",
        status: "Active",
        memberIds: ["1", "2"],
        joinedAt: 2,
        userId: "u2",
        phone: "",
        alias: "new",
      },
    ]);

    expect(
      selectTeamMembers({
        user: {
          currentTeam: { id: "team-a" },
          allTeamMembers: [
            {
              email: "b@example.com",
              role: "member",
              status: "left_team",
              memberId: "1",
              joinedAt: 1,
              userId: "u1",
              phone: "",
              alias: "old",
            },
            {
              email: "b@example.com",
              role: "admin",
              status: "Invite Expired",
              memberId: "2",
              joinedAt: 3,
              userId: "u2",
              phone: "",
              alias: "newer",
            },
          ],
        } as any,
      }),
    ).toEqual([
      {
        email: "b@example.com",
        role: "admin",
        status: "Left Team",
        memberIds: ["1", "2"],
        joinedAt: 3,
        userId: "u2",
        phone: "",
        alias: "newer",
      },
    ]);
  });

  it("updates multimodal state and selectors", () => {
    const config = {
      modelConfig: { config: { category: "image_gen" } },
    } as any;
    let state = multimodalSlice.reducer(
      undefined,
      setMultimodalConfigs({ configs: [config], priceMap: { sku: 1 } }),
    );
    state = multimodalSlice.reducer(
      state,
      setMultimodalPriceMap({ sku2: "2" }),
    );
    state = multimodalSlice.reducer(state, clearError());

    const rootState = { multimodal: state };
    expect(selectMultimodalConfigs(rootState)).toEqual([config]);
    expect(selectMultimodalConfigsByCategory("image_gen")(rootState)).toEqual([
      config,
    ]);
    expect(selectMultimodalPriceMap(rootState)).toEqual({ sku: 1, sku2: "2" });
    expect(selectMultimodalLoading(rootState)).toBe(false);
    expect(selectMultimodalError(rootState)).toBeNull();

    state = multimodalSlice.reducer(state, clearMultimodalConfigs());
    expect(state.configs).toEqual([]);
    expect(state.priceMap).toEqual({});
  });

  it("fetches multimodal configs, sorts by rank and maps dynamic discounts", async () => {
    jest.clearAllMocks();
    const highRankConfig = {
      fusionConfig: { rank: 20 },
      modelConfig: {
        config: { category: "video_gen" },
        skuMappings: [{ skuCode: "sku-video" }],
      },
    } as any;
    const lowRankConfig = {
      fusionConfig: { rank: 1 },
      modelConfig: {
        config: { category: "image_gen" },
        skuMappings: [{ skuCode: "sku-image" }, { skuCode: "sku-image" }],
      },
    } as any;

    mockGetEnabledFusionProductConfigs.mockResolvedValueOnce([
      highRankConfig,
      lowRankConfig,
    ]);
    mockGetBatchPrice.mockResolvedValueOnce([
      {
        basePrice0: 10000,
        discountPrice0: 5000,
        pricePrecision: 4,
        productId: "sku-image",
      },
      {
        basePrice0: 10000,
        discountPrice0: "",
        pricePrecision: 4,
        productId: "sku-video",
      },
    ]);

    const store = configureStore({
      reducer: {
        config: configSlice.reducer,
        multimodal: multimodalSlice.reducer,
      },
    });

    const action = await store.dispatch(fetchMultimodalConfigs(true) as any);

    expect(action.type).toBe(fetchMultimodalConfigs.fulfilled.type);
    expect(mockGetBatchPrice).toHaveBeenCalledWith(
      expect.objectContaining({
        businessType: "model_api",
        productIds: expect.arrayContaining(["sku-image", "sku-video"]),
      }),
    );
    expect(store.getState().multimodal.configs).toEqual([
      lowRankConfig,
      highRankConfig,
    ]);
    expect(store.getState().multimodal.priceMap).toMatchObject({
      "sku-image": { discountPrice: 0.125, originalPrice: 0.25 },
      "sku-video": 0.25,
    });
    expect(store.getState().multimodal.loading).toBe(false);
    expect(store.getState().multimodal.error).toBeNull();
  });

  it("reuses cached multimodal configs and records fetch errors", async () => {
    jest.clearAllMocks();
    const cachedConfig = {
      modelConfig: { config: { category: "audio_gen" }, skuMappings: [] },
    } as any;
    const cachedState = multimodalSlice.reducer(
      undefined,
      setMultimodalConfigs({ configs: [cachedConfig], priceMap: { sku: 3 } }),
    );
    const cachedStore = configureStore({
      preloadedState: { multimodal: cachedState },
      reducer: { multimodal: multimodalSlice.reducer },
    });

    const skipped = await cachedStore.dispatch(
      fetchMultimodalConfigs(false) as any,
    );

    expect(skipped.type).toBe(fetchMultimodalConfigs.rejected.type);
    expect(skipped.meta.condition).toBe(true);
    expect(mockGetEnabledFusionProductConfigs).not.toHaveBeenCalled();

    mockGetEnabledFusionProductConfigs.mockRejectedValueOnce(
      new Error("fusion unavailable"),
    );
    const errorStore = configureStore({
      reducer: { multimodal: multimodalSlice.reducer },
    });

    const failed = await errorStore.dispatch(
      fetchMultimodalConfigs(true) as any,
    );

    expect(failed.type).toBe(fetchMultimodalConfigs.rejected.type);
    expect(errorStore.getState().multimodal).toMatchObject({
      error: "fusion unavailable",
      isFetching: false,
      loading: false,
    });
  });
});
