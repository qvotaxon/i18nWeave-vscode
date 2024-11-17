import vscode from 'vscode';

import { BaseFileChangeHandler } from '@i18n-weave/feature/feature-base-file-change-handler';
import { CodeFileChangeHandler } from '@i18n-weave/feature/feature-code-file-change-handler';
import { JsonFileChangeHandler } from '@i18n-weave/feature/feature-json-file-change-handler';

import { FileType } from '@i18n-weave/util/util-enums';

export class FileChangeHandlerFactory {
  public createFileChangeHandler(
    fileType: FileType,
    context: vscode.ExtensionContext
  ): BaseFileChangeHandler {
    switch (fileType) {
      case FileType.Code:
        return CodeFileChangeHandler.create(context);
      case FileType.Translation:
        return JsonFileChangeHandler.create(context);
      default:
        throw new Error('Unsupported file extension');
    }
  }
}
