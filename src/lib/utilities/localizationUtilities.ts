export interface LocalizedTexts {
  greeting: string;
  confirmativeText: string;
  dismissiveText: string;
}

export enum SupportedLanguages {
  DUTCH = 'nl',
  ENGLISH = 'en',
  SPANISH = 'es',
  FRENCH = 'fr',
  GERMAN = 'de',
  RUSSIAN = 'ru',
  JAPANESE = 'ja',
}

export function getLocalizedTexts(language: string): LocalizedTexts {
  const texts: { [key: string]: LocalizedTexts } = {
    ['en']: {
      greeting: 'Hello!',
      confirmativeText: 'Yes',
      dismissiveText: 'No',
    },
    ['es']: {
      greeting: '¡Hola!',
      confirmativeText: 'Sí',
      dismissiveText: 'No',
    },
    ['fr']: {
      greeting: 'Bonjour!',
      confirmativeText: 'Oui',
      dismissiveText: 'Non',
    },
    ['de']: {
      greeting: 'Guten Tag!',
      confirmativeText: 'Ja',
      dismissiveText: 'Nein',
    },
    ['ru']: {
      greeting: 'Привет!',
      confirmativeText: 'Да',
      dismissiveText: 'Нет',
    },
    ['jp']: {
      greeting: 'Konnichiwa!',
      confirmativeText: 'Hai',
      dismissiveText: 'Iie',
    },
    ['nl']: {
      greeting: 'Hallo!',
      confirmativeText: 'Ja',
      dismissiveText: 'Nee',
    },
  };

  // Fallback to Dutch if the language is not supported
  return texts[language] || texts['nl'];
}
