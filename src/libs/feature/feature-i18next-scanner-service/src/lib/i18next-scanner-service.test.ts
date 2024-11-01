import * as deepl from 'deepl-node';
import assert from 'assert';
import sinon from 'sinon';
import vscode from 'vscode';

import { CacheEntry } from '@i18n-weave/feature/feature-caching-service';
import { I18nextScannerService } from '@i18n-weave/feature/feature-i18next-scanner-service';
import { StatusBarManager } from '@i18n-weave/feature/feature-status-bar-manager';

import {
  ConfigurationStoreManager,
  GeneralConfiguration,
  I18nextScannerModuleConfiguration,
} from '@i18n-weave/util/util-configuration';

suite('I18nextScannerService', () => {
  let scannerService: I18nextScannerService;
  let getConfigStub: sinon.SinonStub;

  setup(() => {
    scannerService = I18nextScannerService.getInstance();
  });

  teardown(() => {
    sinon.restore();
  });

  suite('getInstance', () => {
    test('should return the singleton instance', () => {
      const instance1 = I18nextScannerService.getInstance();
      const instance2 = I18nextScannerService.getInstance();
      assert.strictEqual(instance1, instance2);
    });
  });

  suite('scanCodeAsync', () => {
    test('should scan code for translation keys', async () => {
      let extensionContext: vscode.ExtensionContext;
      const config = {
        i18nextScannerModule: {
          defaultLanguage: 'en',
          enabled: true,
          fileExtensions: ['ts', 'tsx'],
          languages: ['en', 'de', 'fr', 'es'],
          namespaces: ['translation', 'common'],
          defaultNamespace: 'translation',
          translationFilesLocation: 'locales',
          translationFunctionNames: ['I18nKey'],
          translationComponentTranslationKey: 'i18nKey',
          translationComponentName: 'Trans',
          codeFileLocations: ['src'],
        } satisfies I18nextScannerModuleConfiguration,
      };

      const secondConfig = {
        betaFeaturesConfiguration: {
          enableJsonFileWebView: false,
          enableTranslationModule: true,
        },
        format: {
          numberOfSpacesForIndentation: 4,
        },
      } satisfies GeneralConfiguration;

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
        .onFirstCall()
        .returns(config.i18nextScannerModule)
        .onSecondCall()
        .returns(secondConfig);

      const executeScannerStub = (scannerService['executeScanner'] = sinon
        .stub()
        .resolves());

      StatusBarManager.getInstance(extensionContext);

      scannerService.scanCode();

      sinon.assert.calledTwice(getConfigStub);
      sinon.assert.calledOnce(executeScannerStub);
    });
  });
});
