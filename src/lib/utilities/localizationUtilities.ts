export interface LocalizedTexts {
  greeting: string;
  confirmativeText: string;
  dismissiveText: string;
}

export function getLocalizedTexts(language: string): LocalizedTexts {
  const texts: { [key: string]: LocalizedTexts } = {
    en: createLocalizedTexts('Hello!', 'Yes', 'No'),
    es: createLocalizedTexts('¡Hola!', 'Sí', 'No'),
    fr: createLocalizedTexts('Bonjour!', 'Oui', 'Non'),
    de: createLocalizedTexts('Guten Tag!', 'Ja', 'Nein'),
    ru: createLocalizedTexts('Привет!', 'Да', 'Нет'),
    jp: createLocalizedTexts('Konnichiwa!', 'Hai', 'Iie'),
    nl: createLocalizedTexts('Hallo!', 'Ja', 'Nee'),
  };

  // Fallback to Dutch if the language is not supported
  return texts[language] || texts.nl;
}

function createLocalizedTexts(
  greeting: string,
  confirmativeText: string,
  dismissiveText: string
): LocalizedTexts {
  return {
    greeting,
    confirmativeText,
    dismissiveText,
  };
}
