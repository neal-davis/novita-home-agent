import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ChangeNewTemplateModal from "@/app/gpus-console/explore/components/changeNewTemplate";
import {
  reqGetOfficialTemplates,
  reqGetTemplates,
} from "@/api/gpu-instance/templates";
import { message } from "@/components/ui/standard/notify";
import { matchLogoForTemplate } from "@/lib/utils/utils";
import Cookies from "js-cookie";

const mockDispatch = jest.fn();
const mockPush = jest.fn();
let mockUser = { uuid: "user-a" };
let selectValueChange = (_: string) => {};

jest.mock("@/api/gpu-instance/templates", () => ({
  reqGetOfficialTemplates: jest.fn(),
  reqGetTemplates: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children }: any) => <span>{children}</span>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick} type="button">
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  SearchInput: ({ onSearch, placeholder, value }: any) => (
    <input
      aria-label={placeholder}
      onChange={(event) => onSearch?.(event.target.value)}
      placeholder={placeholder}
      value={value}
    />
  ),
}));

jest.mock(
  "@/app/gpus-console/explore/components/changeNewTemplateInput",
  () => ({
    SearchInput: ({ onSearch, placeholder, value }: any) => (
      <input
        aria-label={placeholder}
        onChange={(event) => onSearch?.(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    ),
  }),
);

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange, value }: any) => {
    selectValueChange = onValueChange;
    return <div data-value={value}>{children}</div>;
  },
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <button onClick={() => selectValueChange(value)} type="button">
      {children}
    </button>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

jest.mock("@/app/components/Modal/Modal", () => ({
  __esModule: true,
  default: ({ children, onCancel, open }: any) =>
    open ? (
      <div role="dialog">
        {children}
        <button onClick={onCancel} type="button">
          close modal
        </button>
      </div>
    ) : null,
}));

jest.mock("@/app/gpus-console/components/ContentSkeleton", () => ({
  __esModule: true,
  default: () => <div>loading skeleton</div>,
}));

jest.mock("@/app/gpus-console/components/DataEmpty", () => ({
  __esModule: true,
  default: ({ description, title }: any) => (
    <div>
      {title} {description}
    </div>
  ),
}));

jest.mock("@/components/ui/table", () => ({
  __esModule: true,
  default: () => <div>loading templates</div>,
}));

jest.mock(
  "@/app/gpus-console/explore/components/changeNewTemplateOperations",
  () => ({
    __esModule: true,
    default: ({ refreshTemplateListFun, templateInfo }: any) => (
      <button
        onClick={(event) => {
          event.stopPropagation();
          refreshTemplateListFun(templateInfo.Id, templateInfo.isCollected);
        }}
        type="button"
      >
        {templateInfo.isCollected
          ? `unfavorite ${templateInfo.name}`
          : `favorite ${templateInfo.name}`}
      </button>
    ),
  }),
);

jest.mock("@/app/gpus-console/explore/components/readMe", () => ({
  __esModule: true,
  default: ({ finishForm, readMe }: any) => (
    <div>
      <div>README: {readMe}</div>
      <button onClick={finishForm} type="button">
        close readme
      </button>
    </div>
  ),
}));

jest.mock("@/lib/utils/utils", () => ({
  matchLogoForTemplate: jest.fn(() => "/template.svg"),
}));

jest.mock("@/lib/utils/date", () => ({
  sliceUTCString: jest.fn((value: string) => value.slice(0, 16)),
}));

jest.mock("@/store", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: () => mockUser,
}));

jest.mock("@/store/slice/userSlice", () => ({
  setUserState: jest.fn((payload) => ({ payload, type: "setUserState" })),
  UserState: { logout: "logout" },
}));

jest.mock("next/navigation", () => ({
  usePathname: () => "/gpus-console/explore",
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/constants/urls", () => ({
  NOVITA_URL: {
    TEMPLATE_LIBRARY: "/templates-library",
    USER_LOGIN: "/user/login",
  },
}));

jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (path: string, locale: string) => `/${locale}${path}`,
}));

jest.mock("@/i18n/provider", () => ({
  useI18n: () => ({ locale: "en" }),
}));

jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: jest.fn() },
}));

jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: {
    GPUS_CONSOLE: {
      EXPLORE_CHANGE_TEMPLATE_FILTER: "filter",
    },
  },
}));

jest.mock("js-cookie", () => ({
  get: jest.fn(),
}));

const mockReqGetTemplates = reqGetTemplates as jest.Mock;
const mockReqGetOfficialTemplates = reqGetOfficialTemplates as jest.Mock;
const mockMatchLogoForTemplate = matchLogoForTemplate as jest.Mock;
const mockCookieGet = Cookies.get as jest.Mock;
let consoleLogSpy: jest.SpyInstance;
let consoleErrorSpy: jest.SpyInstance;

