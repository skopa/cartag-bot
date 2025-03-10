module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'google',
        'plugin:@typescript-eslint/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['tsconfig.json', 'tsconfig.dev.json'],
        sourceType: 'module',
    },
    ignorePatterns: [
        '/lib/**/*', // Ignore built files.
    ],
    plugins: [
        '@typescript-eslint',
        'import',
    ],
    rules: {
        'max-len': ['error', 120],
        'quotes': ['error', 'single'],
        'import/no-unresolved': 0,
        'indent': ['error', 4],
        'object-curly-spacing': ['error', 'always'],
        'valid-jsdoc': 0,
        'operator-linebreak': 0,
        'no-case-declarations': 0,
        'require-jsdoc': ['warn', {
            'require': {
                'FunctionDeclaration': true,
                'MethodDefinition': false,
                'ClassDeclaration': false,
                'ArrowFunctionExpression': false,
                'FunctionExpression': false,
            },
        }],
    },
};
