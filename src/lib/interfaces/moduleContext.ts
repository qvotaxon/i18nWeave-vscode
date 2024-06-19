import { Uri } from 'vscode';

export default interface ModuleContext {
  inputPath: Uri;
  outputPath: Uri;
  locale: string;
}
