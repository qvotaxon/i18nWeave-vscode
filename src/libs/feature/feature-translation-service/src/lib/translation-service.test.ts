import * as deepl from 'deepl-node';
import assert from 'assert';
import fs from 'fs';
import sinon from 'sinon';
import vscode from 'vscode';

import { CacheEntry } from '@i18n-weave/feature/feature-caching-service';
import { TranslationService } from '@i18n-weave/feature/feature-translation-service';

import { DeeplClient } from '@i18n-weave/http/http-deepl-client';

import {
  BetaFeaturesConfiguration,
  ConfigurationStore,
  ConfigurationStoreManager,
  GeneralConfiguration,
} from '@i18n-weave/util/util-configuration';
import { TranslationModuleConfiguration } from '@i18n-weave/util/util-configuration';

suite('TranslationService', () => {
  let extensionContext: vscode.ExtensionContext;
  let translationService: TranslationService;
  let readFileSyncStub: sinon.SinonStub;
  let readdirSyncStub: sinon.SinonStub;
  let statSyncStub: sinon.SinonStub;
  let writeFileSyncStub: sinon.SinonStub;
  let fetchTranslationStub: sinon.SinonStub;

  setup(async () => {
    const translationModuleConfiguration = new TranslationModuleConfiguration();
    translationModuleConfiguration.deepL.apiKey = 'api-key';
    translationModuleConfiguration.deepL.enabled = true;

    const betaFeaturesConfiguration = new BetaFeaturesConfiguration();
    betaFeaturesConfiguration.enableTranslationModule = true;

    const generalConfiguration = new GeneralConfiguration();
    generalConfiguration.betaFeaturesConfiguration = betaFeaturesConfiguration;

    const mockConfigStore = new ConfigurationStore({
      translationModule: translationModuleConfiguration,
      general: generalConfiguration,
    });
    ConfigurationStoreManager.getInstance()['_configurationStore'] =
      mockConfigStore;

    extensionContext = {
      globalState: {
        get: sinon.stub().returns({
          value: [],
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

    translationService = TranslationService.getInstance(extensionContext);
    readFileSyncStub = sinon.stub(fs, 'readFileSync');
    readdirSyncStub = sinon.stub(fs, 'readdirSync');
    statSyncStub = sinon.stub(fs, 'statSync');
    writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
    fetchTranslationStub = sinon.stub(
      await DeeplClient.getInstanceAsync(extensionContext),
      'fetchTranslation'
    );
  });

  teardown(() => {
    sinon.restore();
  });

  suite('getInstance', () => {
    test('should return the singleton instance', () => {
      const instance1 = TranslationService.getInstance(extensionContext);
      const instance2 = TranslationService.getInstance(extensionContext);
      assert.strictEqual(instance1, instance2);
    });
  });

  suite('getOtherTranslationFilesPaths', () => {
    test('should return paths of other translation files', () => {
      const fileLocation = 'C:\\projects\\translations\\en\\file.json';
      const parentDirectory = 'C:\\projects\\translations';

      readdirSyncStub.withArgs(parentDirectory).returns(['en', 'fr']);
      statSyncStub
        .withArgs(`${parentDirectory}\\en`)
        .returns({ isDirectory: () => true });
      statSyncStub
        .withArgs(`${parentDirectory}\\fr`)
        .returns({ isDirectory: () => true });
      readdirSyncStub.withArgs(`${parentDirectory}\\en`).returns(['file.json']);
      readdirSyncStub.withArgs(`${parentDirectory}\\fr`).returns(['file.json']);

      const result =
        translationService.getOtherTranslationFilesPaths(fileLocation);

      assert.deepStrictEqual(result, [
        'C:\\projects\\translations\\fr\\file.json',
      ]);
    });

    test('should exclude the original file from the result', () => {
      const fileLocation = 'C:\\projects\\translations\\en\\file.json';
      const parentDirectory = 'C:\\projects\\translations';

      readdirSyncStub.withArgs(parentDirectory).returns(['en', 'fr']);
      statSyncStub
        .withArgs(`${parentDirectory}\\en`)
        .returns({ isDirectory: () => true });
      statSyncStub
        .withArgs(`${parentDirectory}\\fr`)
        .returns({ isDirectory: () => true });
      readdirSyncStub.withArgs(`${parentDirectory}\\en`).returns(['file.json']);
      readdirSyncStub.withArgs(`${parentDirectory}\\fr`).returns(['file.json']);

      const result =
        translationService.getOtherTranslationFilesPaths(fileLocation);

      assert.deepStrictEqual(result, [
        'C:\\projects\\translations\\fr\\file.json',
      ]);
    });
  });

  suite('translateOtherI18nFiles', () => {
    test.skip('should translate missing keys in other i18n files', async () => {
      const fileLocation = 'C:\\projects\\translations\\en\\file.json';
      const changedFileContent = JSON.stringify({ key1: 'value1' });

      readdirSyncStub
        .withArgs('C:\\projects\\translations')
        .returns(['en', 'fr']);
      statSyncStub
        .withArgs('C:\\projects\\translations\\en')
        .returns({ isDirectory: () => true });
      statSyncStub
        .withArgs('C:\\projects\\translations\\fr')
        .returns({ isDirectory: () => true });
      readdirSyncStub
        .withArgs('C:\\projects\\translations\\en')
        .returns(['file.json']);
      readdirSyncStub
        .withArgs('C:\\projects\\translations\\fr')
        .returns(['file.json']);

      readFileSyncStub
        .withArgs('C:\\projects\\translations\\fr\\file.json', 'utf-8')
        .returns(JSON.stringify({ key1: '' }));
      fetchTranslationStub.withArgs('value1', 'fr').resolves('valeur1');

      await translationService.translateOtherI18nFiles(
        fileLocation,
        changedFileContent
      );

      assert(
        writeFileSyncStub.calledWith(
          'C:\\projects\\translations\\fr\\file.json',
          JSON.stringify({ key1: 'valeur1' }, null, 2)
        )
      );
    });

    test('should not update keys that are not missing', async () => {
      const fileLocation = 'C:\\projects\\translations\\en\\file.json';
      const changedFileContent = JSON.stringify({ key1: 'value1' });

      readdirSyncStub
        .withArgs('C:\\projects\\translations')
        .returns(['en', 'fr']);
      statSyncStub
        .withArgs('C:\\projects\\translations\\en')
        .returns({ isDirectory: () => true });
      statSyncStub
        .withArgs('C:\\projects\\translations\\fr')
        .returns({ isDirectory: () => true });
      readdirSyncStub
        .withArgs('C:\\projects\\translations\\en')
        .returns(['file.json']);
      readdirSyncStub
        .withArgs('C:\\projects\\translations\\fr')
        .returns(['file.json']);

      readFileSyncStub
        .withArgs('C:\\projects\\translations\\fr\\file.json', 'utf-8')
        .returns(JSON.stringify({ key1: 'existingValue' }));
      fetchTranslationStub.withArgs('value1', 'fr').resolves('valeur1');

      await translationService.translateOtherI18nFiles(
        fileLocation,
        changedFileContent
      );

      assert(writeFileSyncStub.notCalled);
    });

    test.skip('should handle nested missing keys', async () => {
      const fileLocation = 'C:\\projects\\translations\\en\\file.json';
      const changedFileContent = JSON.stringify({ key1: { subKey: 'value1' } });

      readdirSyncStub
        .withArgs('C:\\projects\\translations')
        .returns(['en', 'fr']);
      statSyncStub
        .withArgs('C:\\projects\\translations\\en')
        .returns({ isDirectory: () => true });
      statSyncStub
        .withArgs('C:\\projects\\translations\\fr')
        .returns({ isDirectory: () => true });
      readdirSyncStub
        .withArgs('C:\\projects\\translations\\en')
        .returns(['file.json']);
      readdirSyncStub
        .withArgs('C:\\projects\\translations\\fr')
        .returns(['file.json']);

      readFileSyncStub
        .withArgs('C:\\projects\\translations\\fr\\file.json', 'utf-8')
        .returns(JSON.stringify({ key1: { subKey: '' } }));
      fetchTranslationStub.withArgs('value1', 'fr').resolves('valeur1');

      await translationService.translateOtherI18nFiles(
        fileLocation,
        changedFileContent
      );

      assert(
        writeFileSyncStub.calledWith(
          'C:\\projects\\translations\\fr\\file.json',
          JSON.stringify({ key1: { subKey: 'valeur1' } }, null, 2)
        )
      );
    });
  });
});
