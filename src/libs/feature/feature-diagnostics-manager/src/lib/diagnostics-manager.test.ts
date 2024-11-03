import * as sinon from 'sinon';
import * as vscode from 'vscode';
import assert from 'assert';

import { ConfigurationStoreManager } from '@i18n-weave/util/util-configuration';

import { DiagnosticsManager } from './diagnostics-manager';

suite('DiagnosticsManager', () => {
  let getConfigStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;
  let diagnosticCollectionStub: sinon.SinonStubbedInstance<vscode.DiagnosticCollection>;
  let createDiagnosticCollectionStub: sinon.SinonStub;

  setup(() => {
    sandbox = sinon.createSandbox();
    diagnosticCollectionStub = {
      set: sandbox.stub(),
      delete: sandbox.stub(),
      clear: sandbox.stub(),
      forEach: sandbox.stub(),
      get: sandbox.stub(),
      has: sandbox.stub(),
      name: 'missingValues',
    } as unknown as sinon.SinonStubbedInstance<vscode.DiagnosticCollection>;
    createDiagnosticCollectionStub = sandbox
      .stub(vscode.languages, 'createDiagnosticCollection')
      .returns(diagnosticCollectionStub);
  });

  teardown(() => {
    sandbox.restore();
  });

  test('should update diagnostics with empty value errors', async () => {
    getConfigStub = sinon
      .stub(ConfigurationStoreManager.getInstance(), 'getConfig')
      .withArgs('debugging')
      .returns({
        logging: {
          enableVerboseLogging: true,
        },
      });
    const manager = DiagnosticsManager.getInstance();

    // @ts-ignore
    manager._diagnosticCollection = diagnosticCollectionStub;

    const document = { uri: 'test-uri' } as unknown as vscode.TextDocument;
    const documentSymbols = [
      { name: 'key1', range: new vscode.Range(0, 0, 0, 5) },
      { name: 'key2', range: new vscode.Range(1, 0, 1, 5) },
    ] as vscode.DocumentSymbol[];

    await manager.updateDiagnostics(document, documentSymbols);

    assert.ok(diagnosticCollectionStub.set.calledOnce);
  });

  test('should create a singleton instance', () => {
    const instance1 = DiagnosticsManager.getInstance();
    const instance2 = DiagnosticsManager.getInstance();
    assert.strictEqual(instance1, instance2);
  });

  test('should update diagnostics with empty value errors', async () => {
    const manager = DiagnosticsManager.getInstance();

    // @ts-ignore
    manager._diagnosticCollection = diagnosticCollectionStub;

    const document = { uri: 'test-uri' } as unknown as vscode.TextDocument;
    const documentSymbols = [
      { name: 'key1', range: new vscode.Range(0, 0, 0, 5) },
      { name: 'key2', range: new vscode.Range(1, 0, 1, 5) },
    ] as vscode.DocumentSymbol[];

    await manager.updateDiagnostics(document, documentSymbols);

    assert.ok(diagnosticCollectionStub.set.calledOnce);
  });

  test('should clear diagnostics if no issues are found', async () => {
    const manager = DiagnosticsManager.getInstance();
    const document = { uri: 'test-uri' } as unknown as vscode.TextDocument;

    // @ts-ignore
    manager._diagnosticCollection = diagnosticCollectionStub;

    await manager.updateDiagnostics(document, null);

    assert.ok(diagnosticCollectionStub.delete.calledOnceWith(document.uri));
  });
});
