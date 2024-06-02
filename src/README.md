```typescript
// Example code for using options pattern.
setInterval(() => {
  try {
    const translationModuleOptions =
      configurationStoreManager.getConfig<TranslationModuleConfiguration>(
        'translationModule'
      );
    const debuggingOptions =
      configurationStoreManager.getConfig<DebuggingConfiguration>('debugging');
    const i18nextJsonToPoConversionModuleOptions =
      configurationStoreManager.getConfig<I18nextJsonToPoConversionModuleConfiguration>(
        'i18nextJsonToPoConversionModule'
      );

    const test = translationModuleOptions.deepL?.formality;
    const test2 = translationModuleOptions.deepL?.apiKey;
    const test3 = translationModuleOptions.deepL?.preserveFormatting;
    const test4 = debuggingOptions.logging?.enableVerboseLogging;
    const test5 = i18nextJsonToPoConversionModuleOptions.enabled;

    console.log('yup, still running...');
  } catch (error) {
    console.error(error);
  }
}, 5000);
```
