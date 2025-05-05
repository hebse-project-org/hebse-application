import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {Utilities} from "../../components/Utilities/utilities.tsx";
import '@testing-library/jest-dom';


vi.mock("../../components/Utilities/DataDownload/data-download.tsx", () => ({
    default: () => <div>Mock Downloader</div>,
}));

describe("Utilities", () => {
    it("renders the Utilities layout with Downloader", () => {
        render(<Utilities />);

        expect(screen.getByText("Mock Downloader")).toBeVisible();
    });
});
