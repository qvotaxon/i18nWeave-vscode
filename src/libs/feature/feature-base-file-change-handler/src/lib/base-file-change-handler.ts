import { Uri } from 'vscode';

import { FileLocationStore } from '@i18n-weave/store/store-file-location-store';

import { Logger } from '@i18n-weave/util/util-logger';

export abstract class BaseFileChangeHandler {
  public abstract handleFileChangeAsync(
    changeFileLocation?: Uri | undefined
  ): Promise<void>;

  public async handleFileDeletionAsync(changeFileLocation: Uri): Promise<void> {
    FileLocationStore.getInstance().deleteFile(changeFileLocation);
  }
  public async handleFileCreationAsync(changeFileLocation: Uri): Promise<void> {
    FileLocationStore.getInstance().addOrUpdateFile(changeFileLocation);
  }
}
