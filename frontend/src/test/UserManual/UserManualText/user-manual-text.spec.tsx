import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserManualText } from "../../../components/UserManual/UserManualText/user-manual-text.tsx";

describe("UserManualText Component", () => {
  const title = "Sample Title";
  const message = "This is a sample message.";
  const sections = [
    { title: "Section 1", description: "Description 1" },
    { title: "Section 2", description: "Description 2" },
  ];

  // Test that the title renders correctly
  it("renders the title correctly", () => {
    render(<UserManualText title={title} message={message} sections={sections} />);
    expect(screen.getByText(title)).toBeVisible();
  });

  // Test that the message renders correctly
  it("renders the message correctly", () => {
    render(<UserManualText title={title} message={message} sections={sections} />);
    expect(screen.getByText(message)).toBeVisible();
  });

//   // Test that sections are not visible initially
//   it("does not show sections initially", () => {
//     render(<UserManualText title={title} message={message} sections={sections} />);
//     expect(screen.queryByText("Section 1")).not.toBeInTheDocument();
//     expect(screen.queryByText("Description 1")).not.toBeInTheDocument();
//   });

  // Test that the 'Show More' button is present initially
  it("shows 'Show More' button initially", () => {
    render(<UserManualText title={title} message={message} sections={sections} />);
    const button = screen.getByRole("button", { name: /show more/i });
    expect(button).toBeVisible();
  });

  // Test that clicking the button expands the sections and updates the button text
  it("expands sections when button is clicked", () => {
    render(<UserManualText title={title} message={message} sections={sections} />);
    const button = screen.getByRole("button", { name: /show more/i });
    fireEvent.click(button);
    expect(screen.getByText("Section 1")).toBeVisible();
    expect(screen.getByText("Description 1")).toBeVisible();
    expect(screen.getByRole("button", { name: /hide details/i })).toBeVisible();
  });
});