import BaseConfiguration from './baseConfiguration';
import DebuggingConfiguration from './debugging/debuggingConfiguration';
import GeneralConfiguration from './general/generalConfiguration';
import I18nextJsonToPoConversionModuleConfiguration from './modules/I18nextJsonToPoConversionModule/i18nextJsonToPoConversionModuleConfiguration';
import I18nextScannerModuleConfiguration from './modules/i18nextScanner/i18nextScannerModuleConfiguration';
import TranslationModuleConfiguration from './modules/translationModule/translationModuleConfiguration';

/**
 * Represents the complete extension Configurationuration.
 */
export default class ExtensionConfiguration implements BaseConfiguration {
  translationModule: TranslationModuleConfiguration =
    new TranslationModuleConfiguration();
  i18nextJsonToPoConversionModule: I18nextJsonToPoConversionModuleConfiguration =
    new I18nextJsonToPoConversionModuleConfiguration();
  i18nextScannerModule: I18nextScannerModuleConfiguration =
    new I18nextScannerModuleConfiguration();
  debugging: DebuggingConfiguration = new DebuggingConfiguration();
  general: GeneralConfiguration = new GeneralConfiguration();
}
