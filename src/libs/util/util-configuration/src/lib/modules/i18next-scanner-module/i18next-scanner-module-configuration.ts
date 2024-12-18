/**
 * Configuration for the I18nextJsonToPoConversionModule.
 */
export class I18nextScannerModuleConfiguration {
  enabled: boolean = true;
  translationFilesLocation: string = 'src/i18n';
  codeFileLocations = ['src'];
  defaultNamespace = 'common';
  namespaces = ['common'];
  languages: string[] = ['en'];
  defaultLanguage: string = 'en';
  nsSeparator: string = ':';
  keySeparator: string = '.';
  pluralSeparator: string = '_';
  contextSeparator: string = '_';
  translationFunctionNames: string[] = ['t', 'i18next.t'];
  translationComponentTranslationKey: string = 'i18nKey';
  translationComponentName: string = 'Trans';
  fileExtensions: string[] = ['ts', 'tsx', 'js', 'jsx'];
}
