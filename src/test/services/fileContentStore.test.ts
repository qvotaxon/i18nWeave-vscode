// import assert from 'assert';
// import sinon from 'sinon';
// import vscode from 'vscode';

// import GeneralConfiguration from '../../entities/configuration/general/generalConfiguration';
// import { ChainType } from '../../enums/chainType';
// import TypeScriptFileChangeHandler from '../../fileChangeHandlers/typeScriptFileChangeHandler';
// import ModuleContext from '../../interfaces/moduleContext';
// import ConfigurationStoreManager from '../../services/configurationStoreManager';
// import FileContentStore from '../../services/fileContentStore';

// suite('TypeScriptFileChangeHandler', () => {
//   let handler: TypeScriptFileChangeHandler;

//   setup(() => {
//     handler = TypeScriptFileChangeHandler.create();

//     const pathsConfiguration = {
//       packageJsonAbsoluteFolderPath: 'some/path',
//     } as GeneralConfiguration['pathsConfiguration'];
//     sinon
//       .stub(ConfigurationStoreManager.getInstance(), 'getConfig')
//       .returns({ pathsConfiguration });
//   });

//   teardown(() => {
//     sinon.restore();
//   });

//   suite('create', () => {
//     test('should create an instance of TypeScriptFileChangeHandler', () => {
//       const instance = TypeScriptFileChangeHandler.create();
//       assert(instance instanceof TypeScriptFileChangeHandler);
//     });
//   });

//   suite('handleFileChangeAsync', () => {
//     let fileContentStoreStub: sinon.SinonStubbedInstance<FileContentStore>;

//     setup(() => {
//       fileContentStoreStub = sinon.createStubInstance(FileContentStore);
//       sinon.stub(FileContentStore, 'getInstance').returns(fileContentStoreStub);
//     });

//     test('should not execute chain if changeFileLocation is undefined', async () => {
//       fileContentStoreStub.fileChangeContainsTranslationKeys.returns(true);
//       const moduleChainManagerExecuteChainStub = sinon
//         .stub(
//           TypeScriptFileChangeHandler.moduleChainManager,
//           'executeChainAsync'
//         )
//         .returns(Promise.resolve());
//       await handler.handleFileChangeAsync();
//       sinon.assert.notCalled(moduleChainManagerExecuteChainStub);
//     });

//     test('should execute chain if changeFileLocation is provided', async () => {
//       fileContentStoreStub.fileChangeContainsTranslationKeys.returns(true);
//       const moduleChainManagerExecuteChainStub = sinon
//         .stub(
//           TypeScriptFileChangeHandler.moduleChainManager,
//           'executeChainAsync'
//         )
//         .returns(Promise.resolve());
//       const uri = vscode.Uri.file('path/to/file.ts');

//       await handler.handleFileChangeAsync(uri);

//       const expectedContext: ModuleContext = {
//         inputPath: uri,
//         locale: '',
//         outputPath: uri,
//       };

//       sinon.assert.calledOnceWithExactly(
//         moduleChainManagerExecuteChainStub,
//         ChainType.TypeScript,
//         expectedContext
//       );
//     });

//     test('should not execute chain if changeFileLocation does not contain translation keys', async () => {
//       const moduleChainManagerExecuteChainStub = sinon
//         .stub(
//           TypeScriptFileChangeHandler.moduleChainManager,
//           'executeChainAsync'
//         )
//         .returns(Promise.resolve());
//       const uri = vscode.Uri.file('path/to/file.ts');

//       fileContentStoreStub.fileChangeContainsTranslationKeys.returns(false);

//       await handler.handleFileChangeAsync(uri);

//       sinon.assert.notCalled(moduleChainManagerExecuteChainStub);
//     });

//     test('should execute chain if changeFileLocation contains translation keys', async () => {
//       fileContentStoreStub.fileChangeContainsTranslationKeys.returns(true);
//       const moduleChainManagerExecuteChainStub = sinon
//         .stub(
//           TypeScriptFileChangeHandler.moduleChainManager,
//           'executeChainAsync'
//         )
//         .returns(Promise.resolve());
//       const uri = vscode.Uri.file('path/to/file.ts');

//       await handler.handleFileChangeAsync(uri);

//       const expectedContext: ModuleContext = {
//         inputPath: uri,
//         locale: '',
//         outputPath: uri,
//       };

//       sinon.assert.calledOnceWithExactly(
//         moduleChainManagerExecuteChainStub,
//         ChainType.TypeScript,
//         expectedContext
//       );
//     });

//     test('should not execute chain if fileChangeContainsTranslationKeys returns false', async () => {
//       fileContentStoreStub.fileChangeContainsTranslationKeys.returns(false);
//       const moduleChainManagerExecuteChainStub = sinon
//         .stub(
//           TypeScriptFileChangeHandler.moduleChainManager,
//           'executeChainAsync'
//         )
//         .returns(Promise.resolve());
//       const uri = vscode.Uri.file('path/to/file.ts');

//       await handler.handleFileChangeAsync(uri);

//       sinon.assert.notCalled(moduleChainManagerExecuteChainStub);
//     });

//     test('should execute chain for each file change', async () => {
//       fileContentStoreStub.fileChangeContainsTranslationKeys.returns(true);
//       const moduleChainManagerExecuteChainStub = sinon
//         .stub(
//           TypeScriptFileChangeHandler.moduleChainManager,
//           'executeChainAsync'
//         )
//         .returns(Promise.resolve());

//       const uri1 = vscode.Uri.file('path/to/file1.ts');
//       const uri2 = vscode.Uri.file('path/to/file2.ts');

//       await handler.handleFileChangeAsync(uri1);
//       await handler.handleFileChangeAsync(uri2);

//       const expectedContext1: ModuleContext = {
//         inputPath: uri1,
//         locale: '',
//         outputPath: uri1,
//       };

//       const expectedContext2: ModuleContext = {
//         inputPath: uri2,
//         locale: '',
//         outputPath: uri2,
//       };

//       sinon.assert.calledTwice(moduleChainManagerExecuteChainStub);

//       sinon.assert.calledWithExactly(
//         moduleChainManagerExecuteChainStub.getCall(0),
//         ChainType.TypeScript,
//         expectedContext1
//       );

//       sinon.assert.calledWithExactly(
//         moduleChainManagerExecuteChainStub.getCall(1),
//         ChainType.TypeScript,
//         expectedContext2
//       );
//     });
//   });
// });
