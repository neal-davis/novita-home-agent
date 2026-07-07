import { render, screen } from "@testing-library/react";
import { ApiInfo } from "@/app/models-console/multimodal-playground/components/ApiInfo/index";

beforeEach(() => {
  Object.assign(navigator, { clipboard: { writeText: jest.fn() } });
});

describe("ApiInfo", () => {
  const formData = { prompt: "a cat" };

  it("renders a single Request block for sync tasks", () => {
    render(
      <ApiInfo
        endpoint="/v3/txt2img"
        isAsyncTask={false}
        formData={formData}
      />,
    );
    expect(screen.getByText("Request")).toBeInTheDocument();
    expect(screen.queryByText("Submit task")).not.toBeInTheDocument();
    // request body + endpoint embedded in the curl command
    expect(screen.getByText(/a cat/)).toBeInTheDocument();
    expect(screen.getByText(/api.novita.ai\/v3\/txt2img/)).toBeInTheDocument();
  });

  it("renders submit + query blocks for async tasks", () => {
    render(
      <ApiInfo
        endpoint="/v3/async/txt2video"
        isAsyncTask
        formData={formData}
      />,
    );
    expect(screen.getByText("Submit task")).toBeInTheDocument();
    expect(screen.getByText("Query result")).toBeInTheDocument();
    expect(screen.getByText(/task-result/)).toBeInTheDocument();
  });
});
