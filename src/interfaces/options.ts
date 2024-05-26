import DebuggingOptions from './debuggingOptions';
import I18nextJsonToPoConversionModuleOptions from './i18nextJsonToPoConversionModuleOptions';
import ModuleOptions from './moduleOptions';
import TranslationModuleOptions from './translationModuleOptions';

export default interface Options {
  [moduleId: string]: ModuleOptions;
  translationModule: TranslationModuleOptions;
  i18nextJsonToPoConversionModule: I18nextJsonToPoConversionModuleOptions;
  debugging: DebuggingOptions;
}
