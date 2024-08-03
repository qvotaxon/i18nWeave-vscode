import { Uri } from 'vscode';

export interface ModuleContext {
  inputPath: Uri;
  outputPath: Uri;
  locale: string;
}
