import { fireEvent, render, screen } from "@testing-library/react";
import PricingModelFilter from "@/app/pricing/components/PricingModelFilter";

jest.mock("@/app/components/ModelLibrary/ModelLogo", () => ({
  __esModule: true,
  default: ({ modelName }: { modelName: string }) => (
    <span data-testid="model-logo">{modelName}</span>
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    onValueChange,
    value,
  }: {
    children: React.ReactNode;
    onValueChange: (value: string) => void;
    value: string;
  }) => (
    <div data-testid="provider-select" data-value={value}>
      {children}
      <button type="button" onClick={() => onValueChange("OpenAI")}>
        choose-openai
      </button>
      <button type="button" onClick={() => onValueChange("All")}>
        choose-all-provider
      </button>
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({ children, className }: any) => (
    <button className={className} type="button">
      {children}
    </button>
  ),
  SelectValue: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

describe("PricingModelFilter", () => {
  const onSearchChange = jest.fn();
  const onFilterTypeChange = jest.fn();
  const onProviderChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderFilter(
    props: Partial<React.ComponentProps<typeof PricingModelFilter>> = {},
  ) {
    return render(
      <PricingModelFilter
        availableProviders={["OpenAI", "Anthropic"]}
        filterType="All"
        onFilterTypeChange={onFilterTypeChange}
        onProviderChange={onProviderChange}
        onSearchChange={onSearchChange}
        searchValue=""
        {...props}
      />,
    );
  }

  it("renders search, category filters and provider options", () => {
    renderFilter({ selectedProvider: "OpenAI" });

    expect(screen.getByLabelText("Search models")).toBeInTheDocument();
    expect(screen.getByLabelText("Filter by All")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByLabelText("Filter by LLM")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getAllByText("OpenAI").length).toBeGreaterThan(0);
    expect(screen.getByTestId("provider-select")).toHaveAttribute(
      "data-value",
      "OpenAI",
    );
  });

  it("search input clears active filters when typing a non-empty value", () => {
    renderFilter({ filterType: "Image", selectedProvider: "OpenAI" });

    fireEvent.change(screen.getByLabelText("Search models"), {
      target: { value: "flux" },
    });

    expect(onFilterTypeChange).toHaveBeenCalledWith("All");
    expect(onProviderChange).toHaveBeenCalledWith("");
    expect(onSearchChange).toHaveBeenCalledWith("flux");
  });

  it("clear search only resets the search value", () => {
    renderFilter({ searchValue: "gpt" });

    fireEvent.click(screen.getByLabelText("Clear search"));

    expect(onSearchChange).toHaveBeenCalledWith("");
    expect(onFilterTypeChange).not.toHaveBeenCalled();
    expect(onProviderChange).not.toHaveBeenCalled();
  });

  it("category clicks toggle active type and reset provider/search", () => {
    renderFilter({ filterType: "Image", searchValue: "flux" });

    fireEvent.click(screen.getByLabelText("Filter by Image"));
    expect(onSearchChange).toHaveBeenCalledWith("");
    expect(onProviderChange).toHaveBeenCalledWith("");
    expect(onFilterTypeChange).toHaveBeenCalledWith("All");

    fireEvent.click(screen.getByLabelText("Filter by Video"));
    expect(onFilterTypeChange).toHaveBeenLastCalledWith("Video");
  });

  it("provider changes clear search and reset filter type", () => {
    renderFilter({ filterType: "Video", searchValue: "kling" });

    fireEvent.click(screen.getByText("choose-openai"));

    expect(onSearchChange).toHaveBeenCalledWith("");
    expect(onFilterTypeChange).toHaveBeenCalledWith("All");
    expect(onProviderChange).toHaveBeenCalledWith("OpenAI");

    fireEvent.click(screen.getByText("choose-all-provider"));
    expect(onProviderChange).toHaveBeenLastCalledWith("");
  });

  it("marks category buttons active only when no provider is selected", () => {
    const { rerender } = renderFilter({ filterType: "Audio" });

    expect(screen.getByLabelText("Filter by Audio")).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    rerender(
      <PricingModelFilter
        availableProviders={["OpenAI"]}
        filterType="Audio"
        onFilterTypeChange={onFilterTypeChange}
        onProviderChange={onProviderChange}
        onSearchChange={onSearchChange}
        searchValue=""
        selectedProvider="OpenAI"
      />,
    );

    expect(screen.getByLabelText("Filter by Audio")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
