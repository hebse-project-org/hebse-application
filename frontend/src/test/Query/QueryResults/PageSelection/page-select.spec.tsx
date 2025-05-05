import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import {PageSelect} from "../../../../components/Query/QueryResults/PageSelect/page-select.tsx";

describe('PageSelect', () => {
    it('renders the pagination component', () => {
        render(
            <PageSelect
                setPageNumber={vi.fn()}
                pageNumber={0}
                rows={100}
                rowsPerPage={10}
                setRowsPerPage={vi.fn()}
            />
        );

        expect(screen.getByText(/Records Per Page/i)).toBeInTheDocument();
    });

    it('calls setPageNumber when clicking next page', () => {
        const setPageNumber = vi.fn();

        render(
            <PageSelect
                setPageNumber={setPageNumber}
                pageNumber={0}
                rows={100}
                rowsPerPage={10}
                setRowsPerPage={vi.fn()}
            />
        );

        const nextPageButton = screen.getByLabelText('Go to next page');
        fireEvent.click(nextPageButton);

        expect(setPageNumber).toHaveBeenCalledWith(1);
    });

    it('calls setRowsPerPage and resets page when selecting new rows per page', async () => {
        const setRowsPerPage = vi.fn();
        const setPageNumber = vi.fn();

        render(
            <PageSelect
                setPageNumber={setPageNumber}
                pageNumber={0}
                rows={100}
                rowsPerPage={10}
                setRowsPerPage={setRowsPerPage}
            />
        );

        const rowsPerPageCombobox = screen.getByRole('combobox', { name: /Records Per Page/i });

        fireEvent.mouseDown(rowsPerPageCombobox);

        const option25 = await screen.findByRole('option', { name: '25' });
        fireEvent.click(option25);

        expect(setRowsPerPage).toHaveBeenCalledWith(25);
        expect(setPageNumber).toHaveBeenCalledWith(0);
    });
});
