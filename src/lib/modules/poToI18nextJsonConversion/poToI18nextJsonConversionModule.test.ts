import * as assert from 'assert';
import { Uri, workspace } from 'vscode';

import FileReader from '../../services/fileIo/fileReader';
import PoToI18nextJsonConversionModule from './poToI18nextJsonConversionModule';

suite('PoToI18nextJsonConversionModule Tests', () => {
  test('doExecute should convert PO to JSON and write to file', async () => {
    const module = new PoToI18nextJsonConversionModule();
    const workspaceFolders = workspace.workspaceFolders![0];
    const inputPath = Uri.file(
      workspaceFolders.uri.fsPath + '/locales/nl/common.po'
    );
    const outputPath = Uri.file(
      workspaceFolders.uri.fsPath + '/locales/nl/common.json'
    );
    const locale = 'en-US';

    let initialOutputFileContent = await FileReader.readFileAsync(
      outputPath.fsPath
    );

    let poContent = `
msgid ""
msgstr ""
"Project-Id-Version: gettext-converter\n"
"MIME-Version: 1.0\n"
"Content-Type: text/plain; charset=utf-8\n"
"Content-Transfer-Encoding: 8bit\n"
"Plural-Forms: nplurals=2; plural=(n != 1)\n"
"POT-Creation-Date: 2024-06-07T12:34:16.846Z\n"
"PO-Revision-Date: 2024-06-07T12:34:16.846Z\n"
"Language: en-US\n"

msgid "key"
msgstr "${Date.now().toString()}"`;

    let context = {
      inputPath,
      outputPath,
      poContent,
      locale,
    };

    await module.executeAsync(context);

    let outputFileContent = await FileReader.readFileAsync(outputPath.fsPath);

    assert.notEqual(outputFileContent, initialOutputFileContent);
  });

  test('doExecute should not write to file if poContent is null', async () => {
    const workspaceFolders = workspace.workspaceFolders![0];
    const inputPath = Uri.file(
      workspaceFolders.uri.fsPath + '/locales/nl/common.po'
    );
    const outputPath = Uri.file(
      workspaceFolders.uri.fsPath + '/locales/nl/common.json'
    );
    const locale = 'en-US';

    const module = new PoToI18nextJsonConversionModule();
    const context = {
      inputPath,
      outputPath,
      poContent: null,
      locale,
    };

    await module.executeAsync(context);

    assert.rejects(FileReader.readFileAsync(outputPath.fsPath));
  });
});
