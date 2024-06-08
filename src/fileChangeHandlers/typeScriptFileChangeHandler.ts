import { Uri } from 'vscode';
import FileChangeHandler from '../interfaces/fileChangeHandler';

export default class TypeScriptFileChangeHandler implements FileChangeHandler {
  handleFileChangeAsync(changeFileLocation?: Uri | undefined): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
