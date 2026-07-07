import { fireEvent, render, screen } from "@testing-library/react";
import { SizeField } from "@/app/models-console/multimodal-playground/components/FormFields/SizeField";

describe("SizeField (options/select mode)", () => {
  it("renders a select with the provided options and forwards changes", () => {
    const onChange = jest.fn();
    render(
      <SizeField
        value="1024*1024"
        onChange={onChange}
        options={["512*512", "1024*1024"]}
      />,
    );
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("1024*1024");
    fireEvent.change(select, { target: { value: "512*512" } });
    expect(onChange).toHaveBeenCalledWith("512*512");
  });
});

describe("SizeField (slider mode)", () => {
  it("initializes width/height from the value prop", () => {
    render(<SizeField value="768*512" onChange={jest.fn()} />);
    expect(screen.getByText("Width")).toBeInTheDocument();
    expect(screen.getByText("Height")).toBeInTheDocument();
    const inputs = screen.getAllByRole("spinbutton");
    expect(inputs[0]).toHaveValue(768);
    expect(inputs[1]).toHaveValue(512);
  });

  it("emits a combined width*height string when width changes", () => {
    const onChange = jest.fn();
    render(<SizeField value="1024*1024" onChange={onChange} />);
    const widthInput = screen.getAllByRole("spinbutton")[0];
    fireEvent.change(widthInput, { target: { value: "512" } });
    expect(onChange).toHaveBeenCalledWith("512*1024");
  });

  it("emits a combined string when height changes", () => {
    const onChange = jest.fn();
    render(<SizeField value="1024*1024" onChange={onChange} />);
    const heightInput = screen.getAllByRole("spinbutton")[1];
    fireEvent.change(heightInput, { target: { value: "768" } });
    expect(onChange).toHaveBeenCalledWith("1024*768");
  });

  it("shows an error message when error is set", () => {
    render(<SizeField value="1024*1024" onChange={jest.fn()} error="oops" />);
    expect(screen.getByText("oops")).toBeInTheDocument();
  });
});
