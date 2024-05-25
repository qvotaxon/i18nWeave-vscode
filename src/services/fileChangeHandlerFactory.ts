import JsonFileChangeHandler from '../fileChangeHandlers/jsonFileChangeHandler';

export default class FileChangeHandlerFactory {
  public createFileChangeHandler(changeFileLocation: string) {
    const fileExt = changeFileLocation.split('.').pop();

    switch (fileExt) {
      //   case 'po':
      // return new PoFileChangeHandler();
      case 'json':
        return new JsonFileChangeHandler();
      //   default:
      // return new CodeFileChangeHandler();
    }
  }
}
