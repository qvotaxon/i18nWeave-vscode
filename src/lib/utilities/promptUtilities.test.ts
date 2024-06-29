import assert from 'assert';
import sinon from 'sinon';
import vscode from 'vscode';

import { Framework } from '../enums/framework';
import { ProjectType } from '../enums/projectType';
import { getLocalizedTexts } from './localizationUtilities';
import {
  selectFrameworkAsync,
  selectProjectTypeAsync,
  showConfigurationToUserAsync,
} from './promptUtilities';

suite('promptUtilities', () => {
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
});
