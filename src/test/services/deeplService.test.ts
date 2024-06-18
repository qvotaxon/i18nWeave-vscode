import * as assert from 'assert';
import sinon from 'sinon';

import TranslationModuleConfiguration from '../../entities/configuration/modules/translationModule/translationModuleConfiguration';
import ConfigurationStore from '../../services/configurationStore';
import ConfigurationStoreManager from '../../services/configurationStoreManager';
import DeeplService from '../../services/deeplService';

suite('DeeplService', () => {
  let deeplService: DeeplService;
  let getConfigStub: sinon.SinonStub;
  let translateUsingDeeplStub: sinon.SinonStub;

  setup(() => {
    const translationModuleConfiguration = new TranslationModuleConfiguration();
    translationModuleConfiguration.enabled = true;
    translationModuleConfiguration.deepL.apiKey = 'api-key';
    translationModuleConfiguration.deepL.enabled = true;

    const mockConfigStore = new ConfigurationStore({
      translationModule: translationModuleConfiguration,
    });
    ConfigurationStoreManager.getInstance()['_configurationStore'] =
      mockConfigStore;

    deeplService = DeeplService.getInstance();

    getConfigStub = sinon
      .stub(ConfigurationStoreManager.prototype, 'getConfig')
      .returns(translationModuleConfiguration);
  });

  teardown(() => {
    sinon.restore();
  });

  suite('getInstance', () => {
    test('should return the singleton instance', () => {
      const instance1 = DeeplService.getInstance();
      const instance2 = DeeplService.getInstance();
      assert.strictEqual(instance1, instance2);
    });
  });

  suite('fetchTranslation', () => {
    test('should fetch translation using Deepl', async () => {
      translateUsingDeeplStub = sinon
        .stub(deeplService, 'fetchTranslation')
        .resolves('Translated text');

      const text = 'Hello';
      const targetLanguage = 'fr';

      const translation = await deeplService.fetchTranslation(
        text,
        targetLanguage
      );

      sinon.assert.calledOnce(translateUsingDeeplStub);
      sinon.assert.calledWith(translateUsingDeeplStub, text, targetLanguage);
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
  });
});
