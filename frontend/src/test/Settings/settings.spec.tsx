import {describe, it, expect} from "vitest";
import { Settings } from "../../components/Settings/settings.tsx";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";


describe("UserManual Component", () => {
    // Test that all section titles render
    it("renders all section titles", async () => {
      render(<Settings />);
      const titles = [
        "GPT API Settings",
        "Database Connection Setup",
      ];

      await waitFor(() => {
        for (const title of titles) {
            const heading = screen.getByRole('heading', { name: title });
            expect(heading).toBeVisible();
          }
      })
    });
});