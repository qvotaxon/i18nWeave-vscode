import * as sinon from 'sinon';
import assert from 'assert';
import { Location, Range, Uri, workspace } from 'vscode';

import { extractTranslationKeys } from './i18next-file-utils';

/* eslint-disable no-restricted-imports */
// Tests for I18nextFileUtils
suite('extractTranslationKeys', () => {
  let openTextDocumentStub: sinon.SinonStub;

  setup(() => {
    openTextDocumentStub = sinon.stub(workspace, 'openTextDocument');
  });

  teardown(() => {
    sinon.restore();
  });

  test('should return an empty object if the JSON is invalid', async () => {
    openTextDocumentStub.resolves({
      getText: () => 'invalid json',
      uri: Uri.file('test.json'),
    });

    const result = await extractTranslationKeys(Uri.file('test.json'));
    assert.deepEqual(result, {});
  });

  test('should extract translation keys and their locations from a valid JSON file', async () => {
    const jsonContent = `
    {
      "key1": "value1",
      "nested": {
        "key2": "value2"
      }
    }`;

    openTextDocumentStub.resolves({
      getText: () => jsonContent,
      uri: Uri.file('test.json'),
      positionAt: (offset: number) => {
        const lines = jsonContent.slice(0, offset).split('\n');
        return {
          line: lines.length - 1,
          character: lines[lines.length - 1].length,
        };
      },
    });

    const result = await extractTranslationKeys(Uri.file('test.json'));

    assert.deepEqual(result, {
      key1: {
        value: 'value1',
        location: new Location(
          Uri.file('test.json'),
          // @ts-ignore - ignoring missing properties
          new Range({ line: 2, character: 14 }, { line: 2, character: 22 })
        ),
      },
      'nested.key2': {
        value: 'value2',
        location: new Location(
          Uri.file('test.json'),
          // @ts-ignore - ignoring missing properties
          new Range({ line: 4, character: 16 }, { line: 4, character: 24 })
        ),
      },
    });
  });

  test('should handle empty objects gracefully', async () => {
    const jsonContent = `{}`;

    openTextDocumentStub.resolves({
      getText: () => jsonContent,
      uri: Uri.file('test.json'),
    });

    const result = await extractTranslationKeys(Uri.file('test.json'));
    assert.deepEqual(result, {});
  });
});

