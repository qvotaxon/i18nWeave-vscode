import * as sinon from 'sinon';
import { strict as assert } from 'assert';
import { TranslationFile } from 'src/libs/store/store-file-location-store/src/lib/file-location-store.types';
import { Uri } from 'vscode';

import { FileReader } from '@i18n-weave/file-io/file-io-file-reader';

import { FileLocationStore } from '@i18n-weave/store/store-file-location-store';

import { LogLevel, Logger } from '@i18n-weave/util/util-logger';

import { TranslationStore } from './translation-store';

suite('TranslationStore', () => {
  let translationStore: TranslationStore;
  let fileReaderStub: sinon.SinonStub;
  let fileLocationStoreStub: sinon.SinonStubbedInstance<FileLocationStore>;
  let loggerStub: sinon.SinonStub;

  setup(() => {
    translationStore = TranslationStore.getInstance();
    fileReaderStub = sinon.stub(FileReader.prototype, 'readWorkspaceFileAsync');
    fileLocationStoreStub = sinon.createStubInstance(FileLocationStore, {
      getTranslationFiles: sinon.stub<[], TranslationFile[]>().returns([
        {
          metaData: { uri: Uri.file('/path/to/file.json') },
        } as TranslationFile,
      ]),
    });
    // fileLocationStoreStub = sinon.stub(
    //   FileLocationStore.getInstance(),
    //   'getTranslationFiles'
    // );
    loggerStub = sinon.stub(Logger.getInstance(), 'log');
  });

  teardown(() => {
    sinon.restore();
  });

  test.skip('should initialize translation store', async () => {
    const fileUri = Uri.file('/path/to/file.json');
    // fileLocationStoreStub.returns([fileUri]);
    fileReaderStub.resolves('{"key": "value"}');

    await translationStore.initializeAsync();

    assert(fileLocationStoreStub.getTranslationFiles.calledOnce);
    assert(fileReaderStub.calledOnceWith(fileUri));
    assert(
      loggerStub.calledWith(
        LogLevel.INFO,
        'Initializing translation store',
        TranslationStore.name
      )
    );
    assert(
      loggerStub.calledWith(
        LogLevel.VERBOSE,
        `Added translation file ${fileUri.fsPath} to store`,
        TranslationStore.name
      )
    );
  });

  test('should get translation file diffs', () => {
    const fileUri = Uri.file('/path/to/file.json');
    const oldContent = '{"key": "oldValue"}';
    const newContent = '{"key": "newValue"}';
    translationStore.updateEntry(fileUri, oldContent);

    const diffs = translationStore.getTranslationFileDiffs(fileUri, newContent);
    // @ts-ignore - typing issue.
    assert.equal(diffs![0].lhs, 'oldValue');
    // @ts-ignore - typing issue.
    assert.equal(diffs![0].rhs, 'newValue');
    assert.equal(diffs![0].kind, 'E');
    assert.equal(diffs![0].path![0], 'key');
  });

  test('should update entry in translation store', () => {
    const fileUri = Uri.file('/path/to/file.json');
    const updatedContent = '{"key": "updatedValue"}';

    translationStore.updateEntry(fileUri, updatedContent);

    assert.deepEqual(
      translationStore['_translationFileContents'].get(fileUri.fsPath),
      { key: 'updatedValue' }
    );
    assert(
      loggerStub.calledWith(
        LogLevel.VERBOSE,
        `Updated translation file ${fileUri.fsPath} in store`,
        TranslationStore.name
      )
    );
  });

  test('should delete entry from translation store', () => {
    const fileUri = Uri.file('/path/to/file.json');
    translationStore.updateEntry(fileUri, '{"key": "value"}');

    translationStore.deleteEntry(fileUri);

    assert(!translationStore['_translationFileContents'].has(fileUri.fsPath));
    assert(
      loggerStub.calledWith(
        LogLevel.VERBOSE,
        `Deleted translation file ${fileUri.fsPath} from store`,
        TranslationStore.name
      )
    );
  });

  test('should add entry to translation store', async () => {
    const fileUri = Uri.file('/path/to/file.json');
    fileReaderStub.resolves('{"key": "value"}');

    await translationStore.addEntryAsync(fileUri);

    assert.deepEqual(
      translationStore['_translationFileContents'].get(fileUri.fsPath),
      { key: 'value' }
    );
    assert(
      loggerStub.calledWith(
        LogLevel.VERBOSE,
        `Added translation file ${fileUri.fsPath} to store`,
        TranslationStore.name
      )
    );
  });
});
