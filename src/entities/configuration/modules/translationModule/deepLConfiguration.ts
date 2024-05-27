/**
 * Represents the configuration for the DeepL module.
 */
export default class DeepLConfiguration {
  enabled: boolean = false;
  apiKey: string = '';
  preserveFormatting: boolean = false;
  formality: string = 'default';
}
