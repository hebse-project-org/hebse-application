import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import {expect, it, vi} from 'vitest';
import DatasetList from "../../../components/Utilities/DataDownload/data-download.tsx";
import '@testing-library/jest-dom';

/* eslint-disable  unicorn/no-null */

vi.mock("../../../components/Utilities/utility-functions.ts", () => ({
    decrypt: vi.fn(() => Promise.resolve("{\"settings\": \"test settings\"}")),
}));

vi.spyOn(globalThis, 'open').mockImplementation(() => null);

beforeEach(() => {
    vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => null),
        removeItem: vi.fn(),
        setItem: vi.fn(),
        clear: vi.fn(),
    });
});

const mockDatasets = {
    hits: {
        hits: [
            {
                id: 'dataset1',
                title: 'Test Dataset 1',
                metadata: { description: '<p>Description for dataset 1</p>' },
                links: { self: 'http://dataset1' },
                files: [
                    {
                        key: 'file1.csv',
                        links: { self: 'http://download/file1' },
                        size: 1_000_000_000,
                        checksum: 'checksum1',
                    },
                ],
            },
        ],
    },
};

describe('DatasetList', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('renders loading initially', () => {
        vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
        render(<DatasetList />);
        expect(screen.getByText(/Loading datasets/i)).toBeInTheDocument();
    });

    it('renders error if fetch fails', async () => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Failed to fetch'))));
        render(<DatasetList />);
        await waitFor(() => {
            expect(screen.getByText(/Error fetching data/i)).toBeInTheDocument();
        });
    });

    it('renders datasets after successful fetch', async () => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockDatasets),
        })));
        render(<DatasetList />);

        await waitFor(() => {
            expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
            expect(screen.getByText('SHOW DESCRIPTION')).toBeInTheDocument();
        });
    });

    it('expands and collapses description on button click', async () => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockDatasets),
        })));
        render(<DatasetList />);

        await waitFor(() => {
            expect(screen.getByText('SHOW DESCRIPTION')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /show description/i }));

        await waitFor(() => {
            expect(screen.getByText(/Description for dataset 1/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /hide description/i }));

        await waitFor(() => {
            expect(screen.queryByText(/Description for dataset 1/i)).not.toBeInTheDocument();
        });
    });

    it('clicks Download and Create Database buttons', async () => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockDatasets),
        })));
        render(<DatasetList />);

        await waitFor(() => {
            expect(screen.getByText('DOWNLOAD')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('DOWNLOAD'));
        fireEvent.click(screen.getByText('CREATE DATABASE USING DATASET'));

        expect.objectContaining({
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                filePath: "http://download/file1",
                fileName: "file1.csv",
                databaseSettings: undefined
            })
        })
    });

    it('fails to create database', async () => {
        vi.stubGlobal("fetch", vi.fn((url: string) => {
            if(url == "https://zenodo.org/api/records/?communities=posydon&resource_type=dataset") {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockDatasets),
                });
            }

            if(url == "http://localhost:8000/PutDatabase") {
                return Promise.resolve({
                    ok: false,
                    status: 500
                });
            }
        }));

        vi.stubGlobal('localStorage', {
            getItem: vi.fn(() => '{"settings": "test settings"}'),
            removeItem: vi.fn(),
            setItem: vi.fn(),
            clear: vi.fn(),
        });

        vi.stubGlobal('decrypt', vi.fn(() => Promise.resolve("{\"settings\": \"test settings\"}")));

        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        render(<DatasetList />);

        await waitFor(() => {
            expect(screen.getByText('DOWNLOAD')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('DOWNLOAD'));
        fireEvent.click(screen.getByText('CREATE DATABASE USING DATASET'));


        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                "http://localhost:8000/PutDatabase",
                expect.objectContaining({
                    method: "PUT",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        filePath: "http://download/file1",
                        fileName: "file1.csv",
                        databaseSettings: JSON.parse('{"settings": "test settings"}')
                    })
                })
            );
        });

        expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('create database with local settings', async () => {
        vi.stubGlobal('localStorage', {
            getItem: vi.fn(() => '{"settings": "test settings"}'),
            removeItem: vi.fn(),
            setItem: vi.fn(),
            clear: vi.fn(),
        });

        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockDatasets),
        })));

        render(<DatasetList />);

        await waitFor(() => {
            expect(screen.getByText('DOWNLOAD')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('CREATE DATABASE USING DATASET'));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                "http://localhost:8000/PutDatabase",
                expect.objectContaining({
                    method: "PUT",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        filePath: "http://download/file1",
                        fileName: "file1.csv",
                        databaseSettings: JSON.parse('{"settings": "test settings"}')
                    })
                })
            );
        });
    });

    it('should throw error when no database settings', async () => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve(mockDatasets),
        })));
        render(<DatasetList />);

        await waitFor(() => {
            expect(screen.getByText(/Error fetching data/i)).toBeInTheDocument();
        });

    });
    
    it('should throw error when failed to get dataset', async () => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve(mockDatasets),
        })));

        vi.stubGlobal('localStorage', {
            getItem: vi.fn(() => '{"settings": "test settings"}'),
            removeItem: vi.fn(),
            setItem: vi.fn(),
            clear: vi.fn(),
        });

        render(<DatasetList />);

        await waitFor(() => {
            expect(screen.getByText(/Error fetching data/i)).toBeInTheDocument();
        });

    });

    it('should not show description when not in metadata', async () => {
        const mockDatasets = {
            hits: {
                hits: [
                    {
                        id: 'dataset1',
                        title: 'Test Dataset 1',
                        links: { self: 'http://dataset1' },
                        files: [
                            {
                                key: 'file1.csv',
                                links: { self: 'http://download/file1' },
                                size: 1_000_000_000,
                                checksum: 'checksum1',
                            },
                        ],
                    },
                ],
            },
        };

        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockDatasets),
        })));
        
        render(<DatasetList/>)


        await waitFor(() => {
            expect(screen.getByText('SHOW DESCRIPTION')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /show description/i }));

        await waitFor(() => {
            expect(screen.getByText(/No description/i)).toBeInTheDocument();
        });
        
    });
});
