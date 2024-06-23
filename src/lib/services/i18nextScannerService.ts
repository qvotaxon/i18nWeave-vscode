import * as Sentry from '@sentry/node';
import sort from 'gulp-sort';
import I18nextScanner from 'i18next-scanner';
import vfs from 'vinyl-fs';

import I18nextScannerModuleConfiguration from '../entities/configuration/modules/i18nextScanner/i18nextScannerModuleConfiguration';
import ConfigurationStoreManager from '../stores/configuration/configurationStoreManager';
import { I18nextScannerOptions } from '../types/i18nextScannerOptions';
import { getSingleWorkSpaceRoot } from '../utilities/filePathUtilities';

/**
 * Service for scanning code using i18next-scanner.
 */
export default class I18nextScannerService {
  private static instance: I18nextScannerService;

  private constructor() {}

  /**
   * Get the singleton instance of I18nextScannerService.
   * @returns The singleton instance.
   */
  public static getInstance(): I18nextScannerService {
    if (!I18nextScannerService.instance) {
      I18nextScannerService.instance = new I18nextScannerService();
    }
    return I18nextScannerService.instance;
  }

  /**
   * Scan code for translation keys in the code file for which the path is provided.
   * @returns A promise resolving to the scan results.
   */
  public scanCode(): void {
    Sentry.startSpan(
      {
        op: 'typeScript.scanCodeFori18next',
        name: 'TypeScript i18next Scanner Module',
      },
      () => {
        const configurationManager = ConfigurationStoreManager.getInstance();
        const i18nextScannerModuleConfig =
          configurationManager.getConfig<I18nextScannerModuleConfiguration>(
            'i18nextScannerModule'
          );

        const workspaceRoot = getSingleWorkSpaceRoot();

        const options: I18nextScannerOptions = {
          compatibilityJSON: 'v3',
          debug: false,
          removeUnusedKeys: true,
          sort: true,
          func: {
            list: i18nextScannerModuleConfig.translationFunctionNames,
            extensions: i18nextScannerModuleConfig.fileExtensions,
          },
          lngs: i18nextScannerModuleConfig.languages,
          ns: i18nextScannerModuleConfig.namespaces,
          defaultLng: i18nextScannerModuleConfig.defaultLanguage,
          defaultNs: i18nextScannerModuleConfig.defaultNamespace,
          defaultValue: '',
          resource: {
            loadPath: `${workspaceRoot}/${i18nextScannerModuleConfig.translationFilesLocation}/{{lng}}/{{ns}}.json`,
            savePath: `${workspaceRoot}/${i18nextScannerModuleConfig.translationFilesLocation}/{{lng}}/{{ns}}.json`,
            jsonIndent: 4,
            lineEnding: 'CRLF',
          },
          nsSeparator: ':',
          keySeparator: '.',
          pluralSeparator: '_',
          contextSeparator: ':',
          contextDefaultValues: [],
          interpolation: {
            prefix: '{{',
            suffix: '}}',
          },
          metadata: {},
          allowDynamicKeys: true,
          trans: {
            component: i18nextScannerModuleConfig.translationComponentName,
            i18nKey:
              i18nextScannerModuleConfig.translationComponentTranslationKey,
            defaultsKey: 'defaults',
            extensions: i18nextScannerModuleConfig.fileExtensions,
            fallbackKey: false,

            // https://react.i18next.com/latest/trans-component#usage-with-simple-html-elements-like-less-than-br-greater-than-and-others-v10.4.0
            supportBasicHtmlNodes: true, // Enables keeping the name of simple nodes (e.g. <br/>) in translations instead of indexed keys.
            keepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'], // Which nodes are allowed to be kept in translations during defaultValue generation of <Trans>.

            // https://github.com/acornjs/acorn/tree/master/acorn#interface
            acorn: {
              ecmaVersion: 2020,
              sourceType: 'module', // defaults to 'module'
            },
          },
        };

        this.executeScanner(
          options,
          workspaceRoot,
          i18nextScannerModuleConfig.codeFileLocations
        );
      }
    );
  }

  private executeScanner = (
    options: I18nextScannerOptions,
    workspaceRoot: string,
    codeFileLocations: string[]
  ) => {
    const scanSources = codeFileLocations.map(
      location => `${location}/**/*.{ts,tsx}`
    );
    scanSources.push(
      ...codeFileLocations.map(location => `!${location}/**/*.spec.{ts,tsx}`)
    );
    scanSources.push('!node_modules/**');

    try {
      vfs
        .src(scanSources, { cwd: workspaceRoot })
        .pipe(sort())
        .pipe(I18nextScanner(options))
        .pipe(vfs.dest('./'));
    } catch (error) {
      console.error(error);
    }
  };
}
