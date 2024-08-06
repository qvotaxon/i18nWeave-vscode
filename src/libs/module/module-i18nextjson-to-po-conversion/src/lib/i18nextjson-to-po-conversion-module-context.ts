import { BaseModuleContext } from '@i18n-weave/module/module-base-action';

export abstract class I18nextJsonToPoConversionModuleContext extends BaseModuleContext {
  jsonContent: any;
}
