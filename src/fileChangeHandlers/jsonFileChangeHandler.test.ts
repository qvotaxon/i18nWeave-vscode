import * as assert from 'assert';
import * as sinon from 'sinon';
import { Uri } from 'vscode';
import JsonFileChangeHandler from './jsonFileChangeHandler';
import { ChainType } from '../enums/chainType';
import FilePathProcessor from '../services/filePathProcessor';

suite('JsonFileChangeHandler Tests', () => {
  let jsonFileChangeHandler: JsonFileChangeHandler;

  setup(() => {
    jsonFileChangeHandler = JsonFileChangeHandler.create();
  });

  test('handleFileChangeAsync should return if changeFileLocation is undefined', async () => {
    const result = await jsonFileChangeHandler.handleFileChangeAsync();
    assert.strictEqual(result, undefined);
  });

  test('handleFileChangeAsync should execute the module chain with correct context', async () => {
    const changeFileLocation = Uri.file('/path/to/file.json');
    const extractedFileParts = {
      locale: 'en',
      outputPath: '/path/to/output',
    };

    const processFilePathStub = sinon.stub().returns(extractedFileParts);
    sinon.replace(FilePathProcessor, 'processFilePath', processFilePathStub);

    const executeChainStub = sinon.stub(
      JsonFileChangeHandler.moduleChainManager,
      'executeChain'
    );

    await jsonFileChangeHandler.handleFileChangeAsync(changeFileLocation);

    sinon.assert.calledOnceWithExactly(
      processFilePathStub,
      changeFileLocation.fsPath
    );
    sinon.assert.calledOnceWithExactly(executeChainStub, ChainType.Json, {
      inputPath: changeFileLocation,
      locale: extractedFileParts.locale,
      outputPath: sinon.match.string,
    });

    sinon.restore();
  });
});
