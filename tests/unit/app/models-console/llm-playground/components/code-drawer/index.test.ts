import { CodeDrawer } from "@/app/models-console/llm-playground/components/code-drawer/index";

jest.mock(
  "@/app/models-console/llm-playground/components/code-drawer/CodeDrawer",
  () => ({ CodeDrawer: () => null }),
);

describe("code-drawer index barrel", () => {
  it("re-exports CodeDrawer", () => {
    expect(CodeDrawer).toBeDefined();
  });
});
