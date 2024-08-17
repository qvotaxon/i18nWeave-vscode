import { DeepLConfiguration } from './deepl-configuration';
import { GoogleTranslateConfiguration } from './google-translate-configuration';

/**
 * Represents the Configurationuration for the translation module.
 */
export class TranslationModuleConfiguration {
  googleTranslate: GoogleTranslateConfiguration =
    new GoogleTranslateConfiguration();
  deepL: DeepLConfiguration = new DeepLConfiguration();
}
