import {describe, expect, it} from "vitest";
import {fireEvent, render, screen} from "@testing-library/react";
import "@testing-library/jest-dom";
import HelpTextField from "../../components/HelpTextField/help-text-field.tsx";

describe("HelpTextField Component", () => {
    const mockOnChange = vi.fn();

    const defaultProps = {
        label: "Test Label",
        value: "test",
        onChange: mockOnChange,
        tooltipText: "Helpful info here",
    };

    it("renders the input with the given label", () => {
        render(<HelpTextField {...defaultProps} />);
        expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
    });

    it("renders the Info icon", () => {
        render(<HelpTextField {...defaultProps} />);
        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("displays tooltip on hover", async () => {
        render(<HelpTextField {...defaultProps} />);
        const iconButton = screen.getByRole("button");

        fireEvent.mouseOver(iconButton);
        expect(await screen.findByText("Helpful info here")).toBeInTheDocument();
    });

    it("calls onChange when input value changes", () => {
        render(<HelpTextField {...defaultProps} />);
        const input = screen.getByLabelText("Test Label");

        fireEvent.change(input, { target: { value: "new value" } });
        expect(mockOnChange).toHaveBeenCalledOnce();
    });
});