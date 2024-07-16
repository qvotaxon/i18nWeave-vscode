import * as assert from 'assert';

import { FileType } from '../../enums/fileType';
import FileChangeHandlerFactory from './fileChangeHandlerFactory';
import CodeFileChangeHandler from './fileChangeHandlers/codeFileChangeHandler';
import JsonFileChangeHandler from './fileChangeHandlers/jsonFileChangeHandler';
import PoFileChangeHandler from './fileChangeHandlers/poFileChangeHandler';

suite('FileChangeHandlerFactory Tests', () => {
  test('createFileChangeHandler should return an instance of JsonFileChangeHandler for json file', () => {
    const factory = new FileChangeHandlerFactory();

    const handler = factory.createFileChangeHandler(FileType.Json);

    assert.strictEqual(handler instanceof JsonFileChangeHandler, true);
  });

  test('createFileChangeHandler should return an instance of PoFileChangeHandler for po file', () => {
    const factory = new FileChangeHandlerFactory();

    const handler = factory.createFileChangeHandler(FileType.Po);

    assert.strictEqual(handler instanceof PoFileChangeHandler, true);
  });

  test('createFileChangeHandler should return an instance of CodeFileChangeHandler for ts file', () => {
    const factory = new FileChangeHandlerFactory();

    const handler = factory.createFileChangeHandler(FileType.Code);

    assert.strictEqual(handler instanceof CodeFileChangeHandler, true);
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
