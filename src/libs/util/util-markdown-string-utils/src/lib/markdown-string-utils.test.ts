import assert from 'assert';
import sinon from 'sinon';

import { createI18nHoverMarkdown } from './markdown-string-utils';

/* eslint-disable no-restricted-imports */
// Tests for MarkdownStringUtils
suite('createI18nHoverMarkdown', () => {
  let sandbox: sinon.SinonSandbox;

  setup(() => {
    sandbox = sinon.createSandbox();
  });

  teardown(() => {
    sandbox.restore();
  });

  test('should create a markdown string with correct translation progress', () => {
    const translations = {
      en: 'Hello',
      fr: 'Bonjour',
      es: 'Hola',
      de: null,
    };
    const defaultLanguage = 'en';
    const markdown = createI18nHoverMarkdown(
      translations,
      defaultLanguage,
      'common'
    );

    assert(
      markdown.value.includes(
        '### ![75%](https://progress-bar.xyz/75?title=Translation%20Progress:)'
      )
    );
  });

  test('should show a warning if default translation is missing', () => {
    const translations = {
      en: null,
      fr: 'Bonjour',
      es: 'Hola',
      de: 'Hallo',
    };
    const defaultLanguage = 'en';
    const markdown = createI18nHoverMarkdown(
      translations,
      defaultLanguage,
      'common'
    );

    assert(
      markdown.value.includes(
        `##### **⚠ Default translation (${defaultLanguage}) missing!**`
      )
    );
  });

  test('should show language status correctly', () => {
    const translations = {
      en: 'Hello',
      fr: 'Bonjour',
      es: 'Hola',
      de: null,
    };
    const defaultLanguage = 'en';
    const markdown = createI18nHoverMarkdown(
      translations,
      defaultLanguage,
      'common'
    );

    assert(markdown.value.includes('- **en:** ✔'));
    assert(markdown.value.includes('- **de:** ✖'));
  });

  test('should show length difference warning if applicable', () => {
    const translations = {
      en: 'Hello',
      fr: 'Bonjour',
      es: 'Hola',
      de: 'Hallo Welt',
    };
    const defaultLanguage = 'en';
    const lengthDifferenceThreshold = 3;
    const markdown = createI18nHoverMarkdown(
      translations,
      defaultLanguage,
      'common',
      lengthDifferenceThreshold
    );

    assert(markdown.value.includes('- **de:** ✔ ⚠ Length difference'));
  });

  test('should not show length difference warning if not applicable', () => {
    const translations = {
      en: 'Hello',
      fr: 'Bonjour',
      es: 'Hola',
      de: 'Hallo',
    };
    const defaultLanguage = 'en';
    const lengthDifferenceThreshold = 10;
    const markdown = createI18nHoverMarkdown(
      translations,
      defaultLanguage,
      'common',
      lengthDifferenceThreshold
    );

    assert(!markdown.value.includes('⚠ Length difference'));
  });
});
