import { BaseConfiguration } from './base-configuration';
import { DebuggingConfiguration } from './debugging/debugging-configuration';
import { GeneralConfiguration } from './general/general-configuration';
import { I18nextScannerModuleConfiguration } from './modules/i18next-scanner-module/i18next-scanner-module-configuration';
import { TranslationModuleConfiguration } from './modules/translation-module/translation-module-configuration';

/**
 * Represents the complete extension Configurationuration.
 */
export class ExtensionConfiguration implements BaseConfiguration {
  translationModule: TranslationModuleConfiguration =
    new TranslationModuleConfiguration();
  i18nextScannerModule: I18nextScannerModuleConfiguration =
    new I18nextScannerModuleConfiguration();
  debugging: DebuggingConfiguration = new DebuggingConfiguration();
  general: GeneralConfiguration = new GeneralConfiguration();
}
