import assert from 'assert';
import sinon from 'sinon';
import { Location, Position, TextDocument, Uri } from 'vscode';

import { FileLocationStore } from '@i18n-weave/store/store-file-location-store';

import { ConfigurationStoreManager } from '@i18n-weave/util/util-configuration';

import { I18nextDefinitionProvider } from './i18next-definition-provider';

suite('I18nextDefinitionProvider', () => {
  let definitionProvider: I18nextDefinitionProvider;
  let documentStub: sinon.SinonStubbedInstance<TextDocument>;
  let positionStub: sinon.SinonStubbedInstance<Position>;
  let fileLocationStoreStub: sinon.SinonStubbedInstance<FileLocationStore>;
  let configurationStoreManagerStub: sinon.SinonStubbedInstance<ConfigurationStoreManager>;

  setup(() => {
    definitionProvider = I18nextDefinitionProvider.getInstance();
    documentStub = {
      uri: Uri.file('/path/to/file'),
      fileName: '/path/to/file',
      isUntitled: false,
      languageId: 'plaintext',
      version: 1,
      isDirty: false,
      isClosed: false,
      save: sinon.stub().resolves(true),
      lineCount: 1,
      lineAt: sinon.stub(),
      offsetAt: sinon.stub(),
      positionAt: sinon.stub(),
      getText: sinon.stub(),
      getWordRangeAtPosition: sinon.stub(),
      validateRange: sinon.stub(),
      validatePosition: sinon.stub(),
    } as unknown as sinon.SinonStubbedInstance<TextDocument>;
    positionStub = sinon.createStubInstance(Position);
    fileLocationStoreStub = sinon.createStubInstance(FileLocationStore);
    configurationStoreManagerStub = sinon.createStubInstance(
      ConfigurationStoreManager
    );

    sinon.stub(FileLocationStore, 'getInstance').returns(fileLocationStoreStub);
    sinon
      .stub(ConfigurationStoreManager, 'getInstance')
      .returns(configurationStoreManagerStub);
  });

  teardown(() => {
    sinon.restore();
  });

  test('should return null if no full key is found at the position', async () => {
    // @ts-ignore - stubbing private method
    sinon.stub(definitionProvider, 'getFullKeyAtPosition').returns(null);

    const result = await definitionProvider.provideDefinition(
      documentStub,
      positionStub
    );

    assert.equal(result, null);
  });

  test('should return null if the key is not found in the translation store', async () => {
    sinon
      // @ts-ignore - stubbing private method
      .stub(definitionProvider, 'getFullKeyAtPosition')
      // @ts-ignore - stubbing private method
      .returns('namespace:key');
    configurationStoreManagerStub.getConfig.returns({
      nsSeparator: ':',
      defaultNamespace: 'default',
      defaultLanguage: 'en',
    });
    fileLocationStoreStub.getTranslationFiles.returns([]);

    const result = await definitionProvider.provideDefinition(
      documentStub,
      positionStub
    );

    assert.equal(result, null);
  });

  test('should return the location of the key if found in the translation store', async () => {
    const mockLocation = new Location(
      Uri.file('/path/to/file'),
      new Position(0, 0)
    );
    sinon
      // @ts-ignore - stubbing private method
      .stub(definitionProvider, 'getFullKeyAtPosition')
      // @ts-ignore - stubbing private method
      .returns('namespace:key');
    configurationStoreManagerStub.getConfig.returns({
      nsSeparator: ':',
      defaultNamespace: 'default',
      defaultLanguage: 'en',
    });
    fileLocationStoreStub.getTranslationFiles.returns([
      {
        language: 'en',
        namespace: 'namespace',
        keys: {
          // @ts-ignore - ignoring missing properties
          key: { location: mockLocation },
        },
      },
    ]);

    const result = await definitionProvider.provideDefinition(
      documentStub,
      positionStub
    );

    assert.equal(result, mockLocation);
  });
});

