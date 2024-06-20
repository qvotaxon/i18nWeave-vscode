// import assert from 'assert';
// import * as fs from 'fs';
// import sinon from 'sinon';
// import * as vscode from 'vscode';

// import WebViewService from './webviewService';

// suite('WebViewService Tests', function () {
//   let service: WebViewService;
//   let sandbox: sinon.SinonSandbox;

//   setup(function () {
//     sandbox = sinon.createSandbox();
//     service = WebViewService.getInstance();
//   });

//   teardown(function () {
//     sandbox.restore();
//   });

//   test('getInstance should return a singleton instance', function () {
//     const instance1 = WebViewService.getInstance();
//     const instance2 = WebViewService.getInstance();
//     assert.strictEqual(instance1, instance2, 'Instances are not the same');
//   });

//   test('openJsonAsTable should create a webview panel and set its content', function () {
//     const uri = vscode.Uri.file('/path/to/file.json');
//     const context = {} as vscode.ExtensionContext;
//     const panel = {
//       webview: {
//         html: '',
//         asWebviewUri: sandbox.stub().returns('webviewUri'),
//       },
//       onDidChangeViewState: sandbox.stub(),
//       webviewPanel: {
//         visible: true,
//       },
//     };
//     // const readFileStub = sandbox.stub(fs, 'readFileSync');
//     const getWebviewContentStub = sandbox
//       .stub(service, 'getWebviewContent')
//       .returns('webviewContent');
//     const showErrorMessageStub = sandbox.stub(
//       vscode.window,
//       'showErrorMessage'
//     );
//     const onDidReceiveMessageStub = sandbox.stub(panel.webview, 'asWebviewUri');
//     const saveJsonFileStub = sandbox.stub(service, 'saveJsonFile');

//     sandbox.stub(vscode.window, 'createWebviewPanel').returns(panel as any);

//     service.openJsonAsTable(uri, context);

//     // assert.strictEqual(
//     //   vscode.window.createWebviewPanel.callCount,
//     //   1,
//     //   'createWebviewPanel was not called'
//     // );
//     // assert.strictEqual(readFileStub.callCount, 1, 'readFile was not called');
//     assert.strictEqual(
//       getWebviewContentStub.callCount,
//       1,
//       'getWebviewContent was not called'
//     );
//     assert.strictEqual(
//       showErrorMessageStub.callCount,
//       0,
//       'showErrorMessage was called'
//     );
//     assert.strictEqual(
//       onDidReceiveMessageStub.callCount,
//       1,
//       'onDidReceiveMessage was not called'
//     );
//     assert.strictEqual(
//       saveJsonFileStub.callCount,
//       0,
//       'saveJsonFile was called'
//     );

//     assert.strictEqual(
//       panel.onDidChangeViewState.callCount,
//       1,
//       'onDidChangeViewState was not called'
//     );
//     assert.strictEqual(
//       panel.webview.html,
//       'webviewContent',
//       'Webview content is incorrect'
//     );
//     // assert.strictEqual(
//     //   panel.webview.onDidReceiveMessage,
//     //   onDidReceiveMessageStub,
//     //   'onDidReceiveMessage is incorrect'
//     // );
//   });

//   test('openJsonAsTable should show an error message if reading the file fails', function () {
//     const uri = vscode.Uri.file('/path/to/file.json');
//     const context = {} as vscode.ExtensionContext;
//     const panel = {
//       webview: {
//         html: '',
//         asWebviewUri: sandbox.stub().returns('webviewUri'),
//       },
//       onDidChangeViewState: sandbox.stub(),
//       webviewPanel: {
//         visible: true,
//       },
//     };
//     // const readFileStub = sandbox.stub(fs, 'readFileSync');
//     const getWebviewContentStub = sandbox.stub(service, 'getWebviewContent');
//     const showErrorMessageStub = sandbox.stub(
//       vscode.window,
//       'showErrorMessage'
//     );
//     const onDidReceiveMessageStub = sandbox.stub(panel.webview, 'asWebviewUri');
//     const saveJsonFileStub = sandbox.stub(service, 'saveJsonFile');

