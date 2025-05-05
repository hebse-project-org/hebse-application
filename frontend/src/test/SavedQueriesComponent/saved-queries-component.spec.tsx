import {describe, expect, it} from "vitest";
import {fireEvent, render, screen} from "@testing-library/react";
import "@testing-library/jest-dom";
import {SavedQueriesComponent} from "../../components/SavedQueriesComponent/saved-queries-component.tsx";

describe("SavedQueriesComponent", () => {
    const savedQueriesMock = [{"query1Name": "query1"}, {"query2Name": "query2"}];
    let setSavedQueriesMock: ReturnType<typeof vi.fn>;
    let setInputValueMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        setSavedQueriesMock = vi.fn();
        setInputValueMock = vi.fn();
        localStorage.clear();
    });

    const renderComponent = () =>
        render(
            <SavedQueriesComponent
                    savedQueries={[...savedQueriesMock]}
                    setSavedQueries={setSavedQueriesMock}
                    setInputValue={setInputValueMock}
            />
        );

    it("renders the saved queries header", () => {
        renderComponent();
        expect(screen.getByText("Saved Queries")).toBeVisible();
    });

    it("toggles query display when dropdown icon is clicked", () => {
        renderComponent();
        const toggleButton = screen.getByRole("button");
        fireEvent.click(toggleButton);
        expect(screen.getByText("query1Name")).toBeVisible();
    });

    it("copies query to input when copy icon is clicked", () => {
        renderComponent();
        fireEvent.click(screen.getByRole("button"));
        const buttons = screen.getAllByRole("button");
        fireEvent.click(buttons[2]);
        expect(setInputValueMock).toHaveBeenCalledExactlyOnceWith("query1");
    });

    it("deletes a query when clear icon is clicked", () => {
        renderComponent();
        fireEvent.click(screen.getByRole("button"));
        const buttons = screen.getAllByRole("button");
        fireEvent.click(buttons[1]);
        expect(setSavedQueriesMock).toHaveBeenCalledExactlyOnceWith([{"query2Name": "query2"}]);
    });

    it("hides saved queries if all are deleted", () => {
        render(
            <SavedQueriesComponent
                savedQueries={["onlyQuery"]}
                setSavedQueries={(updated) => {
                    if (typeof updated === "function") {
                        expect(updated(["onlyQuery"])).toEqual([]);
                    } else {
                        expect(updated).toEqual([]);
                    }
                }}
                setInputValue={() => {}}
            />
        );
        fireEvent.click(screen.getByRole("button"));
        const deleteButton = screen.getAllByRole("button")[1];
        fireEvent.click(deleteButton);
    });
});