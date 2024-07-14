import * as assert from 'assert';

import { FileType } from '../../enums/fileType';
import FileChangeHandlerFactory from './fileChangeHandlerFactory';
import JsonFileChangeHandler from './fileChangeHandlers/jsonFileChangeHandler';
import PoFileChangeHandler from './fileChangeHandlers/poFileChangeHandler';
import TypeScriptFileChangeHandler from './fileChangeHandlers/typeScriptFileChangeHandler';

suite('FileChangeHandlerFactory Tests', () => {
  test('createFileChangeHandler should return an instance of JsonFileChangeHandler for json file', () => {
    const factory = new FileChangeHandlerFactory();

    const handler = factory.createFileChangeHandler(FileType.JSON);

    assert.strictEqual(handler instanceof JsonFileChangeHandler, true);
  });

  test('createFileChangeHandler should return an instance of PoFileChangeHandler for po file', () => {
    const factory = new FileChangeHandlerFactory();

    const handler = factory.createFileChangeHandler(FileType.PO);

    assert.strictEqual(handler instanceof PoFileChangeHandler, true);
  });

  test('createFileChangeHandler should return an instance of TypeScriptFileChangeHandler for ts file', () => {
    const factory = new FileChangeHandlerFactory();

    const handler = factory.createFileChangeHandler(FileType.TypeScript);

    assert.strictEqual(handler instanceof TypeScriptFileChangeHandler, true);
  });

  test('createFileChangeHandler should throw an error for unsupported file extension', () => {
    const factory = new FileChangeHandlerFactory();

    assert.throws(
      () => {
        factory.createFileChangeHandler('txt' as FileType);
      },
      Error,
      'Unsupported file extension'
    );
  });
});
