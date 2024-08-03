import { BaseModuleContext } from '@i18n-weave/module/module-base-action';

export abstract class ReadJsonFileModuleContext extends BaseModuleContext {
  jsonContent: any;
}
