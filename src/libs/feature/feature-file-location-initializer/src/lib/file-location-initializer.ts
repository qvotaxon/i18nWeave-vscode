import { ExtensionContext } from 'vscode';

import { CodeTranslationKeyStore } from '@i18n-weave/store/store-code-translation-key-store';
import { FileLocationStore } from '@i18n-weave/store/store-file-location-store';

import {
  ConfigurationStoreManager,
  I18nextScannerModuleConfiguration,
} from '@i18n-weave/util/util-configuration';
import { FileSearchLocation } from '@i18n-weave/util/util-types';

export class FileLocationInitializer {
  private readonly context: ExtensionContext;

  constructor(context: ExtensionContext) {
    this.context = context;
  }

  public async initializeFileLocations(): Promise<void> {
    const translationFilesLocation =
      ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
        'i18nextScannerModule'
      ).translationFilesLocation;

    const codeFileLocations =
      ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
        'i18nextScannerModule'
      ).codeFileLocations;

    const codeFileExtensions =
      ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
        'i18nextScannerModule'
      ).fileExtensions;

    const fileSearchLocations = [
      {
        filePattern: `**${translationFilesLocation}/**/*.json`,
        ignorePattern: '{**/dist/**}',
      } as FileSearchLocation,
      {
        filePattern: `**/{${codeFileLocations}}/**/*.{${codeFileExtensions}}`,
        ignorePattern: '{**/*.spec.*,**/*.test.*,**/dist/**}',
      } as FileSearchLocation,
    ];

    await FileLocationStore.getInstance().scanWorkspaceAsync(
      fileSearchLocations
    );

    const codeFileUris = FileLocationStore.getInstance()
      .getCodeFiles()
      .map(file => file.metaData.uri);

    await CodeTranslationKeyStore.getInstance().initializeAsync(
      this.context,
      codeFileUris
    );
  }
}
