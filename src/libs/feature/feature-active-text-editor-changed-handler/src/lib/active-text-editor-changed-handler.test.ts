import sinon from 'sinon';
import vscode from 'vscode';

import { DiagnosticsManager } from '@i18n-weave/feature/feature-diagnostics-manager';
import { EmptyJsonValueSymbolProvider } from '@i18n-weave/feature/feature-empty-json-value-symbol-provider';
import { WebviewService } from '@i18n-weave/feature/feature-webview-service';

import { FileLocationStore } from '@i18n-weave/store/store-file-location-store';

import {
  ConfigurationStoreManager,
  GeneralConfiguration,
} from '@i18n-weave/util/util-configuration';

import { ActiveTextEditorChangedHandler } from './active-text-editor-changed-handler';

suite('ActiveTextEditorChangedHandler', () => {
  let sandbox: sinon.SinonSandbox;
  let context: vscode.ExtensionContext;
  let handler: ActiveTextEditorChangedHandler;
  let diagnosticsManagerStub: sinon.SinonStubbedInstance<DiagnosticsManager>;
  let providerStub: sinon.SinonStubbedInstance<EmptyJsonValueSymbolProvider>;
  let webviewServiceStub: sinon.SinonStubbedInstance<WebviewService>;
  let fileLocationStoreStub: sinon.SinonStubbedInstance<FileLocationStore>;
  let configurationStoreManagerStub: sinon.SinonStubbedInstance<ConfigurationStoreManager>;

  setup(() => {
    sandbox = sinon.createSandbox();
    context = {} as vscode.ExtensionContext;
    diagnosticsManagerStub = sandbox.createStubInstance(DiagnosticsManager);
    providerStub = sandbox.createStubInstance(EmptyJsonValueSymbolProvider);
    webviewServiceStub = sandbox.createStubInstance(WebviewService);
    fileLocationStoreStub = sandbox.createStubInstance(FileLocationStore);
    configurationStoreManagerStub = sandbox.createStubInstance(
      ConfigurationStoreManager
    );

    sandbox
      .stub(DiagnosticsManager, 'getInstance')
      .returns(diagnosticsManagerStub);
    sandbox
      .stub(FileLocationStore, 'getInstance')
      .returns(fileLocationStoreStub);
    sandbox
      .stub(ConfigurationStoreManager, 'getInstance')
      .returns(configurationStoreManagerStub);

    handler = new ActiveTextEditorChangedHandler(context);
  });

  teardown(() => {
    sandbox.restore();
  });

  test.skip('should highlight empty JSON values when active editor changes', async () => {
    const editor = {
      document: {
        uri: { scheme: 'file', path: '/path/to/file.json' },
      },
    } as vscode.TextEditor;

    fileLocationStoreStub.hasFile.returns(true);
    providerStub.provideDocumentSymbols.resolves([]);

    const disposable = handler.initialize();

    // @ts-ignore - no exact type needed for testing.
    await vscode.window.onDidChangeActiveTextEditor(editor);

    sinon.assert.calledOnce(providerStub.provideDocumentSymbols);
    sinon.assert.calledOnce(diagnosticsManagerStub.updateDiagnostics);

    disposable.dispose();
  });

  test.skip('should show webview for JSON file if beta feature is enabled', async () => {
    const editor = {
      document: {
        uri: { scheme: 'file', path: '/path/to/file.json' },
      },
    } as vscode.TextEditor;

    fileLocationStoreStub.hasFile.returns(true);
    configurationStoreManagerStub.getConfig.returns({
      betaFeaturesConfiguration: { enableJsonFileWebView: true },
    } as GeneralConfiguration);

    const disposable = handler.initialize();

    // @ts-ignore - no exact type needed for testing.
    await vscode.window.onDidChangeActiveTextEditor(editor);

    sinon.assert.calledOnce(webviewServiceStub.showWebview);

    disposable.dispose();
  });

  test('should not show webview if beta feature is disabled', async () => {
    const editor = {
      document: {
        uri: { scheme: 'file', path: '/path/to/file.json' },
      },
    } as vscode.TextEditor;

    fileLocationStoreStub.hasFile.returns(true);
    configurationStoreManagerStub.getConfig.returns({
      betaFeaturesConfiguration: { enableJsonFileWebView: false },
    } as GeneralConfiguration);

    const disposable = handler.initialize();

    // @ts-ignore - no exact type needed for testing.
    await vscode.window.onDidChangeActiveTextEditor(editor);

    sinon.assert.notCalled(webviewServiceStub.showWebview);

    disposable.dispose();
  });

  test('should not perform any actions if editor is undefined', async () => {
    const disposable = handler.initialize();

    // @ts-ignore - providing unaccepted undefined for testing
    await vscode.window.onDidChangeActiveTextEditor(undefined);

    sinon.assert.notCalled(providerStub.provideDocumentSymbols);
    sinon.assert.notCalled(diagnosticsManagerStub.updateDiagnostics);
    sinon.assert.notCalled(webviewServiceStub.showWebview);

    disposable.dispose();
  });

  test('should not perform any actions if document is not a JSON file', async () => {
    const editor = {
      document: {
        uri: { scheme: 'file', path: '/path/to/file.txt' },
      },
    } as vscode.TextEditor;

    const disposable = handler.initialize();

    // @ts-ignore - no exact type needed for testing.
    await vscode.window.onDidChangeActiveTextEditor(editor);

    sinon.assert.notCalled(providerStub.provideDocumentSymbols);
    sinon.assert.notCalled(diagnosticsManagerStub.updateDiagnostics);
    sinon.assert.notCalled(webviewServiceStub.showWebview);

    disposable.dispose();
  });
});
