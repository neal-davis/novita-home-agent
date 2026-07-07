jest.mock("js-cookie", () => ({
  get: jest.fn(() => "cookie-token"),
  set: jest.fn(),
  remove: jest.fn(),
}));

// Break the userSlice -> api/user -> api/api -> store/index -> userSlice cycle.
jest.mock("@/api/api", () => ({
  request: jest.fn(),
  requestInServerEnv: jest.fn(),
}));
jest.mock("@/api/user", () => ({}));

import {
  fetchTeamInvite,
  logout,
  setUserInfo,
  switchTeam,
  userSlice,
} from "@/store/slice/userSlice";

const reducer = userSlice.reducer;

function baseState() {
  return reducer(undefined, { type: "@@INIT" });
}

describe("userSlice extra branches", () => {
  let reloadSpy: jest.Mock;
  beforeEach(() => {
    reloadSpy = jest.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { hostname: "console.example.com", reload: reloadSpy },
    });
  });

  it("resets user state on a 401 payload", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    let state = baseState();
    state = reducer(state, setUserInfo("401"));
    expect(state.token).toBe("");
    expect(state.uid).toBe(-1);
    expect(state.state).toBeDefined();
    expect(reloadSpy).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("populates user info and current team from a full payload", () => {
    let state = baseState();
    state = reducer(
      state,
      setUserInfo({
        uid: 7,
        uuid: "u7",
        email: "a@b.com",
        role: 1,
        teamId: "t1",
        teams: [
          {
            teamId: "t1",
            teamName: "Team One",
            role: "owner",
            maxMemberCount: 5,
            memberId: "m1",
            remarkName: "alias",
          },
        ],
      }),
    );
    expect(state.uuid).toBe("u7");
    expect(state.currentTeam?.id).toBe("t1");
    expect(state.teams).toHaveLength(1);
  });

  it("sets currentTeam to null when the active teamId is not in teams", () => {
    let state = baseState();
    state = reducer(
      state,
      setUserInfo({
        uid: 8,
        uuid: "u8",
        teamId: "missing",
        teams: [{ teamId: "other", teamName: "Other", role: "basic" }],
      }),
    );
    expect(state.currentTeam).toBeNull();
  });

  it("switchTeam is a no-op with no teams, and selects a team when present", () => {
    let state = baseState();
    // no teams -> no-op
    state = reducer(state, switchTeam("t1"));
    expect(state.currentTeam).toBeNull();

    state = reducer(
      state,
      setUserInfo({
        uid: 1,
        uuid: "u1",
        teams: [
          { teamId: "t1", teamName: "One", role: "owner" },
          { teamId: "t2", teamName: "Two", role: "admin" },
        ],
      }),
    );
    state = reducer(state, switchTeam("t2"));
    expect(state.currentTeam?.id).toBe("t2");
  });

  it("logout clears the session", () => {
    let state = baseState();
    state = reducer(state, logout());
    expect(state.token).toBe("");
    expect(state.uid).toBe(-1);
    expect(state.currentTeam).toBeNull();
  });

  it("fetchTeamInvite.fulfilled maps invite fields", () => {
    let state = baseState();
    state = reducer(state, {
      type: fetchTeamInvite.fulfilled.type,
      payload: {
        email: "i@x.com",
        name: "T",
        role: "admin",
        phone: "123",
        team_id: "tid",
      },
    });
    expect(state.teamInvite.email).toBe("i@x.com");
    expect(state.teamInvite.teamId).toBe("tid");
  });
});
