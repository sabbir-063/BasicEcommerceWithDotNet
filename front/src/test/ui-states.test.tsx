import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import React from "react";
import { Loading, Empty, Banner } from "../main"; // need to export them

test("Loading renders a spinner", () => {
  render(<Loading />);
  expect(screen.getByText("Loading…")).toBeInTheDocument();
});

test("Empty renders text and optional action", () => {
  render(<Empty text="No items found" action={<button>Retry</button>} />);
  expect(screen.getByText("No items found")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
});

test("Banner renders error message", () => {
  render(<Banner text="Network error" />);
  expect(screen.getByRole("alert")).toHaveTextContent("Network error");
});
