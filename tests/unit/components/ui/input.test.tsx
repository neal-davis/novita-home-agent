import { act, fireEvent, render, screen } from "@testing-library/react";
import { Input, SearchInput } from "@/components/ui/input";

describe("Input", () => {
  it("tracks typed value and forwards onChange", () => {
    const onChange = jest.fn();
    render(<Input placeholder="name" onChange={onChange} />);
    const input = screen.getByPlaceholderText("name") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "abc" } });
    expect(input.value).toBe("abc");
    expect(onChange).toHaveBeenCalled();
  });

  it("syncs to a controlled value prop", () => {
    const { rerender } = render(<Input value="one" onChange={() => {}} />);
    const input = screen.getByDisplayValue("one") as HTMLInputElement;
    rerender(<Input value="two" onChange={() => {}} />);
    expect(input.value).toBe("two");
  });

  it("shows a clear button only when allowClear and a value are present, and clears", () => {
    const onChange = jest.fn();
    const onClear = jest.fn();
    render(<Input allowClear onClear={onClear} name="q" onChange={onChange} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;

    // no clear button while empty
    expect(screen.queryByLabelText("Clear input")).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "hello" } });
    const clearBtn = screen.getByLabelText("Clear input");
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(input.value).toBe("");
    expect(onClear).toHaveBeenCalled();
    // onChange called with an empty synthetic event
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ target: { value: "", name: "q" } }),
    );
  });

  it("renders prefix icon and suffix nodes", () => {
    render(
      <Input
        prefixIcon={<span>PFX</span>}
        suffix={<span>SFX</span>}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText("PFX")).toBeInTheDocument();
    expect(screen.getByText("SFX")).toBeInTheDocument();
  });

  it("uses defaultValue as the initial value", () => {
    render(<Input defaultValue="seed" />);
    expect(screen.getByDisplayValue("seed")).toBeInTheDocument();
  });
});

describe("SearchInput", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("debounces search and trims the query", () => {
    const onSearch = jest.fn();
    render(<SearchInput onSearch={onSearch} debounceTime={500} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "  spaced  " } });
    expect(onSearch).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(onSearch).toHaveBeenCalledWith("spaced");
  });

  it("cancels the pending debounce on unmount", () => {
    const onSearch = jest.fn();
    const { unmount } = render(<SearchInput onSearch={onSearch} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "late" },
    });

    unmount();
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(onSearch).not.toHaveBeenCalled();
  });
});
