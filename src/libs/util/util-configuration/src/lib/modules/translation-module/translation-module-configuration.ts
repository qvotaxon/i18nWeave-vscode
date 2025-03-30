import { DeepLConfiguration } from './deepl-configuration';
import { GoogleTranslateConfiguration } from './google-translate-configuration';

/**
 * Represents the Configurationuration for the translation module.
 */
export class TranslationModuleConfiguration {
  enabled: boolean = true;
  googleTranslate: GoogleTranslateConfiguration =
    new GoogleTranslateConfiguration();
  deepL: DeepLConfiguration = new DeepLConfiguration();
}
