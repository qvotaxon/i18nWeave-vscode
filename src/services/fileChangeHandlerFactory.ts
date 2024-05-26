import JsonFileChangeHandler from '../fileChangeHandlers/jsonFileChangeHandler';
import FileChangeHandler from '../interfaces/fileChangeHandler';

export default class FileChangeHandlerFactory {
  public createFileChangeHandler(
    changeFileLocation: string
  ): FileChangeHandler {
    const fileExt = changeFileLocation.split('.').pop();

    switch (fileExt) {
      //   case 'po':
      // return new PoFileChangeHandler();

      case 'json':
        return new JsonFileChangeHandler();
      default:
        throw new Error('Unsupported file extension');
      //   default:
      // return new CodeFileChangeHandler();
    }
  }
}
