import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Section from "@/app/gpus-console/templates-library/components/list";
import {
  reqAddTemplate,
  reqGetOfficialTemplates,
  reqGetTemplateById,
  reqGetTemplates,
  reqOperateTemplate,
} from "@/api/gpu-instance/templates";
import analytics from "@/app/components/analytics/analytics";
import { message } from "@/components/ui/standard/notify";
import { copyText } from "@/lib/utils/utils";
import Cookies from "js-cookie";
import { useAppDispatch, useAppSelector } from "@/store";

const routerPush = jest.fn();
const dispatch = jest.fn();

jest.mock("@/api/gpu-instance/templates", () => ({
  reqAddTemplate: jest.fn(),
  reqGetOfficialTemplates: jest.fn(),
  reqGetTemplateById: jest.fn(),
  reqGetTemplates: jest.fn(),
  reqOperateTemplate: jest.fn(),
}));

jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: {
    trackClick: jest.fn(),
  },
}));

jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: {
    GPUS_CONSOLE: {
      TEMPLATE_LIBRARY_COPY_LINK: "copy-link",
      TEMPLATE_LIBRARY_FAVORITE: "favorite",
      TEMPLATE_LIBRARY_GO_TO_DETAIL: "detail",
    },
  },
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/lib/utils/utils", () => ({
  copyText: jest.fn(),
}));

jest.mock("@/constants/urls", () => ({
  NOVITA_URL: {
    GPU_CONSOLE_TEMPLATE_LIBRARY: "/gpu/template-library",
    USER_LOGIN: "/login",
  },
}));

jest.mock("@/i18n/config", () => ({
  getLocalizedPath: jest.fn(
    (path: string, locale: string) => `/${locale}${path}`,
  ),
}));

jest.mock("@/i18n/provider", () => ({
  useI18n: () => ({ locale: "en" }),
}));

jest.mock("next/navigation", () => ({
  usePathname: () => "/gpu/template-library",
  useRouter: () => ({ push: routerPush }),
}));

jest.mock("react-use", () => ({
  useLocation: () => ({
    href: "https://novita.test/gpu/template-library?favorite=0",
  }),
}));

jest.mock("js-cookie", () => ({
  get: jest.fn(),
}));