const officialTemplates = [
  {
    Id: "official-a",
    channel: "official",
    collectNum: 2,
    description: "official desc",
    extra: { tags: ["NEW"] },
    image: "registry.test/official:latest",
    isCollected: false,
    logo: "/logo.png",
    name: "Official Template",
    readme: "official readme",
    sort: 10,
    updatedAt: 1700000000,
  },
  {
    Id: "community-a",
    channel: "community",
    collectNum: 8,
    description: "community desc",
    image: "registry.test/community:latest",
    isCollected: true,
    name: "Community Template",
    sort: 1,
    updatedAt: 1700000100,
  },
  {
    Id: "hidden-a",
    channel: "official",
    collectNum: 0,
    name: "Hidden Template",
    updatedAt: 1700000200,
  },
];

const privateTemplates = [
  {
    Id: "private-a",
    channel: "private",
    description: "private desc",
    image: "registry.test/private:latest",
    isUsed: true,
    name: "Private Template",
    updatedAt: 1700000300,
  },
  {
    Id: "community-private-a",
    channel: "community",
    description: "private community desc",
    image: "registry.test/private-community:latest",
    isCollected: false,
    isUsed: true,
    name: "Private Community Template",
    updatedAt: 1700000400,
  },
];

function mockTemplateResponses() {
  const clone = (items: any[]) => items.map((item) => ({ ...item }));
  mockReqGetOfficialTemplates.mockResolvedValue({
    template: clone(officialTemplates),
  });
  mockReqGetTemplates.mockImplementation((params) => {
    if (params.channels?.includes("private")) {
      return Promise.resolve({ template: clone(privateTemplates) });
    }
    return Promise.resolve({ template: clone(officialTemplates) });
  });
}

function renderChangeNewTemplate(overrides: { user?: { uuid?: string } } = {}) {
  mockUser = overrides.user === undefined ? { uuid: "user-a" } : overrides.user;
  const onClose = jest.fn();
  const onConfirm = jest.fn();
  render(
    <ChangeNewTemplateModal
      currentTemplate={officialTemplates[0]}
      onClose={onClose}
      onConfirm={onConfirm}
      open
    />,
  );
  return { onClose, onConfirm };
}

beforeEach(() => {
  jest.clearAllMocks();
  consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  mockCookieGet.mockReturnValue(undefined);
  mockTemplateResponses();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      origin: "https://example.test",
      search: "?gpu=4090",
    },
  });
  Object.defineProperty(window, "open", {
    configurable: true,
    value: jest.fn(),
  });
});

afterEach(() => {
  consoleLogSpy.mockRestore();
  consoleErrorSpy.mockRestore();
});

describe("ChangeNewTemplateModal", () => {
  it("loads signed-in templates, shows the current template, and confirms a selection", async () => {
    const { onConfirm } = renderChangeNewTemplate();

    expect(await screen.findByText("Current Template")).toBeInTheDocument();
    expect(screen.getAllByText("Official Template").length).toBeGreaterThan(0);
    expect(screen.getByText("Private Template")).toBeInTheDocument();
    expect(screen.getByText("Community Template")).toBeInTheDocument();
    expect(screen.queryByText("Hidden Template")).not.toBeInTheDocument();
    expect(mockReqGetTemplates).toHaveBeenCalledWith(
      expect.objectContaining({ channels: ["private"], creators: "" }),
    );

    fireEvent.click(screen.getByText("Private Template"));
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ Id: "private-a" }),
    );
  });

  it("filters categories and updates collected state through child operations", async () => {
    renderChangeNewTemplate();

    expect(await screen.findByText("Private Template")).toBeInTheDocument();
    fireEvent.click(screen.getAllByText("Official")[0]);
    expect(screen.getByText("Official (1)")).toBeInTheDocument();
    expect(screen.getAllByText("Official Template").length).toBeGreaterThan(0);
    expect(screen.queryByText("Private Template")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("favorite Official Template"));
    expect(
      await screen.findByText("unfavorite Official Template"),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search Template"), {
      target: { value: "does-not-exist" },
    });
    expect(await screen.findByText(/No results found/)).toBeInTheDocument();
    expect(screen.getByText(/Recommended for You/)).toBeInTheDocument();
  });

  it("protects private categories for anonymous users and fetches only official templates", async () => {
    mockCookieGet.mockReturnValue("expired-token");
    renderChangeNewTemplate({ user: {} });

    expect(await screen.findByText("Official Template")).toBeInTheDocument();
    expect(mockReqGetOfficialTemplates).toHaveBeenCalledWith(
      expect.objectContaining({ channels: ["official"] }),
    );
    expect(screen.queryByText("Private Template")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("My Favorites"));
    expect(message.error).toHaveBeenCalledWith(
      "Login failure, please log in again",
    );
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: "logout",
      type: "setUserState",
    });
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("/en/user/login?redirect="),
    );
  });
});
