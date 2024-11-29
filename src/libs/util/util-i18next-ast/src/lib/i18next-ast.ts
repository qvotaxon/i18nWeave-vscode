import * as parser from '@babel/parser';
import * as t from '@babel/types';
import traverse, { NodePath } from '@babel/traverse';

import { I18nextScannerModuleConfiguration } from '@i18n-weave/util/util-configuration';
import { LogLevel, Logger } from '@i18n-weave/util/util-logger';

const logScope = 'AST Parser';

/**
 * Parses code and returns an array of translation keys based on the user configuration.
 *
 * @param code - The code content as a string.
 * @param config - User-defined configuration for translation functions and components.
 * @returns An array of detected translation keys.
 */
export function extractTranslationKeys(
  code: string,
  config: I18nextScannerModuleConfiguration
): string[] | null {
  const keys: string[] = [];
  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
  } catch (error) {
    Logger.getInstance().log(
      LogLevel.VERBOSE,
      `Error parsing code: ${(error as Error).message}. There is probably a syntax error in the code.`,
      logScope
    );

    return null;
  }

  traverse(ast, {
    // Find translation functions like `t('key')` based on config.functionNames
    CallExpression(path: NodePath<t.CallExpression>) {
      const callee = path.node.callee;

      // Check if the function name is in user-defined list of translation functions
      if (
        t.isIdentifier(callee) &&
        config.translationFunctionNames.includes(callee.name)
      ) {
        const arg = path.node.arguments[0];
        if (t.isStringLiteral(arg)) {
          keys.push(arg.value);
        }
      } else if (
        t.isMemberExpression(callee) &&
        t.isIdentifier(callee.property)
      ) {
        // Check if `object.property` form matches user-defined list
        if (config.translationFunctionNames.includes(callee.property.name)) {
          const arg = path.node.arguments[0];
          if (t.isStringLiteral(arg)) {
            keys.push(arg.value);
          }
        }
      }
    },

    // Detect translation components like `<Trans i18nKey="key" />` based on config.componentNames
    JSXOpeningElement(path: NodePath<t.JSXOpeningElement>) {
      if (
        t.isJSXIdentifier(path.node.name) &&
        config.translationComponentName === path.node.name.name
      ) {
        path.node.attributes.forEach(attr => {
          if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
            // Check if attribute matches user-defined key attributes (e.g., `i18nKey`)
            if (
              config.translationComponentTranslationKey === attr.name.name &&
              t.isStringLiteral(attr.value)
            ) {
              keys.push(attr.value.value);
            }
          }
        });
      }
    },
  });

  return keys;
}
