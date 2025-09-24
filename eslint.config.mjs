import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import importPlugin from 'eslint-plugin-import'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-plugin-prettier'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

export default [
  // 기본 JavaScript 권장 설정
  js.configs.recommended,

  // 모든 파일에 대한 기본 설정
  {
    files: ['**/*.{js,jsx,ts,tsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2024,
        React: 'readonly',
        JSX: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    plugins: {
      import: importPlugin,
      'jsx-a11y': jsxA11y,
      prettier,
      react,
      'react-hooks': reactHooks,
    },

    rules: {
      // Prettier 규칙
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: false,
          tabWidth: 2,
          trailingComma: 'es5',
          printWidth: 80,
          endOfLine: 'auto',
          arrowParens: 'avoid',
          bracketSpacing: true,
          bracketSameLine: false,
          jsxSingleQuote: false,
          useTabs: false,
          quoteProps: 'as-needed',
          proseWrap: 'preserve',
          htmlWhitespaceSensitivity: 'css',
          embeddedLanguageFormatting: 'auto',
        },
      ],

      // React 기본 규칙
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/no-children-prop': 'error',
      'react/no-danger-with-children': 'error',
      'react/no-deprecated': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-is-mounted': 'error',
      'react/no-render-return-value': 'error',
      'react/no-string-refs': 'error',
      'react/no-unknown-property': 'error',
      'react/require-render-return': 'error',

      // React Hooks 규칙
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Import 관련 규칙
      'import/order': [
        'error',
        {
          // import 그룹 순서 정의 (위에서 아래 순서대로)
          groups: [
            'builtin', // Node.js 내장 모듈 (fs, path, http 등)
            'external', // 외부 라이브러리 (react, lodash, axios 등)
            'internal', // 프로젝트 내부 모듈 (`@/`로 시작하는 것들)
            'parent', // 상위 디렉토리 모듈 (../components)
            'sibling', // 같은 디렉토리 모듈 (./Button)
            'index', // 인덱스 파일 (./index)
          ],
          // 각 그룹 사이에 빈 줄 추가
          'newlines-between': 'always',
          // 알파벳 순서로 정렬
          alphabetize: {
            order: 'asc', // 오름차순 정렬 (a → z)
            caseInsensitive: true, // 대소문자 구분 안함
          },
        },
      ],
      // 중복된 import 방지
      'import/no-duplicates': 'error',
      // import 문을 파일 맨 위에 위치시키기
      'import/first': 'error',
      // import 문 다음에 빈 줄 추가
      'import/newline-after-import': 'error',
      // 익명 default export 경고
      'import/no-anonymous-default-export': 'warn',

      // 접근성 규칙
      'jsx-a11y/alt-text': [
        'warn',
        {
          elements: ['img'],
          img: ['Image'],
        },
      ],
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-proptypes': 'warn',
      'jsx-a11y/aria-unsupported-elements': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
      'jsx-a11y/role-supports-aria-props': 'warn',
      'jsx-a11y/anchor-is-valid': [
        'error',
        {
          components: ['Link'],
          specialLink: ['hrefLeft', 'hrefRight'],
          aspects: ['invalidHref', 'preferButton'],
        },
      ],

      // 일반적인 JavaScript 규칙
      'no-unused-vars': 'off',
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'template-curly-spacing': ['error', 'never'],
      'arrow-spacing': 'error',

      // 수정된 comma-dangle 규칙 (JavaScript 파일용)
      'comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'never',
        },
      ],

      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'never'],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'eol-last': ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'computed-property-spacing': ['error', 'never'],
      'func-call-spacing': ['error', 'never'],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'space-before-blocks': 'error',
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always',
        },
      ],
      'space-in-parens': ['error', 'never'],
      'space-infix-ops': 'error',
      'space-unary-ops': 'error',
      'spaced-comment': ['error', 'always'],
    },

    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },

  // TypeScript 파일 전용 설정
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
      'jsx-a11y': jsxA11y,
      prettier,
      react,
      'react-hooks': reactHooks,
    },

    rules: {
      // TypeScript ESLint 기본 규칙
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',

      // 기본 규칙 비활성화
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'error',
    },

    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },

  // JavaScript 파일 전용 설정
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // 설정 파일들에 대한 특별 규칙
  {
    files: [
      '*.config.{js,mjs,cjs,ts}',
      'tailwind.config.{js,ts}',
      'next.config.{js,mjs}',
      'postcss.config.{js,cjs}',
      'eslint.config.{js,mjs}',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'import/no-anonymous-default-export': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // 테스트 파일에 대한 특별 규칙
  {
    files: ['**/__tests__/**/*', '**/*.{test,spec}.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'import/no-anonymous-default-export': 'off',
    },
  },

  // 제외할 파일 및 디렉토리
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'dist/**',
      'public/**',
      '.env*',
      '*.min.js',
      'coverage/**',
      '.nyc_output/**',
      'next-env.d.ts',
      '.pnpm-store/**',
      'package-lock.json',
      'pnpm-lock.yaml',
      'yarn.lock',
      'bun.lock',
    ],
  },
]
