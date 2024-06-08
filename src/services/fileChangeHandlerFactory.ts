import JsonFileChangeHandler from '../fileChangeHandlers/jsonFileChangeHandler';
import PoFileChangeHandler from '../fileChangeHandlers/poFileChangeHandler';
import FileChangeHandler from '../interfaces/fileChangeHandler';

export default class FileChangeHandlerFactory {
  public createFileChangeHandler(
    changeFileLocation: string
  ): FileChangeHandler {
    const fileExt = changeFileLocation.split('.').pop();

    switch (fileExt) {
      case 'po':
        return PoFileChangeHandler.create();
      case 'json':
        return JsonFileChangeHandler.create();
      default:
        throw new Error('Unsupported file extension');
      //   default:
      // return new CodeFileChangeHandler();
    }
  }
}
