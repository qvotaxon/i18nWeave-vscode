import { Uri } from 'vscode';
import { ModuleContext } from '../interfaces/moduleContext';

export abstract class BaseModuleContext implements ModuleContext {
  fileUri: Uri;

  constructor(fileUri: Uri) {
    this.fileUri = fileUri;
  }
}