jest.mock("@/store", () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock("@/store/slice/userSlice", () => ({
  setUserState: jest.fn((state) => ({
    payload: state,
    type: "user/setUserState",
  })),
  UserState: {
    logout: "logout",
  },
}));

jest.mock("@/app/gpus-console/components/ContentSkeletonDeep", () => ({
  __esModule: true,
  default: () => <div>loading templates</div>,
}));

jest.mock("@/app/gpus-console/components/DataEmpty", () => ({
  __esModule: true,
  default: ({ description, title }: { description: string; title: string }) => (
    <div>
      <div>{title}</div>
      <div>{description}</div>
    </div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, disabled, onClick }: any) => (
    <button type="button" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock("lucide-react", () => ({
  LayoutGrid: () => <span>layout icon</span>,
  PenTool: () => <span>pen icon</span>,
  PlusIcon: () => <span>plus icon</span>,
  ShieldCheck: () => <span>shield icon</span>,
  Star: () => <span>star icon</span>,
}));

jest.mock("@/components/ui/input", () => ({
  SearchInput: ({ onSearch, value }: any) => (
    <div>
      <span>search value {value}</span>
      <button type="button" onClick={() => onSearch("private")}>
        search private
      </button>
      <button type="button" onClick={() => onSearch("nothing")}>
        search nothing
      </button>
    </div>
  ),
}));

jest.mock("@/app/gpus-console/templates-library/components/itemList", () => ({
  __esModule: true,
  default: ({
    copyTemplate,
    deleteTemplate,
    handleClick,
    handleCopy,
    handleFavorite,
    items,
    modifyTemplate,
  }: any) => (
    <div>
      {items.map((item: any) => (
        <div key={item.Id}>
          <span>{item.name}</span>
          <button type="button" onClick={() => handleClick(item.Id)}>
            detail {item.Id}
          </button>
          <button
            type="button"
            onClick={(event) =>
              handleFavorite(item.Id, item.isCollected, event)
            }
          >
            favorite {item.Id}
          </button>
          <button type="button" onClick={(event) => handleCopy(item.Id, event)}>
            share {item.Id}
          </button>
          <button
            type="button"
            onClick={(event) => copyTemplate(item.Id, event)}
          >
            duplicate {item.Id}
          </button>
          <button type="button" onClick={() => modifyTemplate(item.Id)}>
            edit {item.Id}
          </button>
          <button type="button" onClick={() => deleteTemplate(item)}>
            delete {item.Id}
          </button>
        </div>
      ))}
    </div>
  ),
}));

jest.mock("@/app/gpus-console/components/addTemplate", () => ({
  __esModule: true,
  default: ({ finishForm, mode, templateObj }: any) => (
    <div>
      <div>
        add template {mode} {(templateObj as any).Id || "new"}
      </div>
      <button type="button" onClick={() => finishForm(true)}>
        finish template
      </button>
      <button type="button" onClick={() => finishForm(false)}>
        cancel template
      </button>
    </div>
  ),
}));

jest.mock("@/app/gpus-console/templates/components/section", () => ({
  MyModal: ({ children, onCancel, open }: any) =>
    open ? (
      <div>
        <div>modal open</div>
        <button type="button" onClick={onCancel}>
          close modal
        </button>
        {children}
      </div>
    ) : null,
}));

jest.mock("@/app/gpus-console/templates/components/deleteTemplate", () => ({
  __esModule: true,
  default: ({ finishForm, templateInfoObj }: any) => (
    <div>
      delete template {(templateInfoObj as any).Id}
      <button type="button" onClick={() => finishForm(true)}>
        confirm delete
      </button>
    </div>
  ),
}));

const mockAddTemplate = reqAddTemplate as jest.Mock;
const mockGetOfficialTemplates = reqGetOfficialTemplates as jest.Mock;
const mockGetTemplateById = reqGetTemplateById as jest.Mock;
const mockGetTemplates = reqGetTemplates as jest.Mock;
const mockOperateTemplate = reqOperateTemplate as jest.Mock;
const mockUseAppSelector = useAppSelector as jest.Mock;
const mockUseAppDispatch = useAppDispatch as jest.Mock;

function mockLoggedIn(uuid = "user-1") {
  mockUseAppSelector.mockImplementation(
    (selector: (state: unknown) => unknown) => selector({ user: { uuid } }),
  );
}

function setupApis() {
  mockGetOfficialTemplates.mockResolvedValue({
    template: [
      {
        Id: "official-low",
        channel: "official",
        collectNum: 1,
        isCollected: false,
        name: "official low",
        sort: 1,
        updatedAt: 1,
      },
      {
        Id: "community-high",
        channel: "community",
        collectNum: 50,
        isCollected: true,
        name: "community high",
        sort: 99,
        updatedAt: 10,
      },
    ],
  });
  mockGetTemplates.mockResolvedValue({
    template: [
      {
        Id: "private-a",
        channel: "private",
        isCollected: false,
        name: "private template",
      },
    ],
  });
  mockGetTemplateById.mockResolvedValue({
    template: {
      Id: "private-a",
      enableApplication: true,
      instanceApplicationConfig: { hidden: true },
      name: "private template",
    },
  });
  mockOperateTemplate.mockResolvedValue({});
  mockAddTemplate.mockResolvedValue({});
}

describe("GPU templates library list", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseAppDispatch.mockReturnValue(dispatch);
    mockLoggedIn();
    setupApis();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { origin: "https://novita.test", search: "?favorite=0" },
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("loads and sorts official/private templates, filters categories, and opens details", async () => {
    render(<Section />);

    expect(screen.getByText("loading templates")).toBeInTheDocument();
    expect(await screen.findByText("All Templates(3)")).toBeInTheDocument();
    expect(screen.getByText("official low")).toBeInTheDocument();
    expect(screen.getByText("community high")).toBeInTheDocument();
    expect(screen.getByText("private template")).toBeInTheDocument();
    expect(mockGetOfficialTemplates).toHaveBeenCalledWith(
      expect.objectContaining({ name: "" }),
    );
    expect(mockGetTemplates).toHaveBeenCalledWith(
      expect.objectContaining({ channel: "private" }),
    );

    fireEvent.click(screen.getByRole("button", { name: /Official/ }));
    expect(await screen.findByText("Official(1)")).toBeInTheDocument();
    expect(screen.queryByText("community high")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /My Creations/ }));
    expect(await screen.findByText("My Creations(1)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "detail private-a" }));
    expect(analytics.trackClick).toHaveBeenCalledWith("detail", {
      templateId: "private-a",
    });
    expect(routerPush).toHaveBeenCalledWith(
      "/en/gpu/template-library?templateId=private-a",
    );
  });

  it("searches, favorites, shares, duplicates, edits, and deletes templates", async () => {
    render(<Section />);

    expect(await screen.findByText("All Templates(3)")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "search private" }));
    expect(await screen.findByText("All Templates(1)")).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "favorite private-a" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "favorite private-a" }));
    await waitFor(() => {
      expect(mockOperateTemplate).toHaveBeenCalledWith({
        operatorType: "collect",
        templateId: "private-a",
      });
    });
    expect(message.success).toHaveBeenCalledWith("Favorite successfully");

    fireEvent.click(screen.getByRole("button", { name: "share private-a" }));
    await waitFor(() => {
      expect(copyText).toHaveBeenCalledWith(
        "https://novita.test/gpu/template-library?templateId=private-a&sharer=user-1",
      );
    });

    fireEvent.click(
      screen.getByRole("button", { name: "duplicate private-a" }),
    );
    await waitFor(() => {
      expect(mockAddTemplate).toHaveBeenCalledWith({
        template: expect.not.objectContaining({
          enableApplication: true,
          instanceApplicationConfig: expect.anything(),
        }),
      });
    });
    expect(mockAddTemplate.mock.calls[0][0].template.name).toBe(
      "private template(1)",
    );

    fireEvent.click(screen.getByRole("button", { name: "edit private-a" }));
    expect(
      await screen.findByText("add template Edit private-a"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "finish template" }));
    expect(message.success).toHaveBeenCalledWith("success");

    fireEvent.click(screen.getByRole("button", { name: "delete private-a" }));
    expect(await screen.findByText("modal open")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "confirm delete" }));
    expect(mockGetTemplates).toHaveBeenCalledWith(
      expect.objectContaining({ channel: "private" }),
    );
  });

  it("shows recommendations for empty searches and redirects unauthenticated actions", async () => {
    mockLoggedIn("");
    (Cookies.get as jest.Mock).mockReturnValueOnce("expired-token");
    render(<Section />);

    expect(await screen.findByText("All Templates(2)")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "search nothing" }));
    expect(await screen.findByText("No Results Found")).toBeInTheDocument();
    expect(screen.getByText("🔥 Recommended for You")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /My Favorites/ }));
    expect(message.error).toHaveBeenCalledWith("Please log in first");
    jest.runOnlyPendingTimers();
    expect(routerPush).toHaveBeenCalledWith(
      "/en/login?redirect=/gpu/template-library%3Ffavorite%3D0",
    );

    fireEvent.click(screen.getByRole("button", { name: /Create Template/ }));
    expect(message.error).toHaveBeenCalledWith(
      "Login failure, please log in again",
    );
  });
});
