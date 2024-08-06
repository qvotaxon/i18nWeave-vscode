import * as assert from 'assert';
import sinon from 'sinon';
import vscode from 'vscode';
import { Uri, workspace } from 'vscode';

import { FileReader } from '@i18n-weave/file-io/file-io-file-reader';

import { ConfigurationStoreManager } from '@i18n-weave/util/util-configuration';

import { PoToI18nextJsonConversionModule } from './po-to-i18nextjson-conversion-module';

suite('PoToI18nextJsonConversionModule Tests', () => {
  let extensionContext: vscode.ExtensionContext;

  setup(() => {
    const getConfigStub = sinon.stub(
      ConfigurationStoreManager.getInstance(),
      'getConfig'
    );
    getConfigStub
      .withArgs('i18nextJsonToPoConversionModule')
      .returns({ enabled: true });
    extensionContext = {} as vscode.ExtensionContext;
  });

  teardown(() => {
    sinon.restore();
  });

  test('doExecute should convert PO to JSON and write to file', async () => {
    const module = new PoToI18nextJsonConversionModule(extensionContext);
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

    // @ts-ignore - temporarilyDisabled is private
    module.temporarilyDisabled = false;

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

    const module = new PoToI18nextJsonConversionModule(extensionContext);
    const context = {
      inputPath,
      outputPath,
      poContent: null,
      locale,
    };

    // @ts-ignore - temporarilyDisabled is private
    module.temporarilyDisabled = false;

    await module.executeAsync(context);

    assert.rejects(FileReader.readFileAsync(outputPath.fsPath));
  });
});
