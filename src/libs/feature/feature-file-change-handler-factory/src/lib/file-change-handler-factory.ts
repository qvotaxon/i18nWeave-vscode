import FileChangeHandler from 'lib/interfaces/fileChangeHandler';
import vscode from 'vscode';

import { FileType } from '@i18n-weave/util/util-enumsz';

import CodeFileChangeHandler from '../../../fileChangeHandlers/feature-code-file-change-handler/src/lib/code-file-change-handler';
import JsonFileChangeHandler from '../../../fileChangeHandlers/feature-json-file-change-handler/src/lib/json-file-change-handler';
import PoFileChangeHandler from '../../../fileChangeHandlers/feature-po-file-change-handler/src/lib/po-file-change-handler';

export class FileChangeHandlerFactory {
  public createFileChangeHandler(
    fileType: FileType,
    context: vscode.ExtensionContext
  ): FileChangeHandler {
    switch (fileType) {
      case FileType.Code:
        return CodeFileChangeHandler.create(context);
      case FileType.Po:
        return PoFileChangeHandler.create(context);
      case FileType.Json:
        return JsonFileChangeHandler.create(context);
      default:
        throw new Error('Unsupported file extension');
    }
  }
}
