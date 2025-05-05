import {describe, it, expect} from "vitest";
import {About} from "../../components/About/about.tsx";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

describe("About Component", () => {
    it("renders the component without crashing", () => {
        render(<About />);
        expect(screen.getByText("About Us")).toBeVisible();
    });

    it("displays the correct description", () => {
        render(<About />);
        expect(screen.getByText(/The development of HEBSE is a result of/i)).toBeVisible();
    });

    it("contains the project website link", () => {
        render(<About />);
        const linkElement = screen.getByRole("link", { name: /https:\/\/sdmay25-20.sd.ece.iastate.edu\//i });
        expect(linkElement).toBeVisible();
        expect(linkElement).toHaveAttribute("href", "https://sdmay25-20.sd.ece.iastate.edu/");
    });
});
