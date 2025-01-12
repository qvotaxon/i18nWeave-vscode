import { Node, parseTree } from 'jsonc-parser';
import { Location, Range, Uri, workspace } from 'vscode';

import { type TranslationKeyData } from '@i18n-weave/store/store-file-store';

/**
 * Extracts translation keys and their locations from an i18next JSON file.
 * @param fileUri The vscode.Uri pointing to the JSON file.
 * @returns A record of translation keys and their corresponding data.
 */
export async function extractTranslationKeys(
  fileUri: Uri
): Promise<Record<string, TranslationKeyData>> {
  const document = await workspace.openTextDocument(fileUri.fsPath);
  const text = document.getText();
  const rootNode = parseTree(text);

  if (!rootNode) {
    return {};
  }

  const keysData: Record<string, TranslationKeyData> = {};

  const processNode = (node: Node, path: string[] = []) => {
    if (node.type === 'object') {
      for (const property of node.children || []) {
        const keyNode = property.children?.[0];
        const valueNode = property.children?.[1];

        if (keyNode?.value) {
          const keyPath = [...path, keyNode.value];
          const fullKey = keyPath.join('.'); // Join path to form dot-separated key

          if (valueNode && valueNode.type !== 'object') {
            const location = new Location(
              document.uri,
              new Range(
                document.positionAt(valueNode.offset),
                document.positionAt(valueNode.offset + valueNode.length)
              )
            );

            keysData[fullKey] = {
              value: valueNode.value as string | null,
              location: location,
            };
          }

          // Recurse into nested objects
          if (valueNode?.type === 'object') {
            processNode(valueNode, keyPath);
          }
        }
      }
    }
  };

  processNode(rootNode);
  return keysData;
}
