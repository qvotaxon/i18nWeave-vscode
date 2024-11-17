import * as assert from 'assert';
import vscode from 'vscode';

import { CodeFileChangeHandler } from '@i18n-weave/feature/feature-code-file-change-handler';
import { JsonFileChangeHandler } from '@i18n-weave/feature/feature-json-file-change-handler';

import { FileType } from '@i18n-weave/util/util-enums';

import { FileChangeHandlerFactory } from './file-change-handler-factory';

suite('FileChangeHandlerFactory Tests', () => {
  let extensionContext: vscode.ExtensionContext;

  setup(() => {
    extensionContext = {} as vscode.ExtensionContext;
  });

  test('createFileChangeHandler should return an instance of JsonFileChangeHandler for json file', () => {
    const factory = new FileChangeHandlerFactory();

    const handler = factory.createFileChangeHandler(
      FileType.Translation,
      extensionContext
    );

    assert.strictEqual(handler instanceof JsonFileChangeHandler, true);
  });

  test('createFileChangeHandler should return an instance of CodeFileChangeHandler for ts file', () => {
    const factory = new FileChangeHandlerFactory();

    const handler = factory.createFileChangeHandler(
      FileType.Code,
      extensionContext
    );

    assert.strictEqual(handler instanceof CodeFileChangeHandler, true);
  });

  test('createFileChangeHandler should throw an error for unsupported file extension', () => {
    const factory = new FileChangeHandlerFactory();

    assert.throws(
      () => {
        factory.createFileChangeHandler('txt' as FileType, extensionContext);
      },
      Error,
      'Unsupported file extension'
    );
  });
});
