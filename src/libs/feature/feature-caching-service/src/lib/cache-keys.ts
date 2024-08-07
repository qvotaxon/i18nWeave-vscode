import { getProjectRootFolder } from '@i18n-weave/util/util-file-path-utilities';

export const sharedCacheKeys = {
  SUPPORTED_TARGET_LANGUAGES: 'i18nWeave.shared.supportedTargetLanguages',
};

export const projectSpecificCacheKeys = () => {
  const projectRootFolder = getProjectRootFolder();

  const projectNameHash = Buffer.from(projectRootFolder).toString('base64');

  return {
    TRANSLATION_FUNCTION: `i18nWeave.${projectNameHash}.translationFunctionCache`,
  };
};
