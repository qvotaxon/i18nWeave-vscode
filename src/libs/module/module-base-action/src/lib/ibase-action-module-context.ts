import { Uri } from 'vscode';

export interface ModuleContext {
  inputPath: Uri;
  outputPath: Uri;
  locale: string;
  hasChanges: boolean | undefined;
  hasDeletions: boolean | undefined;
  hasRenames: boolean | undefined;
}
