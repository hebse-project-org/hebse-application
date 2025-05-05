import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config'

export default defineConfig({
    plugins: [react()],
    test: {
        include: ['**/*.spec.tsx', '**/*.spec.ts'],
        globals: true,
        environment: "jsdom",
        coverage: {
            provider: 'istanbul', // or 'v8'
            thresholds: {
                lines: 100,
                functions: 100,
                branches: 100,
                statements: 100
            }
        },
    },
})