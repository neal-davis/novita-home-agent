import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BlogIndex from "@/app/blog/components/BlogIndex";
import type { PostSummary } from "@/lib/blog";

function post(slug: string, tags: string[]): PostSummary {
  return {
    slug,
    title: `Title ${slug}`,
    description: "",
    author: "Novita AI",
    tags,
    cover: null,
    isSticky: false,
    readingMinutes: null,
    pubDate: null,
    pubDateMs: null,
    updatedDate: null,
  };
}

const posts = [post("a", ["Partnerships"]), post("b", ["Research"])];
const tags = [
  { tag: "Partnerships", count: 1 },
  { tag: "Research", count: 1 },
];

describe("BlogIndex", () => {
  it("renders every post by default (SSG-visible list)", () => {
    render(<BlogIndex posts={posts} tags={tags} />);
    expect(screen.getByText("Title a")).toBeInTheDocument();
    expect(screen.getByText("Title b")).toBeInTheDocument();
  });

  it("filters the list client-side when a tag is selected", () => {
    render(<BlogIndex posts={posts} tags={tags} />);
    fireEvent.click(screen.getByRole("button", { name: /Research/ }));
    expect(screen.queryByText("Title a")).not.toBeInTheDocument();
    expect(screen.getByText("Title b")).toBeInTheDocument();
  });

  it("shows an empty state when the selected tag matches nothing", () => {
    render(<BlogIndex posts={[post("a", ["Partnerships"])]} tags={tags} />);
    fireEvent.click(screen.getByRole("button", { name: /Research/ }));
    expect(screen.getByText("No articles found.")).toBeInTheDocument();
  });
});
