import { Uri } from 'vscode';

import { FileType } from '@i18n-weave/util/util-enums';

type Metadata = {
  uri: Uri;
  entryLastModified: Date;
  type: FileType;
};

type FileData = {
  content: string;
  metaData: Metadata;
};

export type TranslationFile = {
  language: string;
  namespace: string;
  dialect?: string;
} & FileData;

export type CodeFile = FileData;
