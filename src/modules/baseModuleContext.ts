import { Uri } from 'vscode';
import ModuleContext from '../interfaces/moduleContext';

export abstract class BaseModuleContext implements ModuleContext {
  inputPath: Uri;
  outputPath: Uri;
  locale: string;

  constructor(fileUri: Uri, outputPath: Uri, locale: string) {
    this.inputPath = fileUri;
    this.outputPath = outputPath;
    this.locale = locale;
  }
}
