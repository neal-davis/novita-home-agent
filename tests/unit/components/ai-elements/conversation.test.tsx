import { fireEvent, render, screen } from "@testing-library/react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";

const scrollToBottom = jest.fn();
let mockIsAtBottom = false;

jest.mock("use-stick-to-bottom", () => {
  const StickToBottom: any = ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  );
  // eslint-disable-next-line react/display-name
  StickToBottom.Content = ({ children, className }: any) => (
    <div className={className}>{children}</div>
  );
  return {
    StickToBottom,
    useStickToBottomContext: () => ({
      isAtBottom: mockIsAtBottom,
      scrollToBottom,
    }),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  mockIsAtBottom = false;
});

describe("Conversation", () => {
  it("renders content with the log role", () => {
    render(
      <Conversation>
        <ConversationContent>Body</ConversationContent>
      </Conversation>,
    );
    expect(screen.getByRole("log")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("shows the scroll button when not at the bottom and scrolls on click", () => {
    render(<ConversationScrollButton />);
    const btn = screen.getByRole("button");
    fireEvent.click(btn);
    expect(scrollToBottom).toHaveBeenCalled();
  });

  it("hides the scroll button when already at the bottom", () => {
    mockIsAtBottom = true;
    render(<ConversationScrollButton />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
