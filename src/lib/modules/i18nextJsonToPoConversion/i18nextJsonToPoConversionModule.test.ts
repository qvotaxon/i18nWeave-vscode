import * as assert from 'assert';
import { i18next2po } from 'gettext-converter';
import { Uri, workspace } from 'vscode';

import FileReader from '../../services/fileIo/fileReader';
import I18nextJsonToPoConversionModule from './i18nextJsonToPoConversionModule';

suite('I18nextJsonToPoConversionModule Tests', () => {
  const potCreationDateRegex = /"POT-Creation-Date: .+\\n"/g;
  const poRevisionDateRegex = /"PO-Revision-Date: .+\\n"/g;

  test('doExecute should convert JSON to PO and write to file', async () => {
    const workspaceFolders = workspace.workspaceFolders![0];
    const inputPath = Uri.file(
      workspaceFolders.uri.fsPath + '/locales/nl/common.json'
    );
    const outputPath = Uri.file(
      workspaceFolders.uri.fsPath + '/locales/nl/common.po'
    );

    let jsonContent = { key: 'value' };
    const locale = 'en-US';

    const module = new I18nextJsonToPoConversionModule();
    let context = {
      inputPath,
      outputPath,
      jsonContent,
      locale,
    };

    await module.executeAsync(context);

    let expectedOutput = i18next2po(locale, jsonContent, {
      compatibilityJSON: 'v3',
    });
    let outputFileContent = await FileReader.readFileAsync(outputPath.fsPath);

    let outputFileWithoutDates = outputFileContent
      .replace(potCreationDateRegex, '')
      .replace(poRevisionDateRegex, '');
    let expectedOutputWithoutDates = expectedOutput
      .replace(potCreationDateRegex, '')
      .replace(poRevisionDateRegex, '');
    assert.strictEqual(outputFileWithoutDates, expectedOutputWithoutDates);

    jsonContent = { key: 'valueChanged' };
    context = {
      inputPath,
      outputPath,
      jsonContent,
      locale,
    };

    await module.executeAsync(context);

    expectedOutput = i18next2po(locale, jsonContent, {
      compatibilityJSON: 'v3',
    });
    outputFileContent = await FileReader.readFileAsync(outputPath.fsPath);

    outputFileWithoutDates = outputFileContent
      .replace(potCreationDateRegex, '')
      .replace(poRevisionDateRegex, '');
    expectedOutputWithoutDates = expectedOutput
      .replace(potCreationDateRegex, '')
      .replace(poRevisionDateRegex, '');
    assert.strictEqual(outputFileWithoutDates, expectedOutputWithoutDates);
  });

  test('doExecute should not write to file if jsonContent is null', async () => {
    const workspaceFolders = workspace.workspaceFolders![0];
    const inputPath = Uri.file(
      workspaceFolders.uri.fsPath + '/locales/nl/common.json'
    );
    const outputPath = Uri.file(
      workspaceFolders.uri.fsPath + '/locales/nl/common.po'
    );
    const locale = 'en-US';

    const module = new I18nextJsonToPoConversionModule();
    const context = {
      inputPath,
      outputPath,
      jsonContent: null,
      locale,
    };

    await module.executeAsync(context);

    assert.rejects(FileReader.readFileAsync(outputPath.fsPath));
  });
});
