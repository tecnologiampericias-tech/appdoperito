// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const HEX_PATTERN = '^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$';
const RGB_PATTERN = '^(rgb|rgba|hsl|hsla)\\s*\\(';

const NO_RAW_COLOR_MESSAGE =
  'Cores hardcoded (hex/rgb/hsl) são proibidas em telas e componentes. Use tokens de `@/constants/theme` (colors.*). Se a cor não existir lá, adicione um token antes.';

const colorLiteralRules = {
  'no-restricted-syntax': [
    'error',
    {
      selector: `Literal[value=/${HEX_PATTERN}/]`,
      message: NO_RAW_COLOR_MESSAGE,
    },
    {
      selector: `Literal[value=/${RGB_PATTERN}/]`,
      message: NO_RAW_COLOR_MESSAGE,
    },
    {
      selector: `TemplateElement[value.raw=/${HEX_PATTERN.slice(1, -1)}/]`,
      message: NO_RAW_COLOR_MESSAGE,
    },
  ],
};

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
    rules: colorLiteralRules,
  },
]);
