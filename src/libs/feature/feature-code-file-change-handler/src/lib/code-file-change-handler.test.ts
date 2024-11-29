import assert from 'assert';
import fs from 'fs';
import sinon from 'sinon';
import vscode, { Uri, workspace } from 'vscode';

import { CodeFileChangeHandler } from '@i18n-weave/feature/feature-code-file-change-handler';

import { CodeTranslationKeyStore } from '@i18n-weave/store/store-code-translation-key-store';

import { ConfigurationStoreManager } from '@i18n-weave/util/util-configuration';
import { ChainType } from '@i18n-weave/util/util-enums';

suite('CodeFileChangeHandler', () => {
  let mockFs: { readFile: sinon.SinonStub };
  let extensionContext: vscode.ExtensionContext;
  let handler: CodeFileChangeHandler;
  let sandbox: sinon.SinonSandbox;

  setup(() => {
    sandbox = sinon.createSandbox();
    extensionContext = {} as vscode.ExtensionContext;
    handler = CodeFileChangeHandler.create(extensionContext);

    sandbox.stub(
      CodeFileChangeHandler['moduleChainManager'],
      'executeChainAsync'
    );
    sandbox.stub(fs, 'existsSync');
    sandbox.stub(
      CodeTranslationKeyStore.getInstance(),
      'hasTranslationChanges'
    );

    mockFs = {
      readFile: sandbox.stub().resolves(Buffer.from('Mock file content')),
    };

    sandbox.replaceGetter(workspace, 'fs', () => mockFs as any);
  });

  teardown(() => {
    sandbox.restore();
  });

  suite('create', () => {
    test('should create an instance of CodeFileChangeHandler', () => {
      const instance = CodeFileChangeHandler.create(extensionContext);
      assert(instance instanceof CodeFileChangeHandler);
    });
  });

  suite('handleFileChangeAsync', () => {
    test('should not add to _changedFiles if changeFileLocation is undefined', async () => {
      const addSpy = sandbox.spy(Set.prototype, 'add');
      await handler.handleFileChangeAsync();
      sinon.assert.notCalled(addSpy);
    });

    test('should add to _changedFiles if changeFileLocation is provided', async () => {
      const uri = Uri.file('path/to/file.ts');
      const addSpy = sandbox.spy(Set.prototype, 'add');
      await handler.handleFileChangeAsync(uri);
      sinon.assert.calledOnceWithExactly(addSpy, uri.fsPath);
    });
  });

  suite('processChanges', () => {
    let executeChainAsyncStub: sinon.SinonStub;
    let existsSyncStub: sinon.SinonStub;
    let hasTranslationChangesStub: sinon.SinonStub;

    setup(() => {
      executeChainAsyncStub = CodeFileChangeHandler['moduleChainManager']
        .executeChainAsync as sinon.SinonStub;
      existsSyncStub = fs.existsSync as sinon.SinonStub;
      hasTranslationChangesStub = CodeTranslationKeyStore.getInstance()
        .hasTranslationChanges as sinon.SinonStub;

      if (!ConfigurationStoreManager.getInstance().getConfig('debugging')) {
        sandbox
          .stub(ConfigurationStoreManager.getInstance(), 'getConfig')
          .withArgs('debugging')
          .returns({
            logging: {
              enableVerboseLogging: true,
            },
          });
      }
    });

    test('should perform full scan if file does not exist', async () => {
      const uri = Uri.file('path/to/file.ts');
      handler['_changedFiles'].add(uri.fsPath);
      existsSyncStub.returns(false);

      await handler['processChanges']();

      sinon.assert.calledOnce(executeChainAsyncStub);
      sinon.assert.calledWith(
        executeChainAsyncStub,
        ChainType.Code,
        sinon.match({ hasChanges: true, hasDeletions: true, hasRenames: true })
      );
    });

    test('should perform full scan if translations have deletions or renames', async () => {
      const uri = Uri.file('path/to/file.ts');
      handler['_changedFiles'].add(uri.fsPath);
      existsSyncStub.returns(true);
      hasTranslationChangesStub.resolves({
        hasChanges: true,
        hasDeletions: true,
        hasRenames: false,
      });

      await handler['processChanges']();

      sinon.assert.calledOnce(executeChainAsyncStub);
      sinon.assert.calledWith(
        executeChainAsyncStub,
        ChainType.Code,
        sinon.match({ hasChanges: true, hasDeletions: true, hasRenames: true })
      );
    });

    test('should scan specific files if translations have changes but no deletions or renames', async () => {
      const uri = Uri.file('path/to/file.json');
      handler['_changedFiles'].add(uri.fsPath);
      existsSyncStub.returns(true);
      hasTranslationChangesStub.resolves({
        hasChanges: true,
        hasDeletions: false,
        hasRenames: false,
      });

      await handler['processChanges']();

      sinon.assert.calledOnce(executeChainAsyncStub);
      // sinon.assert.calledWith(
      //   executeChainAsyncStub,
      //   ChainType.Code,
      //   sinon.match({
      //     inputPath: uri.fsPath,
      //     hasChanges: true,
      //     hasDeletions: false,
      //     hasRenames: false,
      //   })
      // );

      sinon.assert.calledWith(mockFs.readFile, uri);
    });

    test('should not scan if no changes detected', async () => {
      const uri = Uri.file('path/to/file.ts');
      handler['_changedFiles'].add(uri.fsPath);
      existsSyncStub.returns(true);
      hasTranslationChangesStub.resolves({
        hasChanges: false,
        hasDeletions: false,
        hasRenames: false,
      });

      await handler['processChanges']();

      sinon.assert.notCalled(executeChainAsyncStub);
    });
  });

  suite('handleFileDeletionAsync', () => {
    test('should handle file deletion and update store record', async () => {
      const uri = Uri.file('path/to/file.ts');
      const deleteStoreRecordStub = sandbox.stub(
        CodeTranslationKeyStore.getInstance(),
        'deleteStoreRecord'
      );
      const addSpy = sandbox.spy(Set.prototype, 'add');

      await handler.handleFileDeletionAsync(uri);

      sinon.assert.calledOnceWithExactly(deleteStoreRecordStub, uri);
      sinon.assert.calledOnceWithExactly(addSpy, uri.fsPath);
    });

    test('should not handle file deletion if changeFileLocation is undefined', async () => {
      const deleteStoreRecordStub = sandbox.stub(
        CodeTranslationKeyStore.getInstance(),
        'deleteStoreRecord'
      );
      const addSpy = sandbox.spy(Set.prototype, 'add');

      await handler.handleFileDeletionAsync();

      sinon.assert.notCalled(deleteStoreRecordStub);
      sinon.assert.notCalled(addSpy);
    });
  });

  suite('handleFileCreationAsync', () => {
    test('should handle file creation', async () => {
      const uri = Uri.file('path/to/file.ts');
      const addSpy = sandbox.spy(Set.prototype, 'add');

      await handler.handleFileCreationAsync(uri);

      sinon.assert.calledOnceWithExactly(addSpy, uri.fsPath);
    });
  });
});
