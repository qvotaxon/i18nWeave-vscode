import sort from 'gulp-sort';
import I18nextScanner from 'i18next-scanner';
import vfs from 'vinyl-fs';

import {
  StatusBarManager,
  StatusBarState,
} from '@i18n-weave/feature/feature-status-bar-manager';

import {
  ConfigurationStoreManager,
  GeneralConfiguration,
  I18nextScannerModuleConfiguration,
} from '@i18n-weave/util/util-configuration';
import { TraceMethod } from '@i18n-weave/util/util-decorators';
import { getProjectRootFolder } from '@i18n-weave/util/util-file-path-utilities';

import { I18nextScannerOptions } from './i18nextScannerOptions';

/**
 * Service for scanning code using i18next-scanner.
 */
export class I18nextScannerService {
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
   */
  @TraceMethod
  public scanCode(): void {
    const statusBarManager = StatusBarManager.getInstance();
    statusBarManager.updateState(
      StatusBarState.Running,
      'Scanning code for translation keys...'
    );

    const configManager = ConfigurationStoreManager.getInstance();
    const i18nNextScannerModuleConfiguration =
      configManager.getConfig<I18nextScannerModuleConfiguration>(
        'i18nextScannerModule'
      );
    const generalConfig =
      configManager.getConfig<GeneralConfiguration>('general');
    let projectRoot = getProjectRootFolder();

    if (!projectRoot) {
      throw new Error('No project root found');
    }

    const options: I18nextScannerOptions = {
      compatibilityJSON: 'v3',
      debug: false,
      removeUnusedKeys: true,
      sort: true,
      func: {
        list: i18nNextScannerModuleConfiguration.translationFunctionNames,
        extensions: i18nNextScannerModuleConfiguration.fileExtensions.map(
          fileExtension => `.${fileExtension}`
        ),
      },
      lngs: i18nNextScannerModuleConfiguration.languages,
      ns: i18nNextScannerModuleConfiguration.namespaces,
      defaultLng: i18nNextScannerModuleConfiguration.defaultLanguage,
      defaultNs: i18nNextScannerModuleConfiguration.defaultNamespace,
      defaultValue: '',
      resource: {
        loadPath: `${projectRoot}/${i18nNextScannerModuleConfiguration.translationFilesLocation}/{{lng}}/{{ns}}.json`,
        savePath: `${projectRoot}/${i18nNextScannerModuleConfiguration.translationFilesLocation}/{{lng}}/{{ns}}.json`,
        jsonIndent: generalConfig.format.numberOfSpacesForIndentation,
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
        component: i18nNextScannerModuleConfiguration.translationComponentName,
        i18nKey:
          i18nNextScannerModuleConfiguration.translationComponentTranslationKey,
        defaultsKey: 'defaults',
        extensions: i18nNextScannerModuleConfiguration.fileExtensions,
        fallbackKey: false,
        supportBasicHtmlNodes: true,
        keepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
        acorn: {
          ecmaVersion: 2020,
          sourceType: 'module',
        },
      },
    };

    const fileExtensions = i18nNextScannerModuleConfiguration.fileExtensions;
    const hasMultipleExtensions = fileExtensions.length > 1;

    const extensionPattern = hasMultipleExtensions
      ? `{${fileExtensions.join(',')}}`
      : fileExtensions[0];

    const scanSources = [
      ...i18nNextScannerModuleConfiguration.codeFileLocations.map(location => {
        const normalizedLocation = location.replace(/^\//, '');
        return `${normalizedLocation}/**/*.${extensionPattern}`;
      }),
      ...i18nNextScannerModuleConfiguration.codeFileLocations.map(location => {
        const normalizedLocation = location.replace(/^\//, '');
        return `!${normalizedLocation}/**/*.spec.${extensionPattern}`;
      }),
      '!node_modules/**',
    ];

    this.executeScanner(options, projectRoot, scanSources);

    statusBarManager.setIdle();
  }

  private executeScanner(
    options: I18nextScannerOptions,
    workspaceRoot: string,
    scanSources: string[]
  ): void {
    try {
      vfs
        .src(scanSources, { cwd: workspaceRoot })
        .pipe(sort())
        .pipe(I18nextScanner(options))
        .pipe(vfs.dest('./'));
    } catch (error) {
      console.error(error);
    }
  }
}
