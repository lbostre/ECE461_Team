import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            enabled: true, // Enables coverage
            reportsDirectory: 'coverage', // Specify the output directory for coverage reports
            reporter: ['html'], // Specify the format of coverage reports
        },
    },
});
