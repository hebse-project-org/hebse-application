import {describe, it, expect} from "vitest";
import { SettingsWelcomeText } from "../../../components/Settings/SettingsWelcomeText/settings-welcome-text.tsx";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

describe("SettingsWelcomeText Component", () => { 
    it("renders the component without crashing", () => {
        render( <SettingsWelcomeText/> );
        expect(screen.getByText("Configure Your Settings")).toBeVisible();
    });

    it("renders the expand/collapse button initially", () => {
        render(<SettingsWelcomeText/>);
        const button = screen.getByRole("button", { name: /show more/i });
        expect(button).toBeVisible();
    });

    // Test that clicking the button expands the sections and updates the button text
    it("expands sections when button is clicked", () => {
        render(<SettingsWelcomeText/>);
        const button = screen.getByRole("button", { name: /show more/i });
        fireEvent.click(button);
        
        expect(screen.getByText("GPT API Settings")).toBeVisible();
        expect(screen.getByText("Database Connection")).toBeVisible();
        expect(screen.getByRole("button", { name: /hide details/i })).toBeVisible();
    });
});