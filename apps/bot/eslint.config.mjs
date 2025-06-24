import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import parserTypescript from '@typescript-eslint/parser';
import jsonPlugin from 'eslint-plugin-json';
import perfectionist from 'eslint-plugin-perfectionist';

export default [
    {
        files: ['**/*'],
        ignores: [],
        plugins: {
            perfectionist,
        },
        rules: {
            'perfectionist/sort-classes': ['error', { order: 'asc', type: 'natural' }],
            'perfectionist/sort-enums': ['error', { order: 'asc', type: 'natural' }],
            'perfectionist/sort-imports': [
                'error',
                {
                    groups: [
                        'builtin',
                        'external',
                        'parent',
                        'sibling',
                        'type',
                        'internal',
                        'index',
                        'object',
                        'unknown',
                    ],
                    newlinesBetween: 'always',
                    order: 'asc',
                    type: 'natural',
                },
            ],
            'perfectionist/sort-interfaces': ['error', { order: 'asc', type: 'natural' }],
            'perfectionist/sort-intersection-types': ['error', { order: 'asc', type: 'natural' }],
            'perfectionist/sort-modules': ['error', { order: 'asc', type: 'natural' }],
            'perfectionist/sort-named-exports': ['error', { order: 'asc', type: 'natural' }],
            'perfectionist/sort-named-imports': ['error', { order: 'asc', type: 'natural' }],
            'perfectionist/sort-object-types': ['error', { order: 'asc', type: 'natural' }],
            'perfectionist/sort-objects': ['error', { order: 'asc', type: 'natural' }],
            'perfectionist/sort-union-types': ['error', { order: 'asc', type: 'natural' }],
        },
    },

    {
        files: ['**/*.ts', '**/*.tsx'],
        ignores: [],
        languageOptions: {
            parser: parserTypescript,
            parserOptions: {
                ecmaVersion: 'latest',
                project: ['./tsconfig.json'],
                sourceType: 'module',
                tsconfigRootDir: '.',
            },
        },
        name: 'custom config',
        plugins: {
            '@typescript-eslint': typescriptEslintPlugin,
            json: jsonPlugin,
        },
        rules: {
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-explicit-any': 'error',

            '@typescript-eslint/no-invalid-this': 'error',
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/no-var': 'off',
            '@typescript-eslint/require-await': 'error',

            'no-console': 'off',

            'no-eval': 'error',
            'no-extra-semi': 'off',
            'no-prototype-builtins': 'warn',
            'no-return-await': 'warn',
            'no-unused-vars': 'off',
            'prefer-const': 'error',
        },
    },
];
