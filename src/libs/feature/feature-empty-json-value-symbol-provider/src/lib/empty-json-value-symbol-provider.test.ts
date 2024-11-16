import * as sinon from 'sinon';
import * as vscode from 'vscode';
import assert from 'assert';

import { LogLevel, Logger } from '@i18n-weave/util/util-logger';

import { EmptyJsonValueSymbolProvider } from './empty-json-value-symbol-provider';

suite('EmptyJsonValueSymbolProvider Tests', function () {
  let provider: EmptyJsonValueSymbolProvider;
  let sandbox: sinon.SinonSandbox;
  let loggerStub: sinon.SinonStubbedInstance<Logger>;

  setup(function () {
    sandbox = sinon.createSandbox();
    loggerStub = sandbox.createStubInstance(Logger);
    sandbox.stub(Logger, 'getInstance').returns(loggerStub);
    provider = new EmptyJsonValueSymbolProvider();
  });

  teardown(function () {
    sandbox.restore();
  });

  test('provideDocumentSymbols should return empty array for non-JSON content', async function () {
    const document = {
      getText: sandbox.stub().returns('not a json'),
    } as any;
    const symbols = await provider.provideDocumentSymbols(
      document,
      {} as vscode.CancellationToken
    );
    assert(symbols, 'Symbols should not be null or undefined');
    assert.strictEqual(symbols.length, 0, 'Symbols array should be empty');
    assert(
      loggerStub.log.calledWith(LogLevel.VERBOSE),
      'Logger should log an error'
    );
  });

  test('provideDocumentSymbols should return symbols for empty JSON values', async function () {
    const jsonContent = '{"key1": "", "key2": {"nestedKey": ""}}';
    const document = {
      getText: sandbox.stub().returns(jsonContent),
      positionAt: sandbox.stub().callsFake((index: any) => {
        const lines = jsonContent.slice(0, index).split('\n');
        return new vscode.Position(
          lines.length - 1,
          lines[lines.length - 1].length
        );
      }),
    } as any;

    const symbols = await provider.provideDocumentSymbols(
      document,
      {} as vscode.CancellationToken
    );

    assert(symbols, 'Symbols should not be null or undefined');
    assert.strictEqual(
      symbols.length,
      2,
      'Symbols array should contain 2 items'
    );
    assert.strictEqual(
      symbols[0].name,
      'key1',
      'First symbol name should be "key1"'
    );
    assert.strictEqual(
      symbols[1].name,
      'key2.nestedKey',
      'Second symbol name should be "key2.nestedKey"'
    );
  });
});
