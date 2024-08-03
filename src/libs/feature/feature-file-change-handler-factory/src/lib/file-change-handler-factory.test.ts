import * as assert from 'assert';
import vscode from 'vscode';

import { FileType } from '@i18n-weave/util/util-enums';

import FileChangeHandlerFactory from '../../../file-change-handler-factory';
import CodeFileChangeHandler from '../../../fileChangeHandlers/feature-code-file-change-handler/src/lib/code-file-change-handler';
import JsonFileChangeHandler from '../../../fileChangeHandlers/feature-json-file-change-handler/src/lib/json-file-change-handler';
import PoFileChangeHandler from '../../../fileChangeHandlers/feature-po-file-change-handler/src/lib/po-file-change-handler';

suite('FileChangeHandlerFactory Tests', () => {
  let extensionContext: vscode.ExtensionContext;

  setup(() => {
    extensionContext = {} as vscode.ExtensionContext;
  });

  test('createFileChangeHandler should return an instance of JsonFileChangeHandler for json file', () => {
    const factory = new FileChangeHandlerFactory();

    const handler = factory.createFileChangeHandler(
      FileType.Json,
      extensionContext
    );

    assert.strictEqual(handler instanceof JsonFileChangeHandler, true);
  });

  test('createFileChangeHandler should return an instance of PoFileChangeHandler for po file', () => {
    const factory = new FileChangeHandlerFactory();

    const handler = factory.createFileChangeHandler(
      FileType.Po,
      extensionContext
    );

    assert.strictEqual(handler instanceof PoFileChangeHandler, true);
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
