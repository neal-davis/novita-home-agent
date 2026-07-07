jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("@/store", () => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@/store/slice/userSlice", () => ({
  setToken: jest.fn((token: string) => ({
    payload: token,
    type: "user/setToken",
  })),
}));

import { cookies } from "next/headers";
import ServerStoreInit from "@/store/ServerStoreInit";
import { useAppDispatch } from "@/store";
import { setToken } from "@/store/slice/userSlice";

const mockCookies = cookies as jest.Mock;
const mockUseAppDispatch = useAppDispatch as unknown as jest.Mock;
const mockSetToken = setToken as unknown as jest.Mock;

describe("ServerStoreInit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("dispatches the token from server cookies", () => {
    const dispatch = jest.fn();
    mockUseAppDispatch.mockReturnValue(dispatch);
    mockCookies.mockReturnValue({
      get: jest.fn(() => ({ value: "server-token" })),
    });

    const result = ServerStoreInit();

    expect(mockCookies).toHaveBeenCalled();
    expect(mockSetToken).toHaveBeenCalledWith("server-token");
    expect(dispatch).toHaveBeenCalledWith({
      payload: "server-token",
      type: "user/setToken",
    });
    expect(result).toEqual(<></>);
  });

  it("does not dispatch when the token cookie is missing", () => {
    const dispatch = jest.fn();
    mockUseAppDispatch.mockReturnValue(dispatch);
    mockCookies.mockReturnValue({
      get: jest.fn(() => undefined),
    });

    ServerStoreInit();

    expect(mockSetToken).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