//     sandbox.stub(vscode.window, 'createWebviewPanel').returns(panel as any);

//     service.openJsonAsTable(uri, context);

//     // assert.strictEqual(
//     //   vscode.window.createWebviewPanel.callCount,
//     //   1,
//     //   'createWebviewPanel was not called'
//     // );
//     // assert.strictEqual(readFileStub.callCount, 1, 'readFile was not called');
//     assert.strictEqual(
//       getWebviewContentStub.callCount,
//       0,
//       'getWebviewContent was called'
//     );
//     assert.strictEqual(
//       showErrorMessageStub.callCount,
//       1,
//       'showErrorMessage was not called'
//     );
//     assert.strictEqual(
//       onDidReceiveMessageStub.callCount,
//       0,
//       'onDidReceiveMessage was called'
//     );
//     assert.strictEqual(
//       saveJsonFileStub.callCount,
//       0,
//       'saveJsonFile was called'
//     );

//     assert.strictEqual(
//       panel.onDidChangeViewState.callCount,
//       1,
//       'onDidChangeViewState was not called'
//     );
//     assert.strictEqual(panel.webview.html, '', 'Webview content is incorrect');
//     assert.strictEqual(
//       showErrorMessageStub.getCall(0).args[0],
//       'Error reading file: Read error',
//       'Error message is incorrect'
//     );
//   });

//   test('getWebviewContent should return the correct HTML content', function () {
//     const panel = {} as vscode.WebviewPanel;
//     const jsonData = { key: 'value' };
//     const extensionUri = vscode.Uri.file('/path/to/extension');

//     const readFileSyncStub = sandbox
//       .stub(fs, 'readFileSync')
//       .returns('htmlContent');
//     const joinPathStub = sandbox.stub(vscode.Uri, 'joinPath').returnsThis();
//     const asWebviewUriStub = sandbox
//       .stub(panel.webview, 'asWebviewUri')
//       .returns(vscode.Uri.from({ scheme: 'vscode-resource', path: 'path' }));

//     const htmlContent = service.getWebviewContent(
//       panel,
//       jsonData,
//       extensionUri
//     );

//     assert.strictEqual(
//       readFileSyncStub.callCount,
//       1,
//       'readFileSync was not called'
//     );
//     assert.strictEqual(joinPathStub.callCount, 3, 'joinPath was not called');
//     assert.strictEqual(
//       asWebviewUriStub.callCount,
//       2,
//       'asWebviewUri was not called'
//     );
//     assert.strictEqual(htmlContent, 'htmlContent', 'HTML content is incorrect');
//   });

//   test('generateTableContent should return the correct table content', function () {
//     const jsonData = {
//       key1: 'value1',
//       key2: {
//         nestedKey: 'nestedValue',
//       },
//     };

//     const tableContent = service.generateTableContent(jsonData);

//     assert.strictEqual(
//       tableContent,
//       `<tr>
//                 <td>key1</td>
//                 <td contenteditable="true">value1</td>
//             </tr><tr>
//                 <td>key2.nestedKey</td>
//                 <td contenteditable="true">nestedValue</td>
//             </tr>`,
//       'Table content is incorrect'
//     );
//   });

//   test('saveJsonFile should save the JSON file', function () {
//     const uri = vscode.Uri.file('/path/to/file.json');
//     const jsonData = '{"key": "value"}';

//     const writeFileStub = sandbox.stub(fs, 'writeFileSync');
//     const showErrorMessageStub = sandbox.stub(
//       vscode.window,
//       'showErrorMessage'
//     );
//     const showInformationMessageStub = sandbox.stub(
//       vscode.window,
//       'showInformationMessage'
//     );

//     service.saveJsonFile(uri, jsonData);

//     assert.strictEqual(writeFileStub.callCount, 1, 'writeFile was not called');
//     assert.strictEqual(
//       showErrorMessageStub.callCount,
//       0,
//       'showErrorMessage was called'
//     );
//     assert.strictEqual(
//       showInformationMessageStub.callCount,
//       1,
//       'showInformationMessage was not called'
//     );
//   });
// });
