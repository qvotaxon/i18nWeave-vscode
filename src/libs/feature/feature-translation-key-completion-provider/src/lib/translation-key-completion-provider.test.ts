import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';

import { FileStore } from '@i18n-weave/store/store-file-store';

import { ConfigurationStoreManager } from '@i18n-weave/util/util-configuration';

import { TranslationKeyCompletionProvider } from './translation-key-completion-provider';

/* eslint-disable no-restricted-imports */
// Tests for TranslationKeyCompletionProvider
suite('TranslationKeyCompletionProvider Tests', () => {
  let provider: TranslationKeyCompletionProvider;
  let fileLocationStoreStub: sinon.SinonStubbedInstance<FileStore>;
  let configurationStoreManagerStub: sinon.SinonStubbedInstance<ConfigurationStoreManager>;

  setup(() => {
    provider = TranslationKeyCompletionProvider.getInstance();
    fileLocationStoreStub = sinon.createStubInstance(FileStore);
    configurationStoreManagerStub = sinon.createStubInstance(
      ConfigurationStoreManager
    );

    sinon.stub(FileStore, 'getInstance').returns(fileLocationStoreStub);
    sinon
      .stub(ConfigurationStoreManager, 'getInstance')
      .returns(configurationStoreManagerStub);
  });

  teardown(() => {
    sinon.restore();
  });

  test('provideCompletionItems should return completion items', async () => {
    const document = {
      lineAt: sinon.stub().returns({ text: 't("namespace:key")' }),
      getWordRangeAtPosition: sinon
        .stub()
        .returns(new vscode.Range(0, 15, 0, 15)),
    } as unknown as vscode.TextDocument;
    const position = new vscode.Position(0, 15);

    configurationStoreManagerStub.getConfig.returns({
      translationFunctionNames: ['t'],
      nsSeparator: ':',
      defaultNamespace: 'default',
      defaultLanguage: 'en',
      contextSeparator: '_',
      pluralSeparator: '_plural',
    });

    fileLocationStoreStub.getTranslationKeys.returns(['key1', 'key2']);

    const items = await provider.provideCompletionItems(document, position);

    assert.strictEqual(items!.length, 2);
    assert.strictEqual(items![0].label, 'namespace:key1');
    assert.strictEqual(items![1].label, 'namespace:key2');
  });

  test('resolveCompletionItem should set documentation', async () => {
    const item = new vscode.CompletionItem('namespace:key');
    item.detail = JSON.stringify({
      namespace: 'namespace',
      translationKey: 'key',
    });

    configurationStoreManagerStub.getConfig.returns({
      defaultLanguage: 'en',
    });

    fileLocationStoreStub.getTranslationValue.returns('Translation Value');

    const resolvedItem = await provider.resolveCompletionItem(
      item,
      {} as vscode.CancellationToken
    );

    assert.strictEqual(
      (resolvedItem!.documentation as vscode.MarkdownString).value,
      '##### Default translation (en):\n ##### "Translation Value"\n###### Namespace: **namespace**'
    );
  });

  test('resolveCompletionItem should handle missing translation value', async () => {
    const item = new vscode.CompletionItem('namespace:key');
    item.detail = JSON.stringify({
      namespace: 'namespace',
      translationKey: 'key',
    });

    configurationStoreManagerStub.getConfig.returns({
      defaultLanguage: 'en',
    });

    fileLocationStoreStub.getTranslationValue.returns(undefined);

    const resolvedItem = await provider.resolveCompletionItem(
      item,
      {} as vscode.CancellationToken
    );

    assert.strictEqual(
      (resolvedItem!.documentation as vscode.MarkdownString).value,
      '##### **⚠ Default translation (en) missing!**\n###### Namespace: **namespace**'
    );
  });
});
