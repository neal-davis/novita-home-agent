import Cookies from "js-cookie";
import { info } from "@/api/user";
import { getAllTeamMembers, getInviteInfo } from "@/api/team";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export enum UserState {
  login = "login",
  logout = "logout",
  initializing = "initializing",
}

export type TeamInfo = {
  id: string;
  name: string;
  role: TeamRole;
  maxMemberCount: number;
  memberId: string;
  alias: string;
};

interface UserStateType {
  state: UserState;
  token: string;
  uid: number;
  email: string;
  email_cn: string;
  mobilePhone: string;
  firstName: string;
  lastName: string;
  username: string;
  companyName: string;
  country: string;
  role: number;
  uuid: string;
  verifyStatus: number;
  isVerifyLimit: boolean;
  teamInvite: {
    email: string;
    phone: string;
    teamName: string;
    role: string;
    teamId: string;
  };
  teams: Array<TeamInfo>;
  currentTeam: TeamInfo | null;
  allTeamMembers: {
    email: string;
    role: string;
    status: string;
    memberId: string;
    joinedAt: number;
    userId: string;
    phone: string;
    alias: string;
  }[];
  billingAccount: string;
  isAlreadyTopup: boolean;
  isQuestionnaire: boolean | null;
  thirdPartyName: string;
  tier: string;
  teamOwnerUuid?: string;
}

export function updateUserInfo(state: any, action: any) {
  if (action.payload == "401") {
    console.warn("got 401 on user slice!");
    state.token = "";
    state.uid = -1;
    state.email = "";
    state.email_cn = "";
    state.role = -1;
    state.uuid = "";
    state.mobilePhone = "";
    state.firstName = "";
    state.lastName = "";
    state.username = "";
    state.companyName = "";
    state.country = "";
    state.isVerifyLimit = true;
    state.verifyStatus = 0;
    state.state = UserState.logout;
    state.teams = [];
    state.tier = "";
    if (typeof window !== "undefined") {
      Cookies.remove("token");
      window.location.reload();
    }
    return;
  }
  if (action.payload?.uuid) {
    state.token =
      typeof window === "undefined" ? "" : Cookies.get("token") || "";
    state.uid = action.payload.uid;
    state.email = action.payload.email || action.payload.mobilePhone;
    state.email_cn = action.payload.email;
    state.role = action.payload.role;
    state.uuid = action.payload.uuid;
    state.mobilePhone = action.payload.mobilePhone;
    state.firstName = action.payload.firstName;
    state.lastName = action.payload.lastName;
    state.billingAccount = action.payload.billingAccount;
    state.teamOwnerUuid = action.payload.teamOwnerUuid;
    state.isAlreadyTopup = action.payload.isAlreadyTopup;
    state.isQuestionnaire = action.payload.isQuestionnaire;
    state.thirdPartyName = action.payload.thirdPartyName;
    state.username =
      action.payload.username?.split("@")[0] ||
      action.payload.email?.split("@")[0];
    state.companyName = action.payload.companyName;
    state.country = action.payload.country;
    state.state = action.payload.uid ? UserState.login : UserState.logout;
    state.teams = action.payload.teams.map((t: any) => ({
      id: t.teamId,
      name: t.teamName,
      role: t.role,
      maxMemberCount: t.maxMemberCount,
      memberId: t.memberId,
      alias: t.remarkName,
    }));
    state.tier = action.payload.tier;
    if (action.payload.teams.length > 0 && action.payload.teamId) {
      const curTeam = action.payload.teams?.find(
        (t: any) => t.teamId === action.payload.teamId,
      );
      if (curTeam) {
        state.currentTeam = {
          id: curTeam.teamId,
          name: curTeam.teamName,
          role: curTeam.role,
          maxMemberCount: curTeam.maxMemberCount,
          memberId: curTeam.memberId,
          alias: curTeam.remarkName,
        };
      } else {
        state.currentTeam = null;
      }
    } else {
      state.currentTeam = null;
    }

    if (action.payload.verifyStatus) {
      state.verifyStatus = action.payload.verifyStatus;
    }
    if (action.payload.isVerifyLimit) {
      state.isVerifyLimit = action.payload.isVerifyLimit;
    }
  }
  return state;
}

export const fetchUserInfo = createAsyncThunk("users/getUserInfo", async () => {
  try {
    const response = await info();
    return response;
  } catch (error) {
    return error;
  }
});

export const fetchTeamInvite = createAsyncThunk(
  "users/getTeamInvite",
  async (inviteToken: string) => {
    try {
      const res = await getInviteInfo(inviteToken);
      if (res?.name) {
        return res;
      } else {
        throw new Error(JSON.stringify(res));
      }
    } catch (error) {
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    }
  },
);

export const fetchAllTeamMembers = createAsyncThunk(
  "users/fetchAllTeamMembers",
  async () => {
    const response = await getAllTeamMembers();
    return response;
  },
);

export const setUserState = createAsyncThunk(
  "users/setUserState",
  (userState: UserState) => {
    try {
      return userState;
    } catch (error) {
      return error;
    }
  },
);

