import { render, screen } from "@testing-library/react";
import {
  Message,
  MessageContent,
  MessageAvatar,
} from "@/components/ai-elements/message";

describe("Message", () => {
  it("applies the is-user class for user messages", () => {
    render(
      <Message from="user" data-testid="msg">
        hi
      </Message>,
    );
    expect(screen.getByTestId("msg")).toHaveClass("is-user");
  });

  it("applies the is-assistant class for assistant messages", () => {
    render(
      <Message from="assistant" data-testid="msg">
        hi
      </Message>,
    );
    const msg = screen.getByTestId("msg");
    expect(msg).toHaveClass("is-assistant");
    expect(msg).toHaveClass("flex-row-reverse");
  });

  it("MessageContent renders children", () => {
    render(<MessageContent>Body text</MessageContent>);
    expect(screen.getByText("Body text")).toBeInTheDocument();
  });

  it("MessageAvatar renders the AI fallback", () => {
    render(<MessageAvatar src="/a.png" name="Bot" data-testid="avatar" />);
    expect(screen.getByTestId("avatar")).toBeInTheDocument();
    expect(screen.getByText("AI")).toBeInTheDocument();
  });
});
