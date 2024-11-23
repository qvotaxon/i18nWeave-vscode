import { Uri } from 'vscode';

import { ModuleContext } from './ibase-action-module-context';

export abstract class BaseModuleContext implements ModuleContext {
  inputPath: Uri;
  outputPath: Uri;
  locale: string;
  hasChanges: boolean | undefined = undefined;
  hasDeletions: boolean | undefined = undefined;
  hasRenames: boolean | undefined = undefined;

  constructor(
    fileUri: Uri,
    outputPath: Uri,
    locale: string,
    hasChanges?: boolean | undefined,
    hasDeletions?: boolean | undefined,
    hasRenames?: boolean | undefined
  ) {
    this.inputPath = fileUri;
    this.outputPath = outputPath;
    this.locale = locale;
    this.hasChanges = hasChanges;
    this.hasDeletions = hasDeletions;
    this.hasRenames = hasRenames;
  }
}
