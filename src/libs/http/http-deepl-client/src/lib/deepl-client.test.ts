import * as Sentry from '@sentry/node';
import * as deepl from 'deepl-node';
import { Span } from '@sentry/node';
import assert from 'assert';
import sinon from 'sinon';
import vscode from 'vscode';

import { CacheEntry } from '@i18n-weave/feature/feature-caching-service';
import { StatusBarManager } from '@i18n-weave/feature/feature-status-bar-manager';

import {
  ConfigurationStore,
  ConfigurationStoreManager,
  TranslationModuleConfiguration,
} from '@i18n-weave/util/util-configuration';

import { DeeplClient } from './deepl-client';

suite('DeeplClient', () => {
  let extensionContext: vscode.ExtensionContext;
  let deeplClient: DeeplClient;
  let getConfigStub: sinon.SinonStub;
  let translateStub: sinon.SinonStub;
  let startSpanStub: sinon.SinonStub;

  setup(async () => {
    const config = {
      translationModule: {
        deepL: {
          apiKey: 'api-key',
          preserveFormatting: true,
          formality: 'more',
        },
      },
    };

    extensionContext = {
      globalState: {
        get: sinon.stub().returns({
          value: [{ code: 'fr', name: 'French', supportsFormality: true }],
          timestamp: new Date().toISOString(),
        } as CacheEntry<readonly deepl.Language[]>),
        update: sinon.stub(),
      },
      workspaceState: {
        get: sinon.stub(),
        update: sinon.stub(),
      },
      subscriptions: [],
    } as unknown as vscode.ExtensionContext;

    getConfigStub = sinon
      .stub(ConfigurationStoreManager.getInstance(), 'getConfig')
      .returns(config.translationModule);
    startSpanStub = sinon
      .stub(Sentry, 'startSpan')
      .callsFake((span, callback) => callback(span as unknown as Span));
    translateStub = sinon
      .stub(deepl.Translator.prototype, 'translateText')
      .resolves({ text: 'Translated text' } as deepl.TextResult);
    getConfigStub.withArgs('debugging').returns({
      logging: {
        enableVerboseLogging: true,
      },
    });

    deeplClient = await DeeplClient.getInstanceAsync(extensionContext);
  });

  teardown(() => {
    sinon.restore();
  });

  suite('getInstance', () => {
    test('should return a singleton instance', async () => {
      const instance1 = await DeeplClient.getInstanceAsync(extensionContext);
      const instance2 = await DeeplClient.getInstanceAsync(extensionContext);
      assert.strictEqual(instance1, instance2);
    });

    // test('should reinitialize the translator if the API key changes', async () => {
    //   const initialInstance =
    //     await DeeplClient.getInstanceAsync(extensionContext);
    //   sinon.stub(DeeplClient, 'getApiKey').returns('new-api-key');
    //   const newInstance = await DeeplClient.getInstanceAsync(extensionContext);
    //   assert.notStrictEqual(initialInstance, newInstance);
    // });
  });

  suite('fetchTranslation', () => {
    // test('should fetch translation using DeepL', async () => {
    //   getConfigStub.reset();
    //   const translationModuleConfiguration =
    //     new TranslationModuleConfiguration();
    //   translationModuleConfiguration.deepL.apiKey = 'api-key';
    //   translationModuleConfiguration.deepL.enabled = true;
    //   const mockConfigStore = new ConfigurationStore({
    //     translationModule: translationModuleConfiguration,
    //   });
    //   getConfigStub.returns(translationModuleConfiguration);
    //   ConfigurationStoreManager.getInstance()['_configurationStore'] =
    //     mockConfigStore;
    //   StatusBarManager.getInstance(extensionContext);
    //   const deeplClient = await DeeplClient.getInstanceAsync(extensionContext);
    //   const text = 'Hello';
    //   const targetLanguage = 'fr';
    //   const translation = await deeplClient.fetchTranslation(
    //     text,
    //     targetLanguage
    //   );
    //   sinon.assert.calledThrice(getConfigStub);
    //   sinon.assert.calledOnce(startSpanStub);
    //   sinon.assert.calledOnce(translateStub);
    //   assert.strictEqual(translation, 'Translated text');
    // });
    // test('should throw an error if translator is not initialized', async () => {
    //   // @ts-ignore - Testing private method
    //   DeeplClient.instance.translator = undefined;
    //   const text = 'Hello';
    //   const targetLanguage = 'fr';
    //   await assert.rejects(
    //     async () => {
    //       await deeplClient.fetchTranslation(text, targetLanguage);
    //     },
    //     {
    //       name: 'Error',
    //       message: 'Translator not initialized.',
    //     }
    //   );
    // });
    // test('should set formality to default for English translations', async () => {
    //   const text = 'Hello';
    //   const targetLanguage = 'en';
    //   const translation = await deeplClient.fetchTranslation(
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

  // suite('translateUsingDeepl', () => {
  //   test('should call translateText with the correct arguments', async () => {
  //     const translator = new deepl.Translator('api-key');
  //     const text = ['Hello'];
  //     const targetLanguage = 'fr';
  //     const formality = 'more';

  //     const result = await DeeplClient['translateUsingDeepl'](
  //       translator,
  //       text,
  //       targetLanguage,
  //       formality
  //     );

  //     sinon.assert.calledOnce(startSpanStub);
  //     sinon.assert.calledOnce(translateStub);
  //     assert.strictEqual(result, ['Translated text']);
  //     assert.strictEqual(translateStub.firstCall.args[0], text);
  //     assert.strictEqual(translateStub.firstCall.args[2], targetLanguage);
  //     assert.strictEqual(translateStub.firstCall.args[3].formality, formality);
  //   });
  // });

  // suite('initializeTranslator', () => {
  //   // test('should initialize the translator with the correct API key', () => {
  //   //   DeeplClient['initializeTranslator']('new-api-key');
  //   //   assert.strictEqual(
  //   //     (DeeplClient.translator as deepl.Translator).authKey,
  //   //     'new-api-key'
  //   //   );
  //   // });
  // });

  suite('getPreserveFormatting', () => {
    test('should retrieve the preserve formatting setting from the configuration', () => {
      const preserveFormatting = DeeplClient['getPreserveFormatting']();
      assert.strictEqual(preserveFormatting, true);
    });
  });

  suite('getFormality', () => {
    test('should retrieve the formality setting from the configuration', () => {
      const formality = DeeplClient['getFormality']();
      assert.strictEqual(formality, 'more');
    });
  });

  suite('getApiKey', () => {
    test('should retrieve the API key from the configuration', () => {
      const apiKey = DeeplClient['getApiKey']();
      assert.strictEqual(apiKey, 'api-key');
    });

    test('should throw an error if no API key is found', () => {
      getConfigStub.returns({ deepL: { apiKey: '' } });
      assert.throws(
        () => {
          DeeplClient['getApiKey']();
        },
        {
          name: 'Error',
          message: 'No DeepL API key found in the configuration.',
        }
      );
    });
  });
});
