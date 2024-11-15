import { TextResult } from 'deepl-node';

export interface ITranslator {
  translateAsync(
    texts: string[],
    sourceLang: string,
    targetLang: string
  ): Promise<string[]>;
}