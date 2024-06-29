import assert from 'assert';

import { getLocalizedTexts } from './localizationUtilities';

suite('localizationUtilities', () => {
  test('should return English texts for "en" language', () => {
    const texts = getLocalizedTexts('en');
    assert.deepStrictEqual(texts, {
      greeting: 'Hello!',
      confirmativeText: 'Yes',
      dismissiveText: 'No',
    });
  });

  test('should return Spanish texts for "es" language', () => {
    const texts = getLocalizedTexts('es');
    assert.deepStrictEqual(texts, {
      greeting: '¡Hola!',
      confirmativeText: 'Sí',
      dismissiveText: 'No',
    });
  });

  test('should return French texts for "fr" language', () => {
    const texts = getLocalizedTexts('fr');
    assert.deepStrictEqual(texts, {
      greeting: 'Bonjour!',
      confirmativeText: 'Oui',
      dismissiveText: 'Non',
    });
  });

  test('should return German texts for "de" language', () => {
    const texts = getLocalizedTexts('de');
    assert.deepStrictEqual(texts, {
      greeting: 'Guten Tag!',
      confirmativeText: 'Ja',
      dismissiveText: 'Nein',
    });
  });

  test('should return Russian texts for "ru" language', () => {
    const texts = getLocalizedTexts('ru');
    assert.deepStrictEqual(texts, {
      greeting: 'Привет!',
      confirmativeText: 'Да',
      dismissiveText: 'Нет',
    });
  });

  test('should return Japanese texts for "jp" language', () => {
    const texts = getLocalizedTexts('jp');
    assert.deepStrictEqual(texts, {
      greeting: 'Konnichiwa!',
      confirmativeText: 'Hai',
      dismissiveText: 'Iie',
    });
  });

  test('should return Dutch texts for "nl" language', () => {
    const texts = getLocalizedTexts('nl');
    assert.deepStrictEqual(texts, {
      greeting: 'Hallo!',
      confirmativeText: 'Ja',
      dismissiveText: 'Nee',
    });
  });

  test('should fallback to Dutch texts for unsupported language', () => {
    const texts = getLocalizedTexts('unsupported');
    assert.deepStrictEqual(texts, {
      greeting: 'Hallo!',
      confirmativeText: 'Ja',
      dismissiveText: 'Nee',
    });
  });
});
