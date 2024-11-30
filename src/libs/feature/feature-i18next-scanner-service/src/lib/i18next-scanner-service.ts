import * as path from 'path';
import * as vfs from 'vinyl-fs';
import sort from 'gulp-sort';
import I18nextScanner from 'i18next-scanner';
import { Uri } from 'vscode';

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
import { getWorkspaceRoot } from '@i18n-weave/util/util-file-path-utilities';
import { LogLevel, Logger } from '@i18n-weave/util/util-logger';

import { I18nextScannerOptions } from './i18nextScannerOptions';

export class I18nextScannerService {
  private static instance: I18nextScannerService;
  private readonly logger: Logger;

  private constructor() {
    this.logger = Logger.getInstance();
  }

  public static getInstance(): I18nextScannerService {
    if (!I18nextScannerService.instance) {
      I18nextScannerService.instance = new I18nextScannerService();
    }
    return I18nextScannerService.instance;
  }

  public scanFile(fileUri: Uri, onScanCodeComplete?: () => any): void {
    const statusBarManager = StatusBarManager.getInstance();
    statusBarManager.updateState(
      StatusBarState.Running,
      `Scanning specific code file for translation keys... (${fileUri.fsPath})`
    );
    this.logger.log(
      LogLevel.INFO,
      `Scanning specific code file for translation keys... (${fileUri.fsPath})`,
      'I18nextScannerService'
    );

    const options = this.getI18nextScannerOptions(false);
    const absolutePathToProjectRoot = this.getProjectRootPath();
    this.executeScanner(options, absolutePathToProjectRoot, [
      fileUri.fsPath,
    ]).then(() => {
      this.onScanCodeComplete(statusBarManager);

      if (onScanCodeComplete) {
        onScanCodeComplete();
      }
    });
  }

  @TraceMethod
  public scanCode(onScanCodeComplete?: () => any): void {
    const statusBarManager = StatusBarManager.getInstance();
    statusBarManager.updateState(
      StatusBarState.Running,
      'Scanning code for translation keys...'
    );
    this.logger.log(
      LogLevel.INFO,
      'Scanning code for translation keys...',
      'I18nextScannerService'
    );

    const options = this.getI18nextScannerOptions(true);
    const absolutePathToProjectRoot = this.getProjectRootPath();
    const scanSources = this.getScanSources();

    this.executeScanner(options, absolutePathToProjectRoot, scanSources).then(
      () => {
        this.onScanCodeComplete(statusBarManager);

        if (onScanCodeComplete) {
          onScanCodeComplete();
        }
      }
    );
  }

  private getI18nextScannerOptions(
    removeUnusedKeys: boolean
  ): I18nextScannerOptions {
    const configManager = ConfigurationStoreManager.getInstance();
    const i18nNextScannerModuleConfiguration =
      configManager.getConfig<I18nextScannerModuleConfiguration>(
        'i18nextScannerModule'
      );
    const generalConfig =
      configManager.getConfig<GeneralConfiguration>('general');
    const absolutePathToProjectRoot = this.getProjectRootPath();

    return {
      compatibilityJSON: 'v3',
      debug: false,
      removeUnusedKeys: removeUnusedKeys,
      sort: true,
      func: {
        list: i18nNextScannerModuleConfiguration.translationFunctionNames,
        extensions: i18nNextScannerModuleConfiguration.fileExtensions.map(
          ext => `.${ext}`
        ),
      },
      lngs: i18nNextScannerModuleConfiguration.languages,
      ns: i18nNextScannerModuleConfiguration.namespaces,
      defaultLng: i18nNextScannerModuleConfiguration.defaultLanguage,
      defaultNs: i18nNextScannerModuleConfiguration.defaultNamespace,
      defaultValue: '',
      resource: {
        loadPath: `${absolutePathToProjectRoot}${i18nNextScannerModuleConfiguration.translationFilesLocation}/{{lng}}/{{ns}}.json`,
        savePath: `${absolutePathToProjectRoot}${i18nNextScannerModuleConfiguration.translationFilesLocation}/{{lng}}/{{ns}}.json`,
        jsonIndent: generalConfig.format.numberOfSpacesForIndentation,
        lineEnding: 'CRLF',
      },
      nsSeparator: i18nNextScannerModuleConfiguration.nsSeparator,
      keySeparator: i18nNextScannerModuleConfiguration.keySeparator,
      pluralSeparator: i18nNextScannerModuleConfiguration.pluralSeparator,
      contextSeparator: i18nNextScannerModuleConfiguration.contextSeparator,
      contextDefaultValues: [],
      interpolation: { prefix: '{{', suffix: '}}' },
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
        acorn: { ecmaVersion: 2020, sourceType: 'module' },
      },
    };
  }

  private getProjectRootPath(): string {
    const configManager = ConfigurationStoreManager.getInstance();
    const generalConfig =
      configManager.getConfig<GeneralConfiguration>('general');
    const workspaceRoot = getWorkspaceRoot();

    if (!workspaceRoot) {
      this.logger.log(
        LogLevel.ERROR,
        'No project root found',
        'I18nextScannerService'
      );
      this.logger.show();
      throw new Error('No project root found');
    }

    return path.join(
      workspaceRoot.fsPath,
      generalConfig.relativePathToProjectRoot
    );
  }

  private getScanSources(): string[] {
    const configManager = ConfigurationStoreManager.getInstance();
    const i18nNextScannerModuleConfiguration =
      configManager.getConfig<I18nextScannerModuleConfiguration>(
        'i18nextScannerModule'
      );
    const fileExtensions = i18nNextScannerModuleConfiguration.fileExtensions;
    const extensionPattern =
      fileExtensions.length > 1
        ? `{${fileExtensions.join(',')}}`
        : fileExtensions[0];

    return [
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
  }

  private async executeScanner(
    options: I18nextScannerOptions,
    workspaceRoot: string,
    scanSources: string[]
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        vfs
          .src(scanSources, { cwd: workspaceRoot })
          .pipe(sort())
          .pipe(I18nextScanner(options))
          .pipe(vfs.dest('./'))
          .on('end', resolve)
          .on('error', (error: any) => {
            this.logger.log(
              LogLevel.ERROR,
              `Error executing scanner: ${error}`,
              'I18nextScannerService'
            );
            reject(new Error(`Error executing scanner: ${error}`));
          });
      } catch (error) {
        this.logger.log(
          LogLevel.ERROR,
          `Error executing scanner: ${error}`,
          'I18nextScannerService'
        );
        reject(new Error(`Error executing scanner: ${error}`));
      }
    });
  }

  private onScanCodeComplete(statusBarManager: StatusBarManager) {
    this.logger.log(
      LogLevel.INFO,
      'Done scanning code for translation keys...',
      'I18nextScannerService'
    );
    statusBarManager.setIdle();
  }
}
