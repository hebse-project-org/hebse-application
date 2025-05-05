import {describe, expect, it, beforeEach, vi} from "vitest";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom"
import { QueryInput } from "../../../components/Query/QueryInput/query-input";

beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

describe("QueryInputComponent", () => {
    it("renders without crashing", async () => {
        const dbSettings = JSON.stringify({host: "localhost", port: 5432});
        localStorage.setItem("db_settings", dbSettings);
        //@ts-expect-error decryption function
        global.decrypt = vi.fn().mockResolvedValue(dbSettings);

        vi.spyOn(global, "fetch").mockResolvedValue({
            ok: true,
            json: async () => ({}),
        }as Response);

        render(
            <QueryInput
                savedQueries={[]}
                setSavedQueries={() => {}}
                inputValue="SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
                setInputValue={() => {}}
                onQueryResult={() => {}}
                setPageNumber={() => {}}
            />
        );

        expect(screen.getByText("SQL Query Input"));
        expect(screen.getByText("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")).toBeVisible();
        expect(screen.getByText("Checking DB connection..."));
        await waitFor(() => {
            expect(screen.getByText("Database not connected. Check Settings -> Database."));
        });
    });

    it("displays error when database settings are missing", async () => {
        const onQueryResult = vi.fn();
        render(
            <QueryInput
                savedQueries={[]}
                setSavedQueries={() => {}}
                inputValue="SELECT"
                setInputValue={() => {}}
                onQueryResult={onQueryResult}
                setPageNumber={() => {}}
            />
        );
        fireEvent.click(screen.getByText("SEARCH"));
        await waitFor(() =>
          expect(onQueryResult).toHaveBeenCalledWith("Database settings not found.")
        );
    });

    it("performs DB connection check", async () =>{
        const dbSettings = JSON.stringify({host: "localhost", port: 5432});
        localStorage.setItem("db_settings", dbSettings);
        //@ts-expect-error decryption function
        global.decrypt = vi.fn().mockResolvedValue(dbSettings);
        const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
            ok: true,
            json: async () => ({}),
        } as Response);

        render(
            <QueryInput
                savedQueries={[]}
                setSavedQueries={() => {}}
                inputValue="SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
                setInputValue={() => {}}
                onQueryResult={() => {}}
                setPageNumber={() => {}}
            />
        );
        await waitFor(() => {

            expect(fetchSpy).toHaveBeenCalledWith(
                "http://localhost:3001/decrypt",
                expect.objectContaining({
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                })
            );
        });
    });

    it("calls setInputValue when text is entered", () => {
        const mockSetInputValue = vi.fn();
        render(
          <QueryInput
            savedQueries={[]}
            setSavedQueries={() => {}}
            inputValue=""
            setInputValue={mockSetInputValue}
            onQueryResult={() => {}}
            setPageNumber={() => {}}
          />
        );
        const textField = screen.getByRole('textbox') as HTMLTextAreaElement;
        if (!textField) {
          throw new Error('Could not find the input element rendered by QueryInput.');
        }
        fireEvent.change(textField, { target: { value: 'SELECT id FROM tables;' } });
        expect(mockSetInputValue).toHaveBeenCalledWith('SELECT id FROM tables;');
    });

    it("opens the save menu", async () => {
        render(
            <QueryInput
                savedQueries={[]}
                setSavedQueries={() => {}}
                inputValue="SELECT"
                setInputValue={() => {}}
                onQueryResult={() => {}}
                setPageNumber={() => {}}
            />
        );;
        const openDialogButton = screen.getByText("SAVE");
        fireEvent.click(openDialogButton);
        await waitFor(() => {
          expect(screen.getByText("Save Query")).toBeVisible();
        });
      });

    it("updates the text field value on change", () => {
        render(
            <QueryInput
                savedQueries={[]}
                setSavedQueries={() => {}}
                inputValue="SELECT"
                setInputValue={() => {}}
                onQueryResult={() => {}}
                setPageNumber={() => {}}
            />
        );
        const openDialogButton = screen.getByText("SAVE");
        fireEvent.click(openDialogButton);
        const input = screen.getByLabelText("Query Name") as HTMLInputElement;
        fireEvent.change(input, { target: { value: "New Query Name" } });
        
        expect(input.value).toBe("New Query Name");
    });
    
    it("closes the save menu", async () => {
        render(
            <QueryInput
                savedQueries={[]}
                setSavedQueries={() => {}}
                inputValue="SELECT"
                setInputValue={() => {}}
                onQueryResult={() => {}}
                setPageNumber={() => {}}
            />
        );
        const openDialogButton = screen.getByText("SAVE");
        fireEvent.click(openDialogButton);
        const closeDialogButton = screen.getByText("Cancel");
        fireEvent.click(closeDialogButton);

        expect(screen.getByText("SQL Query Input"));
    });
    
    it("Saves a query", () => {
        const setSavedQueries = vi.fn();
        render(
            <QueryInput
                savedQueries={[]}
                setSavedQueries={setSavedQueries}
                inputValue="SELECT"
                setInputValue={() => {}}
                onQueryResult={() => {}}
                setPageNumber={() => {}}
            />
        );
        const openDialogButton = screen.getByText("SAVE");
        fireEvent.click(openDialogButton);
        const input = screen.getByLabelText("Query Name") as HTMLInputElement;
        fireEvent.change(input, { target: { value: "New" } });
        fireEvent.click(screen.getByText("Save"));
        expect(setSavedQueries).toBeCalledWith([{ "New": "SELECT" }]);
    });

    it("detects duplicates", () => {
        const setSavedQueries = vi.fn();
        render(
            <QueryInput
                savedQueries={[{ "New": "SELECT" }]}
                setSavedQueries={setSavedQueries}
                inputValue="SELECT"
                setInputValue={() => {}}
                onQueryResult={() => {}}
                setPageNumber={() => {}}
            />
        );
        const openDialogButton = screen.getByText("SAVE");
        fireEvent.click(openDialogButton);
        const input = screen.getByLabelText("Query Name") as HTMLInputElement;
        fireEvent.change(input, { target: { value: "New" } });
        fireEvent.click(screen.getByText("Save"));
        expect(alert("This query is already saved under this name."));
    });

    it("Can't save without a name!", () => {
        const setSavedQueries = vi.fn();
        render(
            <QueryInput
                savedQueries={[]}
                setSavedQueries={setSavedQueries}
                inputValue="SELECT"
                setInputValue={() => {}}
                onQueryResult={() => {}}
                setPageNumber={() => {}}
            />
        );
        const openDialogButton = screen.getByText("SAVE");
        fireEvent.click(openDialogButton);
        const input = screen.getByLabelText("Query Name") as HTMLInputElement;
        fireEvent.change(input, { target: { value: "" } });
        fireEvent.click(screen.getByText("Save"));
        expect(alert("Query name cannot be empty."));
    });

    it("Can't save without a query!", () => {
        const setSavedQueries = vi.fn();
        render(
            <QueryInput
                savedQueries={[]}
                setSavedQueries={setSavedQueries}
                inputValue=""
                setInputValue={() => {}}
                onQueryResult={() => {}}
                setPageNumber={() => {}}
            />
        );
        const openDialogButton = screen.getByText("SAVE");
        fireEvent.click(openDialogButton);
        expect(alert("Query cannot be empty."));
    });
});