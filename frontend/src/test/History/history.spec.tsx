import {describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
import {History} from "../../components/History/history.tsx";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);
vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "blob:http://localhost/fake-blob"),
    revokeObjectURL: vi.fn(),
});


describe("History", () => {

    const mockQueries = {
        recent_queries: [
            {id: "1", query_sql: "SELECT * FROM stars", time: new Date(1000).toISOString()},
            {id: "2", query_sql: "SELECT * FROM planets", time: new Date(5000).toISOString()},
        ]
    };

    beforeEach(() => {
        mockFetch.mockClear();
        mockFetch.mockImplementation((url) => {
            switch (url) {
                case "http://localhost:8000/getHistory": {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(mockQueries),
                    });
                }
                case "http://localhost:8000/GetData": {
                    return Promise.resolve({
                        ok: true
                    });
                }
                case "http://localhost:8000/exportData": {
                    return Promise.resolve({
                        ok: true,
                        blob: () => Promise.resolve(new Blob(['id,name\n1,Star A'], {type: 'text/csv'}))
                    });
                }
                default: {
                    return Promise.reject(new Error("Unknown endpoint"));
                }
            }
        });
    });

    it("renders table column titles", () => {
        render(<History/>);
        expect(screen.getByText("Query History")).toBeVisible();
        expect(screen.getByText("Query ID")).toBeVisible();
        expect(screen.getByText("Query")).toBeVisible();
        expect(screen.getByText("Queried")).toBeVisible();
        expect(screen.getByText("Download")).toBeVisible();
    })

    it("renders table rows", async () => {
        render(<History/>);
        await waitFor(() => {

            expect(screen.getByText(mockQueries.recent_queries[0].query_sql)).toBeVisible();
            expect(screen.getByText(mockQueries.recent_queries[0].id)).toBeVisible();
            expect(screen.getByText(new Date(mockQueries.recent_queries[0].time).toLocaleString())).toBeVisible();

            expect(screen.getByText(mockQueries.recent_queries[1].query_sql)).toBeVisible();
            expect(screen.getByText(mockQueries.recent_queries[1].id)).toBeVisible();
            expect(screen.getByText(new Date(mockQueries.recent_queries[1].time).toLocaleString())).toBeVisible();
            expect(screen.getByText("1–2 of 2")).toBeVisible();
        })
    })

    it("downloads data", async () => {
        render(<History/>);
        await waitFor(() => {
            const buttons = screen.getAllByRole("button");
            fireEvent.click(buttons[0]);
            expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/exportData")
        })
    })


    it("getHistory fails", async () => {
        mockFetch.mockImplementationOnce((url) => {
            if (url === "http://localhost:8000/getHistory") {
                return Promise.resolve({
                    ok: false,
                    json: () => Promise.resolve(mockQueries),
                });
            }
            return Promise.reject(new Error("Unknown endpoint"));
        });
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        render(<History/>);
        await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith(new Error("Failed to fetch recent queries")));
    })

    it("handles server error during download", async () => {
        // Mock initial history fetch
        mockFetch.mockImplementation((url) => {
            if (url === "http://localhost:8000/getHistory") {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockQueries),
                });
            } else if (url === "http://localhost:8000/GetData") {
                return Promise.resolve({
                    ok: false,
                    status: 500
                });
            }


            return Promise.reject(new Error("Unknown endpoint"));
        });

        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        render(<History/>);

        await waitFor(() => {
            const downloadButtons = screen.getAllByTestId("DownloadIcon");
            expect(downloadButtons.length).toBe(2);
        });

        const downloadButtons = screen.getAllByTestId("DownloadIcon");
        fireEvent.click(downloadButtons[0]);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith("Error fetching query result:", expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    it("handles error during CSV download", async () => {

        mockFetch.mockImplementation((url) => {
            switch (url) {
                case "http://localhost:8000/getHistory": {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(mockQueries),
                    });
                }
                case "http://localhost:8000/GetData": {
                    return Promise.resolve({
                        ok: true
                    });
                }
                case "http://localhost:8000/exportData": {
                    return Promise.resolve(new Error("Download failed"));
                }
                default: {
                    return Promise.reject(new Error("Unknown endpoint"));
                }
            }
        });

        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        render(<History/>);

        await waitFor(() => {
            const downloadButtons = screen.getAllByTestId("DownloadIcon");
            expect(downloadButtons.length).toBe(2);
        });

        const downloadButtons = screen.getAllByTestId("DownloadIcon");
        fireEvent.click(downloadButtons[0]);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith("Error downloading data:", expect.any(Error));
        });

        consoleSpy.mockRestore();
    });
})
