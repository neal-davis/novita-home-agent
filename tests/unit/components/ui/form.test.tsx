import { fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

function Harness({ withError = false }: { withError?: boolean }) {
  const methods = useForm({ defaultValues: { name: "" } });

  useEffect(() => {
    if (withError) {
      methods.setError("name", { type: "manual", message: "Name is required" });
    }
  }, [withError, methods]);

  return (
    <Form {...methods}>
      <form>
        <FormField
          control={methods.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your name</FormLabel>
              <FormControl>
                <input aria-label="name-input" {...field} />
              </FormControl>
              <FormDescription>Enter your full name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

describe("Form", () => {
  it("renders label, control, and description", () => {
    render(<Harness />);
    expect(screen.getByText("Your name")).toBeInTheDocument();
    expect(screen.getByLabelText("name-input")).toBeInTheDocument();
    expect(screen.getByText("Enter your full name")).toBeInTheDocument();
  });

  it("does not render a message when there is no error", () => {
    render(<Harness />);
    // FormMessage returns null when there is no body
    expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
  });

  it("shows the error message and marks the label destructive on error", () => {
    render(<Harness withError />);
    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Your name")).toHaveClass("text-destructive");
  });

  it("wires the control to the field so typing updates the input", () => {
    render(<Harness />);
    const input = screen.getByLabelText("name-input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Ada" } });
    expect(input.value).toBe("Ada");
  });
});
