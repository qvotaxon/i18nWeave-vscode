import { Location, Uri } from 'vscode';

import { FileType } from '@i18n-weave/util/util-enums';

export interface TranslationKeyData {
  value: string | null;
  location: Location;
}

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
  keys: Record<string, TranslationKeyData>;
} & FileData;

export type CodeFile = FileData;
