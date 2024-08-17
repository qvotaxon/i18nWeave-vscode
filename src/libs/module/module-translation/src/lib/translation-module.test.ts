import sinon from 'sinon';
import vscode from 'vscode';

import { TranslationService } from '@i18n-weave/feature/feature-translation-service';

import { ConfigurationStoreManager } from '@i18n-weave/util/util-configuration';

import { TranslationModule } from './translation-module';
import { TranslationModuleContext } from './translation-module-context';

suite('TranslationModule', () => {
  let extensionContext: vscode.ExtensionContext;
  let translationModule: TranslationModule;
  let context: TranslationModuleContext;

  setup(() => {
    extensionContext = {} as vscode.ExtensionContext;

    translationModule = new TranslationModule(extensionContext);
    context = {
      jsonContent: {
        /* mock JSON content */
      },
      locale: 'en',
      outputPath: { fsPath: '/path/to/output/file' } as unknown as vscode.Uri,
      inputPath: { fsPath: '/path/to/input/file' } as unknown as vscode.Uri,
    };
  });

  teardown(() => {
    sinon.restore();
  });

  test('should translate other i18n files if enabled and jsonContent exists', async () => {
    const getConfigStub = sinon.stub(
      ConfigurationStoreManager.getInstance(),
      'getConfig'
    );
    getConfigStub.withArgs('general').returns({
      betaFeaturesConfiguration: { enableTranslationModule: true },
    });

    const translateOtherI18nFilesStub = sinon.stub(
      TranslationService.getInstance(extensionContext),
      'translateOtherI18nFiles'
    );

    await translationModule.executeAsync(context);

    sinon.assert.calledOnce(getConfigStub);
    sinon.assert.calledWith(getConfigStub, 'general');
    sinon.assert.calledOnce(translateOtherI18nFilesStub);
    sinon.assert.calledWith(
      translateOtherI18nFilesStub,
      '/path/to/input/file',
      context.jsonContent
    );
  });

  test('should not translate other i18n files if disabled', async () => {
    const getConfigStub = sinon.stub(
      ConfigurationStoreManager.getInstance(),
      'getConfig'
    );
    getConfigStub.withArgs('general').returns({
      betaFeaturesConfiguration: { enableTranslationModule: false },
    });

    const translateOtherI18nFilesStub = sinon.stub(
      TranslationService.getInstance(extensionContext),
      'translateOtherI18nFiles'
    );

    await translationModule.executeAsync(context);

    sinon.assert.calledOnce(getConfigStub);
    sinon.assert.calledWith(getConfigStub, 'general');
    sinon.assert.notCalled(translateOtherI18nFilesStub);
  });
});
