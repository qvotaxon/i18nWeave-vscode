import vscode from 'vscode';

import { FileType } from '../../enums/fileType';
import FileChangeHandler from '../../interfaces/fileChangeHandler';
import CodeFileChangeHandler from './fileChangeHandlers/codeFileChangeHandler';
import JsonFileChangeHandler from './fileChangeHandlers/jsonFileChangeHandler';
import PoFileChangeHandler from './fileChangeHandlers/poFileChangeHandler';

export default class FileChangeHandlerFactory {
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
