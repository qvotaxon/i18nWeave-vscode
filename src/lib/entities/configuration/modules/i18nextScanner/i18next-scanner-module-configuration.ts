/**
 * Configuration for the I18nextJsonToPoConversionModule.
 */
export default class I18nextScannerModuleConfiguration {
  enabled: boolean = true;
  translationFilesLocation: string = 'src/i18n';
  codeFileLocations = ['src'];
  defaultNamespace = 'common';
  namespaces = ['common'];
  languages: string[] = ['en'];
  defaultLanguage: string = 'en';
  translationFunctionNames: string[] = ['t', 'i18next.t'];
  translationComponentTranslationKey: string = 'i18nKey';
  translationComponentName: string = 'Trans';
  fileExtensions: string[] = ['ts', 'tsx', 'js', 'jsx'];
}
