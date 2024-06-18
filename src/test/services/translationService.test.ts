import * as assert from 'assert';
import fs, { Dirent } from 'fs';
import sinon from 'sinon';

import DeeplService from '../../services/deeplService';
import TranslationService from '../../services/translationService';

suite('TranslationService', () => {
  let translationService: TranslationService;
  let fsReadFileSyncStub: sinon.SinonStub;
  let fsWriteFileSyncStub: sinon.SinonStub;
  let getOtherTranslationFilesPathsStub: sinon.SinonStub;
  let fetchTranslationStub: sinon.SinonStub;

  setup(() => {
    translationService = TranslationService.getInstance();
    fsReadFileSyncStub = sinon.stub(fs, 'readFileSync');
    fsWriteFileSyncStub = sinon.stub(fs, 'writeFileSync');
    getOtherTranslationFilesPathsStub = sinon.stub(
      translationService,
      'getOtherTranslationFilesPaths'
    );
    fetchTranslationStub = sinon.stub(
      DeeplService.getInstance(),
      'fetchTranslation'
    );
  });

  teardown(() => {
    sinon.restore();
  });

  suite('getInstance', () => {
    test('should return the singleton instance', () => {
      const instance1 = TranslationService.getInstance();
      const instance2 = TranslationService.getInstance();
      assert.strictEqual(instance1, instance2);
    });
  });

  suite('getOtherTranslationFilesPaths', () => {
    test('should return an array of file paths for other translation files', () => {
      const fileLocation = '/path/to/file.json';
      const parentDirectory = '/path/to';
      const fileName = 'file.json';
      const filePath1 = '/path/to/translation1.json';
      const filePath2 = '/path/to/translation2.json';
      const filePath3 = '/path/to/translation3.json';

      sinon
        .stub(fs, 'readdirSync')
        .returns(fs.readdirSync('.', { withFileTypes: true }));
      sinon
        .stub(fs, 'statSync')
        .returns({ isDirectory: () => true } as fs.Stats);
      sinon
        .stub(fs, 'readdirSync')
        .withArgs(parentDirectory)
        .returns([fileName as unknown as Dirent]);
      sinon
        .stub(fs, 'readdirSync')
        .withArgs(parentDirectory + '/' + fileName)
        .returns([fileName as unknown as Dirent]);

      const result =
        translationService.getOtherTranslationFilesPaths(fileLocation);

      assert.deepStrictEqual(result, [filePath1, filePath2, filePath3]);
    });
  });

  suite('translateOtherI18nFiles', () => {
    test('should translate missing keys in other i18n files', async () => {
      const fileLocation = '/path/to/file.json';
      const changedFileContent = '{"key1": "value1", "key2": "value2"}';
      const filePath1 = '/path/to/translation1.json';
      const filePath2 = '/path/to/translation2.json';
      const filePath3 = '/path/to/translation3.json';
      const existingTranslations1 = { key1: '', key3: '' };
      const existingTranslations2 = { key2: '', key4: '' };
      const existingTranslations3 = { key3: '', key5: '' };
      const translatedValue1 = 'translatedValue1';
      const translatedValue2 = 'translatedValue2';
      const translatedValue3 = 'translatedValue3';

      fsReadFileSyncStub
        .withArgs(fileLocation, 'utf-8')
        .returns(changedFileContent);
      fsReadFileSyncStub
        .withArgs(filePath1, 'utf-8')
        .returns(JSON.stringify(existingTranslations1));
      fsReadFileSyncStub
        .withArgs(filePath2, 'utf-8')
        .returns(JSON.stringify(existingTranslations2));
      fsReadFileSyncStub
        .withArgs(filePath3, 'utf-8')
        .returns(JSON.stringify(existingTranslations3));

      getOtherTranslationFilesPathsStub
        .withArgs(fileLocation)
        .returns([filePath1, filePath2, filePath3]);

      fetchTranslationStub
        .withArgs('value1', 'locale1')
        .resolves(translatedValue1);
      fetchTranslationStub
        .withArgs('value2', 'locale2')
        .resolves(translatedValue2);
      fetchTranslationStub
        .withArgs('value2', 'locale3')
        .resolves(translatedValue3);

      await translationService.translateOtherI18nFiles(
        fileLocation,
        changedFileContent
      );

      sinon.assert.calledWith(
        fsWriteFileSyncStub,
        filePath1,
        JSON.stringify(
          {
            key1: translatedValue1,
            key3: '',
          },
          null,
          2
        )
      );
      sinon.assert.calledWith(
        fsWriteFileSyncStub,
        filePath2,
        JSON.stringify(
          {
            key2: translatedValue2,
            key4: '',
          },
          null,
          2
        )
      );
      sinon.assert.calledWith(
        fsWriteFileSyncStub,
        filePath3,
        JSON.stringify(
          {
            key3: '',
            key5: translatedValue3,
          },
          null,
          2
        )
      );
    });
  });
});
