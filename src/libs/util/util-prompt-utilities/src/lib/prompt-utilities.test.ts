import { Framework, ProjectType } from '@i18n-weave/util/util-enums';
import assert from 'assert';
import { getLocalizedTexts } from 'libs/util/util-localization-utilities/src/lib/localization-utilities';
import sinon from 'sinon';
import vscode from 'vscode';

import {
  selectFrameworkAsync,
  selectProjectTypeAsync,
  showConfigurationToUserAsync,
  showOpenDialog,
} from './prompt-utilities';

suite('promptUtilities', () => {
  let sandbox: sinon.SinonSandbox;

  setup(() => {
    sandbox = sinon.createSandbox();
  });

  teardown(() => {
    sandbox.restore();
  });

  suite('selectProjectTypeAsync', () => {
    test('should return selected project type', async () => {
      const projectTypes = Object.values(ProjectType);
      const selectedProjectType = { label: projectTypes[0] };
      const showQuickPickStub = sinon.stub(vscode.window, 'showQuickPick');
      showQuickPickStub.resolves(selectedProjectType);

      const result = await selectProjectTypeAsync();

      assert.strictEqual(result, selectedProjectType);

      showQuickPickStub.restore();
    });
  });

  suite('selectFrameworkAsync', () => {
    test('should return selected framework', async () => {
      const frameworks = Object.values(Framework);
      const selectedFramework = { label: frameworks[0] };
      const showQuickPickStub = sinon.stub(vscode.window, 'showQuickPick');
      showQuickPickStub.resolves(selectedFramework);

      const result = await selectFrameworkAsync();

      assert.strictEqual(result, selectedFramework);

      showQuickPickStub.restore();
    });
  });

  suite('showConfigurationToUserAsync', () => {
    test('should show configuration message and return user selection', async () => {
      const configFilePath = '/path/to/config';
      const defaultLanguage = 'en';
      const localizedTexts = getLocalizedTexts(defaultLanguage);
      const confirmativeText = localizedTexts.confirmativeText;
      const confirmativeOption: vscode.MessageItem = {
        title: `${confirmativeText}, lead the way!`,
      };

      const showInformationMessageStub = sinon.stub(
        vscode.window,
        'showInformationMessage'
      );
      showInformationMessageStub.resolves(confirmativeOption);

      const result = await showConfigurationToUserAsync(
        configFilePath,
        defaultLanguage
      );

      assert.strictEqual(result?.title, confirmativeOption.title);
      sinon.assert.calledOnce(showInformationMessageStub);

      showInformationMessageStub.restore();
    });
  });

  test('showOpenDialog should return undefined if folderSelectionPrompt is falsy', async () => {
    sandbox.stub(vscode.window, 'showQuickPick').resolves(undefined);

    const result = await showOpenDialog('Select Folder');

    assert.strictEqual(result, undefined);
  });

  test('showOpenDialog should return undefined if folderUri is undefined', async () => {
    sandbox.stub(vscode.window, 'showQuickPick').resolves({} as any);
    sandbox.stub(vscode.window, 'showOpenDialog').resolves(undefined);

    const result = await showOpenDialog('Select Folder');

    assert.strictEqual(result, undefined);
  });

  test('showOpenDialog should return and array with length one if only a single folder was picked', async () => {
    const folderUri = [vscode.Uri.file('/path/to/folder')];
    sandbox.stub(vscode.window, 'showQuickPick').resolves({} as any);
    sandbox.stub(vscode.window, 'showOpenDialog').resolves(folderUri);

    const result = await showOpenDialog('Select Folder');

    assert.deepEqual(result, ['/path/to/folder']);
  });

  test('showOpenDialog should return an array of folderUri.fsPath if folderUri has length greater than 1', async () => {
    const folderUri = [
      vscode.Uri.file('/path/to/folder1'),
      vscode.Uri.file('/path/to/folder2'),
    ];
    sandbox.stub(vscode.window, 'showQuickPick').resolves({} as any);
    sandbox.stub(vscode.window, 'showOpenDialog').resolves(folderUri);

    const result = await showOpenDialog('Select Folder', true);

    assert.deepStrictEqual(result, ['/path/to/folder1', '/path/to/folder2']);
  });
});
