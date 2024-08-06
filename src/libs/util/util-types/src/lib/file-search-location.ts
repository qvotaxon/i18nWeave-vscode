import { GlobPattern } from 'vscode';

export type FileSearchLocation = {
  filePattern: GlobPattern;
  ignorePattern: GlobPattern;
};
