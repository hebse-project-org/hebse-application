import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {Query} from "../../components/Query/query.tsx";


vi.mock('../../components/Query/QueryInput/query-input.tsx', () => ({
    QueryInput: () => <div data-testid="query-input" />,
}));

vi.mock('../../components/Query/QueryResults/query-result.tsx', () => ({
    QueryResult: () => <div data-testid="query-result" />,
}));

vi.mock('../../components/QueryWelcomeText/query-welcome-text.tsx', () => ({
    QueryWelcomeText: () => <div data-testid="query-welcome-text" />,
}));

vi.mock('../../components/SavedQueriesComponent/saved-queries-component.tsx', () => ({
    SavedQueriesComponent: () => <div data-testid="saved-queries" />,
}));

vi.mock('../../components/Query/NLPInteraction/nlp-interactions.tsx', () => ({
    NlpInteractions: () => <div data-testid="nlp-interactions" />,
}));

describe('Query', () => {
    it('renders all child components correctly', () => {
        render(<Query />);

        expect(screen.getByTestId('query-welcome-text')).toBeVisible();
        expect(screen.getByTestId('nlp-interactions')).toBeVisible();
        expect(screen.getByTestId('query-input')).toBeVisible();
        expect(screen.getByTestId('saved-queries')).toBeVisible();
        expect(screen.getByTestId('query-result')).toBeVisible();
    });
});
