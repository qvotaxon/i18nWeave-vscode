import * as deepl from 'deepl-node';

/**
 * Represents the configuration for the DeepL module.
 */
export default class DeepLConfiguration {
  enabled: boolean = false;
  apiKey: string = '';
  preserveFormatting: boolean = true;
  formality: deepl.Formality = 'default';
}
