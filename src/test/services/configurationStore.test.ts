import * as assert from 'assert';
import { Options } from 'mock-fs/lib/filesystem';
import * as vscode from 'vscode';
import ConfigurationStore from '../../services/configurationStore';
import * as mock from 'mock-fs';

suite('ConfigurationStore Tests', () => {
  let configurationStore: ConfigurationStore;

  setup(() => {
    configurationStore = new ConfigurationStore();
    configurationStore.Initialize();
  });

  test('GetOptions should return the initialized options', () => {
    const options = configurationStore.GetOptions();
    assert.ok(options);
  });

  test('Get should return the specified configuration', () => {
    const configurationKey = 'translationModule';
    const configuration = configurationStore.Get<Options>(configurationKey);
    assert.ok(configuration);
  });

  test('Get should throw an error if options are not initialized', () => {
    configurationStore = new ConfigurationStore();
    assert.throws(() => {
      configurationStore.GetOptions();
    }, Error);
  });

  //TODO: Fix this test
  //   test('Initialize should update the options', async () => {
  //     // Add a fake workspace folder
  //     const fakeWorkspaceUri = vscode.Uri.file('/path/to/fake/workspace');
  //     vscode.workspace.updateWorkspaceFolders(0, null, {
  //       uri: fakeWorkspaceUri,
  //     });

  //     // Set the active text document to the fake document
  //     // const fakeDocumentUri = vscode.Uri.file('/path/to/fake/workspace/fake.txt');
  //     // const fakeDocument = await vscode.workspace.openTextDocument(
  //     //   fakeDocumentUri
  //     // );
  //     // await vscode.window.showTextDocument(fakeDocument);

  //     configurationStore.Initialize();
  //     const optionsBefore = configurationStore.GetOptions();

  //     const configuration = vscode.workspace.getConfiguration('i18nWeave');

  //     await configuration.update('translationModule.enabled', false);
  //     const optionsAfter = configurationStore.GetOptions();
  //     assert.notDeepStrictEqual(optionsBefore, optionsAfter);

  //     // Restore the file system
  //     mock.restore();
  //   });

  test('updateOptions should throw an error if configuration is not found', () => {
    vscode.extensions.getExtension = () => undefined;
    assert.throws(() => {
      configurationStore.Initialize();
    }, Error);
  });

  test('updateOptions should throw an error if configuration value is missing', () => {
    vscode.workspace
      .getConfiguration('i18nWeave')
      .update('translationModule.enabled', undefined);
    assert.throws(() => {
      configurationStore.Initialize();
    }, Error);
  });
});
