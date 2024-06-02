import BaseConfiguration from './baseConfiguration';
import DebuggingConfiguration from './debugging/debuggingConfiguration';
import I18nextJsonToPoConversionModuleConfiguration from './modules/I18nextJsonToPoConversionModule/i18nextJsonToPoConversionModuleConfiguration';
import TranslationModuleConfiguration from './modules/translationModule/translationModuleConfiguration';

/**
 * Represents the complete extension Configurationuration.
 */
export default class ExtensionConfiguration implements BaseConfiguration {
  translationModule: TranslationModuleConfiguration =
    new TranslationModuleConfiguration();
  i18nextJsonToPoConversionModule: I18nextJsonToPoConversionModuleConfiguration =
    new I18nextJsonToPoConversionModuleConfiguration();
  debugging: DebuggingConfiguration = new DebuggingConfiguration();
}
