import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Allow explicit any in a UI component library (common for unknown form values)
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  { ignores: ['dist/**'] }
);
