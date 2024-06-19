import { Uri } from 'vscode';

export default interface FileChangeHandler {
  handleFileChangeAsync(changeFileLocation?: Uri | undefined): Promise<void>;
}
