import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserManual } from "../../components/UserManual/user-manual.tsx";

describe("UserManual Component", () => {
  // Test that the welcome message renders
  it("renders the welcome message", () => {
    render(<UserManual />);
    expect(screen.getByText("Welcome to the Manual")).toBeVisible();
  });

  // Test that all section titles render
  it("renders all section titles", () => {
    render(<UserManual />);
    const titles = [
      "Setting Up and Connecting a PostgreSQL Database",
      "Database Connection Setup",
      "OpenAI API Connection Setup",
      "How to Make a Query",
      "Viewing and Downloading Query History",
    ];
    for (const title of titles) {
      expect(screen.getByText(title)).toBeVisible();
    };
  });
});