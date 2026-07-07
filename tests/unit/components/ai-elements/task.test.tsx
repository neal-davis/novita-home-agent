import { render, screen } from "@testing-library/react";
import {
  Task,
  TaskContent,
  TaskItem,
  TaskItemFile,
  TaskTrigger,
} from "@/components/ai-elements/task";

describe("Task", () => {
  it("renders the default trigger title and open content", () => {
    render(
      <Task>
        <TaskTrigger title="Searching" />
        <TaskContent>
          <TaskItem>Step one</TaskItem>
        </TaskContent>
      </Task>,
    );
    expect(screen.getByText("Searching")).toBeInTheDocument();
    expect(screen.getByText("Step one")).toBeInTheDocument();
  });

  it("hides content when not open by default", () => {
    render(
      <Task defaultOpen={false}>
        <TaskTrigger title="T" />
        <TaskContent>
          <TaskItem>Hidden step</TaskItem>
        </TaskContent>
      </Task>,
    );
    expect(screen.queryByText("Hidden step")).not.toBeInTheDocument();
  });

  it("TaskTrigger renders custom children", () => {
    render(
      <Task>
        <TaskTrigger title="ignored">
          <span>custom trigger</span>
        </TaskTrigger>
      </Task>,
    );
    expect(screen.getByText("custom trigger")).toBeInTheDocument();
  });

  it("TaskItemFile renders its children", () => {
    render(<TaskItemFile>file.ts</TaskItemFile>);
    expect(screen.getByText("file.ts")).toBeInTheDocument();
  });
});
