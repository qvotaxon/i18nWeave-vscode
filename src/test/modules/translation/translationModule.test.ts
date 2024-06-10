import * as assert from 'assert';
import { Uri } from 'vscode';

import TranslationModule from '../../../modules/translation/translationModule';

suite('TranslationModule', () => {
  test('should create an empty translations object if jsonContent exists', async () => {
    const inputPath = Uri.file('/path/to/input.json');
    const translationModule = new TranslationModule();
    const context = {
      inputPath,
      jsonContent: {},
      outputPath: Uri.file(''),
      locale: '',
      translations: {}, // Add the 'translations' property with an initial value of an empty object
    };

    await translationModule.executeAsync(context);

    assert.deepStrictEqual(context.translations, {});
  });

  test('should update jsonContent with translatedJsonContent if jsonContent exists', async () => {
    const inputPath = Uri.file('/path/to/input.json');
    const translationModule = new TranslationModule();
    const context = {
      inputPath,
      jsonContent: {
        dummy: {
          translations: {
            test: 'test',
          },
        },
      },
      outputPath: Uri.file(''),
      locale: '',
      translations: {},
    };

    await translationModule.executeAsync(context);

    assert.deepStrictEqual(context.jsonContent, context.jsonContent);
  });
});
