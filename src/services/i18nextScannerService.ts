import sort from 'gulp-sort';
import I18nextScanner from 'i18next-scanner';
import path from 'path';
import vfs from 'vinyl-fs';

import GeneralConfiguration from '../entities/configuration/general/generalConfiguration';
import ConfigurationStoreManager from './configurationStoreManager';

type I18nextScannerOptions = {
  compatibilityJSON: string;
  debug: boolean;
  removeUnusedKeys: boolean;
  sort: boolean;
  func: {
    list: string[];
    extensions: string[];
  };
  lngs: string[];
  ns: string[];
  defaultLng: string;
  defaultNs: string;
  defaultValue: string;
  resource: {
    loadPath: string;
    savePath: string;
    jsonIndent: number;
    lineEnding: string;
  };
  nsSeparator: string;
  keySeparator: string;
  pluralSeparator: string;
  contextSeparator: string;
  contextDefaultValues: any[];
  interpolation: {
    prefix: string;
    suffix: string;
  };
  metadata: any;
  allowDynamicKeys: boolean;
};

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
    const packageJsonAbsoluteFolderPath =
      ConfigurationStoreManager.getInstance().getConfig<GeneralConfiguration>(
        'general'
      ).pathsConfiguration.packageJsonAbsoluteFolderPath;

    const fixedPackageJsonAbsoluteFolderPath = path.normalize(
      packageJsonAbsoluteFolderPath
    );

    const options: I18nextScannerOptions = {
      compatibilityJSON: 'v3',
      debug: true,
      removeUnusedKeys: true,
      sort: true,
      func: {
        list: ['I18nKey', 't'],
        extensions: ['.ts', '.tsx'],
      },
      lngs: ['nl', 'en', 'de', 'pl'],
      ns: ['common', 'onboarding', 'validation'],
      defaultLng: 'nl',
      defaultNs: 'common',
      defaultValue: '',
      resource: {
        loadPath: `${fixedPackageJsonAbsoluteFolderPath}/public/locales/{{lng}}/{{ns}}.json`,
        savePath: `${fixedPackageJsonAbsoluteFolderPath}/public/locales/{{lng}}/{{ns}}.json`,
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
      allowDynamicKeys: false,
    };

    this.executeScanner(options, fixedPackageJsonAbsoluteFolderPath);
  }

  private executeScanner = (
    options: I18nextScannerOptions,
    fixedPackageJsonAbsoluteFolderPath: string
  ) => {
    vfs
      .src(
        [
          `apps/**/*.{ts,tsx}`,
          `libs/**/*.{ts,tsx}`,
          `!apps/**/*.spec.{ts,tsx}`,
          `!libs/**/*.spec.{ts,tsx}`,
          `!node_modules/**`,
        ],
        { cwd: fixedPackageJsonAbsoluteFolderPath }
      )
      .pipe(sort())
      .pipe(I18nextScanner(options))
      .pipe(vfs.dest('./'));
  };
}
