import { BaseConfiguration } from './base-configuration';
import { DebuggingConfiguration } from './debugging/debugging-configuration';
import { GeneralConfiguration } from './general/general-configuration';
import { I18nextScannerModuleConfiguration } from './modules/i18next-scanner-module/i18next-scanner-module-configuration';
import { I18nextJsonToPoConversionModuleConfiguration } from './modules/i18nextjson-to-po-conversion-module/i18nextjson-to-po-conversion-module-configuration';
import { TranslationModuleConfiguration } from './modules/translation-module/translation-module-configuration';

/**
 * Represents the complete extension Configurationuration.
 */
export class ExtensionConfiguration implements BaseConfiguration {
  translationModule: TranslationModuleConfiguration =
    new TranslationModuleConfiguration();
  i18nextJsonToPoConversionModule: I18nextJsonToPoConversionModuleConfiguration =
    new I18nextJsonToPoConversionModuleConfiguration();
  i18nextScannerModule: I18nextScannerModuleConfiguration =
    new I18nextScannerModuleConfiguration();
  debugging: DebuggingConfiguration = new DebuggingConfiguration();
  general: GeneralConfiguration = new GeneralConfiguration();
}
