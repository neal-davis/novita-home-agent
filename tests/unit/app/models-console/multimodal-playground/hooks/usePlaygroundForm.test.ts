import { act, renderHook, waitFor } from "@testing-library/react";
import { usePlaygroundForm } from "@/app/models-console/multimodal-playground/hooks/usePlaygroundForm";
import {
  clearPlaygroundFormData,
  loadPlaygroundFormData,
} from "@/app/models-console/multimodal-playground/utils/localStorage";

jest.mock(
  "@/app/models-console/multimodal-playground/utils/localStorage",
  () => ({
    clearPlaygroundFormData: jest.fn(),
    loadPlaygroundFormData: jest.fn(),
  }),
);

const mockLoadPlaygroundFormData = loadPlaygroundFormData as jest.Mock;
const mockClearPlaygroundFormData = clearPlaygroundFormData as jest.Mock;

const requestSchema = {
  prompt: { type: "string", minLength: 3 },
  steps: { type: "integer", minimum: 1, maximum: 50 },
  optional: { type: "string" },
  image_urls: { type: "array", minItems: 1 },
} as any;

const requiredFields = ["prompt", "steps"];
const emptyExamples: typeof examples = [];
const examples = [
  {
    request: {
      prompt: "example prompt",
      steps: 8,
      optional: "from example",
    },
    response: {},
  },
];
const nestedSchema = {
  "input.prompt": { type: "string" },
  optional: { type: "string" },
  images: { type: "array" },
} as any;
const nestedRequiredFields = ["input.prompt"];

describe("usePlaygroundForm", () => {
  beforeEach(() => {
    mockLoadPlaygroundFormData.mockReset();
    mockClearPlaygroundFormData.mockReset();
  });

  it("initializes defaults merged with example request data", async () => {
    mockLoadPlaygroundFormData.mockReturnValue(null);

    const { result } = renderHook(() =>
      usePlaygroundForm({
        requestSchema,
        requiredFields,
        examples,
        modelName: "model-a",
      }),
    );

    await waitFor(() =>
      expect(result.current.formData).toEqual({
        prompt: "example prompt",
        steps: 8,
        optional: "from example",
      }),
    );
    expect(mockLoadPlaygroundFormData).toHaveBeenCalledWith("model-a");
    expect(mockClearPlaygroundFormData).not.toHaveBeenCalled();
  });

  it("uses saved form data once and clears it for the model", async () => {
    mockLoadPlaygroundFormData.mockReturnValue({
      prompt: "saved prompt",
      steps: 12,
    });

    const { result } = renderHook(() =>
      usePlaygroundForm({
        requestSchema,
        requiredFields,
        examples,
        modelName: "model-a",
      }),
    );

    await waitFor(() =>
      expect(result.current.formData).toMatchObject({
        prompt: "saved prompt",
        steps: 12,
      }),
    );
    expect(mockClearPlaygroundFormData).toHaveBeenCalledWith("model-a");
  });

  it("updates fields, clears field errors and resets to schema defaults", async () => {
    const { result } = renderHook(() =>
      usePlaygroundForm({
        requestSchema,
        requiredFields,
        examples: emptyExamples,
      }),
    );

    await waitFor(() =>
      expect(result.current.formData).toEqual({
        prompt: "",
        steps: 1,
      }),
    );

    act(() => {
      result.current.handleFieldChange("prompt", "ok");
    });
    expect(result.current.formData.prompt).toBe("ok");
    expect(result.current.errors.prompt).toBeNull();

    act(() => {
      result.current.handleReset();
    });
    expect(result.current.formData).toEqual({
      prompt: "",
      steps: 1,
    });
    expect(result.current.errors).toEqual({});
  });

  it("validates schema constraints and image URL fields", async () => {
    const { result } = renderHook(() =>
      usePlaygroundForm({
        requestSchema,
        requiredFields,
        examples: emptyExamples,
      }),
    );

    await waitFor(() => expect(result.current.formData.steps).toBe(1));

    act(() => {
      result.current.setFormData({
        prompt: "no",
        steps: 99,
        image_urls: ["ftp://not-allowed"],
      });
    });

    let valid = true;
    act(() => {
      valid = result.current.validateForm();
    });

    expect(valid).toBe(false);
    expect(result.current.errors).toEqual({
      prompt: "Length cannot be less than 3 characters",
      steps: "Cannot be greater than 50",
      image_urls: "Please enter an image URL starting with http or https",
    });
  });

  it("returns filtered nested data for submission", async () => {
    const { result } = renderHook(() =>
      usePlaygroundForm({
        requestSchema: nestedSchema,
        requiredFields: nestedRequiredFields,
        examples: emptyExamples,
      }),
    );

    await waitFor(() =>
      expect(result.current.formData["input.prompt"]).toBe(""),
    );

    act(() => {
      result.current.setFormData({
        "input.prompt": "hello",
        optional: "",
        images: [],
      });
    });

    expect(result.current.getFilteredData()).toEqual({
      input: {
        prompt: "hello",
      },
    });
  });
});
