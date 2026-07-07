import { createRef } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  LLMTools,
  LLMToolsRef,
  functionTemplates,
} from "@/app/models-console/llm-playground/components/chat-options/tools";

// jsdom lacks these APIs used by Radix popper measurement.
beforeAll(() => {
  if (!document.elementsFromPoint) {
    (
      document as unknown as { elementsFromPoint: () => Element[] }
    ).elementsFromPoint = () => [];
  }
});

const validTool = {
  name: "my_func",
  description: "does a thing",
  parameters: {
    type: "object",
    properties: { x: { type: "string" } },
    required: ["x"],
  },
};

describe("functionTemplates", () => {
  it("ships the two built-in templates", () => {
    expect(functionTemplates).toHaveLength(2);
    expect(functionTemplates[0].name).toBe("get_weather");
    expect(functionTemplates[1].name).toBe("simple_calculator");
  });
});

describe("LLMTools ref API", () => {
  it("getTools/setTools/clearTools round-trips through the ref", () => {
    const ref = createRef<LLMToolsRef>();
    render(<LLMTools ref={ref} />);

    expect(ref.current!.getTools()).toEqual([]);

    act(() => ref.current!.setTools([validTool]));
    // Card for the tool should render its name + parameters list
    expect(screen.getByText("my_func")).toBeInTheDocument();
    expect(screen.getByText(/Parameters:/)).toHaveTextContent("x");
    expect(ref.current!.getTools()).toEqual([validTool]);

    act(() => ref.current!.clearTools());
    expect(ref.current!.getTools()).toEqual([]);
    expect(screen.queryByText("my_func")).not.toBeInTheDocument();
  });

  it("renders 'None' when a tool has no properties", () => {
    const ref = createRef<LLMToolsRef>();
    render(<LLMTools ref={ref} />);
    act(() =>
      ref.current!.setTools([
        { name: "empty", description: "d", parameters: { type: "object" } },
      ]),
    );
    expect(screen.getByText(/Parameters:/)).toHaveTextContent("None");
  });
});

describe("LLMTools add dialog + validation", () => {
  const openAddDialog = () => {
    fireEvent.click(screen.getByRole("button", { name: /Add Function/i }));
  };

  it("opens the add dialog and shows valid-state save flow", () => {
    const ref = createRef<LLMToolsRef>();
    render(<LLMTools ref={ref} />);
    openAddDialog();

    expect(
      screen.getByRole("heading", { name: "Add Function" }),
    ).toBeInTheDocument();
    const textarea = screen.getByPlaceholderText("Enter JSON schema...");

    fireEvent.change(textarea, {
      target: { value: JSON.stringify(validTool) },
    });
    expect(screen.getByText("Format correct")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(ref.current!.getTools()).toEqual([validTool]);
  });

  it("flags invalid JSON syntax", () => {
    render(<LLMTools />);
    openAddDialog();
    const textarea = screen.getByPlaceholderText("Enter JSON schema...");
    fireEvent.change(textarea, { target: { value: "{ not json" } });

    expect(screen.getByText("Format error")).toBeInTheDocument();
    expect(screen.getByText(/Invalid JSON format/)).toBeInTheDocument();
  });

  it("reports each missing required field", () => {
    render(<LLMTools />);
    openAddDialog();
    const textarea = screen.getByPlaceholderText("Enter JSON schema...");
    fireEvent.change(textarea, { target: { value: JSON.stringify({}) } });

    expect(
      screen.getByText(/name field is required and must be a string/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/description field is required and must be a string/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/parameters field is required and must be an object/),
    ).toBeInTheDocument();
  });

  it("validates the nested parameters structure", () => {
    render(<LLMTools />);
    openAddDialog();
    const textarea = screen.getByPlaceholderText("Enter JSON schema...");
    fireEvent.change(textarea, {
      target: {
        value: JSON.stringify({
          name: "n",
          description: "d",
          parameters: { type: "array", properties: "nope", required: "nope" },
        }),
      },
    });

    expect(screen.getByText(/parameters.type must be/)).toBeInTheDocument();
    expect(
      screen.getByText(/parameters.properties must be an object/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/parameters.required must be an array/),
    ).toBeInTheDocument();
  });

  it("blocks saving a duplicate function name", () => {
    const ref = createRef<LLMToolsRef>();
    render(<LLMTools ref={ref} />);
    act(() => ref.current!.setTools([validTool]));

    openAddDialog();
    const textarea = screen.getByPlaceholderText("Enter JSON schema...");
    fireEvent.change(textarea, {
      target: { value: JSON.stringify(validTool) },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(
      screen.getByText(/Function name "my_func" already exists/),
    ).toBeInTheDocument();
    // still only one tool
    expect(ref.current!.getTools()).toHaveLength(1);
  });

  it("disables Save when textarea is empty", () => {
    render(<LLMTools />);
    openAddDialog();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });
});

describe("LLMTools edit + delete", () => {
  it("edits an existing tool through its card", () => {
    const ref = createRef<LLMToolsRef>();
    render(<LLMTools ref={ref} />);
    act(() => ref.current!.setTools([validTool]));

    fireEvent.click(screen.getByText("my_func"));
    expect(screen.getByText("Edit Function")).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText("Enter JSON schema...");
    const updated = { ...validTool, description: "updated desc" };
    fireEvent.change(textarea, { target: { value: JSON.stringify(updated) } });
    fireEvent.click(screen.getByRole("button", { name: "Update" }));

    expect(ref.current!.getTools()[0].description).toBe("updated desc");
  });

  it("deletes a tool via the trash button without opening edit", () => {
    const ref = createRef<LLMToolsRef>();
    render(<LLMTools ref={ref} />);
    act(() => ref.current!.setTools([validTool]));

    // The only button rendered before opening any dialog is the trash button
    // (the "Add Function" trigger has accessible text). Pick the icon-only one.
    const trashButton = screen
      .getAllByRole("button")
      .find((b) => !/Add Function/i.test(b.textContent || ""));
    fireEvent.click(trashButton!);

    expect(ref.current!.getTools()).toEqual([]);
    expect(screen.queryByText("Edit Function")).not.toBeInTheDocument();
  });
});
