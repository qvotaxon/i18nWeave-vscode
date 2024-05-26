import * as assert from 'assert';
import FileChangeHandlerFactory from '../../services/fileChangeHandlerFactory';
import JsonFileChangeHandler from '../../fileChangeHandlers/jsonFileChangeHandler';

suite('FileChangeHandlerFactory Tests', () => {
  test('createFileChangeHandler should return an instance of JsonFileChangeHandler for json file', () => {
    const factory = new FileChangeHandlerFactory();
    const changeFileLocation = '/path/to/file.json';

    const handler = factory.createFileChangeHandler(changeFileLocation);

    assert.strictEqual(handler instanceof JsonFileChangeHandler, true);
  });

  test('createFileChangeHandler should throw an error for unsupported file extension', () => {
    const factory = new FileChangeHandlerFactory();
    const changeFileLocation = '/path/to/file.txt';

    assert.throws(
      () => {
        factory.createFileChangeHandler(changeFileLocation);
      },
      Error,
      'Unsupported file extension'
    );
  });
});
