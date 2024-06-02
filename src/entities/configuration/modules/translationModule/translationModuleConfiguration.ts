import DeepLConfiguration from './deepLConfiguration';
import GoogleTranslateConfiguration from './googleTranslateConfiguration';

/**
 * Represents the Configurationuration for the translation module.
 */
export default class TranslationModuleConfiguration {
  enabled: boolean = false;
  googleTranslate: GoogleTranslateConfiguration =
    new GoogleTranslateConfiguration();
  deepL: DeepLConfiguration = new DeepLConfiguration();
}
