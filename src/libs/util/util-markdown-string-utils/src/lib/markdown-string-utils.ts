import vscode from 'vscode';

export function createI18nHoverMarkdown(
  translations: Record<string, string | undefined | null>,
  defaultLanguage: string,
  namespace: string,
  lengthDifferenceThreshold: number = 30
): vscode.MarkdownString {
  const markdown = new vscode.MarkdownString();
  const languages = Object.keys(translations);
  const translatedCount = Object.values(translations).filter(t =>
    t?.trim()
  ).length;
  const defaultTranslation = translations[defaultLanguage];

  markdown.appendMarkdown(
    [
      `### ![${Math.round((translatedCount / languages.length) * 100)}%](https://progress-bar.xyz/${Math.round((translatedCount / languages.length) * 100)}?title=Translation%20Progress:)`,
      defaultTranslation
        ? `##### Default translation (${defaultLanguage}):\n ##### "${defaultTranslation}"`
        : `##### **⚠ Default translation (${defaultLanguage}) missing!**`,
      '---',
      `###### Namespace: **${namespace}**`,
      '---',
      '##### Language Status:',
      ...languages.map(lang =>
        getLanguageStatus(
          lang,
          translations[lang],
          defaultTranslation,
          lengthDifferenceThreshold
        )
      ),
    ].join('\n')
  );

  markdown.supportHtml = true;
  markdown.isTrusted = true;
  return markdown;
}

export function createI18nCompletionMarkdown(
  defaultLanguage: string,
  namespace: string,
  translationValue?: string | undefined | null
): vscode.MarkdownString {
  const markdown = new vscode.MarkdownString();

  markdown.appendMarkdown(
    [
      translationValue
        ? `##### Default translation (${defaultLanguage}):\n ##### "${translationValue}"`
        : `##### **⚠ Default translation (${defaultLanguage}) missing!**`,
      `###### Namespace: **${namespace}**`,
    ].join('\n')
  );

  markdown.supportHtml = true;
  markdown.isTrusted = true;
  return markdown;
}

function getLanguageStatus(
  lang: string,
  translation: string | undefined | null,
  defaultTranslation: string | undefined | null,
  lengthDifferenceThreshold: number
): string {
  const hasTranslation = !!translation?.trim();
  let warning = '';

  if (hasTranslation && defaultTranslation) {
    const sameCharSet =
      getCharSet(translation) === getCharSet(defaultTranslation);
    const lengthDiff = Math.abs(
      defaultTranslation.length - (translation?.length ?? 0)
    );
    if (sameCharSet && lengthDiff > lengthDifferenceThreshold) {
      warning = '⚠ Length difference';
    }
  }

  return `- **${lang}:** ${hasTranslation ? '✔' : '✖'} ${warning}`;
}

function getCharSet(text: string | undefined | null): string {
  if (!text) return 'unknown';
  if (/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(text))
    return 'CJK';
  if (/[A-Za-z]/u.test(text)) return 'Latin';
  if (/[А-яЁё]/u.test(text)) return 'Cyrillic';
  return 'other';
}
