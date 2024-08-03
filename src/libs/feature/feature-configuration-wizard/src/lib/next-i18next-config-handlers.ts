import { I18nextScannerModuleConfiguration } from '@i18n-weave/util/util-configuration';

export async function scanNextI18nextConfigFileAsync(): Promise<
  string | undefined
> {
  // Replace with actual implementation
  return '/path/to/next-i18next.config.js';
}

export async function readNextI18nextConfigFileAsync(
  configFilePath: string
): Promise<Partial<I18nextScannerModuleConfiguration> | undefined> {
  // Replace with actual implementation
  return {
    defaultLanguage: 'en',
    languages: ['en', 'fr'],
    namespaces: ['common'],
    fileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    translationFunctionNames: ['t', 'i18next.t'],
  };
}
