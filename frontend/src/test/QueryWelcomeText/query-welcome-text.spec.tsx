import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import "@testing-library/jest-dom";
import {QueryWelcomeText} from "../../components/QueryWelcomeText/query-welcome-text.tsx";

describe("QueryWelcomeText Component", () => {
    it("renders the component without crashing", () => {
        render(<QueryWelcomeText />);
        expect(screen.getByText("Welcome to HEBSE!")).toBeVisible();
        expect(screen.getByText("Welcome to HEBSE!").parentElement).toHaveStyle("" +
            " backgroundColor: \"#2e2d2e\",\n" +
            "              borderRadius: \"15px\",\n" +
            "              maxWidth: \"lg\",\n" +
            "              width: \"100%\",\n" +
            "              fontFamily: \"monospace\",\n" +
            "              padding: \"20px\",\n" +
            "              marginTop:\"100px\",\n" +
            "              textAlign: \"center\"")
    });
});
