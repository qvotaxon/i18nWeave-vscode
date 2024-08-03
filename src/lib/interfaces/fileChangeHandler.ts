import FileLocationStore from 'lib/stores/fileLocation/fileLocationStore';
import { Uri } from 'vscode';

export default abstract class FileChangeHandler {
  public abstract handleFileChangeAsync(
    changeFileLocation?: Uri | undefined
  ): Promise<void>;
  public async handleFileDeletionAsync(changeFileLocation: Uri): Promise<void> {
    FileLocationStore.getInstance().deleteFile(changeFileLocation);
  }
  public async handleFileCreationAsync(changeFileLocation: Uri): Promise<void> {
    FileLocationStore.getInstance().addOrUpdateFile(changeFileLocation);
  }
}
