import { FileType } from '../../enums/fileType';
import FileChangeHandler from '../../interfaces/fileChangeHandler';
import CodeFileChangeHandler from './fileChangeHandlers/codeFileChangeHandler';
import JsonFileChangeHandler from './fileChangeHandlers/jsonFileChangeHandler';
import PoFileChangeHandler from './fileChangeHandlers/poFileChangeHandler';

export default class FileChangeHandlerFactory {
  public createFileChangeHandler(fileType: FileType): FileChangeHandler {
    switch (fileType) {
      case FileType.Code:
        return CodeFileChangeHandler.create();
      case FileType.Po:
        return PoFileChangeHandler.create();
      case FileType.Json:
        return JsonFileChangeHandler.create();
      default:
        throw new Error('Unsupported file extension');
    }
  }
}
