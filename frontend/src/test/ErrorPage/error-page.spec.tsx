import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import "@testing-library/jest-dom";
import {ErrorPage} from "../../components/ErrorPage/error-page.tsx";

describe("ErrorPage Component", () => {
    it("renders the component without crashing", () => {
        render(<ErrorPage />);
        expect(screen.getByText("Oops!")).toBeVisible();
        expect(screen.getByText("Sorry, an expected error has occurred")).toBeVisible();
    });
});
