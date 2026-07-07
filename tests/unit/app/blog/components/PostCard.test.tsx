import * as React from "react";
import { render, screen } from "@testing-library/react";
import PostCard from "@/app/blog/components/PostCard";
import type { PostSummary } from "@/lib/blog";

const basePost: PostSummary = {
  slug: "hello-world",
  title: "Hello World",
  description: "An intro post",
  author: "Novita AI",
  tags: ["Research", "LLM"],
  cover: "https://cdn.test/uploads/cover.webp",
  isSticky: false,
  readingMinutes: 4,
  pubDate: "2025-02-19 23:31:46",
  pubDateMs: Date.parse("2025-02-19T23:31:46"),
  updatedDate: null,
};

describe("PostCard", () => {
  it("links to the article and renders title, date and reading time", () => {
    render(<PostCard post={basePost} />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/blog/hello-world",
    );
    expect(screen.getByText("Hello World")).toBeInTheDocument();
    expect(screen.getByText("Feb 19, 2025")).toBeInTheDocument();
    expect(screen.getByText("4 min read")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Hello World");
  });

  it("renders a text fallback when there is no cover image", () => {
    render(<PostCard post={{ ...basePost, slug: "no-cover", cover: null }} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Novita AI")).toBeInTheDocument();
  });
});
