import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            enabled: true,
            provider: 'istanbul', // Switch to Istanbul for detailed reports
            reportsDirectory: './coverage', // Specify output directory for coverage reports
            reporter: ['text', 'html', 'json-summary'], // Add 'text' for detailed console output
            all: true, // Include all files in the report
            include: ['src/**/*.ts'], // Specify which files to include
            exclude: ['node_modules', 'dist', 'src/__tests__'], // Exclude test and dist files
            thresholds: {
                statements: 80,
                branches: 75,
                functions: 80,
                lines: 85,
            },
        },
    },
});
