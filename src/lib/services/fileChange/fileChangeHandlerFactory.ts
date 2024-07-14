import { FileType } from '../../enums/fileType';
import FileChangeHandler from '../../interfaces/fileChangeHandler';
import JsonFileChangeHandler from './fileChangeHandlers/jsonFileChangeHandler';
import PoFileChangeHandler from './fileChangeHandlers/poFileChangeHandler';
import TypeScriptFileChangeHandler from './fileChangeHandlers/typeScriptFileChangeHandler';

export default class FileChangeHandlerFactory {
  public createFileChangeHandler(fileType: FileType): FileChangeHandler {
    switch (fileType) {
      case FileType.TypeScript:
        return TypeScriptFileChangeHandler.create();
      case FileType.PO:
        return PoFileChangeHandler.create();
      case FileType.JSON:
        return JsonFileChangeHandler.create();
      default:
        throw new Error('Unsupported file extension');
    }
  }
}
