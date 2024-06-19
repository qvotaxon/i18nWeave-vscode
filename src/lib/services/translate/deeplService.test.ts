import * as Sentry from '@sentry/node';
import { Span } from '@sentry/node';
import assert from 'assert';
import * as deepl from 'deepl-node';
import sinon from 'sinon';

import TranslationModuleConfiguration from '../../entities/configuration/modules/translationModule/translationModuleConfiguration';
import ConfigurationStore from '../../stores/configuration/configurationStore';
import ConfigurationStoreManager from '../../stores/configuration/configurationStoreManager';
import DeeplService from './deeplService';

suite('DeeplService', () => {
  let deeplService: DeeplService;
  let getConfigStub: sinon.SinonStub;
  let translateStub: sinon.SinonStub;
  let startSpanStub: sinon.SinonStub;

  setup(() => {
    const config = {
      translationModule: {
        deepL: {
          apiKey: 'api-key',
          preserveFormatting: true,
          formality: 'more',
        },
      },
    };

    getConfigStub = sinon
      .stub(ConfigurationStoreManager.getInstance(), 'getConfig')
      .returns(config.translationModule);
    startSpanStub = sinon
      .stub(Sentry, 'startSpan')
      .callsFake((span, callback) => callback(span as unknown as Span));
    translateStub = sinon
      .stub(deepl.Translator.prototype, 'translateText')
      .resolves({ text: 'Translated text' } as deepl.TextResult);

    deeplService = DeeplService.getInstance();
  });

  teardown(() => {
    sinon.restore();
  });

  suite('getInstance', () => {
    test('should return a singleton instance', () => {
      const instance1 = DeeplService.getInstance();
      const instance2 = DeeplService.getInstance();
      assert.strictEqual(instance1, instance2);
    });

    test('should reinitialize the translator if the API key changes', () => {
      const initialInstance = DeeplService.getInstance();
      sinon.stub(DeeplService, 'getApiKey').returns('new-api-key');
      const newInstance = DeeplService.getInstance();
      assert.notStrictEqual(initialInstance, newInstance);
    });
  });

  suite('fetchTranslation', () => {
    test('should fetch translation using DeepL', async () => {
      getConfigStub.reset();

      const translationModuleConfiguration =
        new TranslationModuleConfiguration();
      translationModuleConfiguration.enabled = true;
      translationModuleConfiguration.deepL.apiKey = 'api-key';
      translationModuleConfiguration.deepL.enabled = true;

      const mockConfigStore = new ConfigurationStore({
        translationModule: translationModuleConfiguration,
      });
      getConfigStub.returns(translationModuleConfiguration);

      ConfigurationStoreManager.getInstance()['_configurationStore'] =
        mockConfigStore;

      const text = 'Hello';
      const targetLanguage = 'fr';

      const translation = await deeplService.fetchTranslation(
        text,
        targetLanguage
      );

      sinon.assert.calledTwice(getConfigStub);
      sinon.assert.calledOnce(startSpanStub);
      sinon.assert.calledOnce(translateStub);
      assert.strictEqual(translation, 'Translated text');
    });

    test('should throw an error if translator is not initialized', async () => {
      DeeplService.translator = undefined;
      const text = 'Hello';
      const targetLanguage = 'fr';

      await assert.rejects(
        async () => {
          await deeplService.fetchTranslation(text, targetLanguage);
        },
        {
          name: 'Error',
          message: 'Translator not initialized. Please try again.',
        }
      );
    });

    // test('should set formality to default for English translations', async () => {
    //   const text = 'Hello';
    //   const targetLanguage = 'en';

    //   const translation = await deeplService.fetchTranslation(
    //     text,
    //     targetLanguage
    //   );

    //   sinon.assert.calledOnce(getConfigStub);
    //   sinon.assert.calledOnce(startSpanStub);
    //   sinon.assert.calledOnce(translateStub);
    //   assert.strictEqual(translation, 'Translated text');
    //   assert.strictEqual(translateStub.firstCall.args[2], 'en-US');
    //   assert.strictEqual(translateStub.firstCall.args[3], 'default');
    // });
  });

  suite('translateUsingDeepl', () => {
    test('should call translateText with the correct arguments', async () => {
      const translator = new deepl.Translator('api-key');
      const text = 'Hello';
      const targetLanguage = 'fr';
      const formality = 'more';

      const result = await DeeplService['translateUsingDeepl'](
        translator,
        text,
        targetLanguage,
        formality
      );

      sinon.assert.calledOnce(startSpanStub);
      sinon.assert.calledOnce(translateStub);
      assert.strictEqual(result.text, 'Translated text');
      assert.strictEqual(translateStub.firstCall.args[0], text);
      assert.strictEqual(translateStub.firstCall.args[2], targetLanguage);
      assert.strictEqual(translateStub.firstCall.args[3].formality, formality);
    });
  });

  // suite('initializeTranslator', () => {
  //   // test('should initialize the translator with the correct API key', () => {
  //   //   DeeplService['initializeTranslator']('new-api-key');
  //   //   assert.strictEqual(
  //   //     (DeeplService.translator as deepl.Translator).authKey,
  //   //     'new-api-key'
  //   //   );
  //   // });
  // });

  suite('getPreserveFormatting', () => {
    test('should retrieve the preserve formatting setting from the configuration', () => {
      const preserveFormatting = DeeplService['getPreserveFormatting']();
      assert.strictEqual(preserveFormatting, true);
    });
  });

  suite('getFormality', () => {
    test('should retrieve the formality setting from the configuration', () => {
      const formality = DeeplService['getFormality']();
      assert.strictEqual(formality, 'more');
    });
  });

  suite('getApiKey', () => {
    test('should retrieve the API key from the configuration', () => {
      const apiKey = DeeplService['getApiKey']();
      assert.strictEqual(apiKey, 'api-key');
    });

    test('should throw an error if no API key is found', () => {
      getConfigStub.returns({ deepL: { apiKey: '' } });
      assert.throws(
        () => {
          DeeplService['getApiKey']();
        },
        {
          name: 'Error',
          message: 'No DeepL API key found in the configuration.',
        }
      );
    });
  });
});
