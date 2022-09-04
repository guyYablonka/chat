export default {
    verbose: true,
    projects: [
        {
            displayName: {
                name: 'NODE',
                color: 'magenta'
            },
            setupFilesAfterEnv: ['<rootDir>/tests/unit/node/setupTests.ts'],
            testMatch: ['**/tests/*.spec.(js|ts)', '**/*.tests.(js|ts)'],
            transform: {
                '^.+\\.jsx?$': 'babel-jest',
                '^.+\\.tsx?$': 'ts-jest'
            },
            testPathIgnorePatterns: [
                '<rootDir>/node_modules/',
                '<rootDir>/.meteor/'
            ],
            preset: 'ts-jest',
            moduleNameMapper: {
                '^meteor': '<rootDir>/tests/unit/node/module-mappers/meteor.ts'
            }
        },
        {
            displayName: {
                name: 'DOM',
                color: 'blueBright'
            },
            setupFilesAfterEnv: ['<rootDir>/tests/unit/dom/setupTests.ts'],
            testMatch: ['**/tests/*.spec.(jsx|tsx)'],
            testEnvironment: 'jsdom',
            transform: {
                '^.+\\.jsx?$': 'babel-jest',
                '^.+\\.tsx?$': 'ts-jest'
            },
            testPathIgnorePatterns: [
                '<rootDir>/node_modules/',
                '<rootDir>/.meteor/'
            ],
            preset: 'ts-jest',
            moduleNameMapper: {
                '^meteor': '<rootDir>/tests/unit/dom/module-mappers/meteor.ts'
            }
        }
    ]
};
