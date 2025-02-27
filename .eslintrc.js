module.exports = {
    extends: [
        'plugin:react/recommended' // Uses the recommended rules from @eslint-plugin-react
    ],
    parserOptions: {
        ecmaVersion: 2024, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
        ecmaFeatures: {
            jsx: true, // Allows for the parsing of JSX
            tsx: true
        },
        esModuleInterop: true
    },
    rules: {
        'import/no-unresolved': [0, { caseSensitive: false }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off'
    },
    overrides: [
        {
            files: ['**/*.tsx'],
            rules: {
                'react/prop-types': 'off'
            }
        }
    ],
    settings: {
        react: {
            version: 'detect' // Tells eslint-plugin-react to automatically detect the version of React to use
        }
    },
    globals: {
        __webpack_public_path__: true,
        devolutionBundle: true
    }
};