export enum TeamRole {
  owner = "owner",
  admin = "admin",
  developer = "developer",
  basic = "basic",
  billing = "billing",
}

export enum TeamMemberStatus {
  all = "all",
  active = "Active",
  invitePending = "Invite Pending",
  inviteCanceled = "Invite Canceled",
  inviteExpired = "Invite Expired",
  leftTeam = "Left Team",
}

export const userSlice = createSlice({
  name: "user",
  initialState: {
    state: UserState.initializing,
    token: typeof window === "undefined" ? "" : Cookies.get("token"),
    uid: -1,
    email: "",
    email_cn: "", // real email in cn, email may be mobilePhone
    mobilePhone: "",
    firstName: "",
    lastName: "",
    username: "",
    companyName: "",
    country: "",
    role: -1,
    uuid: "",
    verifyStatus: 0,
    isVerifyLimit: false,
    teamInvite: {
      email: "",
      phone: "",
      teamName: "",
      role: "",
      teamId: "",
    },
    teams: [],
    currentTeam: null,
    allTeamMembers: [],
    billingAccount: "",
    isAlreadyTopup: false,
    isQuestionnaire: null,
    thirdPartyName: "",
    tier: "",
    teamOwnerUuid: "",
  } as UserStateType,
  reducers: {
    setToken(state, action) {
      const oriToken = state.token;
      state.token = action.payload;
      if (typeof window !== "undefined") {
        const cookieOptions: any = { expires: 7 };
        if (window.location.hostname.includes("novita.ai")) {
          cookieOptions.domain = ".novita.ai";
        }
        Cookies.set("token", action.payload, cookieOptions);
      }
      if (!!oriToken && oriToken !== action.payload) {
        window.location.reload();
      }
    },
    setUserInfo(state, action) {
      updateUserInfo(state, action);
    },
    switchTeam(state, action) {
      if (state.teams.length === 0) {
        return;
      }
      if (action.payload) {
        state.currentTeam =
          state.teams?.find((t: any) => t.id === action.payload) || null;
      }
    },
    logout(state) {
      state.token = "";
      state.uid = -1;
      state.email = "";
      state.username = "";
      state.role = -1;
      state.teams = [];
      state.currentTeam = null;
      state.uuid = "";
      state.state = UserState.logout;
      state.currentTeam = null;
      if (typeof window !== "undefined") {
        Cookies.remove("token");
        if (window.location.hostname.includes("novita.ai")) {
          Cookies.remove("token", { domain: ".novita.ai" });
        }
      }
    },
  },
  extraReducers(builder) {
    builder.addCase(setUserState.fulfilled, (state, action) => {
      state.state = action.payload as UserState;
    });
    builder.addCase(fetchUserInfo.fulfilled, (state, action) => {
      updateUserInfo(state, action);
    });
    builder.addCase(fetchTeamInvite.fulfilled, (state, action) => {
      state.teamInvite.email = action.payload?.email || "";
      state.teamInvite.teamName = action.payload?.name || "";
      state.teamInvite.role = action.payload?.role || "";
      state.teamInvite.phone = action.payload?.phone || "";
      state.teamInvite.teamId = action.payload?.team_id || "";
    });
    builder.addCase(fetchAllTeamMembers.fulfilled, (state, action) => {
      state.allTeamMembers = action.payload.members.map((m: any) => ({
        email: m.email,
        role: m.role,
        status: m.status,
        memberId: m.member_id,
        joinedAt: parseInt(m.joined_at),
        userId: m.user_id,
        phone: m.phone,
        alias: m.remark_name,
      }));
    });
  },
});

// export
export const { setToken, setUserInfo, logout, switchTeam } = userSlice.actions;

export const selectTeamMembers = (state: { user: UserStateType }) => {
  const { currentTeam } = state.user;

  if (currentTeam === null || state.user.allTeamMembers.length === 0) {
    return [];
  }

  const identityKey = "email";

  // group by email/phone
  const groupedMembers = state.user.allTeamMembers.reduce(
    (acc, member) => {
      const key = member[identityKey];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(member);
      return acc;
    },
    {} as Record<string, typeof state.user.allTeamMembers>,
  );

  // deal with each group
  return Object.values(groupedMembers).map((members) => {
    // find active member
    const activeMember = members.find(
      (m) => m.status === TeamMemberStatus.active,
    );

    // if has active member, use active member info
    if (activeMember) {
      return {
        email: activeMember.email,
        role: activeMember.role,
        status: TeamMemberStatus.active,
        memberIds: members.map((m) => m.memberId),
        joinedAt: activeMember.joinedAt,
        userId: activeMember.userId,
        phone: activeMember.phone,
        alias: activeMember.alias,
      };
    }

    // if no active member, use latest joined member info
    const latestMember = members.reduce(
      (latest, current) =>
        current.joinedAt > latest.joinedAt ? current : latest,
      members[0],
    );

    return {
      email: latestMember.email,
      role: latestMember.role,
      status: TeamMemberStatus.leftTeam,
      memberIds: members.map((m) => m.memberId),
      joinedAt: latestMember.joinedAt,
      userId: latestMember.userId,
      phone: latestMember.phone,
      alias: latestMember.alias,
    };
  });
};
