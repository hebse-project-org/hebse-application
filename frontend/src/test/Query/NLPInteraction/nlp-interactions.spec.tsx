import {describe, expect, it, vi} from "vitest";
import "@testing-library/jest-dom";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {NlpInteractions} from "../../../components/Query/NLPInteraction/nlp-interactions.tsx";
import * as UtilityFunctions from "../../../components/Utilities/utility-functions";

/* eslint-disable  unicorn/no-null */

describe("NlpInteractions component", () => {
    beforeEach(() => {
        
        // Mock localStorage for gpt_settings
        vi.spyOn(Storage.prototype, "getItem").mockImplementation((key: string) => {
            if (key === "gpt_settings") {
                return "mockCiphertext"; // Whatever fake ciphertext
            }
            return null;
        });

        // Mock decrypt function
        vi.spyOn(UtilityFunctions, "decrypt").mockResolvedValue(
            JSON.stringify({
                apiKey: "mock-api-key",
                model: "gpt-4",
            })
        );
        
        // Mock fetch for GPT response
        vi.stubGlobal("fetch", vi.fn((url) => {
            if (url === "http://localhost:8000/test_gpt") {
                return Promise.resolve({
                  ok: true,
                  json: () =>
                    Promise.resolve({ response: { content: "pong" } }),
                });
              }

            if (url === "http://localhost:8000/ask_gpt") {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ response: { content: "Mock GPT response" } }),
                });
            }
            if (url === "http://localhost:3001/decrypt") {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ plaintext: '{"apiKey":"mock-api-key","model":"gpt-4"}' }),
                });
            }
            return Promise.reject(new Error("Unknown fetch URL"));
        }));
        
    });

    it("keeps GPT disconnected when /test_gpt returns OK but no response", async () => {
        const fetchMock = vi.mocked(globalThis.fetch, true);
      
        fetchMock.mockImplementationOnce((url: URL | RequestInfo) => {
          if (url === "http://localhost:8000/test_gpt") {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({}),   
            } as Response);
          }
          return Promise.reject(new Error(`Unknown fetch URL ${url}`));
        });

        render(<NlpInteractions />);
      
        await screen.findByText(
          /GPT Model is not connected\. Check Settings -> GPT API Settings\./i
        );
      });

    it("renders Query Assistance title", () => {
        render(<NlpInteractions />);
        expect(screen.getByText("Query Assistance")).toBeVisible();
    });

    it("renders the input field and button", () => {
        render(<NlpInteractions />);
        expect(screen.getByLabelText("Ask GPT")).toBeVisible();
        expect(screen.getByRole("button", { name: "QUERY" })).toBeVisible();
    });

    it("should display the mock GPT response after submitting a query", async () => {
        render(<NlpInteractions />);

        // Wait for connection check to finish
        await waitFor(() => {
            expect(screen.getByText(/GPT Model is connected!/)).toBeInTheDocument();
        });

        const input = screen.getByLabelText(/Ask GPT/i);
        fireEvent.change(input, { target: { value: "How do I write a SQL query?" } });

        const queryButton = screen.getByRole("button", { name: "QUERY" });
        fireEvent.click(queryButton);

        // Await for the mocked response to show up
        await waitFor(() => {
            expect(screen.getByText(/Mock GPT response/)).toBeInTheDocument();
        });
    });

    it("should set response when missing local storage", async () => {
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            return null;
        });

        render(<NlpInteractions />);

        // Wait for connection check to finish
        await waitFor(() => {
            expect(screen.getByText(/GPT Model is not connected. Check Settings -> GPT API Settings./)).toBeInTheDocument();
        });
    });

    it("should throw error when ask gpt status bad", async () => {

        vi.stubGlobal("fetch", vi.fn((url) => {

            //must assert that the test_gpt endpoint is called first, then the ask_gpt endpoint. 
            if (url === "http://localhost:8000/test_gpt") {
                return Promise.resolve({
                  ok: false,
                  status: 500,                      
                });
              }

            if (url === "http://localhost:8000/ask_gpt") {
                return Promise.resolve({
                    ok: false,
                    status: "500"
                });
            }
            return Promise.reject(new Error("Unknown fetch URL"));
        }));
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        render(<NlpInteractions />);

        // Wait for connection check to finish
        await waitFor(() => {
            expect(screen.getByText(/GPT Model is not connected. Check Settings -> GPT API Settings./)).toBeInTheDocument();
        });

        expect(consoleErrorSpy).toHaveBeenCalled();

        expect(consoleErrorSpy.mock.calls[0][1].message).toEqual("Connection test failed: HTTP status 500");

        consoleErrorSpy.mockRestore();
    });

    it("should fail to handle query when API key missing", async () => {
        render(<NlpInteractions />);

        // Wait for connection check to finish
        await waitFor(() => {
            expect(screen.getByText(/GPT Model is connected!/)).toBeInTheDocument();
        });

        const input = screen.getByLabelText(/Ask GPT/i);
        fireEvent.change(input, { target: { value: "How do I write a SQL query?" } });

        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            return null;
        });

        const queryButton = screen.getByRole("button", { name: "QUERY" });
        fireEvent.click(queryButton);

        await waitFor(() => {
            expect(screen.getByText(/GPT settings not found. Please set up your API key first./)).toBeInTheDocument();
        });
    });


    it("should fail to handle query when backend doesn't respond", async () => {
        render(<NlpInteractions />);


        // Wait for connection check to finish
        await waitFor(() => {
            expect(screen.getByText(/GPT Model is connected!/)).toBeInTheDocument();
        });

        const input = screen.getByLabelText(/Ask GPT/i);
        fireEvent.change(input, { target: { value: "How do I write a SQL query?" } });


        const queryButton = screen.getByRole("button", { name: "QUERY" });
        vi.stubGlobal("fetch", vi.fn((url) => {
            if (url === "http://localhost:8000/ask_gpt") {
                return Promise.resolve({
                    ok: false,
                    status: "500"
                });
            }
            return Promise.reject(new Error("Unknown fetch URL"));
        }));
        fireEvent.click(queryButton);


        await waitFor(() => {
            expect(screen.getByText(/An error occurred while fetching the response./)).toBeInTheDocument();
        });
    });

    it("should set no response when successful call but no response", async () => {
        render(<NlpInteractions />);


        // Wait for connection check to finish
        await waitFor(() => {
            expect(screen.getByText(/GPT Model is connected!/)).toBeInTheDocument();
        });

        const input = screen.getByLabelText(/Ask GPT/i);
        fireEvent.change(input, { target: { value: "How do I write a SQL query?" } });


        const queryButton = screen.getByRole("button", { name: "QUERY" });
        vi.stubGlobal("fetch", vi.fn((url) => {
            if (url === "http://localhost:8000/ask_gpt") {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ response :{}}),
                });
            }
            return Promise.reject(new Error("Unknown fetch URL"));
        }));
        fireEvent.click(queryButton);


        await waitFor(() => {
            expect(screen.getByText(/No response received from GPT./)).toBeInTheDocument();
        });
    });

    it("should not set GPT connected when no response", async () => {
        vi.stubGlobal("fetch", vi.fn((url) => {
            if (url === "http://localhost:8000/ask_gpt") {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({}),
                });
            }
            if (url === "http://localhost:3001/decrypt") {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ plaintext: '{"apiKey":"mock-api-key","model":"gpt-4"}' }),
                });
            }
            return Promise.reject(new Error("Unknown fetch URL"));
        }));
        render(<NlpInteractions />);

        // Wait for connection check to finish
        await waitFor(() => {
            expect(screen.getByText(/GPT Model is not connected. Check Settings -> GPT API Settings./)).toBeInTheDocument();
        });
    });
    
});
