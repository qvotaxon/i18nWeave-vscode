import * as assert from 'assert';
import * as sinon from 'sinon';
import { Diff } from 'deep-diff';
import { ExtensionContext, Uri } from 'vscode';

import { StatusBarManager } from '@i18n-weave/feature/feature-status-bar-manager';
import { TranslationService } from '@i18n-weave/feature/feature-translation-service';

import { FileReader } from '@i18n-weave/file-io/file-io-file-reader';
import { FileWriter } from '@i18n-weave/file-io/file-io-file-writer';

import {
  FileLocationStore,
  type TranslationFile,
} from '@i18n-weave/store/store-file-location-store';
import { FileLockStore } from '@i18n-weave/store/store-file-lock-store';
import { TranslationStore } from '@i18n-weave/store/store-translation-store';

import { ConfigurationStoreManager } from '@i18n-weave/util/util-configuration';

import { TranslationModule } from './translation-module';
import { TranslationModuleContext } from './translation-module-context';

suite('TranslationModule', () => {
  let extensionContext: ExtensionContext;
  let translationModule: TranslationModule;
  let context: TranslationModuleContext;
  let translationStoreStub: sinon.SinonStubbedInstance<TranslationStore>;
  let fileLocationStoreStub: sinon.SinonStubbedInstance<FileLocationStore>;
  let translationServiceStub: sinon.SinonStubbedInstance<TranslationService>;
  let fileReaderStub: sinon.SinonStubbedInstance<typeof FileReader>;
  let fileWriterStub: sinon.SinonStubbedInstance<typeof FileWriter>;

  setup(() => {
    extensionContext = { subscriptions: [] } as any;
    translationModule = new TranslationModule(extensionContext);
    context = {
      inputPath: Uri.file('/path/to/file.json'),
      jsonContent: { key: 'value' },
    } as TranslationModuleContext;

    sinon.stub(StatusBarManager, 'getInstance').returns({
      updateState: sinon.stub().returnsThis(),
      setIdle: sinon.stub().returnsThis(),
    } as any);

    translationStoreStub = sinon.createStubInstance(TranslationStore, {
      getTranslationFileDiffs: sinon
        .stub<[Uri, string], Diff<object, object>[] | undefined>()
        // @ts-ignore
        .returns([{ kind: 'N', path: ['key'], rhs: 'value' }]),
      updateEntry: sinon.stub(),
    });

    fileLocationStoreStub = sinon.createStubInstance(FileLocationStore, {
      getTranslationFiles: sinon.stub<[], TranslationFile[]>().returns([
        {
          metaData: { uri: Uri.file('/path/to/file.json') },
        } as TranslationFile,
      ]),
    });

    translationServiceStub = sinon.createStubInstance(TranslationService, {
      translateKeysAsync: sinon
        .stub<
          [texts: (string | object)[], sourceLang: string, targetLang: string],
          Promise<(string | object)[]>
        >()
        .resolves(['translated value']),
    });

    fileReaderStub = sinon.stub(FileReader);
    fileReaderStub.prototype.readWorkspaceFileAsync.prototype.resolves(
      JSON.stringify({})
    );

    fileWriterStub = sinon.stub(FileWriter);
    fileWriterStub.writeToWorkspaceFileAsync.resolves();

    sinon.stub(FileLockStore, 'getInstance').returns({
      hasFileLock: sinon.stub().returns(false),
      addLock: sinon.stub(),
      delete: sinon.stub(),
    } as any);

    sinon.stub(ConfigurationStoreManager, 'getInstance').returns({
      getConfig: sinon
        .stub()
        .returns({ format: { numberOfSpacesForIndentation: 2 } }),
    } as any);
  });

  teardown(() => {
    sinon.restore();
  });

  test.skip('should execute translation process', async () => {
    // @ts-ignore - calling protected method
    await translationModule.doExecuteAsync(context);

    // assert.ok(
    //   statusBarManagerStub.updateState.calledWith(
    //     StatusBarState.Running,
    //     'Translating changes...'
    //   )
    // );
    assert.ok(
      translationStoreStub.getTranslationFileDiffs.calledWith(
        context.inputPath,
        context.jsonContent
      )
    );
    assert.ok(fileLocationStoreStub.getTranslationFiles.calledOnce);
    assert.ok(
      translationServiceStub.translateKeysAsync.calledWith(
        ['value'],
        'en',
        'en'
      )
    );
    assert.ok(fileWriterStub.writeToWorkspaceFileAsync.called);
    // assert.ok(statusBarManagerStub.setIdle.called);
  });

  test.skip('should skip execution if no jsonContent is provided', async () => {
    context.jsonContent = null;

    // @ts-ignore - calling protected method
    await translationModule.doExecuteAsync(context);

    // assert.ok(!statusBarManagerStub.updateState.called);
    assert.ok(!translationStoreStub.getTranslationFileDiffs.called);
  });

  // test('should skip execution if no diffs are found', async () => {
  //   translationStoreStub.getTranslationFileDiffs.returns([]);

  //   // @ts-ignore - calling protected method
  //   await translationModule.doExecuteAsync(context);

  //   assert.ok(
  //     statusBarManagerStub.updateState.calledWith(
  //       StatusBarState.Running,
  //       'Translating changes...'
  //     )
  //   );
  //   // assert.ok(statusBarManagerStub.setIdle.called);
  // });
});
