export default interface TranslationModuleOptions {
  enabled: boolean;
  googleTranslate: {
    enabled: boolean;
  };
  deepL: {
    enabled: boolean;
    apiKey: string;
    preserveFormatting: boolean;
    formality: 'default' | 'more' | 'less' | 'prefer_more' | 'prefer_less';
  };
}
