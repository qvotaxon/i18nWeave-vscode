import { configuration } from '@i18n-weave/feature/feature-configuration';
import { readFile } from '@i18n-weave/file-io/file-io-read-file';

export function logger() {
  configuration();

  readFile();
}
