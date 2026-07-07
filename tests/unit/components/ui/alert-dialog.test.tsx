import { fireEvent, render, screen } from "@testing-library/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

describe("AlertDialog", () => {
  it("renders title, description and actions when open", () => {
    render(
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm delete</AlertDialogTitle>
            <AlertDialogDescription>This is permanent</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.getByText("Confirm delete")).toBeInTheDocument();
    expect(screen.getByText("This is permanent")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("does not render content when closed", () => {
    render(
      <AlertDialog open={false}>
        <AlertDialogContent>
          <AlertDialogTitle>Hidden</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("fires the action onClick", () => {
    const onClick = jest.fn();
    render(
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogTitle>t</AlertDialogTitle>
          <AlertDialogAction onClick={onClick}>OK</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>,
    );
    fireEvent.click(screen.getByText("OK"));
    expect(onClick).toHaveBeenCalled();
  });

  it("opens via the trigger", () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Shown now</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByText("Shown now")).toBeInTheDocument();
  });
});
