import FileChangeHandler from '../../interfaces/fileChangeHandler';
import JsonFileChangeHandler from './fileChangeHandlers/jsonFileChangeHandler';
import PoFileChangeHandler from './fileChangeHandlers/poFileChangeHandler';
import TypeScriptFileChangeHandler from './fileChangeHandlers/typeScriptFileChangeHandler';

export default class FileChangeHandlerFactory {
  public createFileChangeHandler(
    changeFileLocation: string
  ): FileChangeHandler {
    const fileExt = changeFileLocation.split('.').pop();

    switch (fileExt) {
      case 'ts':
      case 'tsx':
      case 'js':
      case 'jsx':
        return TypeScriptFileChangeHandler.create();
      case 'po':
        return PoFileChangeHandler.create();
      case 'json':
        return JsonFileChangeHandler.create();
      default:
        throw new Error('Unsupported file extension');
    }
  }
}
