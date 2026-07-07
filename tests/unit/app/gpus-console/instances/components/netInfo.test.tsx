import { render, screen } from "@testing-library/react";
import NetInfo from "@/app/gpus-console/instances/components/netInfo";

jest.mock("@/components/ui/table", () => ({
  Table: ({ children }: any) => <table>{children}</table>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
  TableCell: ({ children }: any) => <td>{children}</td>,
}));

describe("NetInfo", () => {
  it("renders a row per network volume with size and mount path", () => {
    render(
      <NetInfo
        netInfoList={[
          { size: 100, mountPath: "/data" },
          { size: 200, mountPath: "/models" },
        ]}
      />,
    );
    expect(screen.getByText("100 GB")).toBeInTheDocument();
    expect(screen.getByText("/data")).toBeInTheDocument();
    expect(screen.getByText("200 GB")).toBeInTheDocument();
    expect(screen.getByText("/models")).toBeInTheDocument();
    expect(screen.getByText("Mount Path")).toBeInTheDocument();
  });

  it("renders just the header when the list is empty", () => {
    render(<NetInfo netInfoList={[]} />);
    expect(screen.getByText("Size")).toBeInTheDocument();
    expect(screen.queryByText(/GB/)).not.toBeInTheDocument();
  });
});
